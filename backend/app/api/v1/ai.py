import json
import logging
import re
from datetime import UTC, datetime
from uuid import uuid4

import httpx
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sse_starlette.sse import EventSourceResponse

from app.api.deps import get_current_user
from app.config import settings
from app.core.permissions import require_roles
from app.database import get_db
from app.models.base import (
    AIConversation,
    AIMessage,
    Course,
    DocumentChunk,
    Quiz,
    QuizAttempt,
    QuizQuestion,
    User,
)
from app.schemas.ai import (
    ChatMessageRequest,
    ChatRequest,
    ConversationResponse,
    MessageResponse,
    QuizAttemptResponse,
    QuizGenerateRequest,
    QuizResponse,
    QuizSubmitRequest,
)
from app.services.adaptive_service import compute_adaptive_score, get_adaptive_level
from app.services.gamification_service import award_xp, get_or_create_profile
from app.services.rag_service import query_rag

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/ai", tags=["ai"])


# ── Conversations ──────────────────────────────────────────────


@router.get("/conversations", response_model=list[ConversationResponse])
async def list_conversations(
    db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)
):
    result = await db.execute(
        select(AIConversation).where(AIConversation.student_id == current_user.id)
    )
    return result.scalars().all()


@router.post("/conversations", response_model=ConversationResponse, status_code=201)
async def create_conversation(
    course_id: str | None = None,
    subject_id: str | None = None,
    title: str | None = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles("admin", "teacher", "student")),
):
    conv = AIConversation(
        id=uuid4(),
        student_id=current_user.id,
        course_id=course_id,
        subject_id=subject_id,
        title=title or "Nouvelle conversation",
    )
    db.add(conv)
    await db.commit()
    await db.refresh(conv)
    return conv


@router.get("/conversations/{conversation_id}", response_model=list[MessageResponse])
async def get_messages(
    conversation_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    conv = await db.get(AIConversation, conversation_id)
    if not conv or conv.student_id != current_user.id:
        raise HTTPException(status_code=404, detail={"error": {"code": "AI_CONVERSATION_NOT_FOUND", "message": "Conversation non trouvée"}})
    result = await db.execute(
        select(AIMessage)
        .where(AIMessage.conversation_id == conversation_id)
        .order_by(AIMessage.created_at)
    )
    return result.scalars().all()


@router.post("/conversations/{conversation_id}/messages")
async def send_message(
    conversation_id: str,
    body: ChatMessageRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    conv = await db.get(AIConversation, conversation_id)
    if not conv or conv.student_id != current_user.id:
        raise HTTPException(status_code=404, detail={"error": {"code": "AI_CONVERSATION_NOT_FOUND", "message": "Conversation non trouvée"}})

    # Store user message
    user_msg = AIMessage(
        id=uuid4(),
        conversation_id=conversation_id,
        role="user",
        content=body.content,
    )
    db.add(user_msg)
    await db.commit()

    # Build history
    history_result = await db.execute(
        select(AIMessage)
        .where(AIMessage.conversation_id == conversation_id)
        .order_by(AIMessage.created_at)
        .limit(10)
    )
    history = [{"role": m.role, "content": m.content} for m in history_result.scalars().all()]

    async def event_stream():
        full_response = ""
        async for token in query_rag(
            db, body.content, str(current_user.id), conv.course_id, history
        ):
            full_response += token
            yield {"event": "token", "data": json.dumps({"token": token})}

        assistant_msg = AIMessage(
            id=uuid4(),
            conversation_id=conversation_id,
            role="assistant",
            content=full_response,
            confidence_score=0.85,
            token_count=len(full_response.split()),
        )
        db.add(assistant_msg)
        conv.total_messages = (conv.total_messages or 0) + 2
        await db.commit()

        # Award XP for AI interaction
        try:
            await award_xp(db, str(current_user.id), "ai_session", 2)
        except Exception as e:
            logger.warning("XP award failed: %s", e)

        yield {"event": "done", "data": json.dumps({"message_id": str(assistant_msg.id)})}

    return EventSourceResponse(event_stream())


@router.post("/conversations/{conversation_id}/messages/{message_id}/feedback")
async def message_feedback(
    conversation_id: str,
    message_id: str,
    feedback: int = Query(1, ge=-1, le=1),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    msg = await db.get(AIMessage, message_id)
    if not msg or str(msg.conversation_id) != conversation_id:
        raise HTTPException(status_code=404, detail={"error": {"code": "AI_MESSAGE_NOT_FOUND", "message": "Message non trouvé"}})
    msg.feedback = feedback
    await db.commit()
    return {"message": "Feedback enregistré"}


# ── Quick chat streaming (no conversation) ─────────────────────


@router.post("/chat/stream")
async def chat_stream(
    body: ChatRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """SSE streaming chat without an existing conversation."""

    async def event_generator():
        try:
            async for token in query_rag(
                db, body.message, str(current_user.id), None, []
            ):
                yield f"data: {json.dumps({'token': token})}\n\n"
            yield f"data: {json.dumps({'done': True})}\n\n"
        except Exception as e:
            yield f"data: {json.dumps({'error': str(e)})}\n\n"

    from fastapi.responses import StreamingResponse

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        },
    )


# ── Quiz generation ────────────────────────────────────────────


@router.post("/quiz/generate", response_model=QuizResponse)
async def generate_quiz(
    body: QuizGenerateRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles("admin", "teacher")),
):
    course = await db.get(Course, body.course_id)
    if not course:
        raise HTTPException(status_code=404, detail={"error": {"code": "AI_COURSE_NOT_FOUND", "message": "Cours non trouvé"}})

    chunks = await db.execute(
        select(DocumentChunk).where(DocumentChunk.course_id == body.course_id).limit(5)
    )
    chunks = chunks.scalars().all()
    context = "\n\n".join(c.content for c in chunks)

    prompt = (
        f"Génère {body.num_questions} questions de quiz sur ce cours "
        f"en difficulté {body.difficulty}.\n"
        f"Types demandés : {', '.join(body.question_types)}.\n"
        f"Format JSON uniquement, avec ce schema :\n"
        f'{{"questions": [{{"question": "...", "type": "mcq", '
        f'"options": [{{"text": "...", "is_correct": true}}, ...], '
        f'"explanation": "..."}}]}}\n\n'
        f"COURS :\n{context[:3000]}"
    )
    async with httpx.AsyncClient() as client:
        resp = await client.post(
            f"{settings.OLLAMA_BASE_URL}/api/generate",
            json={
                "model": settings.OLLAMA_CHAT_MODEL,
                "prompt": prompt,
                "stream": False,
                "format": "json",
            },
            timeout=120.0,
        )
        resp.raise_for_status()
        data = resp.json()

    try:
        quiz_data = json.loads(data["response"])
    except json.JSONDecodeError:
        # Try extracting JSON from markdown code fences
        match = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", data["response"])
        if match:
            quiz_data = json.loads(match.group(1))
        else:
            raise HTTPException(status_code=500, detail={"error": {"code": "AI_PARSE_ERROR", "message": "Impossible de parser la réponse du modèle"}})

    quiz = Quiz(
        id=uuid4(),
        course_id=body.course_id,
        title=f"Quiz - {course.title}",
        difficulty=body.difficulty,
        is_ai_generated=True,
    )
    db.add(quiz)
    await db.flush()

    for idx, q in enumerate(quiz_data.get("questions", [])):
        q_type = q.get("type", "mcq")
        options = q.get("options")
        correct_answer = ""
        if q_type == "mcq" and options:
            correct = next((opt for opt in options if opt.get("is_correct")), None)
            if correct:
                correct_answer = correct.get("text", "")
        elif q_type == "true_false":
            correct_answer = q.get("correct_answer", "")

        question = QuizQuestion(
            id=uuid4(),
            quiz_id=quiz.id,
            question_text=q["question"],
            question_type=q_type,
            options=options,
            correct_answer=correct_answer,
            explanation=q.get("explanation", ""),
            points=1,
            order_index=idx,
        )
        db.add(question)

    await db.commit()
    await db.refresh(quiz)
    return quiz


# ── Quiz subrouter (mounted at /ai/quizzes) ────────────────────

router_quiz = APIRouter(prefix="/quizzes", tags=["quizzes"])


@router_quiz.get("", response_model=list[QuizResponse])
async def list_quizzes(
    course_id: str | None = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = select(Quiz)
    if course_id:
        query = query.where(Quiz.course_id == course_id)
    result = await db.execute(query)
    return result.scalars().all()


@router_quiz.get("/{quiz_id}", response_model=QuizResponse)
async def get_quiz(
    quiz_id: str, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)
):
    quiz = await db.get(Quiz, quiz_id)
    if not quiz:
        raise HTTPException(status_code=404, detail={"error": {"code": "AI_QUIZ_NOT_FOUND", "message": "Quiz non trouvé"}})
    return quiz


@router_quiz.post("/{quiz_id}/attempt", response_model=QuizAttemptResponse)
async def submit_quiz(
    quiz_id: str,
    body: QuizSubmitRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles("student")),
):
    quiz = await db.get(Quiz, quiz_id)
    if not quiz:
        raise HTTPException(status_code=404, detail={"error": {"code": "AI_QUIZ_NOT_FOUND", "message": "Quiz non trouvé"}})

    questions = (
        (
            await db.execute(
                select(QuizQuestion)
                .where(QuizQuestion.quiz_id == quiz_id)
                .order_by(QuizQuestion.order_index)
            )
        )
        .scalars()
        .all()
    )

    score = 0
    max_score = len(questions)

    for i, q in enumerate(questions):
        user_answer = body.answers[i]["answer"] if i < len(body.answers) else None
        if q.question_type == "mcq" and q.options:
            correct_option = next((opt for opt in q.options if opt.get("is_correct")), None)
            if correct_option and user_answer == correct_option.get("text"):
                score += 1
        elif q.question_type == "true_false":
            if (
                user_answer is not None
                and str(user_answer).lower() == str(q.correct_answer).lower()
            ):
                score += 1

    # Get or create profile for adaptive tracking
    profile = await get_or_create_profile(db, str(current_user.id))
    historical = profile.adaptive_score if profile else 0.5
    adaptive_before = profile.adaptive_level if profile else "normal"

    score_ratio = score / max_score if max_score > 0 else 0
    adaptive_score = compute_adaptive_score(
        quiz_score=score_ratio,
        response_time=0,
        max_time=1,
        historical_score=historical,
    )
    adaptive_level = get_adaptive_level(adaptive_score)

    attempt = QuizAttempt(
        id=uuid4(),
        quiz_id=quiz_id,
        student_id=current_user.id,
        answers=body.answers,
        score=score,
        max_score=max_score,
        completed_at=datetime.now(UTC),
        adaptive_level_before=adaptive_before,
        adaptive_level_after=adaptive_level,
    )
    db.add(attempt)

    # Update student profile adaptive values
    profile.adaptive_score = adaptive_score
    profile.adaptive_level = adaptive_level
    await db.commit()
    await db.refresh(attempt)

    # Award XP based on score
    if score_ratio >= 1.0:
        await award_xp(db, str(current_user.id), "quiz_perfect", 50)
    elif score_ratio >= 0.8:
        await award_xp(db, str(current_user.id), "quiz_above_80", 20)
    else:
        await award_xp(db, str(current_user.id), "quiz_completed", 10)

    return attempt


# Mount quiz subrouter onto main router
router.include_router(router_quiz)

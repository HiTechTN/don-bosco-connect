import logging

logger = logging.getLogger(__name__)


def generate_quiz_background(course_id: str, teacher_id: str, num_questions: int = 10, difficulty: str = "normal"):
    import asyncio
    asyncio.run(_generate_quiz_background(course_id, teacher_id, num_questions, difficulty))


async def _generate_quiz_background(course_id: str, teacher_id: str, num_questions: int, difficulty: str):
    from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
    from sqlalchemy.orm import sessionmaker
    from uuid import uuid4
    from app.config import settings
    from app.models import Course, Quiz, QuizQuestion, Subject

    engine = create_async_engine(settings.DATABASE_URL, echo=False, pool_size=5)
    AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async with AsyncSessionLocal() as db:
        from sqlalchemy import select
        result = await db.execute(select(Course).where(Course.id == course_id))
        course = result.scalar_one_or_none()
        if not course:
            logger.error("Course %s not found for quiz generation", course_id)
            return

        result = await db.execute(select(Subject).where(Subject.id == course.subject_id))
        subject = result.scalar_one_or_none()

        prompt = f"""Génère {num_questions} questions de quiz sur ce cours.

COURS : {course.title}
{course.description or ''}

MATIÈRE : {subject.name if subject else 'N/A'}

FORMAT DE RÉPONSE (JSON uniquement, aucun texte autour) :
{{"questions": [{{"question": "...", "type": "mcq", "options": [{{"text": "...", "is_correct": true}}, {{"text": "...", "is_correct": false}}], "explanation": "...", "difficulty": "{difficulty}"}}]}}

CONSIGNES :
- Difficulté : {difficulty}
- Types demandés : mcq, true_false
- Questions claires, sans ambiguïté
- Une seule bonne réponse par QCM
- Explications pédagogiques"""

        from app.services.rag_service import call_ollama_sync
        response_text = call_ollama_sync(prompt, model=settings.OLLAMA_CHAT_MODEL)

        import json
        try:
            data = json.loads(response_text)
            questions_data = data.get("questions", [])
        except json.JSONDecodeError:
            logger.error("Failed to parse quiz generation response")
            return

        quiz = Quiz(
            id=uuid4(),
            course_id=course_id,
            title=f"Quiz: {course.title}",
            difficulty=difficulty,
            is_ai_generated=True,
        )
        db.add(quiz)
        await db.flush()

        for i, q in enumerate(questions_data):
            question = QuizQuestion(
                id=uuid4(),
                quiz_id=quiz.id,
                question_text=q["question"],
                question_type=q.get("type", "mcq"),
                options=q.get("options"),
                correct_answer=str(q.get("options", [{}])[0].get("text")) if q.get("type") == "mcq" else None,
                explanation=q.get("explanation", ""),
                points=1,
                order_index=i,
            )
            db.add(question)

        await db.commit()
        logger.info("Quiz %s generated with %d questions", quiz.id, len(questions_data))

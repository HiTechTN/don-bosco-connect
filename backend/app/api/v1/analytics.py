from datetime import datetime, timezone, timedelta

from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_

from app.database import get_db
from app.api.deps import get_current_user
from app.models.base import (
    User, UserRole, Grade, Evaluation, Course, CourseFile,
    Absence, AIConversation, AIMessage, QuizAttempt, Quiz,
    StudentProfile, ClassEnrollment,
)
from app.core.permissions import require_roles

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/dashboard")
async def admin_dashboard(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.admin))
):
    result = await db.execute(select(func.count(User.id)))
    total_users = result.scalar()
    result = await db.execute(
        select(func.count(User.id)).where(User.role == UserRole.teacher)
    )
    total_teachers = result.scalar()
    result = await db.execute(
        select(func.count(User.id)).where(User.role == UserRole.student)
    )
    total_students = result.scalar()
    result = await db.execute(
        select(func.count(User.id)).where(User.role == UserRole.parent)
    )
    total_parents = result.scalar()
    result = await db.execute(select(func.count(Course.id)))
    total_courses = result.scalar()
    result = await db.execute(
        select(func.count(Grade.id)).where(Grade.graded_at >= datetime.now(timezone.utc) - timedelta(days=30))
    )
    grades_30d = result.scalar()
    result = await db.execute(
        select(func.count(AIConversation.id))
    )
    total_ai_convs = result.scalar()

    return {
        "total_users": total_users,
        "total_teachers": total_teachers,
        "total_students": total_students,
        "total_parents": total_parents,
        "total_courses": total_courses,
        "grades_last_30_days": grades_30d,
        "total_ai_conversations": total_ai_convs,
    }


@router.get("/teacher")
async def teacher_dashboard(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role not in ("admin", "teacher"):
        raise HTTPException(status_code=403, detail="Réservé aux enseignants")

    teacher_id = current_user.id

    # Courses taught
    result = await db.execute(
        select(func.count(Course.id)).where(Course.teacher_id == teacher_id)
    )
    total_courses = result.scalar()

    # Evaluations created
    result = await db.execute(
        select(func.count(Evaluation.id)).where(Evaluation.teacher_id == teacher_id)
    )
    total_evaluations = result.scalar()

    # Grades given in last 30 days
    result = await db.execute(
        select(func.count(Grade.id))
        .join(Evaluation, Grade.evaluation_id == Evaluation.id)
        .where(
            Evaluation.teacher_id == teacher_id,
            Grade.graded_at >= datetime.now(timezone.utc) - timedelta(days=30),
        )
    )
    grades_30d = result.scalar()

    # Average score across evaluations
    result = await db.execute(
        select(func.avg(Grade.score))
        .join(Evaluation, Grade.evaluation_id == Evaluation.id)
        .where(Evaluation.teacher_id == teacher_id)
    )
    avg_score = result.scalar()

    # Absences recorded
    result = await db.execute(
        select(func.count(Absence.id)).where(Absence.teacher_id == teacher_id)
    )
    total_absences = result.scalar()

    return {
        "total_courses": total_courses,
        "total_evaluations": total_evaluations,
        "grades_last_30_days": grades_30d,
        "average_score": round(float(avg_score), 2) if avg_score else None,
        "total_absences_recorded": total_absences,
    }


@router.get("/grades")
async def grade_distribution(
    class_id: str | None = Query(None),
    subject_id: str | None = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.admin, UserRole.teacher))
):
    query = select(Grade).join(Evaluation)
    if class_id:
        query = query.where(Evaluation.class_id == class_id)
    if subject_id:
        query = query.where(Evaluation.subject_id == subject_id)

    result = await db.execute(query)
    grades = result.scalars().all()
    scores = [float(g.score) for g in grades if g.score is not None]

    if not scores:
        return {"count": 0, "average": None, "distribution": []}

    bins = [(0, 5), (5, 10), (10, 12), (12, 15), (15, 18), (18, 21)]
    distribution = [
        {"min": lo, "max": hi, "count": sum(1 for s in scores if lo <= s < hi)}
        for lo, hi in bins
    ]

    return {
        "count": len(scores),
        "average": round(sum(scores) / len(scores), 2),
        "max": max(scores),
        "min": min(scores),
        "distribution": distribution,
    }


@router.get("/ai-usage")
async def ai_usage_stats(
    days: int = Query(30, ge=1, le=365),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.admin))
):
    since = datetime.now(timezone.utc) - timedelta(days=days)

    result = await db.execute(
        select(func.count(AIConversation.id))
        .where(AIConversation.created_at >= since)
    )
    total_convs = result.scalar()

    result = await db.execute(
        select(func.count(AIMessage.id))
        .where(AIMessage.created_at >= since, AIMessage.role == "user")
    )
    total_questions = result.scalar()

    result = await db.execute(
        select(func.coalesce(func.avg(AIMessage.token_count), 0))
        .where(AIMessage.role == "assistant", AIMessage.created_at >= since)
    )
    avg_tokens = result.scalar()

    return {
        "days": days,
        "conversations": total_convs,
        "user_messages": total_questions,
        "avg_tokens_per_response": round(float(avg_tokens), 1) if avg_tokens else 0,
    }


@router.get("/quiz-stats")
async def quiz_stats(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.admin, UserRole.teacher))
):
    result = await db.execute(select(func.count(Quiz.id)))
    total_quizzes = result.scalar()

    result = await db.execute(
        select(func.count(QuizAttempt.id))
    )
    total_attempts = result.scalar()

    result = await db.execute(
        select(func.avg(QuizAttempt.score * 1.0 / func.nullif(QuizAttempt.max_score, 0)))
        .where(QuizAttempt.max_score > 0)
    )
    pass_rate = result.scalar()

    return {
        "total_quizzes": total_quizzes,
        "total_attempts": total_attempts,
        "average_pass_rate": round(float(pass_rate * 100), 1) if pass_rate else None,
    }
from datetime import date, timedelta
from uuid import UUID, uuid4

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.base import (
    Absence,
    Badge,
    ClassEnrollment,
    StudentBadge,
    StudentProfile,
    User,
    XPTransaction,
)

XP_REWARDS = {
    "daily_login": 5,
    "quiz_completed": 10,
    "quiz_above_80": 20,
    "quiz_perfect": 50,
    "ai_session": 2,
    "streak_3_days": 25,
    "streak_7_days": 75,
    "streak_30_days": 300,
    "course_viewed": 1,
}

LEVEL_THRESHOLDS = [
    (0, "Débutant"),
    (100, "Apprenti"),
    (300, "Étudiant"),
    (600, "Assidu"),
    (1000, "Expert"),
    (1500, "Maître"),
    (2500, "Légende"),
]


def _to_uuid(val: str | UUID | None) -> UUID | None:
    if val is None or val == "":
        return None
    return UUID(val) if isinstance(val, str) else val


async def get_or_create_profile(db: AsyncSession, student_id: str) -> StudentProfile:
    result = await db.execute(
        select(StudentProfile).where(StudentProfile.student_id == _to_uuid(student_id))
    )
    profile = result.scalar_one_or_none()
    if not profile:
        profile = StudentProfile(
            id=uuid4(),
            student_id=_to_uuid(student_id),
            xp_total=0,
            level=1,
            streak_days=0,
        )
        db.add(profile)
        await db.commit()
        await db.refresh(profile)
    return profile


async def award_xp(
    db: AsyncSession,
    student_id: str,
    reason: str,
    amount: int,
    reference_id: str | None = None,
) -> None:
    profile = await get_or_create_profile(db, student_id)

    # Streak logic: check last activity BEFORE updating
    today = date.today()
    yesterday = today - timedelta(days=1)
    last_active = profile.last_activity_date

    if last_active == yesterday:
        profile.streak_days += 1
        if profile.streak_days == 3:
            await award_xp(db, student_id, "streak_3_days", XP_REWARDS["streak_3_days"])
            await award_badge(db, student_id, "streak_3")
        elif profile.streak_days == 7:
            await award_xp(db, student_id, "streak_7_days", XP_REWARDS["streak_7_days"])
            await award_badge(db, student_id, "streak_7")
        elif profile.streak_days == 30:
            await award_xp(db, student_id, "streak_30_days", XP_REWARDS["streak_30_days"])
            await award_badge(db, student_id, "streak_30")
    elif last_active != today:
        profile.streak_days = 1  # reset streak

    profile.last_activity_date = today

    # Add XP
    profile.xp_total += amount

    # Recalculate level
    level_num = 1
    for i, (threshold, _) in enumerate(LEVEL_THRESHOLDS):
        if profile.xp_total >= threshold:
            level_num = i + 1
    profile.level = level_num

    transaction = XPTransaction(
        id=uuid4(),
        student_id=_to_uuid(student_id),
        amount=amount,
        reason=reason,
        reference_id=reference_id,
    )
    db.add(transaction)
    await db.commit()


async def award_badge(db: AsyncSession, student_id: str, badge_code: str) -> None:
    badge = (await db.execute(select(Badge).where(Badge.code == badge_code))).scalar_one_or_none()
    if not badge:
        return
    already = (
        await db.execute(
            select(StudentBadge).where(
                StudentBadge.student_id == _to_uuid(student_id),
                StudentBadge.badge_id == badge.id,
            )
        )
    ).scalar_one_or_none()
    if not already:
        db.add(
            StudentBadge(
                id=uuid4(),
                student_id=_to_uuid(student_id),
                badge_id=badge.id,
            )
        )
        await db.commit()


async def get_leaderboard(
    db: AsyncSession,
    class_id: str | None = None,
    period: str = "all",
) -> list[dict]:
    query = (
        select(User, StudentProfile)
        .join(StudentProfile, User.id == StudentProfile.student_id)
        .where(User.role == "student")
    )

    if class_id:
        query = query.join(
            ClassEnrollment,
            ClassEnrollment.student_id == User.id,
        ).where(ClassEnrollment.class_id == _to_uuid(class_id))

    # Period filtering (for future use)
    if period == "month":
        thirty_days_ago = date.today() - timedelta(days=30)
        query = query.where(StudentProfile.last_activity_date >= thirty_days_ago)

    query = query.order_by(StudentProfile.xp_total.desc()).limit(20)
    result = await db.execute(query)
    rows = result.all()

    return [
        {
            "student_id": str(user.id),
            "first_name": user.first_name,
            "last_name": user.last_name,
            "xp_total": profile.xp_total,
            "level": profile.level,
            "rank": rank,
        }
        for rank, (user, profile) in enumerate(rows, start=1)
    ]


async def get_at_risk_students(
    db: AsyncSession,
    class_id: str | None = None,
) -> list[dict]:
    query = select(User).where(User.role == "student")
    if class_id:
        query = query.join(ClassEnrollment, ClassEnrollment.student_id == User.id).where(
            ClassEnrollment.class_id == _to_uuid(class_id)
        )

    result = await db.execute(query)
    students = result.scalars().all()

    thirty_days_ago = date.today() - timedelta(days=30)
    risk_students = []

    for student in students:
        absence_count = (
            await db.execute(
                select(func.count()).where(
                    Absence.student_id == student.id,
                    Absence.date >= thirty_days_ago,
                )
            )
        ).scalar() or 0

        profile = (
            await db.execute(select(StudentProfile).where(StudentProfile.student_id == student.id))
        ).scalar_one_or_none()

        adaptive_level = profile.adaptive_level if profile else "normal"
        adaptive_score = profile.adaptive_score if profile else 0.5
        streak = profile.streak_days if profile else 0

        risk = 0.0
        if absence_count > 0:
            risk += min(absence_count / 20.0, 1.0) * 0.35
        if adaptive_level == "remediation":
            risk += 0.30
        elif adaptive_level == "normal" and adaptive_score < 0.6:
            risk += 0.10
        if streak == 0:
            risk += 0.15
        elif streak < 3:
            risk += 0.07

        risk = round(min(risk, 1.0), 2)

        if risk > 0.4:
            risk_students.append(
                {
                    "student_id": str(student.id),
                    "first_name": student.first_name,
                    "last_name": student.last_name,
                    "risk_score": risk,
                    "absences_last_30d": absence_count,
                    "adaptive_level": adaptive_level,
                    "streak_days": streak,
                }
            )

    return sorted(risk_students, key=lambda x: x["risk_score"], reverse=True)

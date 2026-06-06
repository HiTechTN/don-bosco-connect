from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.database import get_db
from app.models.base import Badge, StudentBadge, User, XPTransaction
from app.schemas.gamification import (
    BadgeResponse,
    DropoutRiskStudent,
    LeaderboardEntry,
    StudentBadgeResponse,
    StudentProfileResponse,
    XPTransactionResponse,
)
from app.services.cache_service import get_cached, set_cache
from app.services.gamification_service import (
    get_at_risk_students,
    get_leaderboard,
    get_or_create_profile,
)

router = APIRouter(prefix="/gamification", tags=["gamification"])


@router.get("/profile", response_model=StudentProfileResponse)
async def get_my_profile(
    db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)
):
    if current_user.role != "student":
        raise HTTPException(
            status_code=403,
            detail={
                "error": {"code": "GAMIFICATION_STUDENTS_ONLY", "message": "Réservé aux élèves"}
            },
        )
    return await get_or_create_profile(db, str(current_user.id))


@router.get("/badges", response_model=list[BadgeResponse])
async def list_badges(
    db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)
):
    cache_key = "badges_all"
    cached = await get_cached(cache_key)
    if cached:
        return [BadgeResponse(**b) for b in cached]
    result = await db.execute(select(Badge))
    badges = result.scalars().all()
    badge_data = [
        {
            "id": str(b.id),
            "code": b.code,
            "name": b.name,
            "description": b.description,
            "icon_url": b.icon_url,
            "xp_reward": b.xp_reward,
            "condition_type": b.condition_type,
            "condition_value": b.condition_value,
        }
        for b in badges
    ]
    await set_cache(cache_key, badge_data)
    return badges


@router.get("/my-badges", response_model=list[StudentBadgeResponse])
async def my_badges(
    db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)
):
    if current_user.role != "student":
        raise HTTPException(
            status_code=403,
            detail={
                "error": {"code": "GAMIFICATION_STUDENTS_ONLY", "message": "Réservé aux élèves"}
            },
        )
    result = await db.execute(
        select(StudentBadge).where(StudentBadge.student_id == current_user.id)
    )
    sbadges = result.scalars().all()
    resp = []
    for sb in sbadges:
        badge = (
            await db.execute(select(Badge).where(Badge.id == sb.badge_id))
        ).scalar_one_or_none()
        resp.append(
            {
                "id": str(sb.id),
                "student_id": str(sb.student_id),
                "badge": badge,
                "awarded_at": sb.awarded_at,
            }
        )
    return resp


@router.get("/leaderboard", response_model=list[LeaderboardEntry])
async def leaderboard(
    class_id: str | None = Query(None),
    period: str = Query("all"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    cache_key = f"leaderboard:{class_id or 'global'}:{period}"
    cached = await get_cached(cache_key)
    if cached:
        return [LeaderboardEntry(**entry) for entry in cached]
    data = await get_leaderboard(db, class_id, period)
    if data:
        await set_cache(cache_key, data, ttl=120)
    return data or []


@router.get("/xp-history", response_model=list[XPTransactionResponse])
async def xp_history(
    db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)
):
    if current_user.role != "student":
        raise HTTPException(
            status_code=403,
            detail={
                "error": {"code": "GAMIFICATION_STUDENTS_ONLY", "message": "Réservé aux élèves"}
            },
        )
    result = await db.execute(
        select(XPTransaction)
        .where(XPTransaction.student_id == current_user.id)
        .order_by(XPTransaction.created_at.desc())
    )
    return result.scalars().all()


@router.get("/at-risk", response_model=list[DropoutRiskStudent])
async def dropout_risk(
    class_id: str | None = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List students at risk of dropping out. Accessible by admin and teachers."""
    if current_user.role not in ("admin", "teacher"):
        raise HTTPException(
            status_code=403,
            detail={
                "error": {
                    "code": "GAMIFICATION_ADMIN_TEACHER_ONLY",
                    "message": "Accès réservé aux administrateurs et enseignants",
                }
            },
        )
    return await get_at_risk_students(db, class_id)

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional

from app.database import get_db
from app.api.deps import get_current_user
from app.schemas.gamification import (
    StudentProfileResponse, BadgeResponse, StudentBadgeResponse,
    XPTransactionResponse, LeaderboardEntry, DropoutRiskStudent,
)
from app.models.base import User, StudentProfile, Badge, StudentBadge, XPTransaction
from app.services.gamification_service import get_or_create_profile, get_leaderboard, get_at_risk_students
from app.services.cache_service import get_cached, set_cache

router = APIRouter(prefix="/gamification", tags=["gamification"])


@router.get("/profile", response_model=StudentProfileResponse)
async def get_my_profile(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "student":
        raise HTTPException(status_code=403, detail="Réservé aux élèves")
    return await get_or_create_profile(db, str(current_user.id))


@router.get("/badges", response_model=List[BadgeResponse])
async def list_badges(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    cache_key = "badges_all"
    cached = await get_cached(cache_key)
    if cached:
        return [BadgeResponse(**b) for b in cached]
    result = await db.execute(select(Badge))
    badges = result.scalars().all()
    await set_cache(
        cache_key,
        [
            {
                "id": str(b.id), "code": b.code, "name": b.name,
                "description": b.description, "icon_url": b.icon_url,
                "xp_reward": b.xp_reward, "condition_type": b.condition_type,
                "condition_value": b.condition_value,
            }
            for b in badges
        ],
    )
    return badges


@router.get("/my-badges", response_model=List[StudentBadgeResponse])
async def my_badges(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "student":
        raise HTTPException(status_code=403, detail="Réservé aux élèves")
    result = await db.execute(
        select(StudentBadge).where(StudentBadge.student_id == current_user.id)
    )
    sbadges = result.scalars().all()
    resp = []
    for sb in sbadges:
        badge = (
            await db.execute(select(Badge).where(Badge.id == sb.badge_id))
        ).scalar_one_or_none()
        resp.append({
            "id": str(sb.id),
            "student_id": str(sb.student_id),
            "badge": badge,
            "awarded_at": sb.awarded_at,
        })
    return resp


@router.get("/leaderboard", response_model=List[LeaderboardEntry])
async def leaderboard(
    class_id: Optional[str] = Query(None),
    period: str = Query("all"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    cache_key = f"leaderboard:{class_id or 'global'}:{period}"
    cached = await get_cached(cache_key)
    if cached:
        return [LeaderboardEntry(**entry) for entry in cached]
    data = await get_leaderboard(db, class_id, period)
    await set_cache(cache_key, data, ttl=120)
    return data


@router.get("/xp-history", response_model=List[XPTransactionResponse])
async def xp_history(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "student":
        raise HTTPException(status_code=403, detail="Réservé aux élèves")
    result = await db.execute(
        select(XPTransaction)
        .where(XPTransaction.student_id == current_user.id)
        .order_by(XPTransaction.created_at.desc())
    )
    return result.scalars().all()


@router.get("/at-risk", response_model=List[DropoutRiskStudent])
async def dropout_risk(
    class_id: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List students at risk of dropping out. Accessible by admin and teachers."""
    if current_user.role not in ("admin", "teacher"):
        raise HTTPException(status_code=403, detail="Accès réservé aux administrateurs et enseignants")
    return await get_at_risk_students(db, class_id)
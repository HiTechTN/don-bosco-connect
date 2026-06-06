"""Admin announcement endpoints (RBAC admin only)."""

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.core.permissions import require_roles
from app.database import get_db
from app.models.base import User, UserRole
from app.services.announcement_service import AnnouncementService
from app.services.audit_service import log_audit

router = APIRouter(tags=["announcements"])


@router.get("/announcements")
async def list_announcements(
    status: str | None = None,
    category: str | None = None,
    q: str | None = None,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.admin])),
):
    """List all announcements (draft+published+archived). Admin only."""
    return await AnnouncementService.list_admin(db, page, per_page, status, category, q)


@router.get("/announcements/{announcement_id}")
async def get_announcement(
    announcement_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.admin])),
):
    """Get announcement details. Admin only."""
    ann = await AnnouncementService.get_by_id(db, announcement_id)
    if not ann:
        raise HTTPException(
            status_code=404,
            detail={"error": {"code": "ANNOUNCEMENT_NOT_FOUND", "message": "Annonce non trouvée"}},
        )
    from app.services.announcement_service import (
        _get_reactions_aggregate,
        announcement_response_dict,
    )

    data = announcement_response_dict(ann)
    data["reactions"] = await _get_reactions_aggregate(db, ann.id)
    return data


@router.post("/announcements", status_code=201)
async def create_announcement(
    data: dict,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.admin])),
):
    """Create a new announcement (draft by default)."""
    ann = await AnnouncementService.create(db, data, str(current_user.id))
    await log_audit(
        db,
        user_id=current_user.id,
        action="announcement.create",
        resource_type="announcement",
        resource_id=ann.id,
        metadata={"title": ann.title, "status": ann.status},
    )
    from app.services.announcement_service import announcement_response_dict

    return announcement_response_dict(ann)


@router.patch("/announcements/{announcement_id}")
async def update_announcement(
    announcement_id: str,
    data: dict,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.admin])),
):
    """Update an announcement."""
    ann = await AnnouncementService.update(db, announcement_id, data)
    if not ann:
        raise HTTPException(
            status_code=404,
            detail={"error": {"code": "ANNOUNCEMENT_NOT_FOUND", "message": "Annonce non trouvée"}},
        )
    from app.services.announcement_service import announcement_response_dict

    return announcement_response_dict(ann)


@router.post("/announcements/{announcement_id}/publish")
async def publish_announcement(
    announcement_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.admin])),
):
    """Publish an announcement (status → published)."""
    ann = await AnnouncementService.publish(db, announcement_id)
    if not ann:
        raise HTTPException(
            status_code=404,
            detail={"error": {"code": "ANNOUNCEMENT_NOT_FOUND", "message": "Annonce non trouvée"}},
        )
    await log_audit(
        db,
        user_id=current_user.id,
        action="announcement.publish",
        resource_type="announcement",
        resource_id=ann.id,
        metadata={"title": ann.title, "visibility": ann.visibility},
    )
    from app.services.announcement_service import announcement_response_dict

    return announcement_response_dict(ann)


@router.post("/announcements/{announcement_id}/archive")
async def archive_announcement(
    announcement_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.admin])),
):
    """Archive an announcement."""
    ann = await AnnouncementService.archive(db, announcement_id)
    if not ann:
        raise HTTPException(
            status_code=404,
            detail={"error": {"code": "ANNOUNCEMENT_NOT_FOUND", "message": "Annonce non trouvée"}},
        )
    await log_audit(
        db,
        user_id=current_user.id,
        action="announcement.archive",
        resource_type="announcement",
        resource_id=ann.id,
        metadata={"title": ann.title},
    )
    from app.services.announcement_service import announcement_response_dict

    return announcement_response_dict(ann)


@router.delete("/announcements/{announcement_id}", status_code=204)
async def delete_announcement(
    announcement_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.admin])),
) -> None:
    """Delete an announcement (hard delete)."""
    ok = await AnnouncementService.delete(db, announcement_id)
    if not ok:
        raise HTTPException(
            status_code=404,
            detail={"error": {"code": "ANNOUNCEMENT_NOT_FOUND", "message": "Annonce non trouvée"}},
        )
    await log_audit(
        db,
        user_id=current_user.id,
        action="announcement.delete",
        resource_type="announcement",
        resource_id=UUID(announcement_id) if announcement_id else None,
    )


@router.post("/announcements/{announcement_id}/reactions")
async def add_reaction(
    announcement_id: str,
    data: dict,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Add a reaction emoji to an announcement."""
    import uuid as _uuid

    from sqlalchemy import select

    from app.models.announcement import AnnouncementReaction

    emoji = data.get("emoji", "")
    if not emoji:
        raise HTTPException(
            status_code=400,
            detail={"error": {"code": "ANNOUNCEMENT_EMOJI_REQUIRED", "message": "Emoji requis"}},
        )

    # Check if reaction already exists
    existing = await db.execute(
        select(AnnouncementReaction).where(
            AnnouncementReaction.announcement_id == announcement_id,
            AnnouncementReaction.user_id == current_user.id,
            AnnouncementReaction.emoji == emoji,
        )
    )
    if existing.scalar_one_or_none():
        raise HTTPException(
            status_code=409,
            detail={
                "error": {"code": "REACTION_ALREADY_ADDED", "message": "Réaction déjà ajoutée"}
            },
        )

    reaction = AnnouncementReaction(
        id=_uuid.uuid4(),
        announcement_id=announcement_id,
        user_id=current_user.id,
        emoji=emoji,
    )
    db.add(reaction)
    await db.commit()
    return {"ok": True}


@router.get("/announcements/{announcement_id}/reactions")
async def get_reactions(
    announcement_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Get aggregated reactions for an announcement."""
    from app.services.announcement_service import _get_reactions_aggregate

    return await _get_reactions_aggregate(db, announcement_id)


@router.delete("/announcements/{announcement_id}/reactions/{emoji}")
async def remove_reaction(
    announcement_id: str,
    emoji: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Remove a specific reaction from the current user."""
    from sqlalchemy import select

    from app.models.announcement import AnnouncementReaction

    result = await db.execute(
        select(AnnouncementReaction).where(
            AnnouncementReaction.announcement_id == announcement_id,
            AnnouncementReaction.user_id == current_user.id,
            AnnouncementReaction.emoji == emoji,
        )
    )
    reaction = result.scalar_one_or_none()
    if not reaction:
        raise HTTPException(
            status_code=404,
            detail={"error": {"code": "REACTION_NOT_FOUND", "message": "Réaction non trouvée"}},
        )

    await db.delete(reaction)
    await db.commit()
    return {"ok": True}

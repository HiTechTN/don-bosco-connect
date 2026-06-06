"""Public announcement endpoints (no auth required)."""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.services.announcement_service import AnnouncementService

router = APIRouter(prefix="/public", tags=["public"])


@router.get("/announcements")
async def list_public_announcements(
    page: int = Query(1, ge=1),
    per_page: int = Query(12, ge=1, le=100),
    category: str | None = None,
    q: str | None = None,
    db: AsyncSession = Depends(get_db),
):
    """
    Returns ONLY status='published' AND visibility='public'
    AND (publish_at IS NULL OR publish_at <= NOW()).
    Never exposes: created_by, allowed_roles, content_json raw.
    """
    return await AnnouncementService.list_public(db, page, per_page, category, q)


@router.get("/announcements/{slug}")
async def get_public_announcement(
    slug: str,
    db: AsyncSession = Depends(get_db),
):
    """Increments views_count. Returns content_html sanitized (never content_json)."""
    result = await AnnouncementService.get_public_by_slug(db, slug)
    if not result:
        raise HTTPException(
            status_code=404,
            detail={"error": {"code": "ANNOUNCEMENT_NOT_FOUND", "message": "Annonce non trouvée"}},
        )
    return result

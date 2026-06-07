from fastapi import APIRouter, Depends, Query
from sqlalchemy import func, select
from sqlalchemy import update as sa_update
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.core.error_codes import NOTIFICATION_NOT_FOUND
from app.core.exceptions import NotFoundException
from app.database import get_db
from app.models.base import Notification, User

router = APIRouter(prefix="/notifications", tags=["notifications"])


@router.get("")
async def list_notifications(
    is_read: bool | None = Query(None),
    type: str | None = Query(None),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = select(Notification).where(Notification.user_id == current_user.id)
    if is_read is not None:
        query = query.where(Notification.is_read == is_read)
    if type:
        query = query.where(Notification.type == type)

    count_query = select(func.count()).select_from(query.subquery())
    total = (await db.execute(count_query)).scalar()

    query = query.order_by(Notification.created_at.desc())
    query = query.offset((page - 1) * per_page).limit(per_page)
    result = await db.execute(query)
    notifications = result.scalars().all()

    pages = (total + per_page - 1) // per_page

    return {
        "items": [
            {
                "id": str(n.id),
                "type": n.type.value if hasattr(n.type, "value") else str(n.type),
                "title": n.title,
                "body": n.body,
                "is_read": n.is_read,
                "data": n.data,
                "created_at": n.created_at.isoformat() if n.created_at else None,
            }
            for n in notifications
        ],
        "total": total,
        "page": page,
        "per_page": per_page,
        "pages": pages,
    }


@router.patch("/{notification_id}/read")
async def mark_read(
    notification_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Notification).where(
            Notification.id == notification_id,
            Notification.user_id == current_user.id,
        )
    )
    notification = result.scalar_one_or_none()
    if not notification:
        raise NotFoundException("Notification", error_code=NOTIFICATION_NOT_FOUND)
    notification.is_read = True
    await db.commit()
    return {"message": "Notification marquée comme lue"}


@router.patch("/read-all")
async def mark_all_read(
    db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)
):
    await db.execute(
        sa_update(Notification)
        .where(
            Notification.user_id == current_user.id,
            ~Notification.is_read,
        )
        .values(is_read=True)
    )
    await db.commit()
    return {"message": "Toutes les notifications marquées comme lues"}


@router.delete("/{notification_id}")
async def delete_notification(
    notification_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Notification).where(
            Notification.id == notification_id,
            Notification.user_id == current_user.id,
        )
    )
    notification = result.scalar_one_or_none()
    if not notification:
        raise NotFoundException("Notification", error_code=NOTIFICATION_NOT_FOUND)
    await db.delete(notification)
    await db.commit()
    return {"message": "Notification supprimée"}

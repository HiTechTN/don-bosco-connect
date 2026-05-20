from datetime import datetime
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.core.permissions import require_roles
from app.database import get_db
from app.models import SchoolEvent, User, UserRole
from app.schemas.events import EventCreate, EventListResponse, EventResponse, EventUpdate

router = APIRouter(tags=["events"])


@router.get("/events", response_model=EventListResponse)
async def list_events(
    from_date: datetime | None = Query(None, alias="from"),
    to_date: datetime | None = Query(None, alias="to"),
    class_id: str | None = None,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = select(SchoolEvent).order_by(SchoolEvent.start_datetime)

    if from_date:
        query = query.where(SchoolEvent.start_datetime >= from_date)
    if to_date:
        query = query.where(SchoolEvent.end_datetime <= to_date)

    result = await db.execute(query)
    items = result.scalars().all()
    return EventListResponse(
        items=[EventResponse.model_validate(e) for e in items],
        total=len(items),
        page=page,
        per_page=per_page,
        pages=max(1, (len(items) + per_page - 1) // per_page),
    )


@router.post("/events", response_model=EventResponse, status_code=201)
async def create_event(
    data: EventCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.admin])),
):
    event = SchoolEvent(
        id=uuid4(),
        title=data.title,
        description=data.description,
        event_type=data.event_type,
        start_datetime=data.start_datetime,
        end_datetime=data.end_datetime,
        all_day=data.all_day,
        target_classes=data.target_classes,
        created_by=current_user.id,
    )
    db.add(event)
    await db.flush()
    await db.refresh(event)
    return EventResponse.model_validate(event)


@router.patch("/events/{event_id}", response_model=EventResponse)
async def update_event(
    event_id: str,
    data: EventUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.admin])),
):
    result = await db.execute(select(SchoolEvent).where(SchoolEvent.id == event_id))
    event = result.scalar_one_or_none()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(event, key, value)

    await db.flush()
    await db.refresh(event)
    return EventResponse.model_validate(event)


@router.delete("/events/{event_id}", status_code=204)
async def delete_event(
    event_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.admin])),
) -> None:
    result = await db.execute(select(SchoolEvent).where(SchoolEvent.id == event_id))
    event = result.scalar_one_or_none()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    await db.execute(delete(SchoolEvent).where(SchoolEvent.id == event_id))
    await db.flush()

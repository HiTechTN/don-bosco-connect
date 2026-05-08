from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_
from typing import Optional
import uuid

from app.database import get_db
from app.api.deps import get_current_user
from app.models.base import TimetableSlot, Subject, Class, User, UserRole
from app.schemas.timetable import TimetableSlotResponse, TimetableSlotCreate, TimetableSlotUpdate
from app.core.permissions import require_roles
from app.core.exceptions import NotFoundException, ConflictException

router = APIRouter(prefix="/timetable", tags=["timetable"])


@router.get("/", response_model=list[TimetableSlotResponse])
async def list_timetable(
    class_id: Optional[str] = Query(None),
    academic_year_id: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = select(TimetableSlot)
    if class_id:
        query = query.where(TimetableSlot.class_id == uuid.UUID(class_id))
    if academic_year_id:
        query = query.where(TimetableSlot.academic_year_id == uuid.UUID(academic_year_id))
    result = await db.execute(query.order_by(TimetableSlot.day, TimetableSlot.start_time))
    slots = result.scalars().all()
    return [TimetableSlotResponse.model_validate(slot) for slot in slots]


@router.post("/slots", response_model=TimetableSlotResponse)
async def create_timetable_slot(
    slot_data: TimetableSlotCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.admin))
):
    result = await db.execute(select(Class).where(Class.id == slot_data.class_id))
    if not result.scalar_one_or_none():
        raise NotFoundException("Classe non trouvée")
    if slot_data.subject_id:
        result = await db.execute(select(Subject).where(Subject.id == slot_data.subject_id))
        if not result.scalar_one_or_none():
            raise NotFoundException("Matière non trouvée")
    if slot_data.teacher_id:
        result = await db.execute(select(User).where(User.id == slot_data.teacher_id))
        teacher = result.scalar_one_or_none()
        if not teacher or teacher.role != UserRole.teacher:
            raise NotFoundException("Professeur non trouvé ou invalide")
    result = await db.execute(
        select(TimetableSlot).where(
            and_(
                TimetableSlot.class_id == slot_data.class_id,
                TimetableSlot.day == slot_data.day,
                or_(
                    and_(
                        TimetableSlot.start_time < slot_data.end_time,
                        TimetableSlot.end_time > slot_data.start_time
                    )
                )
            )
        )
    )
    if result.scalar_one_or_none():
        raise ConflictException("Un créneau existe déjà pour cette classe à cette heure")
    slot = TimetableSlot(
        id=uuid.uuid4(),
        class_id=slot_data.class_id,
        subject_id=slot_data.subject_id,
        teacher_id=slot_data.teacher_id,
        day=slot_data.day,
        start_time=slot_data.start_time,
        end_time=slot_data.end_time,
        room=slot_data.room,
        academic_year_id=slot_data.academic_year_id,
    )
    db.add(slot)
    await db.commit()
    await db.refresh(slot)
    return TimetableSlotResponse.model_validate(slot)


@router.patch("/slots/{slot_id}", response_model=TimetableSlotResponse)
async def update_timetable_slot(
    slot_id: str,
    slot_data: TimetableSlotUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.admin))
):
    try:
        slot_uuid = uuid.UUID(slot_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="ID créneau invalide")
    result = await db.execute(select(TimetableSlot).where(TimetableSlot.id == slot_uuid))
    slot = result.scalar_one_or_none()
    if not slot:
        raise NotFoundException("Créneau non trouvé")
    if slot_data.subject_id is not None:
        slot.subject_id = slot_data.subject_id
    if slot_data.teacher_id is not None:
        slot.teacher_id = slot_data.teacher_id
    if slot_data.day is not None:
        slot.day = slot_data.day
    if slot_data.start_time is not None:
        slot.start_time = slot_data.start_time
    if slot_data.end_time is not None:
        slot.end_time = slot_data.end_time
    if slot_data.room is not None:
        slot.room = slot_data.room
    await db.commit()
    await db.refresh(slot)
    return TimetableSlotResponse.model_validate(slot)


@router.delete("/slots/{slot_id}")
async def delete_timetable_slot(
    slot_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.admin))
):
    try:
        slot_uuid = uuid.UUID(slot_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="ID créneau invalide")
    result = await db.execute(select(TimetableSlot).where(TimetableSlot.id == slot_uuid))
    slot = result.scalar_one_or_none()
    if not slot:
        raise NotFoundException("Créneau non trouvé")
    await db.delete(slot)
    await db.commit()
    return {"message": "Créneau supprimé"}
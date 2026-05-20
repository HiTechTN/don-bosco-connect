import uuid

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.core.exceptions import NotFoundException
from app.core.permissions import require_roles
from app.database import get_db
from app.models.base import Absence, User, UserRole
from app.schemas.absence import AbsenceCreate, AbsenceResponse, AbsenceUpdate
from app.services.absence_service import create_absence

router = APIRouter(prefix="/absences", tags=["absences"])


@router.post("", response_model=AbsenceResponse, status_code=201)
async def create_new_absence(
    body: AbsenceCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.admin, UserRole.teacher)),
):
    absence = await create_absence(db, str(current_user.id), body.model_dump())
    return AbsenceResponse.model_validate(absence)


@router.get("", response_model=list[AbsenceResponse])
async def list_absences(
    student_id: str | None = Query(None),
    class_id: str | None = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = select(Absence)
    if student_id:
        query = query.where(Absence.student_id == uuid.UUID(student_id))
    if class_id:
        query = query.where(Absence.class_id == uuid.UUID(class_id))
    if current_user.role == UserRole.student:
        query = query.where(Absence.student_id == current_user.id)
    result = await db.execute(query.order_by(Absence.date.desc()))
    absences = result.scalars().all()
    return [AbsenceResponse.model_validate(a) for a in absences]


@router.get("/{absence_id}", response_model=AbsenceResponse)
async def get_absence(
    absence_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        abs_uuid = uuid.UUID(absence_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="ID absence invalide")
    result = await db.execute(select(Absence).where(Absence.id == abs_uuid))
    absence = result.scalar_one_or_none()
    if not absence:
        raise NotFoundException("Absence non trouvée")
    return AbsenceResponse.model_validate(absence)


@router.patch("/{absence_id}/justify")
async def justify_absence(
    absence_id: str,
    body: AbsenceUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        abs_uuid = uuid.UUID(absence_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="ID absence invalide")
    result = await db.execute(select(Absence).where(Absence.id == abs_uuid))
    absence = result.scalar_one_or_none()
    if not absence:
        raise NotFoundException("Absence non trouvée")
    for k, v in body.model_dump(exclude_unset=True).items():
        setattr(absence, k, v)
    await db.commit()
    return {"message": "Absence mise à jour"}

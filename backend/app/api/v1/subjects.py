import uuid

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.core.exceptions import ConflictException, NotFoundException
from app.core.permissions import require_roles
from app.database import get_db
from app.models.base import Subject, User, UserRole
from app.schemas.subject import SubjectCreate, SubjectListResponse, SubjectResponse, SubjectUpdate

router = APIRouter(prefix="/subjects", tags=["subjects"])


@router.get("/", response_model=SubjectListResponse)
async def list_subjects(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = select(Subject)
    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar()
    query = query.offset((page - 1) * per_page).limit(per_page)
    result = await db.execute(query)
    subjects = result.scalars().all()
    pages = (total + per_page - 1) // per_page
    return SubjectListResponse(
        items=[SubjectResponse.model_validate(s) for s in subjects],
        total=total,
        page=page,
        per_page=per_page,
        pages=pages,
    )


@router.post("/", response_model=SubjectResponse)
async def create_subject(
    subject_data: SubjectCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.admin)),
):
    result = await db.execute(select(Subject).where(Subject.code == subject_data.code))
    if result.scalar_one_or_none():
        raise ConflictException("Une matière avec ce code existe déjà")
    subject = Subject(
        id=uuid.uuid4(),
        name=subject_data.name,
        name_ar=subject_data.name_ar,
        code=subject_data.code,
        color=subject_data.color,
        coefficient=subject_data.coefficient,
        description=subject_data.description,
    )
    db.add(subject)
    await db.commit()
    await db.refresh(subject)
    return SubjectResponse.model_validate(subject)


@router.get("/{subject_id}", response_model=SubjectResponse)
async def get_subject(
    subject_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        subject_uuid = uuid.UUID(subject_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="ID matière invalide")
    result = await db.execute(select(Subject).where(Subject.id == subject_uuid))
    subject = result.scalar_one_or_none()
    if not subject:
        raise NotFoundException("Matière non trouvée")
    return SubjectResponse.model_validate(subject)


@router.patch("/{subject_id}", response_model=SubjectResponse)
async def update_subject(
    subject_id: str,
    subject_data: SubjectUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.admin)),
):
    try:
        subject_uuid = uuid.UUID(subject_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="ID matière invalide")
    result = await db.execute(select(Subject).where(Subject.id == subject_uuid))
    subject = result.scalar_one_or_none()
    if not subject:
        raise NotFoundException("Matière non trouvée")
    if subject_data.name is not None:
        subject.name = subject_data.name
    if subject_data.name_ar is not None:
        subject.name_ar = subject_data.name_ar
    if subject_data.code is not None:
        subject.code = subject_data.code
    if subject_data.color is not None:
        subject.color = subject_data.color
    if subject_data.coefficient is not None:
        subject.coefficient = subject_data.coefficient
    if subject_data.description is not None:
        subject.description = subject_data.description
    await db.commit()
    await db.refresh(subject)
    return SubjectResponse.model_validate(subject)


@router.delete("/{subject_id}")
async def delete_subject(
    subject_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.admin)),
):
    try:
        subject_uuid = uuid.UUID(subject_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="ID matière invalide")
    result = await db.execute(select(Subject).where(Subject.id == subject_uuid))
    subject = result.scalar_one_or_none()
    if not subject:
        raise NotFoundException("Matière non trouvée")
    await db.delete(subject)
    await db.commit()
    return {"message": "Matière supprimée"}

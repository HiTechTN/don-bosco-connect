import uuid

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.core.exceptions import NotFoundException
from app.core.permissions import require_roles
from app.database import get_db
from app.models.base import Evaluation, Grade, User, UserRole
from app.schemas.evaluation import (
    BulkGradeInput,
    EvaluationCreate,
    EvaluationResponse,
    EvaluationUpdate,
    GradeResponse,
)
from app.services.grade_service import bulk_insert_grades, create_evaluation, publish_evaluation

router = APIRouter(prefix="/evaluations", tags=["evaluations"])


@router.post("", response_model=EvaluationResponse, status_code=201)
async def create_new_evaluation(
    body: EvaluationCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.admin, UserRole.teacher)),
):
    eval_ = await create_evaluation(db, str(current_user.id), body.model_dump())
    return EvaluationResponse.model_validate(eval_)


@router.get("", response_model=list[EvaluationResponse])
async def list_evaluations(
    class_id: str | None = Query(None),
    subject_id: str | None = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = select(Evaluation)
    if class_id:
        query = query.where(Evaluation.class_id == uuid.UUID(class_id))
    if subject_id:
        query = query.where(Evaluation.subject_id == uuid.UUID(subject_id))
    if current_user.role == UserRole.student:
        query = query.where(Evaluation.is_published)
    result = await db.execute(query)
    evals = result.scalars().all()
    return [EvaluationResponse.model_validate(e) for e in evals]


@router.get("/{evaluation_id}", response_model=EvaluationResponse)
async def get_evaluation(
    evaluation_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        eval_uuid = uuid.UUID(evaluation_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="ID évaluation invalide")
    result = await db.execute(select(Evaluation).where(Evaluation.id == eval_uuid))
    eval_ = result.scalar_one_or_none()
    if not eval_:
        raise NotFoundException("Évaluation non trouvée")
    if current_user.role == UserRole.student and not eval_.is_published:
        raise HTTPException(status_code=403, detail="Notes non publiées")
    return EvaluationResponse.model_validate(eval_)


@router.patch("/{evaluation_id}")
async def update_evaluation(
    evaluation_id: str,
    body: EvaluationUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.admin, UserRole.teacher)),
):
    try:
        eval_uuid = uuid.UUID(evaluation_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="ID évaluation invalide")
    result = await db.execute(select(Evaluation).where(Evaluation.id == eval_uuid))
    eval_ = result.scalar_one_or_none()
    if not eval_:
        raise NotFoundException("Évaluation non trouvée")
    for k, v in body.model_dump(exclude_unset=True).items():
        setattr(eval_, k, v)
    await db.commit()
    return {"message": "Évaluation mise à jour"}


@router.delete("/{evaluation_id}")
async def delete_evaluation(
    evaluation_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.admin, UserRole.teacher)),
):
    try:
        eval_uuid = uuid.UUID(evaluation_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="ID évaluation invalide")
    result = await db.execute(select(Evaluation).where(Evaluation.id == eval_uuid))
    eval_ = result.scalar_one_or_none()
    if not eval_:
        raise NotFoundException("Évaluation non trouvée")
    await db.delete(eval_)
    await db.commit()
    return {"message": "Évaluation supprimée"}


@router.get("/{evaluation_id}/grades", response_model=list[GradeResponse])
async def get_grades(
    evaluation_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        eval_uuid = uuid.UUID(evaluation_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="ID évaluation invalide")
    result = await db.execute(select(Evaluation).where(Evaluation.id == eval_uuid))
    eval_ = result.scalar_one_or_none()
    if not eval_:
        raise NotFoundException("Évaluation non trouvée")
    if current_user.role == UserRole.student:
        if not eval_.is_published:
            raise HTTPException(status_code=403, detail="Notes non disponibles")
        result = await db.execute(
            select(Grade).where(
                Grade.evaluation_id == eval_uuid, Grade.student_id == current_user.id
            )
        )
    else:
        result = await db.execute(select(Grade).where(Grade.evaluation_id == eval_uuid))
    grades = result.scalars().all()
    return [GradeResponse.model_validate(g) for g in grades]


@router.post("/{evaluation_id}/grades")
async def add_grades(
    evaluation_id: str,
    body: BulkGradeInput,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.admin, UserRole.teacher)),
):
    try:
        eval_uuid = uuid.UUID(evaluation_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="ID évaluation invalide")
    result = await db.execute(select(Evaluation).where(Evaluation.id == eval_uuid))
    if not result.scalar_one_or_none():
        raise NotFoundException("Évaluation non trouvée")
    await bulk_insert_grades(db, evaluation_id, body.grades, str(current_user.id))
    return {"message": "Notes enregistrées"}


@router.post("/{evaluation_id}/publish")
async def publish_evaluation_endpoint(
    evaluation_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.admin, UserRole.teacher)),
):
    await publish_evaluation(db, evaluation_id)
    return {"message": "Notes publiées"}

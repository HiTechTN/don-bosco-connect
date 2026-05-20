import uuid
from datetime import UTC

from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.core.exceptions import NotFoundException
from app.core.permissions import require_roles
from app.database import get_db
from app.models.base import Course, CourseFile, User, UserRole
from app.schemas.course import CourseCreate, CourseFileResponse, CourseResponse, CourseUpdate
from app.services.course_service import create_course, upload_course_file

router = APIRouter(prefix="/courses", tags=["courses"])


@router.post("", response_model=CourseResponse, status_code=201)
async def create_new_course(
    body: CourseCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.admin, UserRole.teacher)),
):
    course = await create_course(db, str(current_user.id), body.model_dump())
    return CourseResponse.model_validate(course)


@router.get("", response_model=list[CourseResponse])
async def list_courses(
    class_id: str | None = Query(None),
    subject_id: str | None = Query(None),
    teacher_id: str | None = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = select(Course)
    if class_id:
        query = query.where(Course.class_id == uuid.UUID(class_id))
    if subject_id:
        query = query.where(Course.subject_id == uuid.UUID(subject_id))
    if teacher_id:
        query = query.where(Course.teacher_id == uuid.UUID(teacher_id))
    if current_user.role == UserRole.student:
        query = query.where(Course.is_published)
    result = await db.execute(query)
    courses = result.scalars().all()
    return [CourseResponse.model_validate(c) for c in courses]


@router.get("/{course_id}", response_model=CourseResponse)
async def get_course(
    course_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        course_uuid = uuid.UUID(course_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="ID cours invalide")
    result = await db.execute(select(Course).where(Course.id == course_uuid))
    course = result.scalar_one_or_none()
    if not course:
        raise NotFoundException("Cours non trouvé")
    if current_user.role == UserRole.student and not course.is_published:
        raise HTTPException(status_code=403, detail="Cours non publié")
    return CourseResponse.model_validate(course)


@router.patch("/{course_id}")
async def update_course(
    course_id: str,
    body: CourseUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.admin, UserRole.teacher)),
):
    try:
        course_uuid = uuid.UUID(course_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="ID cours invalide")
    result = await db.execute(select(Course).where(Course.id == course_uuid))
    course = result.scalar_one_or_none()
    if not course:
        raise NotFoundException("Cours non trouvé")
    for k, v in body.model_dump(exclude_unset=True).items():
        setattr(course, k, v)
    await db.commit()
    return {"message": "Cours mis à jour"}


@router.delete("/{course_id}")
async def delete_course(
    course_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.admin, UserRole.teacher)),
):
    try:
        course_uuid = uuid.UUID(course_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="ID cours invalide")
    result = await db.execute(select(Course).where(Course.id == course_uuid))
    course = result.scalar_one_or_none()
    if not course:
        raise NotFoundException("Cours non trouvé")
    await db.delete(course)
    await db.commit()
    return {"message": "Cours supprimé"}


@router.post("/{course_id}/publish")
async def publish_course(
    course_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.admin, UserRole.teacher)),
):
    try:
        course_uuid = uuid.UUID(course_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="ID cours invalide")
    result = await db.execute(select(Course).where(Course.id == course_uuid))
    course = result.scalar_one_or_none()
    if not course:
        raise NotFoundException("Cours non trouvé")
    course.is_published = True
    from datetime import datetime

    course.published_at = datetime.now(UTC)
    await db.commit()
    return {"message": "Cours publié"}


@router.post("/{course_id}/files", response_model=CourseFileResponse)
async def upload_file(
    course_id: str,
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.admin, UserRole.teacher)),
):
    try:
        course_uuid = uuid.UUID(course_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="ID cours invalide")
    result = await db.execute(select(Course).where(Course.id == course_uuid))
    if not result.scalar_one_or_none():
        raise NotFoundException("Cours non trouvé")
    cf = await upload_course_file(db, course_id, file, str(current_user.id))
    return CourseFileResponse.model_validate(cf)


@router.get("/{course_id}/files", response_model=list[CourseFileResponse])
async def list_files(
    course_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        course_uuid = uuid.UUID(course_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="ID cours invalide")
    result = await db.execute(select(CourseFile).where(CourseFile.course_id == course_uuid))
    files = result.scalars().all()
    return [CourseFileResponse.model_validate(f) for f in files]


@router.delete("/{course_id}/files/{file_id}")
async def delete_file(
    course_id: str,
    file_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.admin, UserRole.teacher)),
):
    try:
        course_uuid = uuid.UUID(course_id)
        file_uuid = uuid.UUID(file_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="ID invalide")
    result = await db.execute(
        select(CourseFile).where(CourseFile.id == file_uuid, CourseFile.course_id == course_uuid)
    )
    cf = result.scalar_one_or_none()
    if not cf:
        raise NotFoundException("Fichier non trouvé")
    from app.minio_client import get_minio

    minio_client = get_minio()
    minio_client.remove_object(cf.minio_bucket, cf.minio_key)
    await db.delete(cf)
    await db.commit()
    return {"message": "Fichier supprimé"}

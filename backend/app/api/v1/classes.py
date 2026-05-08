from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, or_, update
from typing import Optional
import uuid

from app.database import get_db
from app.api.deps import get_current_user
from app.models.base import AcademicYear, Class, ClassEnrollment, User, UserRole
from app.schemas.academic import (
    AcademicYearResponse, AcademicYearCreate,
    ClassResponse, ClassCreate, ClassUpdate,
    ClassEnrollmentResponse, EnrollmentRequest
)
from app.core.permissions import require_roles
from app.core.exceptions import NotFoundException, ConflictException

router = APIRouter(prefix="/academic-years", tags=["academic-years"])


@router.post("/", response_model=AcademicYearResponse)
async def create_academic_year(
    year_data: AcademicYearCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.admin))
):
    result = await db.execute(select(AcademicYear).where(AcademicYear.name == year_data.name))
    existing_year = result.scalar_one_or_none()
    if existing_year:
        raise ConflictException("Une année scolaire avec ce nom existe déjà")
    if year_data.is_current:
        await db.execute(update(AcademicYear).where(AcademicYear.is_current == True).values(is_current=False))
    year = AcademicYear(
        id=uuid.uuid4(),
        name=year_data.name,
        start_date=year_data.start_date,
        end_date=year_data.end_date,
        is_current=year_data.is_current
    )
    db.add(year)
    await db.commit()
    await db.refresh(year)
    return AcademicYearResponse.model_validate(year)


@router.get("/", response_model=list[AcademicYearResponse])
async def list_academic_years(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(select(AcademicYear).order_by(AcademicYear.start_date.desc()))
    years = result.scalars().all()
    return [AcademicYearResponse.model_validate(year) for year in years]


class_router = APIRouter(prefix="/classes", tags=["classes"])


@class_router.post("/", response_model=ClassResponse)
async def create_class(
    class_data: ClassCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.admin))
):
    result = await db.execute(select(AcademicYear).where(AcademicYear.id == class_data.academic_year_id))
    academic_year = result.scalar_one_or_none()
    if not academic_year:
        raise NotFoundException("Année scolaire non trouvée")
    if class_data.main_teacher_id:
        result = await db.execute(select(User).where(User.id == class_data.main_teacher_id))
        main_teacher = result.scalar_one_or_none()
        if not main_teacher or main_teacher.role != UserRole.teacher:
            raise NotFoundException("Professeur principal non trouvé ou invalide")
    new_class = Class(
        id=uuid.uuid4(),
        academic_year_id=class_data.academic_year_id,
        name=class_data.name,
        level=class_data.level,
        section=class_data.section,
        main_teacher_id=class_data.main_teacher_id,
        max_students=class_data.max_students
    )
    db.add(new_class)
    await db.commit()
    await db.refresh(new_class)
    return ClassResponse.model_validate(new_class)


@class_router.get("/", response_model=list[ClassResponse])
async def list_classes(
    academic_year_id: Optional[str] = Query(None),
    teacher_id: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = select(Class)
    if academic_year_id:
        query = query.where(Class.academic_year_id == uuid.UUID(academic_year_id))
    if teacher_id:
        query = query.where(Class.main_teacher_id == uuid.UUID(teacher_id))
    result = await db.execute(query)
    classes = result.scalars().all()
    return [ClassResponse.model_validate(cls) for cls in classes]


@class_router.get("/{class_id}", response_model=ClassResponse)
async def get_class(
    class_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        class_uuid = uuid.UUID(class_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="ID classe invalide")
    result = await db.execute(select(Class).where(Class.id == class_uuid))
    class_ = result.scalar_one_or_none()
    if not class_:
        raise NotFoundException("Classe non trouvée")
    return ClassResponse.model_validate(class_)


@class_router.patch("/{class_id}", response_model=ClassResponse)
async def update_class(
    class_id: str,
    class_data: ClassUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.admin))
):
    try:
        class_uuid = uuid.UUID(class_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="ID classe invalide")
    result = await db.execute(select(Class).where(Class.id == class_uuid))
    class_ = result.scalar_one_or_none()
    if not class_:
        raise NotFoundException("Classe non trouvée")
    if class_data.name is not None:
        class_.name = class_data.name
    if class_data.level is not None:
        class_.level = class_data.level
    if class_data.section is not None:
        class_.section = class_data.section
    if class_data.max_students is not None:
        class_.max_students = class_data.max_students
    if class_data.main_teacher_id is not None:
        result = await db.execute(select(User).where(User.id == class_data.main_teacher_id))
        teacher = result.scalar_one_or_none()
        if not teacher or teacher.role != UserRole.teacher:
            raise NotFoundException("Professeur non trouvé ou invalide")
        class_.main_teacher_id = class_data.main_teacher_id
    await db.commit()
    await db.refresh(class_)
    return ClassResponse.model_validate(class_)


enrollment_router = APIRouter(prefix="/classes/{class_id}/students", tags=["enrollments"])


@enrollment_router.get("/", response_model=list[dict])
async def list_class_students(
    class_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        class_uuid = uuid.UUID(class_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="ID classe invalide")
    result = await db.execute(
        select(User).join(ClassEnrollment).where(
            ClassEnrollment.class_id == class_uuid,
            ClassEnrollment.status == 'active'
        )
    )
    students = result.scalars().all()
    return [{"id": str(s.id), "first_name": s.first_name, "last_name": s.last_name, "email": s.email} for s in students]


@enrollment_router.post("/", response_model=ClassEnrollmentResponse)
async def enroll_student(
    class_id: str,
    enrollment_data: EnrollmentRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.admin))
):
    try:
        class_uuid = uuid.UUID(class_id)
        student_uuid = uuid.UUID(enrollment_data.student_id)
        academic_year_uuid = uuid.UUID(enrollment_data.academic_year_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="ID invalide")
    result = await db.execute(select(Class).where(Class.id == class_uuid))
    class_ = result.scalar_one_or_none()
    if not class_:
        raise NotFoundException("Classe non trouvée")
    result = await db.execute(select(User).where(User.id == student_uuid))
    student = result.scalar_one_or_none()
    if not student or student.role != UserRole.student:
        raise NotFoundException("Étudiant non trouvé")
    result = await db.execute(select(AcademicYear).where(AcademicYear.id == academic_year_uuid))
    if not result.scalar_one_or_none():
        raise NotFoundException("Année scolaire non trouvée")
    result = await db.execute(
        select(ClassEnrollment).where(
            and_(
                ClassEnrollment.student_id == student_uuid,
                ClassEnrollment.class_id == class_uuid,
                ClassEnrollment.academic_year_id == academic_year_uuid
            )
        )
    )
    if result.scalar_one_or_none():
        raise ConflictException("L'étudiant est déjà inscrit")
    result = await db.execute(
        select(func.count(ClassEnrollment.id)).where(
            and_(
                ClassEnrollment.class_id == class_uuid,
                ClassEnrollment.academic_year_id == academic_year_uuid,
                ClassEnrollment.status == 'active'
            )
        )
    )
    if result.scalar() >= class_.max_students:
        raise ConflictException("La classe est déjà complète")
    enrollment = ClassEnrollment(
        id=uuid.uuid4(),
        student_id=student_uuid,
        class_id=class_uuid,
        academic_year_id=academic_year_uuid
    )
    db.add(enrollment)
    await db.commit()
    await db.refresh(enrollment)
    return ClassEnrollmentResponse.model_validate(enrollment)


@enrollment_router.delete("/{student_id}")
async def unenroll_student(
    class_id: str,
    student_id: str,
    academic_year_id: str = Query(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.admin))
):
    try:
        class_uuid = uuid.UUID(class_id)
        student_uuid = uuid.UUID(student_id)
        academic_year_uuid = uuid.UUID(academic_year_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="ID invalide")
    result = await db.execute(
        select(ClassEnrollment).where(
            and_(
                ClassEnrollment.student_id == student_uuid,
                ClassEnrollment.class_id == class_uuid,
                ClassEnrollment.academic_year_id == academic_year_uuid
            )
        )
    )
    enrollment = result.scalar_one_or_none()
    if not enrollment:
        raise NotFoundException("Inscription non trouvée")
    await db.delete(enrollment)
    await db.commit()
    return {"message": "Étudiant désinscrit"}
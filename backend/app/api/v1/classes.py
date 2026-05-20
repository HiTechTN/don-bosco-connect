import uuid

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import and_, delete, func, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.core.exceptions import ConflictException, NotFoundException
from app.core.permissions import require_roles
from app.database import get_db
from app.models.base import AcademicYear, Class, ClassEnrollment, User, UserRole
from app.schemas.academic import (
    AcademicYearCreate,
    AcademicYearResponse,
    ClassCreate,
    ClassEnrollmentResponse,
    ClassResponse,
    ClassUpdate,
    EnrollmentRequest,
)

router = APIRouter(prefix="/academic-years", tags=["academic-years"])


@router.post("/", response_model=AcademicYearResponse)
async def create_academic_year(
    year_data: AcademicYearCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.admin)),
):
    result = await db.execute(select(AcademicYear).where(AcademicYear.name == year_data.name))
    existing_year = result.scalar_one_or_none()
    if existing_year:
        raise ConflictException("Une année scolaire avec ce nom existe déjà")
    if year_data.is_current:
        await db.execute(
            update(AcademicYear).where(AcademicYear.is_current).values(is_current=False)
        )
    year = AcademicYear(
        id=uuid.uuid4(),
        name=year_data.name,
        start_date=year_data.start_date,
        end_date=year_data.end_date,
        is_current=year_data.is_current,
    )
    db.add(year)
    await db.commit()
    await db.refresh(year)
    return AcademicYearResponse.model_validate(year)


@router.get("/", response_model=list[AcademicYearResponse])
async def list_academic_years(
    db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)
):
    result = await db.execute(select(AcademicYear).order_by(AcademicYear.start_date.desc()))
    years = result.scalars().all()
    return [AcademicYearResponse.model_validate(year) for year in years]


class_router = APIRouter(prefix="/classes", tags=["classes"])


@class_router.post("/", response_model=ClassResponse)
async def create_class(
    class_data: ClassCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.admin)),
):
    result = await db.execute(
        select(AcademicYear).where(AcademicYear.id == class_data.academic_year_id)
    )
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
        max_students=class_data.max_students,
    )
    db.add(new_class)
    await db.commit()
    await db.refresh(new_class)
    return ClassResponse.model_validate(new_class)


@class_router.get("/", response_model=list[ClassResponse])
async def list_classes(
    academic_year_id: str | None = Query(None),
    teacher_id: str | None = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = select(Class)
    if academic_year_id:
        query = query.where(Class.academic_year_id == uuid.UUID(academic_year_id))
    if teacher_id:
        query = query.where(Class.main_teacher_id == uuid.UUID(teacher_id))
    result = await db.execute(query)
    classes = result.scalars().all()
    responses = []
    for cls in classes:
        count_result = await db.execute(
            select(func.count(ClassEnrollment.id)).where(
                ClassEnrollment.class_id == cls.id, ClassEnrollment.status == "active"
            )
        )
        enrollment_count = count_result.scalar() or 0
        teacher_name = None
        if cls.main_teacher_id:
            teacher_result = await db.execute(select(User).where(User.id == cls.main_teacher_id))
            teacher = teacher_result.scalar_one_or_none()
            if teacher:
                teacher_name = f"{teacher.first_name} {teacher.last_name}"
        resp = ClassResponse.model_validate(cls)
        resp.enrollment_count = enrollment_count
        resp.main_teacher_name = teacher_name
        responses.append(resp)
    return responses


@class_router.get("/{class_id}", response_model=ClassResponse)
async def get_class(
    class_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
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
    current_user: User = Depends(require_roles(UserRole.admin)),
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


@class_router.delete("/{class_id}", status_code=204)
async def delete_class(
    class_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.admin)),
) -> None:
    try:
        class_uuid = uuid.UUID(class_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="ID classe invalide")
    result = await db.execute(select(Class).where(Class.id == class_uuid))
    class_ = result.scalar_one_or_none()
    if not class_:
        raise NotFoundException("Classe non trouvée")
    await db.execute(delete(ClassEnrollment).where(ClassEnrollment.class_id == class_uuid))
    await db.delete(class_)
    await db.commit()


enrollment_router = APIRouter(prefix="/classes/{class_id}/students", tags=["enrollments"])


@enrollment_router.get("/", response_model=list[dict])
async def list_class_students(
    class_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        class_uuid = uuid.UUID(class_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="ID classe invalide")
    result = await db.execute(
        select(ClassEnrollment, User)
        .join(User, ClassEnrollment.student_id == User.id)
        .where(ClassEnrollment.class_id == class_uuid, ClassEnrollment.status == "active")
    )
    rows = result.all()
    return [
        {
            "id": str(enr.id),
            "student_id": str(enr.student_id),
            "student_first_name": user.first_name,
            "student_last_name": user.last_name,
            "student_email": user.email,
        }
        for enr, user in rows
    ]


@enrollment_router.post("/", response_model=ClassEnrollmentResponse)
async def enroll_student(
    class_id: str,
    enrollment_data: EnrollmentRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.admin)),
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
                ClassEnrollment.academic_year_id == academic_year_uuid,
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
                ClassEnrollment.status == "active",
            )
        )
    )
    if result.scalar() >= class_.max_students:
        raise ConflictException("La classe est déjà complète")
    enrollment = ClassEnrollment(
        id=uuid.uuid4(),
        student_id=student_uuid,
        class_id=class_uuid,
        academic_year_id=academic_year_uuid,
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
    current_user: User = Depends(require_roles(UserRole.admin)),
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
                ClassEnrollment.academic_year_id == academic_year_uuid,
            )
        )
    )
    enrollment = result.scalar_one_or_none()
    if not enrollment:
        raise NotFoundException("Inscription non trouvée")
    await db.delete(enrollment)
    await db.commit()
    return {"message": "Étudiant désinscrit"}


enrollment_delete_router = APIRouter(prefix="/classes/enrollments", tags=["enrollments"])


@enrollment_delete_router.delete("/{enrollment_id}", status_code=204)
async def delete_enrollment(
    enrollment_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.admin)),
) -> None:
    try:
        enr_uuid = uuid.UUID(enrollment_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="ID inscription invalide")
    result = await db.execute(select(ClassEnrollment).where(ClassEnrollment.id == enr_uuid))
    enrollment = result.scalar_one_or_none()
    if not enrollment:
        raise NotFoundException("Inscription non trouvée")
    await db.delete(enrollment)
    await db.commit()

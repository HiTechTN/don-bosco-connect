import uuid

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.core.error_codes import STUDENT_NOT_FOUND
from app.core.exceptions import NotFoundException
from app.database import get_db
from app.models.base import (
    Absence,
    ClassEnrollment,
    Evaluation,
    Grade,
    Subject,
    User,
    UserRole,
)

router = APIRouter(prefix="/students", tags=["reports"])


@router.get("/{student_id}/grades")
async def get_student_grades(
    student_id: str,
    subject_id: str | None = Query(None),
    academic_year_id: str | None = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get grades for a student. Accessible by the student, their parents, teachers, and admin."""
    try:
        student_uuid = uuid.UUID(student_id)
    except ValueError:
        raise HTTPException(
            status_code=400,
            detail={"error": {"code": "REPORT_STUDENT_INVALID", "message": "ID étudiant invalide"}},
        )

    # Permission checks
    if current_user.role == UserRole.student and current_user.id != student_uuid:
        raise HTTPException(
            status_code=403,
            detail={"error": {"code": "REPORT_ACCESS_DENIED", "message": "Accès refusé"}},
        )
    if current_user.role == UserRole.parent:
        from app.models.base import StudentParentLink

        result = await db.execute(
            select(StudentParentLink).where(
                StudentParentLink.parent_id == current_user.id,
                StudentParentLink.student_id == student_uuid,
            )
        )
        if not result.scalar_one_or_none():
            raise HTTPException(
                status_code=403,
                detail={"error": {"code": "REPORT_ACCESS_DENIED", "message": "Accès refusé"}},
            )

    query = select(Grade).join(Evaluation).where(Grade.student_id == student_uuid)
    if subject_id:
        query = query.where(Evaluation.subject_id == uuid.UUID(subject_id))
    if academic_year_id:
        query = query.where(Evaluation.academic_year_id == uuid.UUID(academic_year_id))

    query = query.where(Evaluation.is_published)
    result = await db.execute(query)
    grades = result.scalars().all()

    return [
        {
            "id": str(g.id),
            "evaluation_id": str(g.evaluation_id),
            "score": float(g.score) if g.score else None,
            "is_absent": g.is_absent,
            "comment": g.comment,
            "graded_at": g.graded_at.isoformat() if g.graded_at else None,
        }
        for g in grades
    ]


@router.get("/{student_id}/absences")
async def get_student_absences(
    student_id: str,
    from_date: str | None = Query(None),
    to_date: str | None = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get absences for a student."""
    try:
        student_uuid = uuid.UUID(student_id)
    except ValueError:
        raise HTTPException(
            status_code=400,
            detail={"error": {"code": "REPORT_STUDENT_INVALID", "message": "ID étudiant invalide"}},
        )

    query = select(Absence).where(Absence.student_id == student_uuid)
    if from_date:
        query = query.where(Absence.date >= from_date)
    if to_date:
        query = query.where(Absence.date <= to_date)

    result = await db.execute(query.order_by(Absence.date.desc()))
    absences = result.scalars().all()
    return [
        {
            "id": str(a.id),
            "date": a.date.isoformat() if a.date else None,
            "type": a.type.value if hasattr(a.type, "value") else str(a.type),
            "justification_status": a.justification_status.value
            if hasattr(a.justification_status, "value")
            else str(a.justification_status),
            "subject_id": str(a.subject_id) if a.subject_id else None,
        }
        for a in absences
    ]


@router.get("/{student_id}/report")
async def get_student_report(
    student_id: str,
    academic_year_id: str | None = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get a student's report (bulletin) as JSON data for PDF generation."""
    try:
        student_uuid = uuid.UUID(student_id)
    except ValueError:
        raise HTTPException(
            status_code=400,
            detail={"error": {"code": "REPORT_STUDENT_INVALID", "message": "ID étudiant invalide"}},
        )

    result = await db.execute(select(User).where(User.id == student_uuid))
    student = result.scalar_one_or_none()
    if not student:
        raise NotFoundException("Étudiant", error_code=STUDENT_NOT_FOUND)

    # Get enrolled classes
    result = await db.execute(
        select(ClassEnrollment).where(
            ClassEnrollment.student_id == student_uuid,
            ClassEnrollment.status == "active",
        )
    )
    enrollments = result.scalars().all()

    from app.models.base import AcademicYear, Class

    report_data = {
        "student_name": f"{student.first_name} {student.last_name}",
        "classes": [],
    }

    for enrollment in enrollments:
        class_result = await db.execute(select(Class).where(Class.id == enrollment.class_id))
        class_ = class_result.scalar_one_or_none()
        if not class_:
            continue

        year_result = await db.execute(
            select(AcademicYear).where(AcademicYear.id == enrollment.academic_year_id)
        )
        year = year_result.scalar_one_or_none()

        # Get evaluations and grades for this class
        eval_result = await db.execute(
            select(Evaluation).where(
                Evaluation.class_id == class_.id,
                Evaluation.is_published,
            )
        )
        evaluations = eval_result.scalars().all()

        class_data = {
            "class_name": class_.name,
            "academic_year": year.name if year else "N/A",
            "subjects": [],
        }

        subject_totals = {}
        for evaluation in evaluations:
            subj_result = await db.execute(
                select(Subject).where(Subject.id == evaluation.subject_id)
            )
            subject = subj_result.scalar_one_or_none()
            if not subject:
                continue

            grade_result = await db.execute(
                select(Grade).where(
                    Grade.evaluation_id == evaluation.id,
                    Grade.student_id == student_uuid,
                )
            )
            grade = grade_result.scalar_one_or_none()
            if not grade or grade.score is None:
                continue

            subj_name = subject.name
            if subj_name not in subject_totals:
                subject_totals[subj_name] = {
                    "scores": [],
                    "coefficient": float(subject.coefficient or 1.0),
                }
            subject_totals[subj_name]["scores"].append(float(grade.score))

        for subj_name, data in subject_totals.items():
            avg = sum(data["scores"]) / len(data["scores"]) if data["scores"] else 0
            class_data["subjects"].append(
                {
                    "name": subj_name,
                    "average": round(avg, 2),
                    "coefficient": data["coefficient"],
                    "total_scores": len(data["scores"]),
                }
            )

        report_data["classes"].append(class_data)

    return report_data

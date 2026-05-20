from datetime import UTC, datetime
from uuid import UUID, uuid4

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.base import Evaluation, Grade
from app.services.notification_service import notify_students_of_grade_publish

ID_FIELDS_IN_EVALUATION = {"subject_id", "class_id", "course_id", "teacher_id", "academic_year_id"}


def _to_uuid(val: str | UUID | None) -> UUID | None:
    if val is None or val == "":
        return None
    return UUID(val) if isinstance(val, str) else val


async def create_evaluation(db: AsyncSession, teacher_id: str, data: dict) -> Evaluation:
    data["teacher_id"] = _to_uuid(teacher_id)
    for field in ID_FIELDS_IN_EVALUATION:
        if field in data and data[field] is not None:
            data[field] = _to_uuid(data[field])
    eval_ = Evaluation(id=uuid4(), **data)
    db.add(eval_)
    await db.commit()
    await db.refresh(eval_)
    return eval_


async def bulk_insert_grades(
    db: AsyncSession, evaluation_id: str, grades_data: list, teacher_id: str
) -> None:
    eval_uuid = _to_uuid(evaluation_id)
    teacher_uuid = _to_uuid(teacher_id)
    now = datetime.now(UTC)
    for g in grades_data:
        grade = Grade(
            id=uuid4(),
            evaluation_id=eval_uuid,
            student_id=_to_uuid(g.student_id),
            score=g.score,
            comment=g.comment,
            is_absent=g.is_absent,
            graded_by=teacher_uuid,
            graded_at=now,
        )
        db.add(grade)
    await db.commit()


async def publish_evaluation(db: AsyncSession, evaluation_id: str) -> None:
    eval_ = await db.get(Evaluation, _to_uuid(evaluation_id))
    if eval_:
        eval_.is_published = True
        await db.commit()
        await notify_students_of_grade_publish(db, evaluation_id)

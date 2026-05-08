from uuid import UUID, uuid4
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.base import Absence
from app.services.notification_service import notify_parents_of_absence


def _to_uuid(val: str | UUID) -> UUID:
    return UUID(val) if isinstance(val, str) else val


async def create_absence(db: AsyncSession, teacher_id: str, data: dict) -> Absence:
    data["teacher_id"] = _to_uuid(teacher_id)
    if "subject_id" in data and data["subject_id"] is not None:
        data["subject_id"] = _to_uuid(data["subject_id"])
    if "student_id" in data and data["student_id"] is not None:
        data["student_id"] = _to_uuid(data["student_id"])
    if "class_id" in data and data["class_id"] is not None:
        data["class_id"] = _to_uuid(data["class_id"])

    absence = Absence(id=uuid4(), **data)
    db.add(absence)
    await db.commit()
    await db.refresh(absence)
    await notify_parents_of_absence(db, absence)
    return absence
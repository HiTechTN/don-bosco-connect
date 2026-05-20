import os
from uuid import UUID, uuid4

from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.minio_client import get_minio
from app.models.base import Course, CourseFile

BUCKET = settings.MINIO_BUCKET_COURSES


def _to_uuid(val: str | UUID | None) -> UUID | None:
    if val is None or val == "":
        return None
    return UUID(val) if isinstance(val, str) else val


async def create_course(db: AsyncSession, teacher_id: str, data: dict) -> Course:
    data["teacher_id"] = _to_uuid(teacher_id)
    for field in ("subject_id", "class_id", "academic_year_id"):
        if field in data and data[field] is not None:
            data[field] = _to_uuid(data[field])
    course = Course(id=uuid4(), **data)
    db.add(course)
    await db.commit()
    await db.refresh(course)
    return course


async def upload_course_file(db: AsyncSession, course_id: str, file, user_id: str) -> CourseFile:
    minio_client = get_minio()
    ext = os.path.splitext(file.filename)[1] if file.filename else ""
    stored_name = f"{uuid4()}{ext}"
    minio_key = f"courses/{course_id}/{stored_name}"
    content = await file.read()
    minio_client.put_object(
        bucket_name=BUCKET,
        object_name=minio_key,
        data=content,
        length=len(content),
        content_type=file.content_type or "application/octet-stream",
    )
    file_type_map = {
        "application/pdf": "pdf",
        "video/mp4": "video",
        "video/webm": "video",
        "image/jpeg": "image",
        "image/png": "image",
        "application/msword": "document",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "document",
        "audio/mpeg": "audio",
    }
    file_type = file_type_map.get(file.content_type, "other")
    cf = CourseFile(
        id=uuid4(),
        course_id=_to_uuid(course_id),
        original_filename=file.filename or "unknown",
        stored_filename=stored_name,
        minio_bucket=BUCKET,
        minio_key=minio_key,
        file_type=file_type,
        file_size_bytes=len(content),
        mime_type=file.content_type,
        uploaded_by=_to_uuid(user_id),
    )
    db.add(cf)
    await db.commit()
    await db.refresh(cf)
    return cf

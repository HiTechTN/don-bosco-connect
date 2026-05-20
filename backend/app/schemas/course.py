from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class CourseCreate(BaseModel):
    title: str
    description: str | None = None
    subject_id: str
    class_id: str
    academic_year_id: str | None = None
    chapter_number: int | None = None
    tags: list[str] | None = []


class CourseUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    chapter_number: int | None = None
    tags: list[str] | None = None
    is_published: bool | None = None


class CourseResponse(BaseModel):
    id: UUID
    teacher_id: UUID | None
    subject_id: UUID | None
    class_id: UUID | None
    academic_year_id: UUID | None
    title: str
    description: str | None
    chapter_number: int | None
    tags: list[str] | None
    is_published: bool
    published_at: datetime | None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
        json_encoders = {datetime: lambda v: v.isoformat()}


class CourseFileResponse(BaseModel):
    id: UUID
    original_filename: str
    file_type: str
    file_size_bytes: int | None
    ai_processing_status: str
    ai_chunk_count: int | None
    created_at: datetime

    class Config:
        from_attributes = True
        json_encoders = {datetime: lambda v: v.isoformat()}

from uuid import UUID
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class CourseCreate(BaseModel):
    title: str
    description: Optional[str] = None
    subject_id: str
    class_id: str
    academic_year_id: Optional[str] = None
    chapter_number: Optional[int] = None
    tags: Optional[List[str]] = []

class CourseUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    chapter_number: Optional[int] = None
    tags: Optional[List[str]] = None
    is_published: Optional[bool] = None

class CourseResponse(BaseModel):
    id: UUID
    teacher_id: Optional[UUID]
    subject_id: Optional[UUID]
    class_id: Optional[UUID]
    academic_year_id: Optional[UUID]
    title: str
    description: Optional[str]
    chapter_number: Optional[int]
    tags: Optional[List[str]]
    is_published: bool
    published_at: Optional[datetime]
    created_at: datetime
    updated_at: datetime
    class Config:
        from_attributes = True
        json_encoders = {datetime: lambda v: v.isoformat()}

class CourseFileResponse(BaseModel):
    id: UUID
    original_filename: str
    file_type: str
    file_size_bytes: Optional[int]
    ai_processing_status: str
    ai_chunk_count: Optional[int]
    created_at: datetime
    class Config:
        from_attributes = True
        json_encoders = {datetime: lambda v: v.isoformat()}
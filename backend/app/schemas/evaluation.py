from datetime import date, datetime
from uuid import UUID

from pydantic import BaseModel


class EvaluationCreate(BaseModel):
    title: str
    description: str | None = None
    type: str = "controle"
    subject_id: str
    class_id: str
    course_id: str | None = None
    max_score: float = 20.0
    coefficient: float = 1.0
    date: date


class EvaluationUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    max_score: float | None = None
    coefficient: float | None = None
    date: date | None = None
    is_published: bool | None = None


class GradeInput(BaseModel):
    student_id: str
    score: float | None = None
    comment: str | None = None
    is_absent: bool = False


class BulkGradeInput(BaseModel):
    grades: list[GradeInput]


class GradeResponse(BaseModel):
    id: UUID
    student_id: UUID
    score: float | None
    comment: str | None
    is_absent: bool
    graded_at: datetime | None

    class Config:
        from_attributes = True
        json_encoders = {datetime: lambda v: v.isoformat()}


class EvaluationResponse(BaseModel):
    id: UUID
    title: str
    description: str | None
    type: str
    subject_id: UUID | None
    class_id: UUID | None
    teacher_id: UUID | None
    course_id: UUID | None
    max_score: float
    coefficient: float
    date: date
    is_published: bool
    created_at: datetime

    class Config:
        from_attributes = True
        json_encoders = {date: lambda v: v.isoformat(), datetime: lambda v: v.isoformat()}

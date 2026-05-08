from uuid import UUID
from pydantic import BaseModel
from typing import Optional, List
from datetime import date, datetime

class EvaluationCreate(BaseModel):
    title: str
    description: Optional[str] = None
    type: str = "controle"
    subject_id: str
    class_id: str
    course_id: Optional[str] = None
    max_score: float = 20.0
    coefficient: float = 1.0
    date: date

class EvaluationUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    max_score: Optional[float] = None
    coefficient: Optional[float] = None
    date: Optional[date] = None
    is_published: Optional[bool] = None

class GradeInput(BaseModel):
    student_id: str
    score: Optional[float] = None
    comment: Optional[str] = None
    is_absent: bool = False

class BulkGradeInput(BaseModel):
    grades: List[GradeInput]

class GradeResponse(BaseModel):
    id: UUID
    student_id: UUID
    score: Optional[float]
    comment: Optional[str]
    is_absent: bool
    graded_at: Optional[datetime]
    class Config:
        from_attributes = True
        json_encoders = {datetime: lambda v: v.isoformat()}

class EvaluationResponse(BaseModel):
    id: UUID
    title: str
    description: Optional[str]
    type: str
    subject_id: Optional[UUID]
    class_id: Optional[UUID]
    teacher_id: Optional[UUID]
    course_id: Optional[UUID]
    max_score: float
    coefficient: float
    date: date
    is_published: bool
    created_at: datetime
    class Config:
        from_attributes = True
        json_encoders = {date: lambda v: v.isoformat(), datetime: lambda v: v.isoformat()}
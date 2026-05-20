import uuid
from datetime import date, datetime

from pydantic import BaseModel, Field


class AcademicYearBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=50)
    start_date: date
    end_date: date
    is_current: bool = Field(default=False)


class AcademicYearCreate(AcademicYearBase):
    pass


class AcademicYearResponse(AcademicYearBase):
    id: uuid.UUID
    created_at: datetime

    class Config:
        from_attributes = True


class ClassBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=50)
    level: str = Field(..., min_length=1, max_length=30)
    section: str | None = Field(None, max_length=10)
    main_teacher_id: uuid.UUID | None = None
    max_students: int = Field(default=30, ge=1, le=100)


class ClassCreate(ClassBase):
    academic_year_id: uuid.UUID


class ClassUpdate(BaseModel):
    name: str | None = Field(None, min_length=1, max_length=50)
    level: str | None = Field(None, min_length=1, max_length=30)
    section: str | None = Field(None, max_length=10)
    main_teacher_id: uuid.UUID | None = None
    max_students: int | None = Field(None, ge=1, le=100)


class ClassResponse(ClassBase):
    id: uuid.UUID
    academic_year_id: uuid.UUID
    enrollment_count: int = 0
    main_teacher_name: str | None = None
    created_at: datetime

    class Config:
        from_attributes = True


class EnrollmentRequest(BaseModel):
    student_id: uuid.UUID
    academic_year_id: uuid.UUID


class ClassEnrollmentResponse(BaseModel):
    id: uuid.UUID
    student_id: uuid.UUID
    class_id: uuid.UUID
    academic_year_id: uuid.UUID
    enrolled_at: datetime
    status: str

    class Config:
        from_attributes = True

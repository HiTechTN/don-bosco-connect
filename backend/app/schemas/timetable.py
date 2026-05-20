import uuid
from datetime import datetime, time

from pydantic import BaseModel, Field

from app.models.base import ScheduleDay


class TimetableSlotBase(BaseModel):
    class_id: uuid.UUID
    subject_id: uuid.UUID | None = None
    teacher_id: uuid.UUID | None = None
    day: ScheduleDay
    start_time: time
    end_time: time
    room: str | None = Field(None, max_length=50)
    academic_year_id: uuid.UUID


class TimetableSlotCreate(TimetableSlotBase):
    pass


class TimetableSlotUpdate(BaseModel):
    subject_id: uuid.UUID | None = None
    teacher_id: uuid.UUID | None = None
    day: ScheduleDay | None = None
    start_time: time | None = None
    end_time: time | None = None
    room: str | None = Field(None, max_length=50)


class TimetableSlotResponse(TimetableSlotBase):
    id: uuid.UUID
    created_at: datetime

    class Config:
        from_attributes = True

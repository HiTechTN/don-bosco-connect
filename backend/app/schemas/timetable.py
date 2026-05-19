from pydantic import BaseModel, Field
from typing import Optional
import uuid
from datetime import time, datetime
from app.models.base import ScheduleDay


class TimetableSlotBase(BaseModel):
    class_id: uuid.UUID
    subject_id: Optional[uuid.UUID] = None
    teacher_id: Optional[uuid.UUID] = None
    day: ScheduleDay
    start_time: time
    end_time: time
    room: Optional[str] = Field(None, max_length=50)
    academic_year_id: uuid.UUID


class TimetableSlotCreate(TimetableSlotBase):
    pass


class TimetableSlotUpdate(BaseModel):
    subject_id: Optional[uuid.UUID] = None
    teacher_id: Optional[uuid.UUID] = None
    day: Optional[ScheduleDay] = None
    start_time: Optional[time] = None
    end_time: Optional[time] = None
    room: Optional[str] = Field(None, max_length=50)


class TimetableSlotResponse(TimetableSlotBase):
    id: uuid.UUID
    created_at: datetime

    class Config:
        from_attributes = True
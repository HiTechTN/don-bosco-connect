from uuid import UUID
from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime, time

class AbsenceCreate(BaseModel):
    student_id: str
    class_id: str
    subject_id: Optional[str] = None
    type: str = "absence"
    date: date
    start_time: Optional[time] = None
    end_time: Optional[time] = None

class AbsenceUpdate(BaseModel):
    justification_status: Optional[str] = None
    justification_text: Optional[str] = None

class AbsenceResponse(BaseModel):
    id: UUID
    student_id: UUID
    class_id: Optional[UUID]
    subject_id: Optional[UUID]
    teacher_id: Optional[UUID]
    type: str
    date: date
    start_time: Optional[time]
    end_time: Optional[time]
    justification_status: str
    justification_text: Optional[str]
    notified_parent: bool
    created_at: datetime
    class Config:
        from_attributes = True
        json_encoders = {date: lambda v: v.isoformat(), time: lambda v: v.isoformat(), datetime: lambda v: v.isoformat()}
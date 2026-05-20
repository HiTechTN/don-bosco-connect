from datetime import date, datetime, time
from uuid import UUID

from pydantic import BaseModel


class AbsenceCreate(BaseModel):
    student_id: str
    class_id: str
    subject_id: str | None = None
    type: str = "absence"
    date: date
    start_time: time | None = None
    end_time: time | None = None


class AbsenceUpdate(BaseModel):
    justification_status: str | None = None
    justification_text: str | None = None


class AbsenceResponse(BaseModel):
    id: UUID
    student_id: UUID | None
    class_id: UUID | None
    subject_id: UUID | None
    teacher_id: UUID | None
    type: str
    date: date
    start_time: time | None
    end_time: time | None
    justification_status: str
    justification_text: str | None
    notified_parent: bool
    created_at: datetime

    class Config:
        from_attributes = True
        json_encoders = {
            date: lambda v: v.isoformat(),
            time: lambda v: v.isoformat(),
            datetime: lambda v: v.isoformat(),
        }

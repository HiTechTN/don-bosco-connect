from uuid import UUID
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, date

class StudentProfileResponse(BaseModel):
    id: UUID
    student_id: UUID
    xp_total: int
    level: int
    streak_days: int
    last_activity_date: Optional[date]
    adaptive_level: str
    adaptive_score: float
    avatar_config: Optional[dict]
    created_at: datetime
    updated_at: datetime
    class Config:
        from_attributes = True
        json_encoders = {date: lambda v: v.isoformat(), datetime: lambda v: v.isoformat()}

class BadgeResponse(BaseModel):
    id: UUID
    code: str
    name: str
    description: Optional[str]
    icon_url: Optional[str]
    xp_reward: int
    condition_type: Optional[str]
    condition_value: Optional[int]
    class Config:
        from_attributes = True

class StudentBadgeResponse(BaseModel):
    id: UUID
    student_id: UUID
    badge: BadgeResponse
    awarded_at: datetime
    class Config:
        from_attributes = True
        json_encoders = {datetime: lambda v: v.isoformat()}

class XPTransactionResponse(BaseModel):
    id: UUID
    student_id: UUID
    amount: int
    reason: str
    reference_id: Optional[UUID]
    created_at: datetime
    class Config:
        from_attributes = True
        json_encoders = {datetime: lambda v: v.isoformat()}

class LeaderboardEntry(BaseModel):
    student_id: UUID
    first_name: str
    last_name: str
    xp_total: int
    level: int
    rank: int

class DropoutRiskStudent(BaseModel):
    student_id: UUID
    first_name: str
    last_name: str
    risk_score: float
    absences_last_30d: int
    adaptive_level: str
    streak_days: int
    class Config:
        from_attributes = True

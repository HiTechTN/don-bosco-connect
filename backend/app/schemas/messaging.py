from uuid import UUID
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class ThreadCreate(BaseModel):
    subject: Optional[str] = None
    participant_ids: List[str]

class MessageSend(BaseModel):
    content: str

class MessageResponse(BaseModel):
    id: UUID
    sender_id: Optional[UUID]
    content: str
    attachment_url: Optional[str]
    created_at: datetime
    class Config:
        from_attributes = True
        json_encoders = {datetime: lambda v: v.isoformat()}

class ThreadResponse(BaseModel):
    id: UUID
    subject: Optional[str]
    participants: List[str]
    last_message: Optional[MessageResponse]
    updated_at: datetime
    class Config:
        from_attributes = True
        json_encoders = {datetime: lambda v: v.isoformat()}

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class ThreadCreate(BaseModel):
    subject: str | None = None
    participant_ids: list[str]


class MessageSend(BaseModel):
    content: str


class MessageResponse(BaseModel):
    id: UUID
    sender_id: UUID | None
    content: str
    attachment_url: str | None
    created_at: datetime

    class Config:
        from_attributes = True
        json_encoders = {datetime: lambda v: v.isoformat()}


class ThreadResponse(BaseModel):
    id: UUID
    subject: str | None
    participants: list[str]
    last_message: MessageResponse | None
    updated_at: datetime

    class Config:
        from_attributes = True
        json_encoders = {datetime: lambda v: v.isoformat()}

import uuid
from datetime import datetime

from pydantic import BaseModel, Field


class EventBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    description: str | None = None
    event_type: str | None = Field(None, max_length=50)
    start_datetime: datetime
    end_datetime: datetime | None = None
    all_day: bool = False
    target_classes: list[uuid.UUID] | None = None


class EventCreate(EventBase):
    pass


class EventUpdate(BaseModel):
    title: str | None = Field(None, min_length=1, max_length=255)
    description: str | None = None
    event_type: str | None = Field(None, max_length=50)
    start_datetime: datetime | None = None
    end_datetime: datetime | None = None
    all_day: bool | None = None
    target_classes: list[uuid.UUID] | None = None


class EventResponse(EventBase):
    id: uuid.UUID
    created_by: uuid.UUID | None = None
    created_at: datetime

    class Config:
        from_attributes = True


class EventListResponse(BaseModel):
    items: list[EventResponse]
    total: int
    page: int
    per_page: int
    pages: int

from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
import uuid


class EventBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    event_type: Optional[str] = Field(None, max_length=50)
    start_datetime: datetime
    end_datetime: Optional[datetime] = None
    all_day: bool = False
    target_classes: Optional[list[uuid.UUID]] = None


class EventCreate(EventBase):
    pass


class EventUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    event_type: Optional[str] = Field(None, max_length=50)
    start_datetime: Optional[datetime] = None
    end_datetime: Optional[datetime] = None
    all_day: Optional[bool] = None
    target_classes: Optional[list[uuid.UUID]] = None


class EventResponse(EventBase):
    id: uuid.UUID
    created_by: Optional[uuid.UUID] = None
    created_at: datetime

    class Config:
        from_attributes = True


class EventListResponse(BaseModel):
    items: list[EventResponse]
    total: int
    page: int
    per_page: int
    pages: int

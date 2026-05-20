import uuid
from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, Field


class SubjectBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    name_ar: str | None = Field(None, max_length=100)
    code: str = Field(..., min_length=1, max_length=20)
    color: str = Field(default="#3B82F6", pattern="^#[0-9a-fA-F]{6}$")
    coefficient: Decimal = Field(default=1.0, max_digits=3, decimal_places=1)
    description: str | None = None


class SubjectCreate(SubjectBase):
    pass


class SubjectUpdate(BaseModel):
    name: str | None = Field(None, min_length=1, max_length=100)
    name_ar: str | None = Field(None, max_length=100)
    code: str | None = Field(None, min_length=1, max_length=20)
    color: str | None = Field(None, pattern="^#[0-9a-fA-F]{6}$")
    coefficient: Decimal | None = Field(None, max_digits=3, decimal_places=1)
    description: str | None = None


class SubjectResponse(SubjectBase):
    id: uuid.UUID
    created_at: datetime

    class Config:
        from_attributes = True


class SubjectListResponse(BaseModel):
    items: list[SubjectResponse]
    total: int
    page: int
    per_page: int
    pages: int

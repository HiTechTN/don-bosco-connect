from pydantic import BaseModel, Field
from typing import Optional
import uuid
from decimal import Decimal


class SubjectBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    name_ar: Optional[str] = Field(None, max_length=100)
    code: str = Field(..., min_length=1, max_length=20)
    color: str = Field(default="#3B82F6", pattern="^#[0-9a-fA-F]{6}$")
    coefficient: Decimal = Field(default=1.0, max_digits=3, decimal_places=1)
    description: Optional[str] = None


class SubjectCreate(SubjectBase):
    pass


class SubjectUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    name_ar: Optional[str] = Field(None, max_length=100)
    code: Optional[str] = Field(None, min_length=1, max_length=20)
    color: Optional[str] = Field(None, pattern="^#[0-9a-fA-F]{6}$")
    coefficient: Optional[Decimal] = Field(None, max_digits=3, decimal_places=1)
    description: Optional[str] = None


class SubjectResponse(SubjectBase):
    id: uuid.UUID
    created_at: str

    class Config:
        from_attributes = True


class SubjectListResponse(BaseModel):
    items: list[SubjectResponse]
    total: int
    page: int
    per_page: int
    pages: int
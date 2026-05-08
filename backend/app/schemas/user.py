from pydantic import BaseModel, Field, EmailStr
from typing import Optional
from app.models.base import UserRole, UserStatus
import uuid
from datetime import datetime


class UserBase(BaseModel):
    email: EmailStr
    first_name: str = Field(..., min_length=1, max_length=100)
    last_name: str = Field(..., min_length=1, max_length=100)
    phone: Optional[str] = Field(None, max_length=20)
    preferred_language: str = Field(default="fr", pattern="^(fr|ar)$")


class UserCreate(UserBase):
    role: UserRole
    password: str = Field(..., min_length=8)


class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    role: Optional[UserRole] = None
    first_name: Optional[str] = Field(None, min_length=1, max_length=100)
    last_name: Optional[str] = Field(None, min_length=1, max_length=100)
    phone: Optional[str] = Field(None, max_length=20)
    preferred_language: Optional[str] = Field(None, pattern="^(fr|ar)$")
    status: Optional[UserStatus] = None


class UserResponse(UserBase):
    id: uuid.UUID
    role: UserRole
    status: UserStatus
    mfa_enabled: bool
    last_login_at: Optional[datetime]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class UserListResponse(BaseModel):
    items: list[UserResponse]
    total: int
    page: int
    per_page: int
    pages: int
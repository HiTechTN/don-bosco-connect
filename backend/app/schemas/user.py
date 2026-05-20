import uuid
from datetime import datetime

from pydantic import BaseModel, EmailStr, Field

from app.models.base import UserRole, UserStatus


class UserBase(BaseModel):
    email: EmailStr
    first_name: str = Field(..., min_length=1, max_length=100)
    last_name: str = Field(..., min_length=1, max_length=100)
    phone: str | None = Field(None, max_length=20)
    preferred_language: str = Field(default="fr", pattern="^(fr|ar)$")


class UserCreate(UserBase):
    role: UserRole
    password: str = Field(..., min_length=8)


class UserUpdate(BaseModel):
    email: EmailStr | None = None
    role: UserRole | None = None
    first_name: str | None = Field(None, min_length=1, max_length=100)
    last_name: str | None = Field(None, min_length=1, max_length=100)
    phone: str | None = Field(None, max_length=20)
    preferred_language: str | None = Field(None, pattern="^(fr|ar)$")
    status: UserStatus | None = None


class UserResponse(UserBase):
    id: uuid.UUID
    role: UserRole
    status: UserStatus
    mfa_enabled: bool
    last_login_at: datetime | None
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

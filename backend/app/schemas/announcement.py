from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field


class AnnouncementCreate(BaseModel):
    title: str
    title_ar: str | None = None
    excerpt: str | None = None
    excerpt_ar: str | None = None
    content_json: dict = Field(default_factory=dict)
    category: str = "general"
    tags: list[str] = Field(default_factory=list)
    visibility: str = "public"
    allowed_roles: list[str] = Field(default_factory=list)
    pinned: bool = False
    priority: int = 0
    cover_image_url: str | None = None
    attachments: list[dict] = Field(default_factory=list)
    publish_at: datetime | None = None


class AnnouncementUpdate(BaseModel):
    title: str | None = None
    title_ar: str | None = None
    excerpt: str | None = None
    excerpt_ar: str | None = None
    content_json: dict | None = None
    category: str | None = None
    tags: list[str] | None = None
    visibility: str | None = None
    allowed_roles: list[str] | None = None
    pinned: bool | None = None
    priority: int | None = None
    cover_image_url: str | None = None
    attachments: list[dict] | None = None
    publish_at: datetime | None = None


class AnnouncementReactionInput(BaseModel):
    emoji: str


class AnnouncementResponse(BaseModel):
    id: UUID
    title: str
    title_ar: str | None
    slug: str
    excerpt: str | None
    excerpt_ar: str | None
    content_html: str | None
    category: str
    tags: list[str]
    status: str
    visibility: str
    allowed_roles: list[str]
    pinned: bool
    priority: int
    cover_image_url: str | None
    attachments: list[dict]
    views_count: int
    publish_at: datetime | None
    created_by: UUID | None
    created_at: datetime | None
    updated_at: datetime | None
    reactions: dict[str, int] | None = None

    class Config:
        from_attributes = True


class PublicAnnouncementResponse(BaseModel):
    id: UUID
    title: str
    slug: str
    excerpt: str | None
    content_html: str | None
    category: str
    tags: list[str]
    pinned: bool
    cover_image_url: str | None
    views_count: int
    publish_at: datetime | None
    created_at: datetime | None
    reactions: dict[str, int] | None = None

    class Config:
        from_attributes = True


class AnnouncementListResponse(BaseModel):
    items: list[AnnouncementResponse]
    total: int
    page: int
    per_page: int
    pages: int


class PublicAnnouncementListResponse(BaseModel):
    items: list[PublicAnnouncementResponse]
    total: int
    page: int
    per_page: int
    pages: int

import uuid

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
)
from sqlalchemy.dialects.postgresql import ARRAY, JSONB, UUID
from sqlalchemy.sql import func

from app.database import Base


class Announcement(Base):
    __tablename__ = "announcements"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(255), nullable=False)
    title_ar = Column(String(255))
    slug = Column(String(255), unique=True, nullable=False, index=True)
    excerpt = Column(Text)
    excerpt_ar = Column(Text)
    content_json = Column(JSONB, nullable=False, default={})
    content_html = Column(Text)
    category = Column(String(50), nullable=False, default="general")
    tags = Column(ARRAY(Text), default=[])
    status = Column(String(20), nullable=False, default="draft")
    visibility = Column(String(20), nullable=False, default="public")
    allowed_roles = Column(ARRAY(Text), default=[])
    pinned = Column(Boolean, default=False)
    priority = Column(Integer, default=0)
    cover_image_url = Column(Text)
    attachments = Column(JSONB, default=[])
    views_count = Column(Integer, default=0)
    publish_at = Column(DateTime(timezone=True))
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class AnnouncementReaction(Base):
    __tablename__ = "announcement_reactions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    announcement_id = Column(
        UUID(as_uuid=True),
        ForeignKey("announcements.id", ondelete="CASCADE"),
        nullable=False,
    )
    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )
    emoji = Column(String(10), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

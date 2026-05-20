import uuid

from sqlalchemy import JSON, Column, Date, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy import Enum as SAEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database import Base


class StudentProfile(Base):
    __tablename__ = "student_profiles"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), unique=True)
    xp_total = Column(Integer, default=0)
    level = Column(Integer, default=1)
    streak_days = Column(Integer, default=0)
    last_activity_date = Column(Date)
    adaptive_level = Column(
        SAEnum("remediation", "normal", "advanced", name="difficulty_level"), default="normal"
    )
    adaptive_score = Column(Float, default=0.5)
    avatar_config = Column(JSON, default={})
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    student = relationship("User", back_populates="student_profile")


class Badge(Base):
    __tablename__ = "badges"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    code = Column(String(50), unique=True, nullable=False)
    name = Column(String(100), nullable=False)
    description = Column(Text)
    icon_url = Column(Text)
    xp_reward = Column(Integer, default=0)
    condition_type = Column(String(50))
    condition_value = Column(Integer)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class StudentBadge(Base):
    __tablename__ = "student_badges"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"))
    badge_id = Column(UUID(as_uuid=True), ForeignKey("badges.id"))
    awarded_at = Column(DateTime(timezone=True), server_default=func.now())


class XPTransaction(Base):
    __tablename__ = "xp_transactions"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"))
    amount = Column(Integer, nullable=False)
    reason = Column(String(100), nullable=False)
    reference_id = Column(UUID)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

import uuid

from sqlalchemy import ARRAY, Column, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy import Enum as SAEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func

from app.database import Base


class AIConversation(Base):
    __tablename__ = "ai_conversations"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"))
    course_id = Column(UUID(as_uuid=True), ForeignKey("courses.id", ondelete="SET NULL"))
    subject_id = Column(UUID(as_uuid=True), ForeignKey("subjects.id"))
    title = Column(String(255))
    total_messages = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class AIMessage(Base):
    __tablename__ = "ai_messages"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    conversation_id = Column(
        UUID(as_uuid=True), ForeignKey("ai_conversations.id", ondelete="CASCADE")
    )
    role = Column(SAEnum("user", "assistant", "system", name="message_role"))
    content = Column(Text, nullable=False)
    chunks_used = Column(ARRAY(UUID))
    confidence_score = Column(Float, default=None)
    response_time_ms = Column(Integer)
    feedback = Column(Integer)
    token_count = Column(Integer)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

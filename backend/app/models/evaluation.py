import uuid

from sqlalchemy import (
    JSON,
    Boolean,
    Column,
    Date,
    DateTime,
    ForeignKey,
    Integer,
    Numeric,
    String,
    Text,
    Time,
)
from sqlalchemy import Enum as SAEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func

from app.database import Base


class Evaluation(Base):
    __tablename__ = "evaluations"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(255), nullable=False)
    description = Column(Text)
    type = Column(
        SAEnum("quiz", "devoir", "examen", "controle", "oral", "projet", name="evaluation_type")
    )
    subject_id = Column(UUID(as_uuid=True), ForeignKey("subjects.id"))
    class_id = Column(UUID(as_uuid=True), ForeignKey("classes.id"))
    teacher_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    course_id = Column(UUID(as_uuid=True), ForeignKey("courses.id"))
    max_score = Column(Numeric(5, 2), default=20.0)
    coefficient = Column(Numeric(3, 1), default=1.0)
    date = Column(Date, nullable=False)
    is_published = Column(Boolean, default=False)
    is_ai_generated = Column(Boolean, default=False)
    academic_year_id = Column(UUID(as_uuid=True), ForeignKey("academic_years.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class Grade(Base):
    __tablename__ = "grades"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    evaluation_id = Column(UUID(as_uuid=True), ForeignKey("evaluations.id", ondelete="CASCADE"))
    student_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"))
    score = Column(Numeric(5, 2))
    comment = Column(Text)
    is_absent = Column(Boolean, default=False)
    graded_by = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    graded_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class Quiz(Base):
    __tablename__ = "quizzes"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    course_id = Column(UUID(as_uuid=True), ForeignKey("courses.id", ondelete="CASCADE"))
    title = Column(String(255), nullable=False)
    difficulty = Column(
        SAEnum("remediation", "normal", "advanced", name="difficulty_level"), default="normal"
    )
    is_ai_generated = Column(Boolean, default=True)
    time_limit_seconds = Column(Integer)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class QuizQuestion(Base):
    __tablename__ = "quiz_questions"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    quiz_id = Column(UUID(as_uuid=True), ForeignKey("quizzes.id", ondelete="CASCADE"))
    question_text = Column(Text, nullable=False)
    question_type = Column(String(20), default="mcq")
    options = Column(JSON)
    correct_answer = Column(Text)
    explanation = Column(Text)
    points = Column(Integer, default=1)
    order_index = Column(Integer)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class QuizAttempt(Base):
    __tablename__ = "quiz_attempts"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    quiz_id = Column(UUID(as_uuid=True), ForeignKey("quizzes.id", ondelete="CASCADE"))
    student_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"))
    answers = Column(JSON, default=[])
    score = Column(Numeric(5, 2))
    max_score = Column(Numeric(5, 2))
    duration_seconds = Column(Integer)
    completed_at = Column(DateTime(timezone=True))
    adaptive_level_before = Column(
        SAEnum("remediation", "normal", "advanced", name="difficulty_level")
    )
    adaptive_level_after = Column(
        SAEnum("remediation", "normal", "advanced", name="difficulty_level")
    )
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class Absence(Base):
    __tablename__ = "absences"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id = Column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=True
    )
    class_id = Column(UUID(as_uuid=True), ForeignKey("classes.id"), nullable=True)
    subject_id = Column(UUID(as_uuid=True), ForeignKey("subjects.id"))
    teacher_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    type = Column(SAEnum("absence", "retard", "exclusion", name="absence_type"), default="absence")
    date = Column(Date, nullable=False)
    start_time = Column(Time)
    end_time = Column(Time)
    justification_status = Column(
        SAEnum("pending", "justified", "unjustified", name="justification_status"),
        default="pending",
    )
    justification_text = Column(Text)
    justification_document_url = Column(Text)
    notified_parent = Column(Boolean, default=False)
    notified_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

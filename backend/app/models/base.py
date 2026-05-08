import uuid
import enum
from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, Integer, Float, Enum as SAEnum, Text, JSON, ForeignKey, Date, Time, BigInteger, ARRAY
from sqlalchemy.dialects.postgresql import UUID, INET
from pgvector.sqlalchemy import Vector
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database import Base


class UserRole(str, enum.Enum):
    admin = "admin"
    teacher = "teacher"
    student = "student"
    parent = "parent"


class UserStatus(str, enum.Enum):
    active = "active"
    inactive = "inactive"
    suspended = "suspended"


class ScheduleDay(str, enum.Enum):
    monday = "monday"
    tuesday = "tuesday"
    wednesday = "wednesday"
    thursday = "thursday"
    friday = "friday"
    saturday = "saturday"


class FileType(str, enum.Enum):
    pdf = "pdf"
    video = "video"
    image = "image"
    document = "document"
    audio = "audio"
    other = "other"


class ProcessingStatus(str, enum.Enum):
    pending = "pending"
    processing = "processing"
    indexed = "indexed"
    failed = "failed"


class EvaluationType(str, enum.Enum):
    quiz = "quiz"
    devoir = "devoir"
    examen = "examen"
    controle = "controle"
    oral = "oral"
    projet = "projet"


class DifficultyLevel(str, enum.Enum):
    remediation = "remediation"
    normal = "normal"
    advanced = "advanced"


class MessageRole(str, enum.Enum):
    user = "user"
    assistant = "assistant"
    system = "system"


class AbsenceType(str, enum.Enum):
    absence = "absence"
    retard = "retard"
    exclusion = "exclusion"


class JustificationStatus(str, enum.Enum):
    pending = "pending"
    justified = "justified"
    unjustified = "unjustified"


class NotificationType(str, enum.Enum):
    absence = "absence"
    grade_published = "grade_published"
    message = "message"
    ai_response = "ai_response"
    quiz_available = "quiz_available"
    event = "event"
    system = "system"
    decrochage_alert = "decrochage_alert"

class User(Base):
    __tablename__ = "users"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(SAEnum("admin", "teacher", "student", "parent", name="user_role"), nullable=False)
    status = Column(SAEnum("active", "inactive", "suspended", name="user_status"), default="active")
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    phone = Column(String(20))
    avatar_url = Column(Text)
    preferred_language = Column(String(5), default="fr")
    mfa_enabled = Column(Boolean, default=False)
    mfa_secret = Column(Text)
    last_login_at = Column(DateTime(timezone=True))
    failed_login_count = Column(Integer, default=0)
    locked_until = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    refresh_tokens = relationship("RefreshToken", back_populates="user")
    student_profile = relationship("StudentProfile", uselist=False, back_populates="student")

class RefreshToken(Base):
    __tablename__ = "refresh_tokens"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"))
    token_hash = Column(String(255), nullable=False)
    device_info = Column(Text)
    ip_address = Column(INET)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    revoked_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    user = relationship("User", back_populates="refresh_tokens")

class AuditLog(Base):
    __tablename__ = "audit_logs"
    id = Column(BigInteger, primary_key=True, autoincrement=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"))
    action = Column(String(100), nullable=False)
    resource_type = Column(String(50))
    resource_id = Column(UUID(as_uuid=True))
    ip_address = Column(INET)
    user_agent = Column(Text)
    metadata_ = Column("metadata", JSON, default={})
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class AcademicYear(Base):
    __tablename__ = "academic_years"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(50), nullable=False)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    is_current = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Class(Base):
    __tablename__ = "classes"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    academic_year_id = Column(UUID(as_uuid=True), ForeignKey("academic_years.id"))
    name = Column(String(50), nullable=False)
    level = Column(String(30), nullable=False)
    section = Column(String(10))
    main_teacher_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    max_students = Column(Integer, default=30)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class ClassEnrollment(Base):
    __tablename__ = "class_enrollments"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"))
    class_id = Column(UUID(as_uuid=True), ForeignKey("classes.id", ondelete="CASCADE"))
    academic_year_id = Column(UUID(as_uuid=True), ForeignKey("academic_years.id"))
    enrolled_at = Column(DateTime(timezone=True), server_default=func.now())
    status = Column(String(20), default="active")

class StudentParentLink(Base):
    __tablename__ = "student_parent_links"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"))
    parent_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"))
    relationship = Column(String(30), default="parent")
    is_primary = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Subject(Base):
    __tablename__ = "subjects"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), nullable=False)
    name_ar = Column(String(100))
    code = Column(String(20), unique=True, nullable=False)
    color = Column(String(7), default="#3B82F6")
    coefficient = Column(Float, default=1.0)
    description = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class TeacherSubjectAssignment(Base):
    __tablename__ = "teacher_subject_assignments"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    teacher_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"))
    subject_id = Column(UUID(as_uuid=True), ForeignKey("subjects.id", ondelete="CASCADE"))
    class_id = Column(UUID(as_uuid=True), ForeignKey("classes.id", ondelete="CASCADE"))
    academic_year_id = Column(UUID(as_uuid=True), ForeignKey("academic_years.id"))

class TimetableSlot(Base):
    __tablename__ = "timetable_slots"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    class_id = Column(UUID(as_uuid=True), ForeignKey("classes.id", ondelete="CASCADE"))
    subject_id = Column(UUID(as_uuid=True), ForeignKey("subjects.id"))
    teacher_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    day = Column(SAEnum("monday","tuesday","wednesday","thursday","friday","saturday", name="schedule_day"))
    start_time = Column(Time, nullable=False)
    end_time = Column(Time, nullable=False)
    room = Column(String(50))
    academic_year_id = Column(UUID(as_uuid=True), ForeignKey("academic_years.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Course(Base):
    __tablename__ = "courses"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    teacher_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"))
    subject_id = Column(UUID(as_uuid=True), ForeignKey("subjects.id"))
    class_id = Column(UUID(as_uuid=True), ForeignKey("classes.id"))
    academic_year_id = Column(UUID(as_uuid=True), ForeignKey("academic_years.id"))
    title = Column(String(255), nullable=False)
    description = Column(Text)
    chapter_number = Column(Integer)
    tags = Column(ARRAY(Text), default=[])
    is_published = Column(Boolean, default=False)
    published_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

class CourseFile(Base):
    __tablename__ = "course_files"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    course_id = Column(UUID(as_uuid=True), ForeignKey("courses.id", ondelete="CASCADE"))
    original_filename = Column(String(255), nullable=False)
    stored_filename = Column(String(255), nullable=False)
    minio_bucket = Column(String(100), nullable=False)
    minio_key = Column(Text, nullable=False)
    file_type = Column(SAEnum("pdf","video","image","document","audio","other", name="file_type"))
    file_size_bytes = Column(BigInteger)
    mime_type = Column(String(100))
    ai_processing_status = Column(SAEnum("pending","processing","indexed","failed", name="processing_status"), default="pending")
    ai_chunk_count = Column(Integer, default=0)
    ai_error_message = Column(Text)
    uploaded_by = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class DocumentChunk(Base):
    __tablename__ = "document_chunks"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    file_id = Column(UUID(as_uuid=True), ForeignKey("course_files.id", ondelete="CASCADE"))
    course_id = Column(UUID(as_uuid=True), ForeignKey("courses.id", ondelete="CASCADE"))
    subject_id = Column(UUID(as_uuid=True), ForeignKey("subjects.id"))
    class_id = Column(UUID(as_uuid=True), ForeignKey("classes.id"))
    chunk_index = Column(Integer, nullable=False)
    content = Column(Text, nullable=False)
    token_count = Column(Integer)
    embedding = Column(Vector(768))
    metadata_ = Column("metadata", JSON, default={})
    created_at = Column(DateTime(timezone=True), server_default=func.now())

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
    conversation_id = Column(UUID(as_uuid=True), ForeignKey("ai_conversations.id", ondelete="CASCADE"))
    role = Column(SAEnum("user","assistant","system", name="message_role"))
    content = Column(Text, nullable=False)
    chunks_used = Column(ARRAY(UUID))
    confidence_score = Column(Float, default=None)
    response_time_ms = Column(Integer)
    feedback = Column(Integer)
    token_count = Column(Integer)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Evaluation(Base):
    __tablename__ = "evaluations"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(255), nullable=False)
    description = Column(Text)
    type = Column(SAEnum("quiz","devoir","examen","controle","oral","projet", name="evaluation_type"))
    subject_id = Column(UUID(as_uuid=True), ForeignKey("subjects.id"))
    class_id = Column(UUID(as_uuid=True), ForeignKey("classes.id"))
    teacher_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    course_id = Column(UUID(as_uuid=True), ForeignKey("courses.id"))
    max_score = Column(Float, default=20.0)
    coefficient = Column(Float, default=1.0)
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
    score = Column(Float)
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
    difficulty = Column(SAEnum("remediation","normal","advanced", name="difficulty_level"), default="normal")
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
    score = Column(Float)
    max_score = Column(Float)
    duration_seconds = Column(Integer)
    completed_at = Column(DateTime(timezone=True))
    adaptive_level_before = Column(SAEnum("remediation","normal","advanced", name="difficulty_level"))
    adaptive_level_after = Column(SAEnum("remediation","normal","advanced", name="difficulty_level"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Absence(Base):
    __tablename__ = "absences"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"))
    class_id = Column(UUID(as_uuid=True), ForeignKey("classes.id"))
    subject_id = Column(UUID(as_uuid=True), ForeignKey("subjects.id"))
    teacher_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    type = Column(SAEnum("absence","retard","exclusion", name="absence_type"), default="absence")
    date = Column(Date, nullable=False)
    start_time = Column(Time)
    end_time = Column(Time)
    justification_status = Column(SAEnum("pending","justified","unjustified", name="justification_status"), default="pending")
    justification_text = Column(Text)
    justification_document_url = Column(Text)
    notified_parent = Column(Boolean, default=False)
    notified_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class MessageThread(Base):
    __tablename__ = "message_threads"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    subject = Column(String(255))
    is_group = Column(Boolean, default=False)
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

class ThreadParticipant(Base):
    __tablename__ = "thread_participants"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    thread_id = Column(UUID(as_uuid=True), ForeignKey("message_threads.id", ondelete="CASCADE"))
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"))
    last_read_at = Column(DateTime(timezone=True))
    is_archived = Column(Boolean, default=False)

class Message(Base):
    __tablename__ = "messages"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    thread_id = Column(UUID(as_uuid=True), ForeignKey("message_threads.id", ondelete="CASCADE"))
    sender_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"))
    content = Column(Text, nullable=False)
    content_iv = Column(Text, nullable=False)
    attachment_url = Column(Text)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    thread = relationship("MessageThread")

class Notification(Base):
    __tablename__ = "notifications"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"))
    type = Column(SAEnum("absence","grade_published","message","ai_response","quiz_available","event","system","decrochage_alert", name="notification_type"))
    title = Column(String(255), nullable=False)
    body = Column(Text)
    data = Column(JSON, default={})
    is_read = Column(Boolean, default=False)
    read_at = Column(DateTime(timezone=True))
    push_sent = Column(Boolean, default=False)
    push_sent_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class StudentProfile(Base):
    __tablename__ = "student_profiles"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), unique=True)
    xp_total = Column(Integer, default=0)
    level = Column(Integer, default=1)
    streak_days = Column(Integer, default=0)
    last_activity_date = Column(Date)
    adaptive_level = Column(SAEnum("remediation","normal","advanced", name="difficulty_level"), default="normal")
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

class SchoolEvent(Base):
    __tablename__ = "school_events"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(255), nullable=False)
    description = Column(Text)
    event_type = Column(String(50))
    start_datetime = Column(DateTime(timezone=True), nullable=False)
    end_datetime = Column(DateTime(timezone=True))
    all_day = Column(Boolean, default=False)
    target_classes = Column(ARRAY(UUID))
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

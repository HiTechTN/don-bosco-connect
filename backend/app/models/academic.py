import uuid

from sqlalchemy import (
    ARRAY,
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
    coefficient = Column(Numeric(3, 1), default=1.0)
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
    day = Column(
        SAEnum(
            "monday", "tuesday", "wednesday", "thursday", "friday", "saturday", name="schedule_day"
        )
    )
    start_time = Column(Time, nullable=False)
    end_time = Column(Time, nullable=False)
    room = Column(String(50))
    academic_year_id = Column(UUID(as_uuid=True), ForeignKey("academic_years.id"))
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

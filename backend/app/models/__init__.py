from app.models.enums import (
    UserRole, UserStatus, ScheduleDay, FileType, ProcessingStatus,
    EvaluationType, DifficultyLevel, MessageRole, AbsenceType,
    JustificationStatus, NotificationType,
)
from app.models.user import User, RefreshToken, AuditLog
from app.models.academic import (
    AcademicYear, Class, ClassEnrollment, StudentParentLink,
    Subject, TeacherSubjectAssignment, TimetableSlot, SchoolEvent,
)
from app.models.course import Course, CourseFile, DocumentChunk
from app.models.evaluation import (
    Evaluation, Grade, Quiz, QuizQuestion, QuizAttempt, Absence,
)
from app.models.ai import AIConversation, AIMessage
from app.models.messaging import MessageThread, ThreadParticipant, Message, Notification
from app.models.gamification import StudentProfile, Badge, StudentBadge, XPTransaction

__all__ = [
    "UserRole", "UserStatus", "ScheduleDay", "FileType", "ProcessingStatus",
    "EvaluationType", "DifficultyLevel", "MessageRole", "AbsenceType",
    "JustificationStatus", "NotificationType",
    "User", "RefreshToken", "AuditLog",
    "AcademicYear", "Class", "ClassEnrollment", "StudentParentLink",
    "Subject", "TeacherSubjectAssignment", "TimetableSlot", "SchoolEvent",
    "Course", "CourseFile", "DocumentChunk",
    "Evaluation", "Grade", "Quiz", "QuizQuestion", "QuizAttempt", "Absence",
    "AIConversation", "AIMessage",
    "MessageThread", "ThreadParticipant", "Message", "Notification",
    "StudentProfile", "Badge", "StudentBadge", "XPTransaction",
]

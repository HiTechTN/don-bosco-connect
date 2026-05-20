import enum


class UserRole(enum.StrEnum):
    admin = "admin"
    teacher = "teacher"
    student = "student"
    parent = "parent"


class UserStatus(enum.StrEnum):
    active = "active"
    inactive = "inactive"
    suspended = "suspended"


class ScheduleDay(enum.StrEnum):
    monday = "monday"
    tuesday = "tuesday"
    wednesday = "wednesday"
    thursday = "thursday"
    friday = "friday"
    saturday = "saturday"


class FileType(enum.StrEnum):
    pdf = "pdf"
    video = "video"
    image = "image"
    document = "document"
    audio = "audio"
    other = "other"


class ProcessingStatus(enum.StrEnum):
    pending = "pending"
    processing = "processing"
    indexed = "indexed"
    failed = "failed"


class EvaluationType(enum.StrEnum):
    quiz = "quiz"
    devoir = "devoir"
    examen = "examen"
    controle = "controle"
    oral = "oral"
    projet = "projet"


class DifficultyLevel(enum.StrEnum):
    remediation = "remediation"
    normal = "normal"
    advanced = "advanced"


class MessageRole(enum.StrEnum):
    user = "user"
    assistant = "assistant"
    system = "system"


class AbsenceType(enum.StrEnum):
    absence = "absence"
    retard = "retard"
    exclusion = "exclusion"


class JustificationStatus(enum.StrEnum):
    pending = "pending"
    justified = "justified"
    unjustified = "unjustified"


class NotificationType(enum.StrEnum):
    absence = "absence"
    grade_published = "grade_published"
    message = "message"
    ai_response = "ai_response"
    quiz_available = "quiz_available"
    event = "event"
    system = "system"
    decrochage_alert = "decrochage_alert"

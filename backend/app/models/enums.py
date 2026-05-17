import enum


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

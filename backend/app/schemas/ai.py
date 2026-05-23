from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class ChatMessageRequest(BaseModel):
    content: str
    course_id: str | None = None


class ChatRequest(BaseModel):
    message: str
    context_type: str = "general"


class ConversationResponse(BaseModel):
    id: UUID
    student_id: UUID
    course_id: UUID | None
    subject_id: UUID | None
    title: str | None
    total_messages: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
        json_encoders = {datetime: lambda v: v.isoformat()}


class MessageResponse(BaseModel):
    id: UUID
    role: str
    content: str
    confidence_score: float | None
    feedback: int | None
    created_at: datetime

    class Config:
        from_attributes = True
        json_encoders = {datetime: lambda v: v.isoformat()}


class QuizGenerateRequest(BaseModel):
    course_id: str
    num_questions: int = 10
    difficulty: str = "normal"
    question_types: list[str] = ["mcq", "true_false"]


class QuizSubmitRequest(BaseModel):
    answers: list[dict]


class QuizResponse(BaseModel):
    id: UUID
    course_id: UUID | None
    title: str
    difficulty: str
    is_ai_generated: bool
    time_limit_seconds: int | None
    created_at: datetime

    class Config:
        from_attributes = True
        json_encoders = {datetime: lambda v: v.isoformat()}


class QuizAttemptResponse(BaseModel):
    id: UUID
    quiz_id: UUID
    student_id: UUID
    score: float | None
    max_score: float | None
    duration_seconds: int | None
    completed_at: datetime | None
    created_at: datetime

    class Config:
        from_attributes = True
        json_encoders = {datetime: lambda v: v.isoformat()}

from uuid import UUID
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class ChatMessageRequest(BaseModel):
    content: str
    course_id: Optional[str] = None

class ConversationResponse(BaseModel):
    id: UUID
    student_id: UUID
    course_id: Optional[UUID]
    subject_id: Optional[UUID]
    title: Optional[str]
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
    confidence_score: Optional[float]
    feedback: Optional[int]
    created_at: datetime
    class Config:
        from_attributes = True
        json_encoders = {datetime: lambda v: v.isoformat()}

class QuizGenerateRequest(BaseModel):
    course_id: str
    num_questions: int = 10
    difficulty: str = "normal"
    question_types: List[str] = ["mcq", "true_false"]

class QuizSubmitRequest(BaseModel):
    answers: List[dict]

class QuizResponse(BaseModel):
    id: UUID
    course_id: Optional[UUID]
    title: str
    difficulty: str
    is_ai_generated: bool
    time_limit_seconds: Optional[int]
    created_at: datetime
    class Config:
        from_attributes = True
        json_encoders = {datetime: lambda v: v.isoformat()}

class QuizAttemptResponse(BaseModel):
    id: UUID
    quiz_id: UUID
    student_id: UUID
    score: Optional[float]
    max_score: Optional[float]
    duration_seconds: Optional[int]
    completed_at: Optional[datetime]
    created_at: datetime
    class Config:
        from_attributes = True
        json_encoders = {datetime: lambda v: v.isoformat()}

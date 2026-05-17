# Backward compatibility re-exports
from app.workers.document_tasks import index_course_file
from app.workers.notification_tasks import compute_daily_analytics, check_dropout_risk
from app.workers.ai_tasks import generate_quiz_background

__all__ = [
    "index_course_file",
    "compute_daily_analytics",
    "check_dropout_risk",
    "generate_quiz_background",
]

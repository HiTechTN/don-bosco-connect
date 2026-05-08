from celery import Celery
from app.config import settings

celery_app = Celery(
    "donbosco",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL,
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    task_soft_time_limit=300,
    task_time_limit=600,
    worker_prefetch_multiplier=1,
    beat_schedule={
        "compute-daily-analytics": {
            "task": "app.workers.tasks.compute_daily_analytics",
            "schedule": 86400.0,  # daily
        },
        "check-dropout-risk": {
            "task": "app.workers.tasks.check_dropout_risk",
            "schedule": 43200.0,  # every 12 hours
        },
    },
)

# Import tasks so they are registered
from app.workers import tasks  # noqa: E402, F401
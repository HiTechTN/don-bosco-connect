from fastapi import APIRouter

from app.api.v1.absences import router as absences_router
from app.api.v1.ai import router as ai_router
from app.api.v1.analytics import router as analytics_router
from app.api.v1.audit import router as audit_router
from app.api.v1.auth import router as auth_router
from app.api.v1.classes import class_router, enrollment_delete_router, enrollment_router
from app.api.v1.classes import router as classes_router
from app.api.v1.courses import router as courses_router
from app.api.v1.evaluations import router as evaluations_router
from app.api.v1.events import router as events_router
from app.api.v1.gamification import router as gamification_router
from app.api.v1.messages import router as messages_router
from app.api.v1.notifications import router as notifications_router
from app.api.v1.reports import router as reports_router
from app.api.v1.subjects import router as subjects_router
from app.api.v1.timetable import router as timetable_router
from app.api.v1.users import router as users_router

v1_router = APIRouter(prefix="/api/v1")

v1_router.include_router(auth_router)
v1_router.include_router(users_router)
v1_router.include_router(classes_router)
v1_router.include_router(class_router)
v1_router.include_router(enrollment_router)
v1_router.include_router(enrollment_delete_router)
v1_router.include_router(subjects_router)
v1_router.include_router(timetable_router)
v1_router.include_router(audit_router)
v1_router.include_router(analytics_router)
v1_router.include_router(courses_router)
v1_router.include_router(evaluations_router)
v1_router.include_router(absences_router)
v1_router.include_router(messages_router)
v1_router.include_router(notifications_router)
v1_router.include_router(reports_router)
v1_router.include_router(ai_router)
v1_router.include_router(gamification_router)
v1_router.include_router(events_router)
# WebSocket router is included directly in main.py (no prefix)

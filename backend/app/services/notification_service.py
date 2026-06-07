import logging
from uuid import UUID, uuid4

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.base import Absence, Notification, NotificationType, User

logger = logging.getLogger(__name__)


async def create_notification(
    db: AsyncSession,
    user_id: str,
    type: NotificationType,
    title: str,
    body: str | None = None,
    data: dict | None = None,
) -> Notification:
    uid = UUID(user_id) if isinstance(user_id, str) and user_id else user_id
    notification = Notification(
        id=uuid4(),
        user_id=uid,
        type=type,
        title=title,
        body=body,
        data=data or {},
    )
    db.add(notification)
    await db.commit()
    await db.refresh(notification)

    # Push real-time via WebSocket
    try:
        from app.api.v1.websocket import send_notification_to_user

        await send_notification_to_user(
            str(uid),
            {
                "type": "notification",
                "id": str(notification.id),
                "notification_type": type.value if hasattr(type, "value") else str(type),
                "title": title,
                "body": body,
                "data": data or {},
                "created_at": (
                    notification.created_at.isoformat() if notification.created_at else None
                ),
            },
        )
    except Exception:
        logger.warning("WebSocket push failed for user %s — notification saved in DB", uid)

    return notification


async def notify_parents_of_absence(db: AsyncSession, absence: Absence) -> None:
    from app.models.base import StudentParentLink

    result = await db.execute(
        select(StudentParentLink).where(StudentParentLink.student_id == absence.student_id)
    )
    links = result.scalars().all()

    student_result = await db.execute(select(User).where(User.id == absence.student_id))
    student = student_result.scalar_one_or_none()
    student_name = f"{student.first_name} {student.last_name}" if student else "un élève"

    for link in links:
        await create_notification(
            db,
            user_id=str(link.parent_id),
            type=NotificationType.absence,
            title="Absence signalée",
            body=f"Votre enfant {student_name} a été absent(e) le {absence.date}.",
            data={
                "absence_id": str(absence.id),
                "student_id": str(absence.student_id),
                "date": absence.date.isoformat() if absence.date else None,
            },
        )


async def notify_students_of_grade_publish(db: AsyncSession, evaluation_id: str) -> None:
    from app.models.base import ClassEnrollment, Evaluation

    result = await db.execute(select(Evaluation).where(Evaluation.id == evaluation_id))
    evaluation = result.scalar_one_or_none()
    if not evaluation:
        return

    result = await db.execute(
        select(ClassEnrollment).where(
            ClassEnrollment.class_id == evaluation.class_id,
            ClassEnrollment.academic_year_id == evaluation.academic_year_id,
            ClassEnrollment.status == "active",
        )
    )
    enrollments = result.scalars().all()

    for enrollment in enrollments:
        await create_notification(
            db,
            user_id=str(enrollment.student_id),
            type=NotificationType.grade_published,
            title="Notes publiées",
            body=f"Les notes de l'évaluation '{evaluation.title}' sont disponibles.",
            data={
                "evaluation_id": str(evaluation.id),
                "subject_id": (str(evaluation.subject_id) if evaluation.subject_id else None),
            },
        )

import logging

from sqlalchemy import select, text
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker

from app.config import settings
from app.services.cache_service import set_cache

logger = logging.getLogger(__name__)

engine = create_async_engine(settings.DATABASE_URL, echo=False, pool_size=5)
AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


def compute_daily_analytics() -> None:
    import asyncio

    asyncio.run(_compute_daily_analytics())


async def _compute_daily_analytics() -> None:
    async with AsyncSessionLocal() as db:
        result = await db.execute(select(text("count(*) FROM users")))
        total_users = result.scalar()
        await set_cache("analytics:daily:total_users", total_users, ttl=86400)

        result = await db.execute(
            select(
                text("count(*) FROM student_profiles WHERE last_activity_date >= CURRENT_DATE - 7")
            )
        )
        active_students = result.scalar()
        await set_cache("analytics:daily:active_students", active_students, ttl=86400)

        logger.info("Daily analytics computed: %d users, %d active", total_users, active_students)


def check_dropout_risk() -> None:
    import asyncio

    asyncio.run(_check_dropout_risk())


async def _check_dropout_risk() -> None:
    from app.models.enums import NotificationType
    from app.services.gamification_service import get_at_risk_students
    from app.services.notification_service import create_notification

    async with AsyncSessionLocal() as db:
        at_risk = await get_at_risk_students(db)
        logger.info("Dropout check: %d students at risk", len(at_risk))

        for student in at_risk:
            if student["risk_score"] > 0.7:
                await create_notification(
                    db,
                    user_id=student["student_id"],
                    type=NotificationType.decrochage_alert,
                    title="Alerte décrochage",
                    body=(
                        f"Risque détecté : {student['risk_score'] * 100:.0f}%. "
                        "Contactez votre enseignant."
                    ),
                    data=student,
                )
            result = await db.execute(
                select(text("parent_id FROM student_parent_links WHERE student_id = :sid")),
                {"sid": student["student_id"]},
            )
            for row in result.all():
                await create_notification(
                    db,
                    user_id=str(row[0]),
                    type=NotificationType.decrochage_alert,
                    title="Alerte décrochage - votre enfant",
                    body=f"Votre enfant présente un risque de {student['risk_score'] * 100:.0f}%.",
                    data=student,
                )

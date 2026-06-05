"""Tests that exercise the engine fixture lifecycle.

These tests create, read, update and delete records directly through
``db_session`` (bypassing the HTTP layer) so that every test opens and
closes its own connection from the pool.  Running many such tests
increases the chance of triggering the "Event loop is closed" error
during session-scoped engine teardown — letting us determine whether
it silently corrupts test outcomes or is merely a teardown warning.
"""
import uuid
from datetime import date, time

import pytest
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import hash_password
from app.models.academic import (
    AcademicYear,
    Class,
    Subject,
)
from app.models.announcement import Announcement
from app.models.evaluation import Absence, Evaluation, Grade
from app.models.messaging import Notification
from app.models.user import User, UserRole

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _uid() -> uuid.UUID:
    return uuid.uuid4()


def _user(**overrides: object) -> User:
    defaults = dict(
        id=_uid(),
        email=f"{_uid().hex[:8]}@test.tn",
        password_hash=hash_password("x"),
        role=UserRole.student,
        first_name="T",
        last_name="U",
    )
    defaults.update(overrides)
    return User(**defaults)  # type: ignore[arg-type]


# ---------------------------------------------------------------------------
# 1. Bulk insert — stress the connection pool
# ---------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_bulk_insert_users(db_session: AsyncSession) -> None:
    """Insert 50 users in one transaction, then read them back."""
    users = [_user(email=f"bulk{i}@test.tn") for i in range(50)]
    db_session.add_all(users)
    await db_session.commit()

    result = await db_session.execute(text("SELECT count(*) FROM users"))
    count = result.scalar()
    assert count is not None and count >= 50


# ---------------------------------------------------------------------------
# 2. Multi-table inserts per test
# ---------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_multi_table_insert(db_session: AsyncSession) -> None:
    """Create a user, an academic year, a class, and a subject in one test."""
    teacher = _user(role=UserRole.teacher, email="multi_teacher@test.tn")
    db_session.add(teacher)
    await db_session.flush()

    year = AcademicYear(
        id=_uid(), name="2025-26",
        start_date=date(2025, 9, 1), end_date=date(2026, 6, 30),
        is_current=True,
    )
    db_session.add(year)
    await db_session.flush()

    cls = Class(
        id=_uid(), academic_year_id=year.id,
        name="6ème A", level="6ème",
        main_teacher_id=teacher.id,
    )
    db_session.add(cls)
    await db_session.flush()

    subj = Subject(id=_uid(), name="Maths", code="MATH01")
    db_session.add(subj)
    await db_session.commit()

    result = await db_session.execute(text("SELECT count(*) FROM subjects WHERE code = 'MATH01'"))
    assert result.scalar() == 1


# ---------------------------------------------------------------------------
# 3. CRUD cycle — insert → update → delete
# ---------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_crud_announcement(db_session: AsyncSession) -> None:
    """Full CRUD cycle on announcements."""
    admin = _user(role=UserRole.admin, email="crud_admin@test.tn")
    db_session.add(admin)
    await db_session.flush()

    ann = Announcement(
        id=_uid(),
        title="Test Announcement",
        slug=f"test-ann-{_uid().hex[:8]}",
        content_json={"blocks": []},
        category="general",
        status="draft",
        created_by=admin.id,
    )
    db_session.add(ann)
    await db_session.commit()

    # Read
    loaded = await db_session.get(Announcement, ann.id)
    assert loaded is not None
    assert loaded.title == "Test Announcement"

    # Update
    loaded.status = "published"  # type: ignore[assignment]
    await db_session.commit()

    q = text(
        "SELECT status FROM announcements WHERE id = :aid"
    )
    result = await db_session.execute(q, {"aid": ann.id})
    assert result.scalar() == "published"

    # Delete
    await db_session.delete(loaded)
    await db_session.commit()

    gone = await db_session.get(Announcement, ann.id)
    assert gone is None


# ---------------------------------------------------------------------------
# 4. Multiple independent transactions
# ---------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_sequential_transactions(db_session: AsyncSession) -> None:
    """Run 10 independent commits to stress the connection pool."""
    for i in range(10):
        user = _user(email=f"seq{i}@test.tn")
        db_session.add(user)
        await db_session.commit()

    result = await db_session.execute(
        text("SELECT count(*) FROM users WHERE email LIKE 'seq%@test.tn'")
    )
    assert result.scalar() == 10


# ---------------------------------------------------------------------------
# 5. Mixed operations across tables
# ---------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_evaluation_with_grades(db_session: AsyncSession) -> None:
    """Create an evaluation and attach multiple grades."""
    teacher = _user(role=UserRole.teacher, email="eval_teacher@test.tn")
    student = _user(role=UserRole.student, email="eval_student@test.tn")
    db_session.add_all([teacher, student])
    await db_session.flush()

    ev = Evaluation(
        id=_uid(),
        title="Midterm",
        type="examen",
        date=date(2025, 12, 15),
        max_score=20.0,
        teacher_id=teacher.id,
    )
    db_session.add(ev)
    await db_session.flush()

    grades = [
        Grade(id=_uid(), evaluation_id=ev.id, student_id=student.id, score=score)
        for score in [12.0, 15.5, 18.0, 9.0, 14.5]
    ]
    db_session.add_all(grades)
    await db_session.commit()

    q = text(
        "SELECT count(*) FROM grades WHERE evaluation_id = :eid"
    )
    result = await db_session.execute(q, {"eid": ev.id})
    assert result.scalar() == 5


# ---------------------------------------------------------------------------
# 6. Absences batch insert
# ---------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_absences_batch(db_session: AsyncSession) -> None:
    """Create 20 absence records to test batch operations."""
    student = _user(role=UserRole.student, email="abs_student@test.tn")
    db_session.add(student)
    await db_session.flush()

    absences = [
        Absence(
            id=_uid(),
            student_id=student.id,
            type="absence",
            date=date(2025, 9, 1 + i),
            start_time=time(8, 0),
            end_time=time(10, 0),
        )
        for i in range(20)
    ]
    db_session.add_all(absences)
    await db_session.commit()

    result = await db_session.execute(
        text(f"SELECT count(*) FROM absences WHERE student_id = '{student.id}'")
    )
    assert result.scalar() == 20


# ---------------------------------------------------------------------------
# 7. Notifications CRUD
# ---------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_notifications_crud(db_session: AsyncSession) -> None:
    """Create, read, update, and delete notifications."""
    user = _user(role=UserRole.student, email="notif_student@test.tn")
    db_session.add(user)
    await db_session.flush()

    notif = Notification(
        id=_uid(),
        user_id=user.id,
        type="system",
        title="Welcome",
        body="Welcome to Don Bosco Connect",
    )
    db_session.add(notif)
    await db_session.commit()

    loaded = await db_session.get(Notification, notif.id)
    assert loaded is not None
    assert loaded.title == "Welcome"

    loaded.is_read = True  # type: ignore[assignment]
    await db_session.commit()

    await db_session.delete(loaded)
    await db_session.commit()

    gone = await db_session.get(Notification, notif.id)
    assert gone is None


# ---------------------------------------------------------------------------
# 8. Concurrent-like rapid commits
# ---------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_rapid_fire_commits(db_session: AsyncSession) -> None:
    """25 rapid sequential commits to stress event loop and connection pool."""
    for i in range(25):
        ann = Announcement(
            id=_uid(),
            title=f"Rapid {i}",
            slug=f"rapid-{i}-{_uid().hex[:8]}",
            content_json={"text": str(i)},
            category="general",
            status="draft",
        )
        db_session.add(ann)
        await db_session.commit()

    result = await db_session.execute(
        text("SELECT count(*) FROM announcements WHERE title LIKE 'Rapid %'")
    )
    assert result.scalar() == 25


# ---------------------------------------------------------------------------
# 9. Read-heavy test (many SELECTs on different tables)
# ---------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_heavy_reads(db_session: AsyncSession) -> None:
    """Perform many SELECT queries across different tables."""
    for _ in range(10):
        await db_session.execute(text("SELECT count(*) FROM users"))
        await db_session.execute(text("SELECT count(*) FROM announcements"))
        await db_session.execute(text("SELECT count(*) FROM grades"))
        await db_session.execute(text("SELECT count(*) FROM absences"))
        await db_session.execute(text("SELECT count(*) FROM notifications"))
        await db_session.execute(text("SELECT count(*) FROM evaluations"))
        await db_session.execute(text("SELECT count(*) FROM subjects"))
        await db_session.execute(text("SELECT count(*) FROM classes"))


# ---------------------------------------------------------------------------
# 10. Large record with JSON payload
# ---------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_large_json_payload(db_session: AsyncSession) -> None:
    """Insert an announcement with a large content_json payload."""
    big_payload = {
        "blocks": [
            {"type": "paragraph", "text": f"Line {i} of content. " * 10}
            for i in range(50)
        ]
    }
    ann = Announcement(
        id=_uid(),
        title="Large Payload",
        slug=f"large-{_uid().hex[:8]}",
        content_json=big_payload,
        category="general",
        status="draft",
    )
    db_session.add(ann)
    await db_session.commit()

    loaded = await db_session.get(Announcement, ann.id)
    assert loaded is not None
    assert len(loaded.content_json["blocks"]) == 50  # type: ignore[index]


# ---------------------------------------------------------------------------
# 11. Cross-table foreign key operations
# ---------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_cascade_relationships(db_session: AsyncSession) -> None:
    """Create related records across multiple tables and verify they coexist."""
    teacher = _user(role=UserRole.teacher, email="cascade_teacher@test.tn")
    db_session.add(teacher)
    await db_session.flush()

    year = AcademicYear(
        id=_uid(), name="Cascade Year",
        start_date=date(2025, 9, 1),
        end_date=date(2026, 6, 30),
    )
    db_session.add(year)
    await db_session.flush()

    cls = Class(id=_uid(), academic_year_id=year.id, name="5ème B", level="5ème")
    db_session.add(cls)
    await db_session.flush()

    subj = Subject(id=_uid(), name="Français", code="FR01")
    db_session.add(subj)
    await db_session.flush()

    ev = Evaluation(
        id=_uid(), title="Dictée", type="controle",
        date=date(2025, 10, 10), teacher_id=teacher.id,
        subject_id=subj.id, class_id=cls.id,
    )
    db_session.add(ev)
    await db_session.commit()

    result = await db_session.execute(text("SELECT count(*) FROM evaluations"))
    count = result.scalar()
    assert count is not None and count >= 1


# ---------------------------------------------------------------------------
# 12. Stress test: 100 records across two tables
# ---------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_stress_two_tables(db_session: AsyncSession) -> None:
    """Insert 50 users + 50 announcements in rapid succession."""
    users = [_user(email=f"stress_u{i}@test.tn") for i in range(50)]
    db_session.add_all(users)
    await db_session.flush()

    anns = [
        Announcement(
            id=_uid(),
            title=f"Stress {i}",
            slug=f"stress-{i}-{_uid().hex[:8]}",
            content_json={},
            category="general",
            status="draft",
        )
        for i in range(50)
    ]
    db_session.add_all(anns)
    await db_session.commit()

    r1 = await db_session.execute(
        text("SELECT count(*) FROM users WHERE email LIKE 'stress_u%@test.tn'")
    )
    r2 = await db_session.execute(
        text("SELECT count(*) FROM announcements WHERE title LIKE 'Stress %'")
    )
    assert r1.scalar() == 50
    assert r2.scalar() == 50

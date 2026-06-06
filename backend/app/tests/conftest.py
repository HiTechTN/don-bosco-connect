"""Shared fixtures for backend tests.

The engine is session-scoped (tables created once, disposed once).
``db_session`` is function-scoped — each test gets a fresh session backed
by a dedicated connection from the pool.

Note: we intentionally do NOT override the ``event_loop`` fixture.
In pytest-asyncio >=0.23 with ``asyncio_mode = auto``, overriding it
deprecation causes ``RuntimeError: Task … got Future … attached to a
different loop`` because the session-scoped loop conflicts with the
framework's own loop management.
"""
import uuid
from collections.abc import AsyncGenerator

import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy import text
from sqlalchemy.exc import OperationalError, ProgrammingError
from sqlalchemy.ext.asyncio import (
    AsyncSession,
    create_async_engine,
)

from app.config import settings
from app.core.security import create_access_token, hash_password
from app.database import Base, get_db
from app.main import app
from app.models.base import User, UserRole

TEST_DATABASE_URL = settings.DATABASE_URL


# ---------------------------------------------------------------------------
# Database fixtures
# ---------------------------------------------------------------------------
@pytest_asyncio.fixture(scope="session")
async def engine():
    """Session-scoped async engine — create tables once, dispose once."""
    engine = create_async_engine(TEST_DATABASE_URL, echo=False)
    async with engine.begin() as conn:
        try:
            await conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector"))
        except (ProgrammingError, OperationalError):
            pass  # pgvector extension not installed locally
        await conn.run_sync(Base.metadata.create_all)
    yield engine
    # Teardown: truncate all test-populated tables to prevent
    # data accumulation across repeated local runs.
    tables_to_truncate = [
        "announcements",
        "grades",
        "absences",
        "notifications",
        "quiz_attempts",
        "quiz_questions",
        "quizzes",
        "evaluations",
        "audit_logs",
        "refresh_tokens",
        "users",
        "subjects",
        "classes",
        "academic_years",
        "school_events",
        "timetable_slots",
        "teacher_subject_assignments",
        "class_enrollments",
        "student_parent_links",
        "student_profiles",
        "student_badges",
        "xp_transactions",
        "badges",
        "ai_messages",
        "ai_conversations",
        "course_files",
        "document_chunks",
        "courses",
        "messages",
        "thread_participants",
        "message_threads",
    ]
    async with engine.begin() as conn:
        for table in tables_to_truncate:
            await conn.execute(text(f"TRUNCATE TABLE {table} CASCADE"))
    await engine.dispose()


@pytest_asyncio.fixture
async def db_session(engine) -> AsyncGenerator[AsyncSession, None]:
    """Function-scoped session — each test gets a dedicated connection.

    Using ``engine.connect()`` explicitly acquires a connection from the
    pool and binds the session to it, preventing concurrent tests from
    sharing the same underlying asyncpg connection (which causes
    ``InterfaceError: cannot perform operation: another operation is
    in progress``).
    """
    async with engine.connect() as conn:
        async with AsyncSession(bind=conn, expire_on_commit=False) as session:
            yield session


# ---------------------------------------------------------------------------
# HTTP client fixture
# ---------------------------------------------------------------------------
@pytest_asyncio.fixture
async def client(db_session: AsyncSession) -> AsyncGenerator[AsyncClient, None]:
    """Async test client with ``get_db`` overridden to use the test session."""

    async def override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = override_get_db
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac
    app.dependency_overrides.clear()


# ---------------------------------------------------------------------------
# User fixtures
# ---------------------------------------------------------------------------
async def _create_user(
    db_session: AsyncSession, role: UserRole, email: str
) -> User:
    user = User(
        id=uuid.uuid4(),
        email=email,
        password_hash=hash_password("password123"),
        role=role,
        first_name=role.value.capitalize(),
        last_name="Test",
    )
    db_session.add(user)
    await db_session.commit()
    return user


@pytest_asyncio.fixture
async def admin_user(db_session: AsyncSession) -> User:
    return await _create_user(
        db_session, UserRole.admin, f"admin_{uuid.uuid4().hex[:8]}@test.tn"
    )


@pytest_asyncio.fixture
async def teacher_user(db_session: AsyncSession) -> User:
    return await _create_user(
        db_session, UserRole.teacher, f"teacher_{uuid.uuid4().hex[:8]}@test.tn"
    )


@pytest_asyncio.fixture
async def student_user(db_session: AsyncSession) -> User:
    return await _create_user(
        db_session, UserRole.student, f"student_{uuid.uuid4().hex[:8]}@test.tn"
    )


# ---------------------------------------------------------------------------
# Token fixtures
# ---------------------------------------------------------------------------
@pytest_asyncio.fixture
async def admin_token(admin_user: User) -> str:
    return create_access_token(
        user_id=str(admin_user.id), role=admin_user.role
    )


@pytest_asyncio.fixture
async def teacher_token(teacher_user: User) -> str:
    return create_access_token(
        user_id=str(teacher_user.id), role=teacher_user.role
    )


@pytest_asyncio.fixture
async def student_token(student_user: User) -> str:
    return create_access_token(
        user_id=str(student_user.id), role=student_user.role
    )

"""Shared fixtures for backend tests.

Root-cause fix for pytest-asyncio "Event loop is closed" error:
Override the ``event_loop`` fixture at **session** scope so that every test
and every async fixture shares a single loop that stays alive for the entire
test session.  The engine is also session-scoped (tables created once,
disposed once).  ``db_session`` is function-scoped — each test gets a fresh
session backed by a connection from the pool.
"""
import asyncio
import uuid
from collections.abc import AsyncGenerator

import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy import text
from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)

from app.config import settings
from app.core.security import create_access_token, hash_password
from app.database import Base, get_db
from app.main import app
from app.models.base import User, UserRole

TEST_DATABASE_URL = settings.DATABASE_URL


# ---------------------------------------------------------------------------
# Session-scoped event loop — single loop for all tests and fixtures
# ---------------------------------------------------------------------------
@pytest.fixture(scope="session")
def event_loop():
    """Session-scoped event loop.

    Overriding the default function-scoped loop prevents the
    "Event loop is closed" error that occurs when session-scoped
    fixtures (like ``engine``) try to tear down after the loop
    has already been closed by a function-scoped loop.
    """
    loop = asyncio.new_event_loop()
    yield loop
    loop.close()


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
        except Exception:
            pass  # noqa: E722 — pgvector may not be installed locally
        await conn.run_sync(Base.metadata.create_all)
    yield engine
    await engine.dispose()


@pytest_asyncio.fixture
async def db_session(engine) -> AsyncGenerator[AsyncSession, None]:
    """Function-scoped session — fresh session per test from the pool."""
    session_factory = async_sessionmaker(
        engine, class_=AsyncSession, expire_on_commit=False
    )
    async with session_factory() as session:
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
    return await _create_user(db_session, UserRole.admin, "admin@test.tn")


@pytest_asyncio.fixture
async def teacher_user(db_session: AsyncSession) -> User:
    return await _create_user(db_session, UserRole.teacher, "teacher@test.tn")


@pytest_asyncio.fixture
async def student_user(db_session: AsyncSession) -> User:
    return await _create_user(db_session, UserRole.student, "student@test.tn")


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

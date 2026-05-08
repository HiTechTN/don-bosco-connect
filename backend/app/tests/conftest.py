import asyncio
import uuid
from typing import AsyncGenerator

import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy import text

from app.main import app
from app.database import Base, get_db
from app.config import settings
from app.models.base import User, UserRole
from app.core.security import hash_password, create_access_token


TEST_DATABASE_URL = settings.DATABASE_URL


@pytest_asyncio.fixture(scope="session")
def event_loop():
    loop = asyncio.new_event_loop()
    yield loop
    loop.close()


@pytest_asyncio.fixture(scope="session")
async def engine():
    engine = create_async_engine(TEST_DATABASE_URL, echo=False)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield engine
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    await engine.dispose()


@pytest_asyncio.fixture
async def db_session(engine) -> AsyncGenerator[AsyncSession, None]:
    session_factory = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    async with session_factory() as session:
        yield session


@pytest_asyncio.fixture
async def client(db_session: AsyncSession) -> AsyncGenerator[AsyncClient, None]:
    async def override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = override_get_db
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac
    app.dependency_overrides.clear()


async def _create_user(db_session: AsyncSession, role: UserRole, email: str) -> User:
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


@pytest_asyncio.fixture
async def admin_token(admin_user: User) -> str:
    return create_access_token(user_id=str(admin_user.id), role=admin_user.role)


@pytest_asyncio.fixture
async def teacher_token(teacher_user: User) -> str:
    return create_access_token(user_id=str(teacher_user.id), role=teacher_user.role)


@pytest_asyncio.fixture
async def student_token(student_user: User) -> str:
    return create_access_token(user_id=str(student_user.id), role=student_user.role)
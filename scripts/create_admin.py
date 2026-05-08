"""
CLI script to create an admin user in production.
Usage: python scripts/create_admin.py --email admin@donbosco.tn --password <password> --name "Admin Name"
"""
import asyncio
import argparse
import uuid

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy import select

from app.config import settings
from app.models.user import User, UserRole, UserStatus
from app.core.security import hash_password


async def create_admin(email: str, password: str, first_name: str, last_name: str):
    engine = create_async_engine(settings.DATABASE_URL, echo=False)
    session_factory = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async with session_factory() as session:
        result = await session.execute(select(User).where(User.email == email))
        existing = result.scalar_one_or_none()
        if existing:
            print(f"User with email {email} already exists.")
            return

        admin = User(
            id=uuid.uuid4(),
            email=email,
            password_hash=hash_password(password),
            role=UserRole.admin,
            first_name=first_name,
            last_name=last_name,
            status=UserStatus.active,
        )
        session.add(admin)
        await session.commit()
        print(f"Admin user created: {email}")

    await engine.dispose()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Create admin user")
    parser.add_argument("--email", required=True, help="Admin email")
    parser.add_argument("--password", required=True, help="Admin password")
    parser.add_argument("--first-name", required=True, help="Admin first name")
    parser.add_argument("--last-name", required=True, help="Admin last name")
    args = parser.parse_args()

    asyncio.run(create_admin(args.email, args.password, args.first_name, args.last_name))

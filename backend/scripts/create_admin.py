import asyncio, argparse, sys, uuid
sys.path.insert(0, "/app")
from app.database import AsyncSessionLocal
from app.models.base import User
from app.core.security import hash_password
from sqlalchemy import select

async def create_admin(email, first, last, password):
    async with AsyncSessionLocal() as session:
        if (await session.execute(select(User).where(User.email == email))).scalar_one_or_none():
            print("Email déjà utilisé.")
            return
        session.add(User(id=uuid.uuid4(), email=email, password_hash=hash_password(password), role="admin", first_name=first, last_name=last))
        await session.commit()
        print("Admin créé.")

if __name__ == "__main__":
    p = argparse.ArgumentParser()
    p.add_argument("--email", required=True)
    p.add_argument("--first-name", required=True)
    p.add_argument("--last-name", required=True)
    p.add_argument("--password", default="Admin123!")
    args = p.parse_args()
    asyncio.run(create_admin(args.email, args.first_name, args.last_name, args.password))

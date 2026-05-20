from datetime import UTC, datetime
from uuid import UUID, uuid4

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import decrypt_message, encrypt_message
from app.models.base import Message, MessageThread, ThreadParticipant


def _to_uuid(val: str | UUID) -> UUID:
    return UUID(val) if isinstance(val, str) else val


async def create_thread(
    db: AsyncSession, creator_id: str, subject: str | None, participant_ids: list[str]
) -> MessageThread:
    thread = MessageThread(id=uuid4(), subject=subject, created_by=_to_uuid(creator_id))
    db.add(thread)
    await db.flush()
    all_ids = set(_to_uuid(uid) for uid in [creator_id] + participant_ids)
    for uid in all_ids:
        db.add(ThreadParticipant(thread_id=thread.id, user_id=uid))
    await db.commit()
    await db.refresh(thread)
    return thread


async def send_message(db: AsyncSession, thread_id: str, sender_id: str, content: str) -> Message:
    ct_b64, iv_b64 = encrypt_message(content)
    msg = Message(
        id=uuid4(),
        thread_id=_to_uuid(thread_id),
        sender_id=_to_uuid(sender_id),
        content=ct_b64,
        content_iv=iv_b64,
    )
    db.add(msg)
    thread = await db.get(MessageThread, _to_uuid(thread_id))
    if thread:
        thread.updated_at = datetime.now(UTC)
    await db.commit()
    await db.refresh(msg)
    msg.content = decrypt_message(msg.content, msg.content_iv)
    return msg

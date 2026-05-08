import uuid
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.api.deps import get_current_user
from app.models.base import MessageThread, ThreadParticipant, Message, User
from app.schemas.messaging import ThreadCreate, MessageSend, MessageResponse
from app.services.messaging_service import create_thread, send_message
from app.core.security import decrypt_message
from app.core.exceptions import NotFoundException, ForbiddenException

router = APIRouter(prefix="/messages", tags=["messages"])


@router.post("/threads", status_code=201)
async def create_new_thread(
    body: ThreadCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    thread = await create_thread(db, str(current_user.id), body.subject, body.participant_ids)
    return {"id": str(thread.id), "subject": thread.subject, "created_at": str(thread.created_at)}


@router.get("/threads", response_model=List[dict])
async def list_threads(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(
        select(MessageThread)
        .join(ThreadParticipant)
        .where(ThreadParticipant.user_id == current_user.id)
    )
    threads = result.scalars().all()
    resp = []
    for t in threads:
        last_msg_result = await db.execute(
            select(Message)
            .where(Message.thread_id == t.id)
            .order_by(Message.created_at.desc())
            .limit(1)
        )
        last_msg = last_msg_result.scalar_one_or_none()
        last_msg_content = None
        if last_msg:
            try:
                last_msg_content = decrypt_message(last_msg.content, last_msg.content_iv)
            except Exception:
                last_msg_content = "***"
        resp.append({
            "id": str(t.id),
            "subject": t.subject,
            "last_message": last_msg_content,
            "updated_at": t.updated_at.isoformat() if t.updated_at else None,
        })
    return resp


@router.get("/threads/{thread_id}", response_model=List[dict])
async def get_messages(
    thread_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        tid = uuid.UUID(thread_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="ID fil invalide")

    part = await db.execute(
        select(ThreadParticipant).where(
            ThreadParticipant.thread_id == tid,
            ThreadParticipant.user_id == current_user.id
        )
    )
    if not part.scalar_one_or_none():
        raise ForbiddenException("Accès interdit à ce fil")

    result = await db.execute(
        select(Message).where(Message.thread_id == tid).order_by(Message.created_at)
    )
    messages = result.scalars().all()
    return [
        {
            "id": str(msg.id),
            "thread_id": str(msg.thread_id),
            "sender_id": str(msg.sender_id),
            "content": decrypt_message(msg.content, msg.content_iv)
            if msg.content_iv
            else "***",
            "created_at": msg.created_at.isoformat() if msg.created_at else None,
        }
        for msg in messages
    ]


@router.post("/threads/{thread_id}", status_code=201)
async def post_message(
    thread_id: str,
    body: MessageSend,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        tid = uuid.UUID(thread_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="ID fil invalide")

    part = await db.execute(
        select(ThreadParticipant).where(
            ThreadParticipant.thread_id == tid,
            ThreadParticipant.user_id == current_user.id
        )
    )
    if not part.scalar_one_or_none():
        raise ForbiddenException("Accès interdit à ce fil")

    msg = await send_message(db, thread_id, str(current_user.id), body.content)
    return {
        "id": str(msg.id),
        "thread_id": str(msg.thread_id),
        "sender_id": str(msg.sender_id),
        "content": msg.content,
        "created_at": msg.created_at.isoformat() if msg.created_at else None,
    }
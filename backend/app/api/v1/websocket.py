import asyncio
import json

from fastapi import APIRouter, Query, WebSocket, WebSocketDisconnect

from app.core.security import decode_token
from app.redis_client import get_redis

router = APIRouter()


async def get_user_from_token(token: str) -> dict | None:
    payload = decode_token(token)
    if payload and payload.get("type") == "access":
        return payload
    return None


@router.websocket("/ws/v1/notifications")
async def websocket_notifications(
    websocket: WebSocket,
    token: str = Query(...),
) -> None:
    payload = await get_user_from_token(token)
    if not payload:
        await websocket.close(code=4001)
        return

    user_id = payload["sub"]
    await websocket.accept()

    redis = await get_redis()
    pubsub = redis.pubsub()
    await pubsub.subscribe(f"user:{user_id}", "broadcast")

    async def listen():
        async for msg in pubsub.listen():
            if msg["type"] == "message":
                try:
                    text = msg["data"]
                    if isinstance(text, bytes):
                        text = text.decode()
                    await websocket.send_text(text)
                except Exception:
                    pass

    listen_task = asyncio.create_task(listen())

    try:
        while True:
            try:
                await asyncio.wait_for(websocket.receive_text(), timeout=30.0)
            except TimeoutError:
                await websocket.send_text(json.dumps({"type": "ping"}))
    except WebSocketDisconnect:
        listen_task.cancel()
        await pubsub.unsubscribe(f"user:{user_id}", "broadcast")


@router.websocket("/ws/v1/ai/stream/{conversation_id}")
async def websocket_ai_stream(
    websocket: WebSocket,
    conversation_id: str,
    token: str = Query(...),
) -> None:
    payload = await get_user_from_token(token)
    if not payload:
        await websocket.close(code=4001)
        return

    await websocket.accept()
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        pass


async def send_notification_to_user(user_id: str, message: dict) -> None:
    """Send a notification to a specific user via Redis Pub/Sub."""
    try:
        redis = await get_redis()
        await redis.publish(f"user:{user_id}", json.dumps(message))
    except Exception:
        pass

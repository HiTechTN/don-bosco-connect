from fastapi import APIRouter, Query, WebSocket, WebSocketDisconnect

from app.core.security import decode_token

router = APIRouter()

active_connections: dict[str, set[WebSocket]] = {}


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

    if user_id not in active_connections:
        active_connections[user_id] = set()
    active_connections[user_id].add(websocket)

    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        active_connections[user_id].discard(websocket)
        if not active_connections[user_id]:
            del active_connections[user_id]


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
    """Send a notification to a specific user via WebSocket."""
    if user_id in active_connections:
        for ws in active_connections[user_id]:
            try:
                await ws.send_json(message)
            except Exception:
                active_connections[user_id].discard(ws)

"""Tests for AI endpoints."""

from httpx import AsyncClient


async def test_create_conversation(client: AsyncClient, student_token: str) -> None:
    resp = await client.post(
        "/api/v1/ai/conversations",
        params={"title": "Test"},
        headers={"Authorization": f"Bearer {student_token}"},
    )
    assert resp.status_code == 201
    data = resp.json()
    assert data["title"] == "Test"
    assert "id" in data


async def test_create_conversation_default_title(client: AsyncClient, student_token: str) -> None:
    resp = await client.post(
        "/api/v1/ai/conversations",
        headers={"Authorization": f"Bearer {student_token}"},
    )
    assert resp.status_code == 201
    assert resp.json()["title"] == "Nouvelle conversation"


async def test_list_conversations(client: AsyncClient, student_token: str) -> None:
    resp = await client.get(
        "/api/v1/ai/conversations",
        headers={"Authorization": f"Bearer {student_token}"},
    )
    assert resp.status_code == 200
    assert isinstance(resp.json(), list)


async def test_list_conversations_requires_auth(client: AsyncClient) -> None:
    resp = await client.get("/api/v1/ai/conversations")
    assert resp.status_code in (401, 403)


async def test_get_conversation_messages(client: AsyncClient, student_token: str) -> None:
    # Create a conversation first
    create_resp = await client.post(
        "/api/v1/ai/conversations",
        params={"title": "Msg Test"},
        headers={"Authorization": f"Bearer {student_token}"},
    )
    conv_id = create_resp.json()["id"]

    # Get messages (should be empty)
    resp = await client.get(
        f"/api/v1/ai/conversations/{conv_id}",
        headers={"Authorization": f"Bearer {student_token}"},
    )
    assert resp.status_code == 200
    assert isinstance(resp.json(), list)


async def test_get_conversation_not_found(client: AsyncClient, student_token: str) -> None:
    resp = await client.get(
        "/api/v1/ai/conversations/00000000-0000-0000-0000-000000000000",
        headers={"Authorization": f"Bearer {student_token}"},
    )
    assert resp.status_code == 404


async def test_get_conversation_wrong_user(
    client: AsyncClient, student_token: str, teacher_token: str
) -> None:
    # Student creates conversation
    create_resp = await client.post(
        "/api/v1/ai/conversations",
        params={"title": "Private"},
        headers={"Authorization": f"Bearer {student_token}"},
    )
    conv_id = create_resp.json()["id"]

    # Teacher tries to access it
    resp = await client.get(
        f"/api/v1/ai/conversations/{conv_id}",
        headers={"Authorization": f"Bearer {teacher_token}"},
    )
    assert resp.status_code == 404


async def test_message_feedback_not_found(client: AsyncClient, student_token: str) -> None:
    nil_uuid = "00000000-0000-0000-0000-000000000000"
    resp = await client.post(
        f"/api/v1/ai/conversations/{nil_uuid}/messages/{nil_uuid}/feedback",
        params={"feedback": 1},
        headers={"Authorization": f"Bearer {student_token}"},
    )
    assert resp.status_code == 404


async def test_quiz_generate_requires_auth(client: AsyncClient) -> None:
    resp = await client.post(
        "/api/v1/ai/quiz/generate",
        json={"course_id": "", "num_questions": 3},
    )
    assert resp.status_code == 401


async def test_quiz_generate_requires_admin_or_teacher(
    client: AsyncClient, student_token: str
) -> None:
    resp = await client.post(
        "/api/v1/ai/quiz/generate",
        json={"course_id": "", "num_questions": 3},
        headers={"Authorization": f"Bearer {student_token}"},
    )
    assert resp.status_code in (401, 403)


async def test_list_quizzes(client: AsyncClient, student_token: str) -> None:
    resp = await client.get(
        "/api/v1/ai/quizzes",
        headers={"Authorization": f"Bearer {student_token}"},
    )
    assert resp.status_code == 200
    assert isinstance(resp.json(), list)


async def test_list_quizzes_requires_auth(client: AsyncClient) -> None:
    resp = await client.get("/api/v1/ai/quizzes")
    assert resp.status_code in (401, 403)


async def test_get_quiz_not_found(client: AsyncClient, student_token: str) -> None:
    nil_uuid = "00000000-0000-0000-0000-000000000000"
    resp = await client.get(
        f"/api/v1/ai/quizzes/{nil_uuid}",
        headers={"Authorization": f"Bearer {student_token}"},
    )
    assert resp.status_code == 404


async def test_quiz_attempt_not_found(client: AsyncClient, student_token: str) -> None:
    nil_uuid = "00000000-0000-0000-0000-000000000000"
    resp = await client.post(
        f"/api/v1/ai/quizzes/{nil_uuid}/attempt",
        json={"answers": []},
        headers={"Authorization": f"Bearer {student_token}"},
    )
    assert resp.status_code == 404


async def test_quiz_generate_course_not_found(client: AsyncClient, admin_token: str) -> None:
    nil_uuid = "00000000-0000-0000-0000-000000000000"
    resp = await client.post(
        "/api/v1/ai/quiz/generate",
        json={"course_id": nil_uuid, "num_questions": 2},
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    # May be 404 (course not found) or 500 (Ollama not available)
    assert resp.status_code in (404, 500)


async def test_chat_stream_requires_auth(client: AsyncClient) -> None:
    resp = await client.post(
        "/api/v1/ai/chat/stream",
        json={"message": "Hello"},
    )
    assert resp.status_code == 401

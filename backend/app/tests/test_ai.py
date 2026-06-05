from httpx import AsyncClient


async def test_create_conversation(client: AsyncClient, student_token: str) -> None:
    resp = await client.post(
        "/api/v1/ai/conversations",
        params={"title": "Test"},
        headers={"Authorization": f"Bearer {student_token}"},
    )
    assert resp.status_code == 201


async def test_list_conversations(client: AsyncClient, student_token: str) -> None:
    resp = await client.get(
        "/api/v1/ai/conversations",
        headers={"Authorization": f"Bearer {student_token}"},
    )
    assert resp.status_code == 200


async def test_get_conversation_not_found(client: AsyncClient, student_token: str) -> None:
    resp = await client.get(
        "/api/v1/ai/conversations/00000000-0000-0000-0000-000000000000",
        headers={"Authorization": f"Bearer {student_token}"},
    )
    assert resp.status_code == 404


async def test_quiz_generate_requires_auth(client: AsyncClient) -> None:
    resp = await client.post(
        "/api/v1/ai/quiz/generate",
        json={"course_id": "", "num_questions": 3},
    )
    assert resp.status_code == 403


async def test_list_quizzes(client: AsyncClient, student_token: str) -> None:
    resp = await client.get(
        "/api/v1/ai/quizzes",
        headers={"Authorization": f"Bearer {student_token}"},
    )
    assert resp.status_code == 200

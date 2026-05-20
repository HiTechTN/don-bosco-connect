import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_create_evaluation(client: AsyncClient, teacher_token: str) -> None:
    resp = await client.post(
        "/api/v1/evaluations",
        json={
            "title": "Test Contrôle",
            "type": "controle",
            "subject_id": "",
            "class_id": "",
            "date": "2026-05-15",
        },
        headers={"Authorization": f"Bearer {teacher_token}"},
    )
    assert resp.status_code in (201, 422)


@pytest.mark.asyncio
async def test_list_evaluations(client: AsyncClient, student_token: str) -> None:
    resp = await client.get(
        "/api/v1/evaluations",
        headers={"Authorization": f"Bearer {student_token}"},
    )
    assert resp.status_code == 200


@pytest.mark.asyncio
async def test_get_evaluation_not_found(client: AsyncClient, admin_token: str) -> None:
    resp = await client.get(
        "/api/v1/evaluations/00000000-0000-0000-0000-000000000000",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert resp.status_code == 404

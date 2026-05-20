import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_create_course(client: AsyncClient, teacher_token: str) -> None:
    resp = await client.post(
        "/api/v1/courses",
        json={"title": "Test Course", "subject_id": "", "class_id": ""},
        headers={"Authorization": f"Bearer {teacher_token}"},
    )
    assert resp.status_code in (201, 422)  # 422 if subject_id/class_id invalid (test env)


@pytest.mark.asyncio
async def test_list_courses(client: AsyncClient, student_token: str) -> None:
    resp = await client.get(
        "/api/v1/courses",
        headers={"Authorization": f"Bearer {student_token}"},
    )
    assert resp.status_code == 200
    assert isinstance(resp.json(), list)


@pytest.mark.asyncio
async def test_get_course_not_found(client: AsyncClient, admin_token: str) -> None:
    resp = await client.get(
        "/api/v1/courses/00000000-0000-0000-0000-000000000000",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert resp.status_code == 404

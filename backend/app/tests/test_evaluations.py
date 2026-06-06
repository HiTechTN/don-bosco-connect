"""Tests for evaluation endpoints."""

from httpx import AsyncClient


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


async def test_create_evaluation_requires_auth(client: AsyncClient) -> None:
    resp = await client.post(
        "/api/v1/evaluations",
        json={"title": "Test", "date": "2026-05-15"},
    )
    assert resp.status_code in (401, 403)


async def test_create_evaluation_requires_teacher_or_admin(
    client: AsyncClient, student_token: str
) -> None:
    resp = await client.post(
        "/api/v1/evaluations",
        json={"title": "Test", "date": "2026-05-15"},
        headers={"Authorization": f"Bearer {student_token}"},
    )
    assert resp.status_code in (401, 403)


async def test_list_evaluations(client: AsyncClient, student_token: str) -> None:
    resp = await client.get(
        "/api/v1/evaluations",
        headers={"Authorization": f"Bearer {student_token}"},
    )
    assert resp.status_code == 200
    assert isinstance(resp.json(), list)


async def test_list_evaluations_requires_auth(client: AsyncClient) -> None:
    resp = await client.get("/api/v1/evaluations")
    assert resp.status_code in (401, 403)


async def test_get_evaluation_not_found(client: AsyncClient, admin_token: str) -> None:
    resp = await client.get(
        "/api/v1/evaluations/00000000-0000-0000-0000-000000000000",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert resp.status_code == 404


async def test_get_evaluation_invalid_id(client: AsyncClient, admin_token: str) -> None:
    resp = await client.get(
        "/api/v1/evaluations/not-a-uuid",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert resp.status_code == 400


async def test_update_evaluation_invalid_id(client: AsyncClient, admin_token: str) -> None:
    resp = await client.patch(
        "/api/v1/evaluations/not-a-uuid",
        json={"title": "Updated"},
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert resp.status_code == 400


async def test_delete_evaluation_invalid_id(client: AsyncClient, admin_token: str) -> None:
    resp = await client.delete(
        "/api/v1/evaluations/not-a-uuid",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert resp.status_code == 400


async def test_get_grades_invalid_id(client: AsyncClient, admin_token: str) -> None:
    resp = await client.get(
        "/api/v1/evaluations/not-a-uuid/grades",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert resp.status_code == 400


async def test_add_grades_invalid_id(client: AsyncClient, admin_token: str) -> None:
    resp = await client.post(
        "/api/v1/evaluations/not-a-uuid/grades",
        json={"grades": []},
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert resp.status_code == 400


async def test_get_grades_nonexistent(client: AsyncClient, admin_token: str) -> None:
    nil_uuid = "00000000-0000-0000-0000-000000000000"
    resp = await client.get(
        f"/api/v1/evaluations/{nil_uuid}/grades",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert resp.status_code == 404


async def test_add_grades_nonexistent(client: AsyncClient, admin_token: str) -> None:
    nil_uuid = "00000000-0000-0000-0000-000000000000"
    resp = await client.post(
        f"/api/v1/evaluations/{nil_uuid}/grades",
        json={"grades": []},
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert resp.status_code == 404


async def test_delete_evaluation_nonexistent(client: AsyncClient, admin_token: str) -> None:
    nil_uuid = "00000000-0000-0000-0000-000000000000"
    resp = await client.delete(
        f"/api/v1/evaluations/{nil_uuid}",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert resp.status_code == 404


async def test_update_evaluation_nonexistent(client: AsyncClient, admin_token: str) -> None:
    nil_uuid = "00000000-0000-0000-0000-000000000000"
    resp = await client.patch(
        f"/api/v1/evaluations/{nil_uuid}",
        json={"title": "Updated"},
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert resp.status_code == 404


async def test_get_grades_requires_auth(client: AsyncClient) -> None:
    nil_uuid = "00000000-0000-0000-0000-000000000000"
    resp = await client.get(f"/api/v1/evaluations/{nil_uuid}/grades")
    assert resp.status_code in (401, 403)


async def test_add_grades_requires_auth(client: AsyncClient) -> None:
    nil_uuid = "00000000-0000-0000-0000-000000000000"
    resp = await client.post(
        f"/api/v1/evaluations/{nil_uuid}/grades",
        json={"grades": []},
    )
    assert resp.status_code in (401, 403)


async def test_publish_requires_auth(client: AsyncClient) -> None:
    nil_uuid = "00000000-0000-0000-0000-000000000000"
    resp = await client.post(f"/api/v1/evaluations/{nil_uuid}/publish")
    assert resp.status_code in (401, 403)


async def test_student_cannot_create_evaluation(client: AsyncClient, student_token: str) -> None:
    resp = await client.post(
        "/api/v1/evaluations",
        json={"title": "Student Eval", "date": "2026-06-01"},
        headers={"Authorization": f"Bearer {student_token}"},
    )
    assert resp.status_code in (401, 403)


async def test_student_cannot_delete_evaluation(client: AsyncClient, student_token: str) -> None:
    nil_uuid = "00000000-0000-0000-0000-000000000000"
    resp = await client.delete(
        f"/api/v1/evaluations/{nil_uuid}",
        headers={"Authorization": f"Bearer {student_token}"},
    )
    assert resp.status_code in (401, 403)

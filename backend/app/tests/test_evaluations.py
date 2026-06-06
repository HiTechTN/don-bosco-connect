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


# ── Happy-path flow tests ──────────────────────────────────────


async def test_evaluation_full_crud_flow(
    client: AsyncClient, teacher_token: str, admin_token: str
) -> None:
    """Create → retrieve → update → publish → get grades → delete."""
    headers = {"Authorization": f"Bearer {teacher_token}"}
    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    # 1. Create
    create_resp = await client.post(
        "/api/v1/evaluations",
        json={
            "title": "Happy Path Eval",
            "type": "controle",
            "subject_id": "",
            "class_id": "",
            "date": "2026-06-15",
            "max_score": 20.0,
            "coefficient": 1.0,
        },
        headers=headers,
    )
    assert create_resp.status_code == 201
    eval_id = create_resp.json()["id"]
    assert create_resp.json()["title"] == "Happy Path Eval"
    assert create_resp.json()["is_published"] is False

    # 2. Retrieve
    get_resp = await client.get(f"/api/v1/evaluations/{eval_id}", headers=headers)
    assert get_resp.status_code == 200
    assert get_resp.json()["title"] == "Happy Path Eval"
    assert get_resp.json()["max_score"] == 20.0

    # 3. Update
    update_resp = await client.patch(
        f"/api/v1/evaluations/{eval_id}",
        json={"title": "Updated Eval", "max_score": 15.0},
        headers=headers,
    )
    assert update_resp.status_code == 200
    assert update_resp.json()["message"] == "Évaluation mise à jour"

    # Verify update stuck
    get_resp2 = await client.get(f"/api/v1/evaluations/{eval_id}", headers=headers)
    assert get_resp2.json()["title"] == "Updated Eval"
    assert get_resp2.json()["max_score"] == 15.0

    # 4. Get grades (empty — no students graded yet)
    grades_resp = await client.get(f"/api/v1/evaluations/{eval_id}/grades", headers=admin_headers)
    assert grades_resp.status_code == 200
    assert grades_resp.json() == []

    # 5. Publish
    publish_resp = await client.post(f"/api/v1/evaluations/{eval_id}/publish", headers=headers)
    assert publish_resp.status_code == 200
    assert publish_resp.json()["message"] == "Notes publiées"

    # 6. Delete
    delete_resp = await client.delete(f"/api/v1/evaluations/{eval_id}", headers=headers)
    assert delete_resp.status_code == 200
    assert delete_resp.json()["message"] == "Évaluation supprimée"

    # Verify deleted
    get_resp3 = await client.get(f"/api/v1/evaluations/{eval_id}", headers=headers)
    assert get_resp3.status_code == 404


async def test_evaluation_create_and_publish_flow(client: AsyncClient, admin_token: str) -> None:
    """Admin creates and publishes in quick succession."""
    headers = {"Authorization": f"Bearer {admin_token}"}

    create_resp = await client.post(
        "/api/v1/evaluations",
        json={
            "title": "Admin Quick Eval",
            "type": "examen",
            "subject_id": "",
            "class_id": "",
            "date": "2026-07-01",
        },
        headers=headers,
    )
    assert create_resp.status_code == 201
    eval_id = create_resp.json()["id"]

    # Publish immediately
    publish_resp = await client.post(f"/api/v1/evaluations/{eval_id}/publish", headers=headers)
    assert publish_resp.status_code == 200

    # Verify published via admin
    get_resp = await client.get(f"/api/v1/evaluations/{eval_id}", headers=headers)
    assert get_resp.status_code == 200
    assert get_resp.json()["is_published"] is True

import pytest


@pytest.mark.asyncio
async def test_create_absence(client: AsyncClient, teacher_token: str):
    resp = await client.post(
        "/api/v1/absences",
        json={
            "student_id": "",
            "class_id": "",
            "type": "absence",
            "date": "2026-05-15",
        },
        headers={"Authorization": f"Bearer {teacher_token}"},
    )
    assert resp.status_code in (201, 422)


@pytest.mark.asyncio
async def test_list_absences(client: AsyncClient, student_token: str):
    resp = await client.get(
        "/api/v1/absences",
        headers={"Authorization": f"Bearer {student_token}"},
    )
    assert resp.status_code == 200


@pytest.mark.asyncio
async def test_justify_absence_not_found(client: AsyncClient, admin_token: str):
    resp = await client.patch(
        "/api/v1/absences/00000000-0000-0000-0000-000000000000/justify",
        json={"justification_status": "justified"},
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert resp.status_code == 404
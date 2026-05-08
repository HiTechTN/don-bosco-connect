import pytest


@pytest.mark.asyncio
async def test_admin_dashboard(client: AsyncClient, admin_token: str):
    resp = await client.get(
        "/api/v1/analytics/dashboard",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert "total_users" in data


@pytest.mark.asyncio
async def test_teacher_dashboard(client: AsyncClient, teacher_token: str):
    resp = await client.get(
        "/api/v1/analytics/teacher",
        headers={"Authorization": f"Bearer {teacher_token}"},
    )
    assert resp.status_code == 200


@pytest.mark.asyncio
async def test_teacher_dashboard_forbidden(client: AsyncClient, student_token: str):
    resp = await client.get(
        "/api/v1/analytics/teacher",
        headers={"Authorization": f"Bearer {student_token}"},
    )
    assert resp.status_code == 403


@pytest.mark.asyncio
async def test_grade_distribution(client: AsyncClient, admin_token: str):
    resp = await client.get(
        "/api/v1/analytics/grades",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert resp.status_code == 200


@pytest.mark.asyncio
async def test_ai_usage(client: AsyncClient, admin_token: str):
    resp = await client.get(
        "/api/v1/analytics/ai-usage",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert resp.status_code == 200


@pytest.mark.asyncio
async def test_quiz_stats(client: AsyncClient, admin_token: str):
    resp = await client.get(
        "/api/v1/analytics/quiz-stats",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert resp.status_code == 200
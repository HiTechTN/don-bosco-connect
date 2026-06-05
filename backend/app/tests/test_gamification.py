from httpx import AsyncClient


async def test_gamification_profile(client: AsyncClient, student_token: str) -> None:
    resp = await client.get(
        "/api/v1/gamification/profile",
        headers={"Authorization": f"Bearer {student_token}"},
    )
    assert resp.status_code == 200


async def test_leaderboard(client: AsyncClient, student_token: str) -> None:
    resp = await client.get(
        "/api/v1/gamification/leaderboard",
        headers={"Authorization": f"Bearer {student_token}"},
    )
    assert resp.status_code == 200


async def test_badges(client: AsyncClient, student_token: str) -> None:
    resp = await client.get(
        "/api/v1/gamification/badges",
        headers={"Authorization": f"Bearer {student_token}"},
    )
    assert resp.status_code == 200


async def test_dropout_risk_forbidden(client: AsyncClient, student_token: str) -> None:
    resp = await client.get(
        "/api/v1/gamification/at-risk",
        headers={"Authorization": f"Bearer {student_token}"},
    )
    assert resp.status_code == 403


async def test_dropout_risk_admin(client: AsyncClient, admin_token: str) -> None:
    resp = await client.get(
        "/api/v1/gamification/at-risk",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert resp.status_code == 200

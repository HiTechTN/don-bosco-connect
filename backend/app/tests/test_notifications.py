import pytest


@pytest.mark.asyncio
async def test_list_notifications(client: AsyncClient, admin_token: str):
    resp = await client.get(
        "/api/v1/notifications",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert resp.status_code == 200


@pytest.mark.asyncio
async def test_mark_read_not_found(client: AsyncClient, admin_token: str):
    resp = await client.patch(
        "/api/v1/notifications/00000000-0000-0000-0000-000000000000/read",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert resp.status_code == 404
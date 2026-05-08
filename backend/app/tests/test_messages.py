import pytest


@pytest.mark.asyncio
async def test_create_thread(client: AsyncClient, admin_token: str):
    resp = await client.post(
        "/api/v1/messages/threads",
        json={"subject": "Test", "participant_ids": []},
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert resp.status_code == 201


@pytest.mark.asyncio
async def test_list_threads(client: AsyncClient, admin_token: str):
    resp = await client.get(
        "/api/v1/messages/threads",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert resp.status_code == 200
"""Tests for announcement endpoints (ÉTAPE 4.1)."""
from httpx import AsyncClient

from app.main import app


class TestPublicAnnouncements:
    """Tests for public announcement endpoints (no auth)."""

    async def test_list_public_returns_ok(self) -> None:
        async with AsyncClient(app=app, base_url="http://test") as client:
            resp = await client.get("/api/v1/public/announcements")
        assert resp.status_code == 200
        data = resp.json()
        assert "items" in data
        assert "total" in data
        assert "page" in data
        assert "per_page" in data
        assert "pages" in data

    async def test_list_public_only_published(self) -> None:
        """Public endpoint should never return draft or archived items."""
        async with AsyncClient(app=app, base_url="http://test") as client:
            resp = await client.get("/api/v1/public/announcements")
        data = resp.json()
        for item in data.get("items", []):
            assert item.get("status") == "published" or "status" not in item

    async def test_list_public_never_returns_content_json(self) -> None:
        """Public endpoint must never expose raw content_json."""
        async with AsyncClient(app=app, base_url="http://test") as client:
            resp = await client.get("/api/v1/public/announcements")
        data = resp.json()
        for item in data.get("items", []):
            assert "content_json" not in item, "content_json should not be exposed publicly"

    async def test_list_public_never_returns_created_by(self) -> None:
        """Public endpoint must never expose created_by."""
        async with AsyncClient(app=app, base_url="http://test") as client:
            resp = await client.get("/api/v1/public/announcements")
        data = resp.json()
        for item in data.get("items", []):
            assert "created_by" not in item, "created_by should not be exposed publicly"

    async def test_list_public_never_returns_allowed_roles(self) -> None:
        """Public endpoint must never expose allowed_roles."""
        async with AsyncClient(app=app, base_url="http://test") as client:
            resp = await client.get("/api/v1/public/announcements")
        data = resp.json()
        for item in data.get("items", []):
            assert "allowed_roles" not in item, "allowed_roles should not be exposed publicly"

    async def test_list_public_returns_paginated(self) -> None:
        async with AsyncClient(app=app, base_url="http://test") as client:
            resp = await client.get("/api/v1/public/announcements", params={"per_page": 2})
        data = resp.json()
        assert data["per_page"] == 2
        assert len(data["items"]) <= 2

    async def test_list_public_category_filter(self) -> None:
        async with AsyncClient(app=app, base_url="http://test") as client:
            resp = await client.get(
                "/api/v1/public/announcements", params={"category": "general"}
            )
        assert resp.status_code == 200

    async def test_get_public_announcement_not_found(self) -> None:
        async with AsyncClient(app=app, base_url="http://test") as client:
            resp = await client.get("/api/v1/public/announcements/nonexistent-slug")
        assert resp.status_code == 404


class TestAdminAnnouncements:
    """Tests for admin announcement endpoints (auth required)."""

    async def test_list_admin_requires_auth(self) -> None:
        async with AsyncClient(app=app, base_url="http://test") as client:
            resp = await client.get("/api/v1/announcements")
        assert resp.status_code in (401, 403)

    async def test_create_requires_auth(self) -> None:
        async with AsyncClient(app=app, base_url="http://test") as client:
            resp = await client.post(
                "/api/v1/announcements",
                json={"title": "Test", "category": "general"},
            )
        assert resp.status_code in (401, 403)

    async def test_publish_requires_auth(self) -> None:
        async with AsyncClient(app=app, base_url="http://test") as client:
            resp = await client.post("/api/v1/announcements/fake-id/publish")
        assert resp.status_code in (401, 403)

    async def test_reactions_endpoint_public(self) -> None:
        async with AsyncClient(app=app, base_url="http://test") as client:
            resp = await client.get("/api/v1/announcements/fake-id/reactions")
        assert resp.status_code in (200, 404)

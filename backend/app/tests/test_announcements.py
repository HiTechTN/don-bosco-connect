"""Tests for announcement endpoints."""

from httpx import AsyncClient


class TestPublicAnnouncements:
    """Tests for public announcement endpoints (no auth)."""

    async def test_list_public_returns_ok(self, client: AsyncClient) -> None:
        resp = await client.get("/api/v1/public/announcements")
        assert resp.status_code == 200
        data = resp.json()
        assert "items" in data
        assert "total" in data
        assert "page" in data
        assert "per_page" in data
        assert "pages" in data

    async def test_list_public_only_published(self, client: AsyncClient) -> None:
        """Public endpoint should never return draft or archived items."""
        resp = await client.get("/api/v1/public/announcements")
        data = resp.json()
        for item in data.get("items", []):
            assert item.get("status") == "published" or "status" not in item

    async def test_list_public_never_returns_content_json(self, client: AsyncClient) -> None:
        """Public endpoint must never expose raw content_json."""
        resp = await client.get("/api/v1/public/announcements")
        data = resp.json()
        for item in data.get("items", []):
            assert "content_json" not in item

    async def test_list_public_never_returns_created_by(self, client: AsyncClient) -> None:
        """Public endpoint must never expose created_by."""
        resp = await client.get("/api/v1/public/announcements")
        data = resp.json()
        for item in data.get("items", []):
            assert "created_by" not in item

    async def test_list_public_never_returns_allowed_roles(self, client: AsyncClient) -> None:
        """Public endpoint must never expose allowed_roles."""
        resp = await client.get("/api/v1/public/announcements")
        data = resp.json()
        for item in data.get("items", []):
            assert "allowed_roles" not in item

    async def test_list_public_returns_paginated(self, client: AsyncClient) -> None:
        resp = await client.get("/api/v1/public/announcements", params={"per_page": 2})
        data = resp.json()
        assert data["per_page"] == 2
        assert len(data["items"]) <= 2

    async def test_list_public_category_filter(self, client: AsyncClient) -> None:
        resp = await client.get("/api/v1/public/announcements", params={"category": "general"})
        assert resp.status_code == 200

    async def test_get_public_announcement_not_found(self, client: AsyncClient) -> None:
        resp = await client.get("/api/v1/public/announcements/nonexistent-slug")
        assert resp.status_code == 404


class TestAdminAnnouncements:
    """Tests for admin announcement endpoints (auth required)."""

    async def test_list_admin_requires_auth(self, client: AsyncClient) -> None:
        resp = await client.get("/api/v1/announcements")
        assert resp.status_code in (401, 403)

    async def test_create_requires_auth(self, client: AsyncClient) -> None:
        resp = await client.post(
            "/api/v1/announcements",
            json={"title": "Test", "category": "general"},
        )
        assert resp.status_code in (401, 403)

    async def test_publish_requires_auth(self, client: AsyncClient) -> None:
        resp = await client.post("/api/v1/announcements/fake-id/publish")
        assert resp.status_code in (401, 403)

    async def test_reactions_endpoint_public(self, client: AsyncClient) -> None:
        resp = await client.get("/api/v1/public/announcements/nonexistent/reactions")
        assert resp.status_code in (200, 404)


class TestAdminAnnouncementCRUD:
    """Full CRUD tests for admin announcement endpoints."""

    async def test_create_and_get_announcement(self, client: AsyncClient, admin_token: str) -> None:
        headers = {"Authorization": f"Bearer {admin_token}"}
        resp = await client.post(
            "/api/v1/announcements",
            json={
                "title": "Test Announcement",
                "category": "general",
                "content_json": {"blocks": [{"text": "Hello"}]},
            },
            headers=headers,
        )
        assert resp.status_code == 201
        data = resp.json()
        assert data["title"] == "Test Announcement"
        assert data["category"] == "general"
        ann_id = data["id"]

        # Get by ID
        resp = await client.get(f"/api/v1/announcements/{ann_id}", headers=headers)
        assert resp.status_code == 200
        assert resp.json()["title"] == "Test Announcement"

    async def test_list_admin_announcements(self, client: AsyncClient, admin_token: str) -> None:
        headers = {"Authorization": f"Bearer {admin_token}"}
        resp = await client.get("/api/v1/announcements", headers=headers)
        assert resp.status_code == 200

    async def test_update_announcement(self, client: AsyncClient, admin_token: str) -> None:
        headers = {"Authorization": f"Bearer {admin_token}"}
        # Create
        resp = await client.post(
            "/api/v1/announcements",
            json={"title": "Original", "category": "general"},
            headers=headers,
        )
        ann_id = resp.json()["id"]

        # Update
        resp = await client.patch(
            f"/api/v1/announcements/{ann_id}",
            json={"title": "Updated Title"},
            headers=headers,
        )
        assert resp.status_code == 200
        assert resp.json()["title"] == "Updated Title"

    async def test_publish_announcement(self, client: AsyncClient, admin_token: str) -> None:
        headers = {"Authorization": f"Bearer {admin_token}"}
        resp = await client.post(
            "/api/v1/announcements",
            json={"title": "To Publish", "category": "general"},
            headers=headers,
        )
        ann_id = resp.json()["id"]

        resp = await client.post(f"/api/v1/announcements/{ann_id}/publish", headers=headers)
        assert resp.status_code == 200
        assert resp.json()["status"] == "published"

    async def test_archive_announcement(self, client: AsyncClient, admin_token: str) -> None:
        headers = {"Authorization": f"Bearer {admin_token}"}
        resp = await client.post(
            "/api/v1/announcements",
            json={"title": "To Archive", "category": "general"},
            headers=headers,
        )
        ann_id = resp.json()["id"]

        resp = await client.post(f"/api/v1/announcements/{ann_id}/archive", headers=headers)
        assert resp.status_code == 200
        assert resp.json()["status"] == "archived"

    async def test_delete_announcement(self, client: AsyncClient, admin_token: str) -> None:
        headers = {"Authorization": f"Bearer {admin_token}"}
        resp = await client.post(
            "/api/v1/announcements",
            json={"title": "To Delete", "category": "general"},
            headers=headers,
        )
        ann_id = resp.json()["id"]

        resp = await client.delete(f"/api/v1/announcements/{ann_id}", headers=headers)
        assert resp.status_code == 204

        # Verify deleted
        resp = await client.get(f"/api/v1/announcements/{ann_id}", headers=headers)
        assert resp.status_code == 404

    async def test_get_nonexistent_announcement(
        self, client: AsyncClient, admin_token: str
    ) -> None:
        headers = {"Authorization": f"Bearer {admin_token}"}
        nil_uuid = "00000000-0000-0000-0000-000000000000"
        resp = await client.get(f"/api/v1/announcements/{nil_uuid}", headers=headers)
        assert resp.status_code == 404

    async def test_publish_nonexistent_announcement(
        self, client: AsyncClient, admin_token: str
    ) -> None:
        headers = {"Authorization": f"Bearer {admin_token}"}
        nil_uuid = "00000000-0000-0000-0000-000000000000"
        resp = await client.post(f"/api/v1/announcements/{nil_uuid}/publish", headers=headers)
        assert resp.status_code == 404

    async def test_delete_nonexistent_announcement(
        self, client: AsyncClient, admin_token: str
    ) -> None:
        headers = {"Authorization": f"Bearer {admin_token}"}
        nil_uuid = "00000000-0000-0000-0000-000000000000"
        resp = await client.delete(f"/api/v1/announcements/{nil_uuid}", headers=headers)
        assert resp.status_code == 404

    async def test_teacher_cannot_create_announcement(
        self, client: AsyncClient, teacher_token: str
    ) -> None:
        headers = {"Authorization": f"Bearer {teacher_token}"}
        resp = await client.post(
            "/api/v1/announcements",
            json={"title": "Teacher Post", "category": "general"},
            headers=headers,
        )
        assert resp.status_code in (401, 403)


class TestAnnouncementReactions:
    """Tests for announcement reaction endpoints."""

    async def test_add_reaction(self, client: AsyncClient, admin_token: str) -> None:
        headers = {"Authorization": f"Bearer {admin_token}"}
        # Create an announcement first
        resp = await client.post(
            "/api/v1/announcements",
            json={"title": "React Test", "category": "general"},
            headers=headers,
        )
        ann_id = resp.json()["id"]

        # Add a reaction
        resp = await client.post(
            f"/api/v1/announcements/{ann_id}/reactions",
            json={"emoji": "👍"},
            headers=headers,
        )
        assert resp.status_code == 200
        assert resp.json()["ok"] is True

    async def test_duplicate_reaction_returns_409(
        self, client: AsyncClient, admin_token: str
    ) -> None:
        headers = {"Authorization": f"Bearer {admin_token}"}
        resp = await client.post(
            "/api/v1/announcements",
            json={"title": "Dupe React", "category": "general"},
            headers=headers,
        )
        ann_id = resp.json()["id"]

        # Add reaction twice
        await client.post(
            f"/api/v1/announcements/{ann_id}/reactions",
            json={"emoji": "❤️"},
            headers=headers,
        )
        resp = await client.post(
            f"/api/v1/announcements/{ann_id}/reactions",
            json={"emoji": "❤️"},
            headers=headers,
        )
        assert resp.status_code == 409

    async def test_reaction_requires_emoji(self, client: AsyncClient, admin_token: str) -> None:
        headers = {"Authorization": f"Bearer {admin_token}"}
        resp = await client.post(
            "/api/v1/announcements",
            json={"title": "No Emoji", "category": "general"},
            headers=headers,
        )
        ann_id = resp.json()["id"]

        resp = await client.post(
            f"/api/v1/announcements/{ann_id}/reactions",
            json={"emoji": ""},
            headers=headers,
        )
        assert resp.status_code == 400

    async def test_get_reactions(self, client: AsyncClient, admin_token: str) -> None:
        headers = {"Authorization": f"Bearer {admin_token}"}
        resp = await client.post(
            "/api/v1/announcements",
            json={"title": "Get React", "category": "general"},
            headers=headers,
        )
        ann_id = resp.json()["id"]

        # Add a reaction then get
        await client.post(
            f"/api/v1/announcements/{ann_id}/reactions",
            json={"emoji": "🔥"},
            headers=headers,
        )
        resp = await client.get(f"/api/v1/announcements/{ann_id}/reactions")
        assert resp.status_code == 200
        data = resp.json()
        assert isinstance(data, (dict, list))

    async def test_remove_reaction(self, client: AsyncClient, admin_token: str) -> None:
        headers = {"Authorization": f"Bearer {admin_token}"}
        resp = await client.post(
            "/api/v1/announcements",
            json={"title": "Remove React", "category": "general"},
            headers=headers,
        )
        ann_id = resp.json()["id"]

        # Add then remove
        await client.post(
            f"/api/v1/announcements/{ann_id}/reactions",
            json={"emoji": "🎉"},
            headers=headers,
        )
        resp = await client.delete(
            f"/api/v1/announcements/{ann_id}/reactions/🎉",
            headers=headers,
        )
        assert resp.status_code == 200

    async def test_remove_nonexistent_reaction(self, client: AsyncClient, admin_token: str) -> None:
        headers = {"Authorization": f"Bearer {admin_token}"}
        resp = await client.post(
            "/api/v1/announcements",
            json={"title": "No React", "category": "general"},
            headers=headers,
        )
        ann_id = resp.json()["id"]

        resp = await client.delete(
            f"/api/v1/announcements/{ann_id}/reactions/ghost",
            headers=headers,
        )
        assert resp.status_code == 404

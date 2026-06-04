"""Announcement service with XSS sanitization."""
import re
import sys
import uuid
from datetime import datetime, timezone

from slugify import slugify
from sqlalchemy import func, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.announcement import Announcement, AnnouncementReaction


# ── XSS Sanitization ─────────────────────────────────────────────

ALLOWED_TAGS = [
    "p", "br", "strong", "em", "u", "s", "h1", "h2", "h3", "h4",
    "ul", "ol", "li", "blockquote", "pre", "code",
    "a", "img", "table", "thead", "tbody", "tr", "th", "td",
    "hr", "span", "div",
]

ALLOWED_ATTRS: dict[str, list[str]] = {
    "a": ["href", "title", "target", "rel"],
    "img": ["src", "alt", "width", "height"],
    "td": ["colspan", "rowspan"],
    "th": ["colspan", "rowspan"],
    "*": ["class"],
}

_TAG_RE = re.compile(r"<(/?)(\w+)([^>]*)>")
_ATTR_RE = re.compile(r'(\w[\w-]*)\s*=\s*(?:"([^"]*)"|\'([^\']*)\'|(\S+))')
_DANGEROUS_ATTR = re.compile(r"^on", re.IGNORECASE)
_JAVASCRIPT_URI = re.compile(r"^\s*javascript\s*:", re.IGNORECASE)


def _sanitize_tag(match: re.Match) -> str:
    """Replace a single HTML tag: strip disallowed tags/attrs."""
    slash, tag, attrs_str = match.group(1), match.group(2).lower(), match.group(3)
    if tag not in ALLOWED_TAGS:
        return ""
    allowed = set(ALLOWED_ATTRS.get(tag, []))
    global_allowed = set(ALLOWED_ATTRS.get("*", []))
    allowed = allowed | global_allowed
    clean_attrs = []
    for attr_match in _ATTR_RE.finditer(attrs_str):
        name = attr_match.group(1).lower()
        value = attr_match.group(2) or attr_match.group(3) or attr_match.group(4) or ""
        if _DANGEROUS_ATTR.match(name):
            continue
        if name not in allowed:
            continue
        if name == "href" and _JAVASCRIPT_URI.match(value):
            continue
        if name == "src" and _JAVASCRIPT_URI.match(value):
            continue
        clean_attrs.append(f' {name}="{value}"')
    return f"<{slash}{tag}{''.join(clean_attrs)}>"


def sanitize_html(html: str) -> str:
    """Sanitize HTML from TipTap before storage/display.

    Strips script/iframe/form/tags, event handlers, javascript: URIs.
    Falls back to bleach if available, otherwise uses regex.
    """
    try:
        import bleach
        from bleach.linkifier import LinkifyFilter

        return bleach.clean(
            html,
            tags=ALLOWED_TAGS,
            attributes=ALLOWED_ATTRS,
            strip=True,
            strip_comments=True,
        )
    except ImportError:
        pass

    # Regex fallback
    cleaned = _TAG_RE.sub(_sanitize_tag, html)
    cleaned = re.sub(r"<!--.*?-->", "", cleaned, flags=re.DOTALL)
    cleaned = re.sub(r"<(script|iframe|form|object|embed|meta|link|style)[^>]*>.*?</\1>", "", cleaned, flags=re.DOTALL | re.IGNORECASE)
    cleaned = re.sub(r"<(script|iframe|form|object|embed|meta|link|style)[^>]*/?>", "", cleaned, flags=re.IGNORECASE)
    return cleaned.strip()


def _make_slug(title: str) -> str:
    """Generate a URL-safe slug from title."""
    return slugify(title, allow_unicode=True) or f"annonce-{uuid.uuid4().hex[:8]}"


# ── Public service ────────────────────────────────────────────────


class AnnouncementService:
    @staticmethod
    async def list_public(
        db: AsyncSession,
        page: int = 1,
        per_page: int = 12,
        category: str | None = None,
        q: str | None = None,
    ) -> dict:
        """List published public announcements only."""
        query = (
            select(Announcement)
            .where(Announcement.status == "published")
            .where(Announcement.visibility == "public")
        )
        now = datetime.now(timezone.utc)
        query = query.where(
            (Announcement.publish_at.is_(None)) | (Announcement.publish_at <= now)
        )
        if category:
            query = query.where(Announcement.category == category)
        if q:
            pattern = f"%{q}%"
            query = query.where(
                Announcement.title.ilike(pattern) | Announcement.excerpt.ilike(pattern)
            )

        # Count
        count_q = select(func.count()).select_from(query.subquery())
        total = (await db.execute(count_q)).scalar() or 0

        # Paginate
        query = query.order_by(
            Announcement.pinned.desc(),
            Announcement.priority.desc(),
            Announcement.created_at.desc(),
        )
        query = query.offset((page - 1) * per_page).limit(per_page)
        result = await db.execute(query)
        items = result.scalars().all()

        # Build public responses (no content_json, no created_by, no allowed_roles)
        public_items = []
        for ann in items:
            reactions = await _get_reactions_aggregate(db, ann.id)
            public_items.append(
                {
                    "id": ann.id,
                    "title": ann.title,
                    "slug": ann.slug,
                    "excerpt": ann.excerpt,
                    "content_html": ann.content_html,
                    "category": ann.category,
                    "tags": ann.tags or [],
                    "pinned": ann.pinned,
                    "cover_image_url": ann.cover_image_url,
                    "views_count": ann.views_count,
                    "publish_at": ann.publish_at,
                    "created_at": ann.created_at,
                    "reactions": reactions,
                }
            )
        return {
            "items": public_items,
            "total": total,
            "page": page,
            "per_page": per_page,
            "pages": max(1, (total + per_page - 1) // per_page),
        }

    @staticmethod
    async def get_public_by_slug(db: AsyncSession, slug: str) -> dict | None:
        """Get a single public announcement by slug. Increments views."""
        result = await db.execute(
            select(Announcement).where(
                Announcement.slug == slug,
                Announcement.status == "published",
                Announcement.visibility == "public",
            )
        )
        ann = result.scalar_one_or_none()
        if not ann:
            return None
        now = datetime.now(timezone.utc)
        if ann.publish_at and ann.publish_at > now:
            return None

        # Increment views
        ann.views_count = (ann.views_count or 0) + 1
        await db.commit()

        reactions = await _get_reactions_aggregate(db, ann.id)
        return {
            "id": ann.id,
            "title": ann.title,
            "slug": ann.slug,
            "excerpt": ann.excerpt,
            "content_html": ann.content_html,
            "category": ann.category,
            "tags": ann.tags or [],
            "pinned": ann.pinned,
            "cover_image_url": ann.cover_image_url,
            "views_count": ann.views_count,
            "publish_at": ann.publish_at,
            "created_at": ann.created_at,
            "reactions": reactions,
        }

    @staticmethod
    async def list_admin(
        db: AsyncSession,
        page: int = 1,
        per_page: int = 20,
        status: str | None = None,
        category: str | None = None,
        q: str | None = None,
    ) -> dict:
        """List all announcements for admin (draft+published+archived)."""
        query = select(Announcement)
        if status:
            query = query.where(Announcement.status == status)
        if category:
            query = query.where(Announcement.category == category)
        if q:
            pattern = f"%{q}%"
            query = query.where(Announcement.title.ilike(pattern))

        count_q = select(func.count()).select_from(query.subquery())
        total = (await db.execute(count_q)).scalar() or 0

        query = query.order_by(Announcement.created_at.desc())
        query = query.offset((page - 1) * per_page).limit(per_page)
        result = await db.execute(query)
        items = result.scalars().all()

        return {
            "items": [AnnouncementResponse_dict(a) for a in items],
            "total": total,
            "page": page,
            "per_page": per_page,
            "pages": max(1, (total + per_page - 1) // per_page),
        }

    @staticmethod
    async def create(db: AsyncSession, data: dict, user_id: str) -> Announcement:
        """Create a new announcement (draft by default)."""
        title = data.get("title", "")
        slug = _make_slug(title)
        # Ensure unique slug
        existing = await db.execute(select(Announcement).where(Announcement.slug == slug))
        if existing.scalar_one_or_none():
            slug = f"{slug}-{uuid.uuid4().hex[:6]}"

        content_json = data.get("content_json", {})
        content_html = sanitize_html(_render_json_to_html(content_json)) if content_json else None

        ann = Announcement(
            id=uuid.uuid4(),
            title=title,
            title_ar=data.get("title_ar"),
            slug=slug,
            excerpt=data.get("excerpt"),
            excerpt_ar=data.get("excerpt_ar"),
            content_json=content_json,
            content_html=content_html,
            category=data.get("category", "general"),
            tags=data.get("tags", []),
            status=data.get("status", "draft"),
            visibility=data.get("visibility", "public"),
            allowed_roles=data.get("allowed_roles", []),
            pinned=data.get("pinned", False),
            priority=data.get("priority", 0),
            cover_image_url=data.get("cover_image_url"),
            attachments=data.get("attachments", []),
            publish_at=data.get("publish_at"),
            created_by=user_id,
        )
        db.add(ann)
        await db.commit()
        await db.refresh(ann)
        return ann

    @staticmethod
    async def get_by_id(db: AsyncSession, announcement_id: str) -> Announcement | None:
        result = await db.execute(
            select(Announcement).where(Announcement.id == announcement_id)
        )
        return result.scalar_one_or_none()

    @staticmethod
    async def update(db: AsyncSession, announcement_id: str, data: dict) -> Announcement | None:
        ann = await AnnouncementService.get_by_id(db, announcement_id)
        if not ann:
            return None
        for key, value in data.items():
            if value is not None and hasattr(ann, key):
                setattr(ann, key, value)
        # Re-render content_html if content_json changed
        if "content_json" in data and data["content_json"] is not None:
            ann.content_html = sanitize_html(_render_json_to_html(data["content_json"]))
        await db.commit()
        await db.refresh(ann)
        return ann

    @staticmethod
    async def publish(db: AsyncSession, announcement_id: str) -> Announcement | None:
        ann = await AnnouncementService.get_by_id(db, announcement_id)
        if not ann:
            return None
        ann.status = "published"
        if not ann.publish_at:
            ann.publish_at = datetime.now(timezone.utc)
        await db.commit()
        await db.refresh(ann)
        return ann

    @staticmethod
    async def archive(db: AsyncSession, announcement_id: str) -> Announcement | None:
        ann = await AnnouncementService.get_by_id(db, announcement_id)
        if not ann:
            return None
        ann.status = "archived"
        await db.commit()
        await db.refresh(ann)
        return ann

    @staticmethod
    async def delete(db: AsyncSession, announcement_id: str) -> bool:
        ann = await AnnouncementService.get_by_id(db, announcement_id)
        if not ann:
            return False
        await db.delete(ann)
        await db.commit()
        return True


def AnnouncementResponse_dict(ann: Announcement) -> dict:
    """Convert an Announcement model to a dict for admin responses."""
    return {
        "id": ann.id,
        "title": ann.title,
        "title_ar": ann.title_ar,
        "slug": ann.slug,
        "excerpt": ann.excerpt,
        "excerpt_ar": ann.excerpt_ar,
        "content_json": ann.content_json,
        "content_html": ann.content_html,
        "category": ann.category,
        "tags": ann.tags or [],
        "status": ann.status,
        "visibility": ann.visibility,
        "allowed_roles": ann.allowed_roles or [],
        "pinned": ann.pinned,
        "priority": ann.priority,
        "cover_image_url": ann.cover_image_url,
        "attachments": ann.attachments or [],
        "views_count": ann.views_count,
        "publish_at": ann.publish_at,
        "created_by": ann.created_by,
        "created_at": ann.created_at,
        "updated_at": ann.updated_at,
    }


async def _get_reactions_aggregate(db: AsyncSession, announcement_id) -> dict[str, int]:
    """Get aggregated reactions for an announcement."""
    result = await db.execute(
        select(AnnouncementReaction.emoji, func.count(AnnouncementReaction.id))
        .where(AnnouncementReaction.announcement_id == announcement_id)
        .group_by(AnnouncementReaction.emoji)
    )
    return {row[0]: row[1] for row in result.all()}


def _render_json_to_html(content_json: dict) -> str:
    """Convert TipTap JSON to HTML (simple implementation)."""
    if not content_json:
        return ""
    if isinstance(content_json, str):
        return content_json
    # If it's TipTap JSON with content array
    if "content" in content_json:
        return _render_nodes(content_json["content"])
    return ""


def _render_nodes(nodes: list[dict]) -> str:
    """Recursively render TipTap nodes to HTML."""
    parts = []
    for node in nodes:
        node_type = node.get("type", "")
        text = node.get("text", "")
        marks = node.get("marks", [])
        content = node.get("content", [])

        if node_type == "text":
            html = _escape(text)
            for mark in marks:
                mark_type = mark.get("type", "")
                if mark_type == "bold":
                    html = f"<strong>{html}</strong>"
                elif mark_type == "italic":
                    html = f"<em>{html}</em>"
                elif mark_type == "underline":
                    html = f"<u>{html}</u>"
                elif mark_type == "code":
                    html = f"<code>{html}</code>"
                elif mark_type == "link":
                    href = mark.get("attrs", {}).get("href", "#")
                    html = f'<a href="{href}">{html}</a>'
            parts.append(html)
        elif node_type in ("paragraph",):
            inner = _render_nodes(content) if content else ""
            parts.append(f"<p>{inner}</p>")
        elif node_type in ("heading",):
            level = node.get("attrs", {}).get("level", 1)
            inner = _render_nodes(content) if content else ""
            parts.append(f"<h{level}>{inner}</h{level}>")
        elif node_type == "bulletList":
            inner = _render_nodes(content) if content else ""
            parts.append(f"<ul>{inner}</ul>")
        elif node_type == "orderedList":
            inner = _render_nodes(content) if content else ""
            parts.append(f"<ol>{inner}</ol>")
        elif node_type == "listItem":
            inner = _render_nodes(content) if content else ""
            parts.append(f"<li>{inner}</li>")
        elif node_type == "blockquote":
            inner = _render_nodes(content) if content else ""
            parts.append(f"<blockquote>{inner}</blockquote>")
        elif node_type == "codeBlock":
            inner = _render_nodes(content) if content else ""
            parts.append(f"<pre><code>{inner}</code></pre>")
        elif node_type == "hardBreak":
            parts.append("<br>")
        elif node_type == "horizontalRule":
            parts.append("<hr>")
        elif node_type == "image":
            src = node.get("attrs", {}).get("src", "")
            alt = node.get("attrs", {}).get("alt", "")
            parts.append(f'<img src="{_escape(src)}" alt="{_escape(alt)}">')
        else:
            # Unknown node: recurse into content
            if content:
                parts.append(_render_nodes(content))
    return "\n".join(parts)


def _escape(text: str) -> str:
    """Escape HTML special characters."""
    return (
        text.replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
        .replace('"', "&quot;")
        .replace("'", "&#x27;")
    )

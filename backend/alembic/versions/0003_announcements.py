"""Announcements table and reactions.

Revision ID: 0003
Revises: 0002
Create Date: 2026-06-04
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import ARRAY, JSONB, UUID

revision = "0003"
down_revision = "0002"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"')

    op.create_table(
        "announcements",
        sa.Column("id", UUID(as_uuid=True), primary_key=True, server_default=sa.text("uuid_generate_v4()")),
        sa.Column("title", sa.String(255), nullable=False),
        sa.Column("title_ar", sa.String(255), nullable=True),
        sa.Column("slug", sa.String(255), unique=True, nullable=False),
        sa.Column("excerpt", sa.Text, nullable=True),
        sa.Column("excerpt_ar", sa.Text, nullable=True),
        sa.Column("content_json", JSONB, nullable=False, server_default="{}"),
        sa.Column("content_html", sa.Text, nullable=True),
        sa.Column("category", sa.String(50), nullable=False, server_default="general"),
        sa.Column("tags", ARRAY(sa.Text), server_default="{}"),
        sa.Column("status", sa.String(20), nullable=False, server_default="draft"),
        sa.Column("visibility", sa.String(20), nullable=False, server_default="public"),
        sa.Column("allowed_roles", ARRAY(sa.Text), server_default="{}"),
        sa.Column("pinned", sa.Boolean, server_default=sa.text("false")),
        sa.Column("priority", sa.SmallInteger, server_default=sa.text("0")),
        sa.Column("cover_image_url", sa.Text, nullable=True),
        sa.Column("attachments", JSONB, server_default="[]"),
        sa.Column("views_count", sa.Integer, server_default=sa.text("0")),
        sa.Column("publish_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_by", UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("idx_ann_status_visibility", "announcements", ["status", "visibility"])
    op.create_index("idx_ann_publish_at", "announcements", ["publish_at"])
    op.create_index("idx_ann_slug", "announcements", ["slug"])
    op.create_index("idx_ann_pinned", "announcements", ["pinned", sa.text("priority DESC")])

    op.create_table(
        "announcement_reactions",
        sa.Column("id", UUID(as_uuid=True), primary_key=True, server_default=sa.text("uuid_generate_v4()")),
        sa.Column("announcement_id", UUID(as_uuid=True), sa.ForeignKey("announcements.id", ondelete="CASCADE"), nullable=False),
        sa.Column("user_id", UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("emoji", sa.String(10), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.UniqueConstraint("announcement_id", "user_id", "emoji", name="uq_announcement_user_emoji"),
    )


def downgrade() -> None:
    op.drop_table("announcement_reactions")
    op.drop_index("idx_ann_pinned", table_name="announcements")
    op.drop_index("idx_ann_slug", table_name="announcements")
    op.drop_index("idx_ann_publish_at", table_name="announcements")
    op.drop_index("idx_ann_status_visibility", table_name="announcements")
    op.drop_table("announcements")

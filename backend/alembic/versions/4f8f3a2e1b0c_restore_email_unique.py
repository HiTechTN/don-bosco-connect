"""restore unique constraint on users.email

Revision ID: 4f8f3a2e1b0c
Revises: fe1460476a39
Create Date: 2026-06-07 10:00:00.000000

"""

from collections.abc import Sequence

from alembic import op

revision: str = "4f8f3a2e1b0c"
down_revision: str | None = "fe1460476a39"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.drop_index(op.f("ix_users_email"), table_name="users")
    op.create_index(op.f("ix_users_email"), "users", ["email"], unique=False)
    op.create_unique_constraint("users_email_key", "users", ["email"])


def downgrade() -> None:
    op.drop_constraint("users_email_key", "users", type_="unique")
    op.drop_index(op.f("ix_users_email"), table_name="users")
    op.create_index(op.f("ix_users_email"), "users", ["email"], unique=True)

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
    op.create_unique_constraint("uq_users_email", "users", ["email"])


def downgrade() -> None:
    op.drop_constraint("uq_users_email", "users", type_="unique")

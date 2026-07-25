"""initial users table

Revision ID: 20260725_0001
Revises:
Create Date: 2026-07-25

"""

from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

revision: str = "20260725_0001"
down_revision: str | Sequence[str] | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("firstname", sa.String(), nullable=True),
        sa.Column("lastname", sa.String(), nullable=True),
        sa.Column("street", sa.String(), nullable=True),
        sa.Column("house_number", sa.String(), nullable=True),
        sa.Column("postal_code", sa.String(), nullable=True),
        sa.Column("location", sa.String(), nullable=True),
        sa.Column("phone", sa.String(), nullable=True),
        sa.Column("email", sa.String(), nullable=True),
        sa.Column("birthday", sa.Date(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("last_signed_in", sa.DateTime(), nullable=True),
        sa.Column("updated_at", sa.DateTime(), nullable=True),
        sa.Column("member_since", sa.Date(), nullable=True),
        sa.Column(
            "role",
            sa.Enum(
                "vorstand",
                "mitglied",
                "kassenwart",
                "kassenpruefer",
                name="role",
            ),
            nullable=True,
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_users_email"), "users", ["email"], unique=True)
    op.create_index(op.f("ix_users_firstname"), "users", ["firstname"], unique=False)
    op.create_index(op.f("ix_users_lastname"), "users", ["lastname"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_users_lastname"), table_name="users")
    op.drop_index(op.f("ix_users_firstname"), table_name="users")
    op.drop_index(op.f("ix_users_email"), table_name="users")
    op.drop_table("users")
    op.execute("DROP TYPE IF EXISTS role")

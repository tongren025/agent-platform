"""add embeddings table

Revision ID: a7c2e3f41b90
Revises: 5b08f4badaa1
Create Date: 2026-07-01

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = 'a7c2e3f41b90'
down_revision: Union[str, Sequence[str], None] = '5b08f4badaa1'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("CREATE EXTENSION IF NOT EXISTS vector")

    op.create_table('embeddings',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('employee_key', sa.String(length=128), nullable=False),
        sa.Column('source_type', sa.String(length=32), nullable=False),
        sa.Column('source_id', sa.String(length=128), nullable=False),
        sa.Column('content', sa.Text(), nullable=False, server_default=''),
        sa.Column('embedding', sa.LargeBinary(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index('ix_emb_employee_key', 'embeddings', ['employee_key'])
    op.create_index('ix_emb_source_type', 'embeddings', ['source_type'])
    op.create_index('ix_emb_source_id', 'embeddings', ['source_id'])
    op.create_index('ix_emb_employee_source', 'embeddings',
                    ['employee_key', 'source_type', 'source_id'], unique=True)


def downgrade() -> None:
    op.drop_table('embeddings')

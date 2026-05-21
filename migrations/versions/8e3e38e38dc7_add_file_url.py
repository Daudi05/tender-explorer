from alembic import op
import sqlalchemy as sa

revision = '8e3e38e38dc7'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    with op.batch_alter_table('award_letters') as batch_op:
        batch_op.add_column(sa.Column('file_url', sa.String(255), nullable=True))


def downgrade():
    with op.batch_alter_table('award_letters') as batch_op:
        batch_op.drop_column('file_url')
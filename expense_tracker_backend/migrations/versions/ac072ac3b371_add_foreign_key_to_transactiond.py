"""Add foreign key to Transactiond

Revision ID: ac072ac3b371
Revises: 7fb6f5193cf3
Create Date: 2024-11-09 08:57:20.127817

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import mysql

# revision identifiers, used by Alembic.
revision = 'ac072ac3b371'
down_revision = '7fb6f5193cf3'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('incomes',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('user_id', sa.Integer(), nullable=False),
    sa.Column('source', sa.String(length=100), nullable=False),
    sa.Column('amount', sa.Float(), nullable=False),
    sa.Column('date', sa.Date(), nullable=False),
    sa.Column('payment_method', sa.String(length=50), nullable=False),
    sa.Column('notes', sa.String(length=255), nullable=True),
    sa.Column('other_source', sa.String(length=100), nullable=True),
    sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.drop_table('income')
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('income',
    sa.Column('id', mysql.INTEGER(), autoincrement=True, nullable=False),
    sa.Column('user_id', mysql.INTEGER(), autoincrement=False, nullable=False),
    sa.Column('source', mysql.VARCHAR(length=100), nullable=False),
    sa.Column('amount', mysql.FLOAT(), nullable=False),
    sa.Column('date', sa.DATE(), nullable=False),
    sa.Column('payment_method', mysql.VARCHAR(length=50), nullable=False),
    sa.Column('notes', mysql.VARCHAR(length=255), nullable=True),
    sa.Column('other_source', mysql.VARCHAR(length=100), nullable=True),
    sa.PrimaryKeyConstraint('id'),
    mysql_collate='utf8mb4_0900_ai_ci',
    mysql_default_charset='utf8mb4',
    mysql_engine='InnoDB'
    )
    op.drop_table('incomes')
    # ### end Alembic commands ###

"""initial schema

Revision ID: 20260424_0001
Revises:
Create Date: 2026-04-24
"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "20260424_0001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "customers",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("name", sa.String(length=120), nullable=False),
        sa.Column("phone", sa.String(length=40), nullable=True),
        sa.Column("form_level", sa.Enum("form1", "form2", "form3", "form4", name="formlevel"), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_table(
        "expenses",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column(
            "category",
            sa.Enum(
                "paper_ream",
                "binding_tape",
                "cover_paper",
                "stapler_pins",
                "printer_toner",
                "printer_maintenance",
                "other",
                name="expensecategory",
            ),
            nullable=False,
        ),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("amount", sa.Numeric(precision=12, scale=2), nullable=False),
        sa.Column("date", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_table(
        "inventory_items",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("name", sa.String(length=120), nullable=False),
        sa.Column("unit", sa.String(length=32), nullable=False),
        sa.Column("current_stock", sa.Float(), nullable=False),
        sa.Column("low_stock_threshold", sa.Float(), nullable=False),
        sa.Column("cost_per_unit", sa.Numeric(precision=12, scale=2), nullable=False),
        sa.Column("last_restocked_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("name"),
    )

    op.create_table(
        "pricing_catalog",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("subject", sa.String(length=120), nullable=False),
        sa.Column("category", sa.Enum("science", "languages", "humanities", name="subjectcategory"), nullable=False),
        sa.Column("form_level", sa.Enum("form1", "form2", "form3", "form4", name="formlevel"), nullable=False),
        sa.Column("price", sa.Numeric(precision=12, scale=2), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_table(
        "orders",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("order_number", sa.String(length=40), nullable=False),
        sa.Column("customer_id", sa.String(length=36), nullable=False),
        sa.Column("total_amount", sa.Numeric(precision=12, scale=2), nullable=False),
        sa.Column("amount_paid", sa.Numeric(precision=12, scale=2), nullable=False),
        sa.Column(
            "order_status",
            sa.Enum("pending", "ready", "delivered", name="orderstatus"),
            nullable=False,
        ),
        sa.Column("payment_status", sa.Enum("unpaid", "partial", "paid", name="paymentstatus"), nullable=False),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("delivered_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["customer_id"], ["customers.id"], ondelete="RESTRICT"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_orders_order_number"), "orders", ["order_number"], unique=True)

    op.create_table(
        "inventory_movements",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("item_id", sa.String(length=36), nullable=False),
        sa.Column("movement_type", sa.Enum("in_stock", "out_stock", "adjust", name="inventorymovementtype"), nullable=False),
        sa.Column("quantity_delta", sa.Float(), nullable=False),
        sa.Column("note", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["item_id"], ["inventory_items.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_table(
        "order_items",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("order_id", sa.String(length=36), nullable=False),
        sa.Column("subject", sa.String(length=120), nullable=False),
        sa.Column("category", sa.Enum("science", "languages", "humanities", name="subjectcategory"), nullable=False),
        sa.Column("form_level", sa.Enum("form1", "form2", "form3", "form4", name="formlevel"), nullable=False),
        sa.Column("quantity", sa.Integer(), nullable=False),
        sa.Column("unit_price", sa.Numeric(precision=12, scale=2), nullable=False),
        sa.ForeignKeyConstraint(["order_id"], ["orders.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_table(
        "payments",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("order_id", sa.String(length=36), nullable=False),
        sa.Column("customer_id", sa.String(length=36), nullable=False),
        sa.Column("amount", sa.Numeric(precision=12, scale=2), nullable=False),
        sa.Column("method", sa.Enum("cash", "airtel_money", "tnm_mpamba", "other", name="paymentmethod"), nullable=False),
        sa.Column("paid_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.ForeignKeyConstraint(["customer_id"], ["customers.id"], ondelete="RESTRICT"),
        sa.ForeignKeyConstraint(["order_id"], ["orders.id"], ondelete="RESTRICT"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_payments_customer_id"), "payments", ["customer_id"], unique=False)
    op.create_index(op.f("ix_payments_order_id"), "payments", ["order_id"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_payments_order_id"), table_name="payments")
    op.drop_index(op.f("ix_payments_customer_id"), table_name="payments")
    op.drop_table("payments")
    op.drop_table("order_items")
    op.drop_table("inventory_movements")
    op.drop_index(op.f("ix_orders_order_number"), table_name="orders")
    op.drop_table("orders")
    op.drop_table("pricing_catalog")
    op.drop_table("inventory_items")
    op.drop_table("expenses")
    op.drop_table("customers")

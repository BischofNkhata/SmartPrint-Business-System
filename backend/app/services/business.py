from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.entities import Expense, Order, PaymentStatus


def derive_payment_status(total_amount: float, amount_paid: float) -> PaymentStatus:
    if amount_paid <= 0:
        return PaymentStatus.unpaid
    if amount_paid >= total_amount:
        return PaymentStatus.paid
    return PaymentStatus.partial


def get_next_order_number(db: Session) -> str:
    count = db.scalar(select(func.count(Order.id))) or 0
    return f"ORD-{count + 1:05d}"


def report_summary(db: Session) -> dict[str, float]:
    total_revenue = float(db.scalar(select(func.coalesce(func.sum(Order.amount_paid), 0))) or 0)
    total_expenses = float(db.scalar(select(func.coalesce(func.sum(Expense.amount), 0))) or 0)
    total_outstanding = float(
        db.scalar(select(func.coalesce(func.sum(Order.total_amount - Order.amount_paid), 0))) or 0
    )
    return {
        "revenue": total_revenue,
        "expenses": total_expenses,
        "profit": total_revenue - total_expenses,
        "outstanding_loans": total_outstanding,
    }

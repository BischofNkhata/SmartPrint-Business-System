import enum
import uuid
from datetime import datetime

from sqlalchemy import DateTime, Enum, Float, ForeignKey, Integer, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class UserRole(str, enum.Enum):
    admin = "admin"
    user = "user"


def uuid_str() -> str:
    return str(uuid.uuid4())


class FormLevel(str, enum.Enum):
    form1 = "Form 1"
    form2 = "Form 2"
    form3 = "Form 3"
    form4 = "Form 4"


class SubjectCategory(str, enum.Enum):
    science = "Science"
    languages = "Languages"
    humanities = "Humanities"


class OrderStatus(str, enum.Enum):
    pending = "Pending"
    ready = "Ready"
    delivered = "Delivered"


class PaymentStatus(str, enum.Enum):
    unpaid = "Unpaid"
    partial = "Partial"
    paid = "Paid"


class PaymentMethod(str, enum.Enum):
    cash = "Cash"
    airtel_money = "Airtel Money"
    tnm_mpamba = "TNM Mpamba"
    other = "Other"


class ExpenseCategory(str, enum.Enum):
    paper_ream = "Paper (Ream)"
    binding_tape = "Binding Tape"
    cover_paper = "Cover Paper"
    stapler_pins = "Stapler Pins"
    printer_toner = "Printer Toner"
    printer_maintenance = "Printer Maintenance"
    other = "Other"


class Customer(Base):
    __tablename__ = "customers"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uuid_str)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    phone: Mapped[str | None] = mapped_column(String(40))
    form_level: Mapped[FormLevel] = mapped_column(Enum(FormLevel), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)

    orders: Mapped[list["Order"]] = relationship(back_populates="customer")
    payments: Mapped[list["Payment"]] = relationship(back_populates="customer")


class Order(Base):
    __tablename__ = "orders"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uuid_str)
    order_number: Mapped[str] = mapped_column(String(40), unique=True, index=True, nullable=False)
    customer_id: Mapped[str] = mapped_column(ForeignKey("customers.id", ondelete="RESTRICT"), nullable=False)
    total_amount: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)
    amount_paid: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False, default=0)
    order_status: Mapped[OrderStatus] = mapped_column(Enum(OrderStatus), nullable=False, default=OrderStatus.pending)
    payment_status: Mapped[PaymentStatus] = mapped_column(Enum(PaymentStatus), nullable=False, default=PaymentStatus.unpaid)
    notes: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
    delivered_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    customer: Mapped[Customer] = relationship(back_populates="orders")
    items: Mapped[list["OrderItem"]] = relationship(back_populates="order", cascade="all, delete-orphan")
    payments: Mapped[list["Payment"]] = relationship(back_populates="order", cascade="all, delete-orphan")


class OrderItem(Base):
    __tablename__ = "order_items"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uuid_str)
    order_id: Mapped[str] = mapped_column(ForeignKey("orders.id", ondelete="CASCADE"), nullable=False)
    subject: Mapped[str] = mapped_column(String(120), nullable=False)
    category: Mapped[SubjectCategory] = mapped_column(Enum(SubjectCategory), nullable=False)
    form_level: Mapped[FormLevel] = mapped_column(Enum(FormLevel), nullable=False)
    quantity: Mapped[int] = mapped_column(Integer, nullable=False)
    unit_price: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)

    order: Mapped[Order] = relationship(back_populates="items")


class Payment(Base):
    __tablename__ = "payments"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uuid_str)
    order_id: Mapped[str] = mapped_column(ForeignKey("orders.id", ondelete="RESTRICT"), nullable=False, index=True)
    customer_id: Mapped[str] = mapped_column(ForeignKey("customers.id", ondelete="RESTRICT"), nullable=False, index=True)
    amount: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)
    method: Mapped[PaymentMethod] = mapped_column(Enum(PaymentMethod), nullable=False)
    paid_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    notes: Mapped[str | None] = mapped_column(Text)

    order: Mapped[Order] = relationship(back_populates="payments")
    customer: Mapped[Customer] = relationship(back_populates="payments")


class Expense(Base):
    __tablename__ = "expenses"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uuid_str)
    category: Mapped[ExpenseCategory] = mapped_column(Enum(ExpenseCategory), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    amount: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)
    date: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)


class InventoryItem(Base):
    __tablename__ = "inventory_items"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uuid_str)
    name: Mapped[str] = mapped_column(String(120), nullable=False, unique=True)
    unit: Mapped[str] = mapped_column(String(32), nullable=False)
    current_stock: Mapped[float] = mapped_column(Float, nullable=False, default=0)
    low_stock_threshold: Mapped[float] = mapped_column(Float, nullable=False, default=0)
    cost_per_unit: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False, default=0)
    last_restocked_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)

    movements: Mapped[list["InventoryMovement"]] = relationship(back_populates="item", cascade="all, delete-orphan")


class InventoryMovementType(str, enum.Enum):
    in_stock = "IN"
    out_stock = "OUT"
    adjust = "ADJUST"


class InventoryMovement(Base):
    __tablename__ = "inventory_movements"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uuid_str)
    item_id: Mapped[str] = mapped_column(ForeignKey("inventory_items.id", ondelete="CASCADE"), nullable=False)
    movement_type: Mapped[InventoryMovementType] = mapped_column(Enum(InventoryMovementType), nullable=False)
    quantity_delta: Mapped[float] = mapped_column(Float, nullable=False)
    note: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)

    item: Mapped[InventoryItem] = relationship(back_populates="movements")


class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uuid_str)
    username: Mapped[str] = mapped_column(String(120), unique=True, index=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[UserRole] = mapped_column(Enum(UserRole), nullable=False, default=UserRole.user)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)


class PricingCatalog(Base):
    __tablename__ = "pricing_catalog"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uuid_str)
    subject: Mapped[str] = mapped_column(String(120), nullable=False)
    category: Mapped[SubjectCategory] = mapped_column(Enum(SubjectCategory), nullable=False)
    form_level: Mapped[FormLevel] = mapped_column(Enum(FormLevel), nullable=False)
    price: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)

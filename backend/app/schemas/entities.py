from datetime import datetime

from pydantic import BaseModel, ConfigDict

from app.models.entities import (
    ExpenseCategory,
    FormLevel,
    OrderStatus,
    PaymentMethod,
    PaymentStatus,
    SubjectCategory,
)


class ORMBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)


class CustomerBase(BaseModel):
    name: str
    phone: str | None = None
    form_level: FormLevel


class CustomerCreate(CustomerBase):
    pass


class CustomerUpdate(BaseModel):
    name: str | None = None
    phone: str | None = None
    form_level: FormLevel | None = None


class CustomerRead(ORMBase, CustomerBase):
    id: str
    created_at: datetime
    outstanding_balance: float = 0


class OrderItemBase(BaseModel):
    subject: str
    category: SubjectCategory
    form_level: FormLevel
    quantity: int
    unit_price: float


class OrderItemCreate(OrderItemBase):
    pass


class OrderItemRead(ORMBase, OrderItemBase):
    id: str


class OrderCreate(BaseModel):
    customer_id: str
    items: list[OrderItemCreate]
    total_amount: float
    amount_paid: float = 0
    order_status: OrderStatus = OrderStatus.pending
    notes: str | None = None


class OrderUpdate(BaseModel):
    total_amount: float | None = None
    amount_paid: float | None = None
    order_status: OrderStatus | None = None
    notes: str | None = None


class OrderRead(ORMBase):
    id: str
    order_number: str
    customer_id: str
    items: list[OrderItemRead]
    total_amount: float
    amount_paid: float
    order_status: OrderStatus
    payment_status: PaymentStatus
    created_at: datetime
    delivered_at: datetime | None = None
    notes: str | None = None


class PaymentCreate(BaseModel):
    order_id: str
    customer_id: str
    amount: float
    method: PaymentMethod
    paid_at: datetime
    notes: str | None = None


class PaymentRead(ORMBase):
    id: str
    order_id: str
    customer_id: str
    amount: float
    method: PaymentMethod
    paid_at: datetime
    notes: str | None = None


class ExpenseCreate(BaseModel):
    category: ExpenseCategory
    description: str
    amount: float
    date: datetime


class ExpenseRead(ORMBase):
    id: str
    category: ExpenseCategory
    description: str
    amount: float
    date: datetime


class InventoryItemCreate(BaseModel):
    name: str
    unit: str
    current_stock: float
    low_stock_threshold: float
    cost_per_unit: float
    last_restocked_at: datetime


class InventoryItemUpdate(BaseModel):
    name: str | None = None
    unit: str | None = None
    current_stock: float | None = None
    low_stock_threshold: float | None = None
    cost_per_unit: float | None = None
    last_restocked_at: datetime | None = None


class StockAdjustment(BaseModel):
    delta: float
    note: str | None = None


class InventoryItemRead(ORMBase):
    id: str
    name: str
    unit: str
    current_stock: float
    low_stock_threshold: float
    cost_per_unit: float
    last_restocked_at: datetime


class PricingCreate(BaseModel):
    subject: str
    category: SubjectCategory
    form_level: FormLevel
    price: float


class PricingRead(ORMBase):
    id: str
    subject: str
    category: SubjectCategory
    form_level: FormLevel
    price: float


class PricingUpdate(BaseModel):
    price: float


class SummaryReport(BaseModel):
    revenue: float
    expenses: float
    profit: float
    outstanding_loans: float

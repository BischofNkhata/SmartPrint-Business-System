from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.db.session import get_db
from app.core.security import get_current_user
from app.models.entities import (
    Customer,
    Expense,
    InventoryItem,
    InventoryMovement,
    InventoryMovementType,
    Order,
    OrderItem,
    OrderStatus,
    Payment,
    PricingCatalog,
)
from app.schemas.entities import (
    CustomerCreate,
    CustomerRead,
    CustomerUpdate,
    ExpenseCreate,
    ExpenseRead,
    InventoryItemCreate,
    InventoryItemRead,
    InventoryItemUpdate,
    OrderCreate,
    OrderRead,
    OrderUpdate,
    PaymentCreate,
    PaymentRead,
    PricingCreate,
    PricingRead,
    PricingUpdate,
    StockAdjustment,
    SummaryReport,
)
from app.services.business import derive_payment_status, get_next_order_number, report_summary

router = APIRouter(dependencies=[Depends(get_current_user)])


@router.get("/customers", response_model=list[CustomerRead])
def list_customers(db: Session = Depends(get_db)) -> list[CustomerRead]:
    customers = db.scalars(select(Customer)).all()
    results: list[CustomerRead] = []
    for customer in customers:
        orders = db.scalars(select(Order).where(Order.customer_id == customer.id)).all()
        outstanding = float(sum(float(o.total_amount) - float(o.amount_paid) for o in orders))
        item = CustomerRead.model_validate(customer)
        item.outstanding_balance = outstanding
        results.append(item)
    return results


@router.post("/customers", response_model=CustomerRead, status_code=status.HTTP_201_CREATED)
def create_customer(payload: CustomerCreate, db: Session = Depends(get_db)) -> Customer:
    customer = Customer(**payload.model_dump())
    db.add(customer)
    db.commit()
    db.refresh(customer)
    return customer


@router.patch("/customers/{customer_id}", response_model=CustomerRead)
def update_customer(customer_id: str, payload: CustomerUpdate, db: Session = Depends(get_db)) -> Customer:
    customer = db.get(Customer, customer_id)
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(customer, key, value)
    db.commit()
    db.refresh(customer)
    return customer


@router.delete("/customers/{customer_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_customer(customer_id: str, db: Session = Depends(get_db)) -> None:
    customer = db.get(Customer, customer_id)
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    db.delete(customer)
    db.commit()


@router.get("/orders", response_model=list[OrderRead])
def list_orders(db: Session = Depends(get_db)) -> list[Order]:
    stmt = select(Order).options(selectinload(Order.items))
    return db.scalars(stmt).all()


@router.post("/orders", response_model=OrderRead, status_code=status.HTTP_201_CREATED)
def create_order(payload: OrderCreate, db: Session = Depends(get_db)) -> Order:
    customer = db.get(Customer, payload.customer_id)
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    order = Order(
        customer_id=payload.customer_id,
        total_amount=payload.total_amount,
        amount_paid=payload.amount_paid,
        order_status=payload.order_status,
        payment_status=derive_payment_status(payload.total_amount, payload.amount_paid),
        notes=payload.notes,
        order_number=get_next_order_number(db),
    )
    for item in payload.items:
        order.items.append(OrderItem(**item.model_dump()))
    db.add(order)
    db.commit()
    db.refresh(order)
    return order


@router.patch("/orders/{order_id}", response_model=OrderRead)
def update_order(order_id: str, payload: OrderUpdate, db: Session = Depends(get_db)) -> Order:
    order = db.get(Order, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    changes = payload.model_dump(exclude_unset=True)
    for key, value in changes.items():
        setattr(order, key, value)
    if "order_status" in changes and changes["order_status"] == OrderStatus.delivered:
        order.delivered_at = datetime.utcnow()
    order.payment_status = derive_payment_status(float(order.total_amount), float(order.amount_paid))
    db.commit()
    db.refresh(order)
    return order


@router.delete("/orders/{order_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_order(order_id: str, db: Session = Depends(get_db)) -> None:
    order = db.get(Order, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    db.delete(order)
    db.commit()


@router.get("/payments", response_model=list[PaymentRead])
def list_payments(db: Session = Depends(get_db)) -> list[Payment]:
    return db.scalars(select(Payment)).all()


@router.post("/payments", response_model=PaymentRead, status_code=status.HTTP_201_CREATED)
def create_payment(payload: PaymentCreate, db: Session = Depends(get_db)) -> Payment:
    order = db.get(Order, payload.order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    payment = Payment(**payload.model_dump())
    order.amount_paid = float(order.amount_paid) + payload.amount
    order.payment_status = derive_payment_status(float(order.total_amount), float(order.amount_paid))
    db.add(payment)
    db.commit()
    db.refresh(payment)
    return payment


@router.delete("/payments/{payment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_payment(payment_id: str, db: Session = Depends(get_db)) -> None:
    payment = db.get(Payment, payment_id)
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    order = db.get(Order, payment.order_id)
    if order:
        order.amount_paid = max(0, float(order.amount_paid) - float(payment.amount))
        order.payment_status = derive_payment_status(float(order.total_amount), float(order.amount_paid))
    db.delete(payment)
    db.commit()


@router.get("/expenses", response_model=list[ExpenseRead])
def list_expenses(db: Session = Depends(get_db)) -> list[Expense]:
    return db.scalars(select(Expense)).all()


@router.post("/expenses", response_model=ExpenseRead, status_code=status.HTTP_201_CREATED)
def create_expense(payload: ExpenseCreate, db: Session = Depends(get_db)) -> Expense:
    expense = Expense(**payload.model_dump())
    db.add(expense)
    db.commit()
    db.refresh(expense)
    return expense


@router.delete("/expenses/{expense_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_expense(expense_id: str, db: Session = Depends(get_db)) -> None:
    expense = db.get(Expense, expense_id)
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    db.delete(expense)
    db.commit()


@router.get("/inventory", response_model=list[InventoryItemRead])
def list_inventory(db: Session = Depends(get_db)) -> list[InventoryItem]:
    return db.scalars(select(InventoryItem)).all()


@router.post("/inventory", response_model=InventoryItemRead, status_code=status.HTTP_201_CREATED)
def create_inventory(payload: InventoryItemCreate, db: Session = Depends(get_db)) -> InventoryItem:
    item = InventoryItem(**payload.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.patch("/inventory/{item_id}", response_model=InventoryItemRead)
def update_inventory(item_id: str, payload: InventoryItemUpdate, db: Session = Depends(get_db)) -> InventoryItem:
    item = db.get(InventoryItem, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Inventory item not found")
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(item, key, value)
    db.commit()
    db.refresh(item)
    return item


@router.patch("/inventory/{item_id}/stock", response_model=InventoryItemRead)
def adjust_inventory(item_id: str, payload: StockAdjustment, db: Session = Depends(get_db)) -> InventoryItem:
    item = db.get(InventoryItem, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Inventory item not found")
    item.current_stock = max(0, float(item.current_stock) + payload.delta)
    if payload.delta > 0:
        item.last_restocked_at = datetime.utcnow()
        move_type = InventoryMovementType.in_stock
    elif payload.delta < 0:
        move_type = InventoryMovementType.out_stock
    else:
        move_type = InventoryMovementType.adjust
    movement = InventoryMovement(
        item_id=item.id,
        movement_type=move_type,
        quantity_delta=payload.delta,
        note=payload.note,
    )
    db.add(movement)
    db.commit()
    db.refresh(item)
    return item


@router.get("/pricing", response_model=list[PricingRead])
def list_pricing(db: Session = Depends(get_db)) -> list[PricingCatalog]:
    return db.scalars(select(PricingCatalog)).all()


@router.post("/pricing", response_model=PricingRead, status_code=status.HTTP_201_CREATED)
def create_pricing(payload: PricingCreate, db: Session = Depends(get_db)) -> PricingCatalog:
    item = PricingCatalog(**payload.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.put("/pricing/{pricing_id}", response_model=PricingRead)
def update_pricing(pricing_id: str, payload: PricingUpdate, db: Session = Depends(get_db)) -> PricingCatalog:
    item = db.get(PricingCatalog, pricing_id)
    if not item:
        raise HTTPException(status_code=404, detail="Pricing entry not found")
    item.price = payload.price
    db.commit()
    db.refresh(item)
    return item


@router.get("/reports/summary", response_model=SummaryReport)
def get_summary(
    _from: datetime | None = Query(default=None, alias="from"),
    _to: datetime | None = Query(default=None, alias="to"),
    db: Session = Depends(get_db),
) -> SummaryReport:
    # Current implementation returns overall totals; date-range filtering can be added without API contract changes.
    _ = (_from, _to)
    return SummaryReport(**report_summary(db))

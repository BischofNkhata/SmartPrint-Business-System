import type {
  Customer,
  Expense,
  InventoryItem,
  Order,
  OrderItem,
  OrderStatus,
  Payment,
  PaymentMethod,
  PricingItem,
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000';
const API_PREFIX = `${API_BASE_URL}/api/v1`;

export interface LoginResponse {
  accessToken: string;
  tokenType: string;
  role: string;
}

function getStoredToken(): string | null {
  try {
    const rawAuth = localStorage.getItem('printmis-auth');
    const token = rawAuth ? JSON.parse(rawAuth)?.state?.token : null;
    return typeof token === 'string' ? token : null;
  } catch {
    return null;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getStoredToken();
  const response = await fetch(`${API_PREFIX}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers ?? {}),
    },
    ...init,
  });
  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem('printmis-auth'); // best-effort logout on auth failure
      window.location.href = '/login';
    }
    throw new Error(`API request failed: ${response.status}`);
  }
  if (response.status === 204) {
    return undefined as T;
  }
  return (await response.json()) as T;
}

const toCustomer = (row: any): Customer => ({
  id: row.id,
  name: row.name,
  phone: row.phone ?? undefined,
  formLevel: row.form_level,
  createdAt: row.created_at,
});

const toOrderItem = (row: any): OrderItem => ({
  id: row.id,
  subject: row.subject,
  category: row.category,
  formLevel: row.form_level,
  quantity: row.quantity,
  unitPrice: Number(row.unit_price),
});

const toOrder = (row: any): Order => ({
  id: row.id,
  orderNumber: row.order_number,
  customerId: row.customer_id,
  items: (row.items ?? []).map(toOrderItem),
  totalAmount: Number(row.total_amount),
  amountPaid: Number(row.amount_paid),
  orderStatus: row.order_status,
  paymentStatus: row.payment_status,
  createdAt: row.created_at,
  deliveredAt: row.delivered_at ?? undefined,
  notes: row.notes ?? undefined,
});

const toPayment = (row: any): Payment => ({
  id: row.id,
  orderId: row.order_id,
  customerId: row.customer_id,
  amount: Number(row.amount),
  method: row.method,
  paidAt: row.paid_at,
  notes: row.notes ?? undefined,
});

const toExpense = (row: any): Expense => ({
  id: row.id,
  category: row.category,
  description: row.description,
  amount: Number(row.amount),
  date: row.date,
});

const toInventory = (row: any): InventoryItem => ({
  id: row.id,
  name: row.name,
  unit: row.unit,
  currentStock: Number(row.current_stock),
  lowStockThreshold: Number(row.low_stock_threshold),
  costPerUnit: Number(row.cost_per_unit),
  lastRestockedAt: row.last_restocked_at,
});

const toPricing = (row: any): PricingItem => ({
  id: row.id,
  subject: row.subject,
  category: row.category,
  formLevel: row.form_level,
  price: Number(row.price),
});

export async function fetchBootstrapData() {
  const [customers, orders, payments, expenses, inventory, pricing] = await Promise.all([
    request<any[]>('/customers'),
    request<any[]>('/orders'),
    request<any[]>('/payments'),
    request<any[]>('/expenses'),
    request<any[]>('/inventory'),
    request<any[]>('/pricing'),
  ]);
  return {
    customers: customers.map(toCustomer),
    orders: orders.map(toOrder),
    payments: payments.map(toPayment),
    expenses: expenses.map(toExpense),
    inventory: inventory.map(toInventory),
    pricing: pricing.map(toPricing),
  };
}

export async function loginRequest(username: string, password: string): Promise<LoginResponse> {
  const row = await request<any>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
  return {
    accessToken: row.access_token,
    tokenType: row.token_type,
    role: row.role,
  };
}

export async function createCustomer(payload: Omit<Customer, 'id' | 'createdAt'>): Promise<Customer> {
  const row = await request<any>('/customers', {
    method: 'POST',
    body: JSON.stringify({
      name: payload.name,
      phone: payload.phone ?? null,
      form_level: payload.formLevel,
    }),
  });
  return toCustomer(row);
}

export async function updateCustomerApi(customerId: string, updates: Partial<Customer>): Promise<Customer> {
  const row = await request<any>(`/customers/${customerId}`, {
    method: 'PATCH',
    body: JSON.stringify({
      name: updates.name,
      phone: updates.phone ?? null,
      form_level: updates.formLevel,
    }),
  });
  return toCustomer(row);
}

export async function removeCustomer(customerId: string): Promise<void> {
  await request<void>(`/customers/${customerId}`, { method: 'DELETE' });
}

export async function createOrder(payload: {
  customerId: string;
  items: OrderItem[];
  totalAmount: number;
  amountPaid: number;
  orderStatus: OrderStatus;
  notes?: string;
}): Promise<Order> {
  const row = await request<any>('/orders', {
    method: 'POST',
    body: JSON.stringify({
      customer_id: payload.customerId,
      total_amount: payload.totalAmount,
      amount_paid: payload.amountPaid,
      order_status: payload.orderStatus,
      notes: payload.notes ?? null,
      items: payload.items.map((i) => ({
        subject: i.subject,
        category: i.category,
        form_level: i.formLevel,
        quantity: i.quantity,
        unit_price: i.unitPrice,
      })),
    }),
  });
  return toOrder(row);
}

export async function patchOrder(orderId: string, payload: Partial<Pick<Order, 'totalAmount' | 'amountPaid' | 'orderStatus' | 'notes'>>): Promise<Order> {
  const row = await request<any>(`/orders/${orderId}`, {
    method: 'PATCH',
    body: JSON.stringify({
      total_amount: payload.totalAmount,
      amount_paid: payload.amountPaid,
      order_status: payload.orderStatus,
      notes: payload.notes,
    }),
  });
  return toOrder(row);
}

export async function removeOrder(orderId: string): Promise<void> {
  await request<void>(`/orders/${orderId}`, { method: 'DELETE' });
}

export async function createPayment(payload: {
  orderId: string;
  customerId: string;
  amount: number;
  method: PaymentMethod;
  paidAt: string;
  notes?: string;
}): Promise<Payment> {
  const row = await request<any>('/payments', {
    method: 'POST',
    body: JSON.stringify({
      order_id: payload.orderId,
      customer_id: payload.customerId,
      amount: payload.amount,
      method: payload.method,
      paid_at: payload.paidAt,
      notes: payload.notes ?? null,
    }),
  });
  return toPayment(row);
}

export async function createExpense(payload: Omit<Expense, 'id'>): Promise<Expense> {
  const row = await request<any>('/expenses', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return toExpense(row);
}

export async function removeExpense(expenseId: string): Promise<void> {
  await request<void>(`/expenses/${expenseId}`, { method: 'DELETE' });
}

export async function createInventoryItem(payload: Omit<InventoryItem, 'id'>): Promise<InventoryItem> {
  const row = await request<any>('/inventory', {
    method: 'POST',
    body: JSON.stringify({
      name: payload.name,
      unit: payload.unit,
      current_stock: payload.currentStock,
      low_stock_threshold: payload.lowStockThreshold,
      cost_per_unit: payload.costPerUnit,
      last_restocked_at: payload.lastRestockedAt,
    }),
  });
  return toInventory(row);
}

export async function adjustInventory(itemId: string, delta: number): Promise<InventoryItem> {
  const row = await request<any>(`/inventory/${itemId}/stock`, {
    method: 'PATCH',
    body: JSON.stringify({ delta }),
  });
  return toInventory(row);
}

export async function updatePricingPrice(id: string, price: number): Promise<PricingItem> {
  const row = await request<any>(`/pricing/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ price }),
  });
  return toPricing(row);
}

export async function createPricing(payload: Omit<PricingItem, 'id'>): Promise<PricingItem> {
  const row = await request<any>('/pricing', {
    method: 'POST',
    body: JSON.stringify({
      subject: payload.subject,
      category: payload.category,
      form_level: payload.formLevel,
      price: payload.price,
    }),
  });
  return toPricing(row);
}

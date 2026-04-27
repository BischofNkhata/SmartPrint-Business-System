// ─── Customer ───────────────────────────────────────────────────────────────
export type FormLevel = 'Form 1' | 'Form 2' | 'Form 3' | 'Form 4';

export interface Customer {
  id: string;
  name: string;
  phone?: string;
  formLevel: FormLevel;
  createdAt: string;
}

// ─── Order ───────────────────────────────────────────────────────────────────
export type SubjectCategory = 'Science' | 'Languages' | 'Humanities';
export type OrderStatus = 'Pending' | 'Ready' | 'Delivered';
export type PaymentStatus = 'Unpaid' | 'Partial' | 'Paid';

export interface OrderItem {
  id: string;
  subject: string;
  category: SubjectCategory;
  formLevel: FormLevel;
  quantity: number;
  unitPrice: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  items: OrderItem[];
  totalAmount: number;
  amountPaid: number;
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
  createdAt: string;
  deliveredAt?: string;
  notes?: string;
}

// ─── Payment ─────────────────────────────────────────────────────────────────
export type PaymentMethod = 'Cash' | 'Airtel Money' | 'TNM Mpamba' | 'Other';

export interface Payment {
  id: string;
  orderId: string;
  customerId: string;
  amount: number;
  method: PaymentMethod;
  paidAt: string;
  notes?: string;
}

// ─── Expense ─────────────────────────────────────────────────────────────────
export type ExpenseCategory =
  | 'Paper (Ream)'
  | 'Binding Tape'
  | 'Cover Paper'
  | 'Stapler Pins'
  | 'Printer Toner'
  | 'Printer Maintenance'
  | 'Other';

export interface Expense {
  id: string;
  category: ExpenseCategory;
  description: string;
  amount: number;
  date: string;
}

// ─── Inventory ───────────────────────────────────────────────────────────────
export interface InventoryItem {
  id: string;
  name: string;
  unit: string;
  currentStock: number;
  lowStockThreshold: number;
  costPerUnit: number;
  lastRestockedAt: string;
}

// ─── Pricing ─────────────────────────────────────────────────────────────────
export interface PricingItem {
  id: string;
  subject: string;
  category: SubjectCategory;
  formLevel: FormLevel;
  price: number;
}

// ─── Constants ───────────────────────────────────────────────────────────────
export const SUBJECTS: Record<SubjectCategory, string[]> = {
  Science:    ['Biology', 'Chemistry', 'Physics'],
  Languages:  ['Chichewa', 'English'],
  Humanities: ['Life Skills', 'Bible Knowledge', 'Social Studies'],
};

export const FORM_LEVELS: FormLevel[] = ['Form 1', 'Form 2', 'Form 3', 'Form 4'];
export const PAYMENT_METHODS: PaymentMethod[] = ['Cash', 'Airtel Money', 'TNM Mpamba', 'Other'];
export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  'Paper (Ream)', 'Binding Tape', 'Cover Paper', 'Stapler Pins',
  'Printer Toner', 'Printer Maintenance', 'Other',
];
export const ORDER_STATUSES: OrderStatus[] = ['Pending', 'Ready', 'Delivered'];

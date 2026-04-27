import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  Customer, Expense, InventoryItem, Order, OrderStatus, Payment, PricingItem
} from './types';
import { derivePaymentStatus } from './utils';
import {
  adjustInventory, createCustomer, createExpense, createInventoryItem, createOrder, createPayment, createPricing,
  fetchBootstrapData, patchOrder, removeCustomer, removeExpense, removeOrder, updatePricingPrice, updateCustomerApi
} from './services/api';

interface AppState {
  customers: Customer[];
  orders: Order[];
  payments: Payment[];
  expenses: Expense[];
  inventory: InventoryItem[];
  pricing: PricingItem[];
  addCustomer: (c: Omit<Customer, 'id' | 'createdAt'>) => Promise<Customer>;
  updateCustomer: (id: string, updates: Partial<Customer>) => Promise<void>;
  deleteCustomer: (id: string) => Promise<void>;
  addOrder: (o: Omit<Order, 'id' | 'orderNumber' | 'paymentStatus' | 'createdAt'>) => Promise<Order>;
  updateOrderStatus: (id: string, status: OrderStatus) => Promise<void>;
  updateOrder: (id: string, updates: Partial<Order>) => Promise<void>;
  deleteOrder: (id: string) => Promise<void>;
  addPayment: (p: Omit<Payment, 'id'>) => Promise<void>;
  deletePayment: (id: string) => Promise<void>;
  addExpense: (e: Omit<Expense, 'id'>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  addInventoryItem: (item: Omit<InventoryItem, 'id'>) => Promise<void>;
  adjustStock: (id: string, delta: number) => Promise<void>;
  updateInventoryItem: (id: string, updates: Partial<InventoryItem>) => Promise<void>;
  updatePrice: (id: string, price: number) => Promise<void>;
  addPricing: (item: Omit<PricingItem, 'id'>) => Promise<PricingItem>;
  initSeed: () => Promise<void>;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      customers: [], orders: [], payments: [], expenses: [], inventory: [], pricing: [],
      initSeed: async () => {
        const data = await fetchBootstrapData();
        set({ ...data });
      },
      addCustomer: async (data) => {
        const customer = await createCustomer(data);
        set((s) => ({ customers: [customer, ...s.customers] }));
        return customer;
      },
      updateCustomer: async (id, updates) => {
        try {
          const updated = await updateCustomerApi(id, updates as Partial<Customer>);
          set((s) => ({ customers: s.customers.map((c) => c.id === id ? updated : c) }));
        } catch (err) {
          // fall back to local optimistic update if API fails
          set((s) => ({ customers: s.customers.map((c) => c.id === id ? { ...c, ...updates } : c) }));
        }
      },
      deleteCustomer: async (id) => {
        await removeCustomer(id);
        set((s) => ({ customers: s.customers.filter((c) => c.id !== id) }));
      },
      addOrder: async (data) => {
        const order = await createOrder(data);
        set((s) => ({ orders: [order, ...s.orders] }));
        return order;
      },
      updateOrderStatus: async (id, status) => {
        const order = await patchOrder(id, { orderStatus: status });
        set((s) => ({ orders: s.orders.map((o) => o.id === id ? order : o) }));
      },
      updateOrder: async (id, updates) => {
        const order = await patchOrder(id, {
          totalAmount: updates.totalAmount, amountPaid: updates.amountPaid, orderStatus: updates.orderStatus, notes: updates.notes
        });
        set((s) => ({ orders: s.orders.map((o) => o.id === id ? order : o) }));
      },
      deleteOrder: async (id) => {
        await removeOrder(id);
        set((s) => ({ orders: s.orders.filter((o) => o.id !== id), payments: s.payments.filter((p) => p.orderId !== id) }));
      },
      addPayment: async (data) => {
        const payment = await createPayment(data);
        set((s) => {
          const updatedOrders = s.orders.map((o) => {
            if (o.id !== payment.orderId) return o;
            const newPaid = o.amountPaid + payment.amount;
            return { ...o, amountPaid: newPaid, paymentStatus: derivePaymentStatus(o.totalAmount, newPaid) };
          });
          return { payments: [payment, ...s.payments], orders: updatedOrders };
        });
      },
      deletePayment: async (id) => {
        set((s) => ({ payments: s.payments.filter((p) => p.id !== id) }));
      },
      addExpense: async (data) => {
        const expense = await createExpense(data);
        set((s) => ({ expenses: [expense, ...s.expenses] }));
      },
      deleteExpense: async (id) => {
        await removeExpense(id);
        set((s) => ({ expenses: s.expenses.filter((e) => e.id !== id) }));
      },
      addInventoryItem: async (data) => {
        const item = await createInventoryItem(data);
        set((s) => ({ inventory: [...s.inventory, item] }));
      },
      adjustStock: async (id, delta) => {
        const item = await adjustInventory(id, delta);
        set((s) => ({ inventory: s.inventory.map((i) => i.id === id ? item : i) }));
      },
      updateInventoryItem: async (id, updates) => {
        set((s) => ({ inventory: s.inventory.map((i) => i.id === id ? { ...i, ...updates } : i) }));
      },
      updatePrice: async (id, price) => {
        const item = await updatePricingPrice(id, price);
        set((s) => ({ pricing: s.pricing.map((p) => p.id === id ? item : p) }));
      },
      addPricing: async (data) => {
        const item = await createPricing(data);
        set((s) => ({ pricing: [...s.pricing, item] }));
        return item;
      },
    }),
    { name: 'printmis-store-v2' },
  ),
);

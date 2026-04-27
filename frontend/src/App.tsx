import { BrowserRouter, Navigate, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { useStore } from './store';
import { Sidebar, BottomNav } from './components/Navigation';
import { useAuthStore } from './authStore';
import { ToastProvider } from './components/Toast';

import Dashboard from './pages/Dashboard';
import Orders from './pages/Orders';
import OrderHistory from './pages/OrderHistory';
import NewOrder from './pages/NewOrder';
import OrderDetail from './pages/OrderDetail';
import Customers from './pages/Customers';
import CustomerDetail from './pages/CustomerDetail';
import Expenses from './pages/Expenses';
import Inventory from './pages/Inventory';
import Pricing from './pages/Pricing';
import Reports from './pages/Reports';
import Payments from './pages/Payments';
import Login from './pages/Login';

function AppShell() {
  const { initSeed } = useStore();
  useEffect(() => { void initSeed(); }, [initSeed]);

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/orders/history" element={<OrderHistory />} />
          <Route path="/orders/new" element={<NewOrder />} />
          <Route path="/orders/:id" element={<OrderDetail />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/customers/:id" element={<CustomerDetail />} />
          <Route path="/expenses" element={<Expenses />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/payments" element={<Payments />} />
        </Routes>
      </main>
      <BottomNav />
    </div>
  );
}

export default function App() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return (
    <BrowserRouter>
      <ToastProvider>
        <Routes>
          {!isAuthenticated ? (
            <>
              <Route path="/login" element={<Login />} />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </>
          ) : (
            <>
              <Route path="/login" element={<Navigate to="/dashboard" replace />} />
              <Route path="/*" element={<AppShell />} />
            </>
          )}
        </Routes>
      </ToastProvider>
    </BrowserRouter>
  );
}

import { BrowserRouter, Navigate, Routes, Route } from 'react-router-dom';
import { Suspense, lazy, useEffect } from 'react';
import { useStore } from './store';
import { Sidebar, BottomNav } from './components/Navigation';
import { useAuthStore } from './authStore';
import { ToastProvider } from './components/Toast';
import { Topbar } from './components/Topbar';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const Orders = lazy(() => import('./pages/Orders'));
const OrderHistory = lazy(() => import('./pages/OrderHistory'));
const NewOrder = lazy(() => import('./pages/NewOrder'));
const OrderDetail = lazy(() => import('./pages/OrderDetail'));
const Customers = lazy(() => import('./pages/Customers'));
const CustomerDetail = lazy(() => import('./pages/CustomerDetail'));
const Expenses = lazy(() => import('./pages/Expenses'));
const Inventory = lazy(() => import('./pages/Inventory'));
const Pricing = lazy(() => import('./pages/Pricing'));
const Reports = lazy(() => import('./pages/Reports'));
const Payments = lazy(() => import('./pages/Payments'));
const Login = lazy(() => import('./pages/Login'));
const Landing = lazy(() => import('./pages/Landing'));

function AppFallback() {
  return (
    <div style={{ padding: 18, color: 'var(--text-muted)', fontWeight: 800 }}>
      Loading…
    </div>
  );
}

function AppShell() {
  const { initSeed } = useStore();
  useEffect(() => { void initSeed(); }, [initSeed]);

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main-content">
        <Topbar />
        <div style={{ padding: 'clamp(14px, 2.2vw, 28px)', paddingTop: 'clamp(16px, 2.2vw, 22px)' }}>
          <Suspense fallback={<AppFallback />}>
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
          </Suspense>
        </div>
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
        <Suspense fallback={<AppFallback />}>
          <Routes>
            {!isAuthenticated ? (
              <>
                <Route path="/" element={<Landing />} />
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
        </Suspense>
      </ToastProvider>
    </BrowserRouter>
  );
}

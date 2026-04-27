import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, ShoppingBag, Users,
  Receipt, Package, Tag, BarChart3, Menu, X, Printer, CreditCard
} from 'lucide-react';
import { useState } from 'react';
import { useAuthStore } from '../authStore';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/orders', label: 'Orders', icon: ShoppingBag },
  { to: '/customers', label: 'Customers', icon: Users },
  { to: '/expenses', label: 'Expenses', icon: Receipt },
  { to: '/payments', label: 'Payments', icon: CreditCard },
  { to: '/inventory', label: 'Inventory', icon: Package },
  { to: '/pricing', label: 'Pricing', icon: Tag },
  { to: '/reports', label: 'Reports', icon: BarChart3 },
];

const bottomItems = navItems.slice(0, 4);

function SidebarLink({ to, label, icon: Icon }: typeof navItems[0]) {
  return (
    <NavLink
      to={to}
      style={({ isActive }) => ({
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '11px 14px',
        borderRadius: 10,
        textDecoration: 'none',
        fontSize: 14,
        fontWeight: 600,
        color: isActive ? '#fff' : '#cbd5e1',
        background: isActive ? 'rgba(37,99,235,0.95)' : 'transparent',
        transition: 'all 0.15s',
        margin: '1px 8px',
      })}
    >
      <Icon size={17} />
      {label}
    </NavLink>
  );
}

export function Sidebar() {
  const logout = useAuthStore((s) => s.logout);
  return (
    <nav className="sidebar">
      <div style={{ padding: '22px 20px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ background: '#2563EB', borderRadius: 8, width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Printer size={18} color="white" />
          </div>
          <div>
            <div style={{ fontFamily: 'DM Serif Display, serif', color: 'white', fontSize: 17, lineHeight: 1.1 }}>SmartPrint Business</div>
            <div style={{ color: '#64748B', fontSize: 11 }}>System MIS</div>
          </div>
        </div>
      </div>

      <div style={{ flex: 1, paddingTop: 12 }}>
        {navItems.map(item => (
          <SidebarLink key={item.to} {...item} />
        ))}
      </div>

      <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.08)', color: '#475569', fontSize: 12, display: 'grid', gap: 10 }}>
        <button
          onClick={logout}
          style={{ border: '1px solid rgba(248, 113, 113, 0.45)', background: 'rgba(127, 29, 29, 0.18)', color: '#fecaca', borderRadius: 8, padding: '8px 10px', cursor: 'pointer', fontWeight: 600 }}
        >
          Logout
        </button>
        <span>v1.0 · Mobile + Desktop</span>
      </div>
    </nav>
  );
}

export function BottomNav() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const location = useLocation();
  const logout = useAuthStore((s) => s.logout);

  return (
    <>
      <nav className="bottom-nav">
        {bottomItems.map(({ to, label, icon: Icon }) => {
          const active = location.pathname.startsWith(to);
          return (
            <NavLink
              key={to}
              to={to}
              style={{
                flex: 1, display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', gap: 3,
                textDecoration: 'none', paddingTop: 6,
                color: active ? 'var(--color-primary)' : 'var(--color-muted)',
                fontSize: 10, fontWeight: 600,
              }}
            >
              <Icon size={20} />
              {label}
            </NavLink>
          );
        })}
        {/* More button */}
        <button
          onClick={() => setDrawerOpen(true)}
          style={{
            flex: 1, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: 3,
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--color-muted)', fontSize: 10, fontWeight: 600, paddingTop: 6,
          }}
        >
          <Menu size={20} />
          More
        </button>
      </nav>

      {/* Drawer */}
      {drawerOpen && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 300 }}
          onClick={() => setDrawerOpen(false)}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              position: 'absolute', bottom: 0, left: 0, right: 0,
              background: 'white', borderRadius: '20px 20px 0 0',
              padding: '20px 16px 32px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <span style={{ fontFamily: 'DM Serif Display, serif', fontSize: 18 }}>More</span>
              <button onClick={() => setDrawerOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {navItems.slice(4).map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  onClick={() => setDrawerOpen(false)}
                  style={({ isActive }) => ({
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '14px 16px', borderRadius: 12, textDecoration: 'none',
                    background: isActive ? 'var(--color-primary-light)' : '#F7F4EF',
                    color: isActive ? 'var(--color-primary)' : 'var(--color-ink)',
                    fontWeight: 600, fontSize: 14,
                  })}
                >
                  <Icon size={18} />
                  {label}
                </NavLink>
              ))}
              <button
                onClick={() => { logout(); setDrawerOpen(false); }}
                style={{
                  gridColumn: '1 / -1',
                  padding: '12px 16px',
                  borderRadius: 12,
                  border: '1px solid #fecaca',
                  background: '#fef2f2',
                  color: 'var(--color-danger)',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

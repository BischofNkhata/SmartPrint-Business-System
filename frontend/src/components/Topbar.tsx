import { Search, SunMoon, LogOut } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useThemeStore } from '../theme/themeStore';
import { useAuthStore } from '../authStore';

export function Topbar() {
  const toggleTheme = useThemeStore((s) => s.toggle);
  const mode = useThemeStore((s) => s.mode);
  const logout = useAuthStore((s) => s.logout);
  const [q, setQ] = useState('');

  const placeholder = useMemo(() => {
    if (q.trim().length > 0) return '';
    return 'Search orders, customers, payments…';
  }, [q]);

  return (
    <header className="topbar">
      <div className="topbar-left">
        <div className="search" role="search" aria-label="Search">
          <Search size={16} style={{ color: 'var(--text-muted)' }} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={placeholder} />
        </div>
      </div>
      <div className="topbar-right">
        <button
          className="icon-btn"
          onClick={toggleTheme}
          aria-label={mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          title={mode === 'dark' ? 'Light mode' : 'Dark mode'}
        >
          <SunMoon size={18} style={{ color: 'var(--text-muted)' }} />
        </button>
        <button className="icon-btn" onClick={logout} aria-label="Logout" title="Logout">
          <LogOut size={18} style={{ color: 'var(--text-muted)' }} />
        </button>
      </div>
    </header>
  );
}


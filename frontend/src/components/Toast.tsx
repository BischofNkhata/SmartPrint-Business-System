import { createContext, useContext, useCallback, useState, useEffect } from 'react';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';
import type { ReactNode } from 'react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div style={{
        position: 'fixed',
        top: 20,
        right: 20,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        maxWidth: 360,
        width: 'calc(100% - 40px)',
      }}>
        {toasts.map(toast => (
          <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  const [exit, setExit] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setExit(true), 3000);
    return () => clearTimeout(t);
  }, []);

  const handleClose = () => {
    setExit(true);
    setTimeout(onClose, 300);
  };

  const colors: Record<ToastType, { bg: string; border: string; icon: string; title: string }> = {
    success: { bg: 'var(--bg-elevated)', border: 'rgba(22, 163, 74, 0.35)', icon: 'var(--success-600)', title: 'Success' },
    error:   { bg: 'var(--bg-elevated)', border: 'rgba(220, 38, 38, 0.40)', icon: 'var(--danger-600)', title: 'Something went wrong' },
    info:    { bg: 'var(--bg-elevated)', border: 'rgba(37, 99, 235, 0.35)', icon: 'var(--brand-500)', title: 'Info' },
  };

  const c = colors[toast.type];
  const Icon = toast.type === 'success' ? CheckCircle : toast.type === 'error' ? XCircle : Info;

  return (
    <div style={{
      background: c.bg,
      border: `1px solid ${c.border}`,
      borderRadius: 14,
      padding: '12px 16px',
      display: 'flex',
      alignItems: 'flex-start',
      gap: 10,
      boxShadow: 'var(--shadow-md)',
      transform: exit ? 'translateX(120%)' : 'translateX(0)',
      opacity: exit ? 0 : 1,
      transition: 'all 0.3s ease',
      pointerEvents: 'auto',
    }}>
      <Icon size={18} color={c.icon} style={{ flexShrink: 0, marginTop: 2 }} />
      <div style={{ flex: 1, lineHeight: 1.4 }}>
        <div style={{ fontWeight: 900, letterSpacing: '-0.01em' }}>{c.title}</div>
        <div style={{ marginTop: 2, fontSize: 13, fontWeight: 700, color: 'var(--text-muted)' }}>
          {toast.message}
        </div>
      </div>
      <button
        onClick={handleClose}
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 0, marginTop: 2 }}
      >
        <X size={16} />
      </button>
    </div>
  );
}


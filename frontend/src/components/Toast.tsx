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

  const colors: Record<ToastType, { bg: string; border: string; icon: string }> = {
    success: { bg: '#f0fdf4', border: '#16a34a', icon: '#16a34a' },
    error:   { bg: '#fef2f2', border: '#dc2626', icon: '#dc2626' },
    info:    { bg: '#eff6ff', border: '#2563eb', icon: '#2563eb' },
  };

  const c = colors[toast.type];
  const Icon = toast.type === 'success' ? CheckCircle : toast.type === 'error' ? XCircle : Info;

  return (
    <div style={{
      background: c.bg,
      border: `1.5px solid ${c.border}`,
      borderRadius: 10,
      padding: '12px 16px',
      display: 'flex',
      alignItems: 'flex-start',
      gap: 10,
      boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
      transform: exit ? 'translateX(120%)' : 'translateX(0)',
      opacity: exit ? 0 : 1,
      transition: 'all 0.3s ease',
      pointerEvents: 'auto',
    }}>
      <Icon size={18} color={c.icon} style={{ flexShrink: 0, marginTop: 2 }} />
      <div style={{ flex: 1, fontSize: 14, fontWeight: 600, color: '#1f2937', lineHeight: 1.4 }}>
        {toast.message}
      </div>
      <button
        onClick={handleClose}
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: 0, marginTop: 2 }}
      >
        <X size={16} />
      </button>
    </div>
  );
}


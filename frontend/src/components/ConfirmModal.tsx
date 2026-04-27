import { useState, useCallback } from 'react';
import { Modal, Button } from './UI';
import { AlertTriangle } from 'lucide-react';
import type { ReactNode } from 'react';

interface ConfirmModalProps {
  open: boolean;
  title: string;
  message: ReactNode;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
}

export function ConfirmModal({
  open,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  danger = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onCancel} title={title}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 24 }}>
        <div style={{
          width: 40,
          height: 40,
          borderRadius: '50%',
          background: danger ? 'var(--color-danger-light)' : 'var(--color-accent-light)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}>
          <AlertTriangle size={20} color={danger ? 'var(--color-danger)' : 'var(--color-accent)'} />
        </div>
        <div style={{ fontSize: 14, color: 'var(--color-ink)', lineHeight: 1.5 }}>
          {message}
        </div>
      </div>
      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
        <Button variant="secondary" onClick={onCancel} disabled={loading}>
          {cancelText}
        </Button>
        <Button
          variant={danger ? 'danger' : 'primary'}
          onClick={handleConfirm}
          disabled={loading}
        >
          {loading ? 'Please wait...' : confirmText}
        </Button>
      </div>
    </Modal>
  );
}

// Hook for easier usage
export function useConfirmModal() {
  const [state, setState] = useState<{
    open: boolean;
    title: string;
    message: ReactNode;
    danger?: boolean;
    confirmText?: string;
    onConfirm?: () => void | Promise<void>;
  }>({ open: false, title: '', message: '' });

  const openConfirm = useCallback((options: {
    title: string;
    message: ReactNode;
    danger?: boolean;
    confirmText?: string;
    onConfirm: () => void | Promise<void>;
  }) => {
    setState({ open: true, ...options });
  }, []);

  const closeConfirm = useCallback(() => {
    setState(prev => ({ ...prev, open: false }));
  }, []);

  const modal = (
    <ConfirmModal
      open={state.open}
      title={state.title}
      message={state.message}
      danger={state.danger}
      confirmText={state.confirmText}
      onConfirm={async () => {
        await state.onConfirm?.();
        closeConfirm();
      }}
      onCancel={closeConfirm}
    />
  );

  return { openConfirm, closeConfirm, modal };
}


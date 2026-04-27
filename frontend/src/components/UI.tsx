import { X } from 'lucide-react';
import type { ReactNode } from 'react';

// ─── Button ──────────────────────────────────────────────────────────────────
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md';
  children: ReactNode;
}

export function Button({ variant = 'primary', size = 'md', children, style, ...props }: ButtonProps) {
  const styles: Record<string, React.CSSProperties> = {
    primary:   { background: 'var(--color-primary)', color: 'white', border: 'none', boxShadow: '0 8px 16px rgba(37, 99, 235, 0.22)' },
    secondary: { background: 'white', color: 'var(--color-ink)', border: '1.5px solid var(--color-border)' },
    danger:    { background: 'var(--color-danger)', color: 'white', border: 'none', boxShadow: '0 8px 16px rgba(220, 38, 38, 0.18)' },
    ghost:     { background: 'transparent', color: 'var(--color-muted)', border: 'none' },
  };
  const sizes: Record<string, React.CSSProperties> = {
    sm: { padding: '7px 12px', fontSize: 13 },
    md: { padding: '10px 18px', fontSize: 14 },
  };
  return (
    <button
      {...props}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
        borderRadius: 8, fontFamily: 'DM Sans, sans-serif', fontWeight: 600,
        cursor: props.disabled ? 'not-allowed' : 'pointer',
        opacity: props.disabled ? 0.5 : 1,
        transition: 'opacity 0.15s, transform 0.1s, box-shadow 0.15s',
        ...styles[variant], ...sizes[size], ...style,
      }}
    >
      {children}
    </button>
  );
}

// ─── Card ────────────────────────────────────────────────────────────────────
export function Card({ children, style }: { children: ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      background: 'white',
      borderRadius: 12,
      border: '1px solid var(--color-border)',
      padding: 'clamp(16px, 4vw, 20px)',
      boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
      transition: 'all 0.3s ease',
      ...style,
    }}>
      {children}
    </div>
  );
}

// ─── KpiCard ─────────────────────────────────────────────────────────────────
export function KpiCard({ label, value, sub, gradient, icon, onClick }: {
  label: string; value: string; sub?: ReactNode; gradient: string;
  icon?: ReactNode; onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      style={{
        background: gradient,
        borderRadius: 16,
        padding: 'clamp(20px, 5vw, 24px)',
        color: 'white',
        boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
        position: 'relative',
        overflow: 'hidden',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        cursor: onClick ? 'pointer' : 'default',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = '0 15px 40px rgba(0,0,0,0.15)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.1)';
      }}
    >
      <div style={{ position: 'absolute', top: -40, right: -40, width: 120, height: 120, background: 'rgba(255,255,255,0.1)', borderRadius: '50%' }} />
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, opacity: 0.9, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {label}
          </div>
          <div style={{ fontSize: 32, fontFamily: 'DM Serif Display, serif', fontWeight: 700, marginBottom: 10 }}>
            {value}
          </div>
          {sub && <div style={{ fontSize: 13, fontWeight: 600, opacity: 0.95 }}>{sub}</div>}
        </div>
        {icon && (
          <div style={{ width: 56, height: 56, borderRadius: 14, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(10px)' }}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Modal ───────────────────────────────────────────────────────────────────
export function Modal({ open, onClose, title, children }: {
  open: boolean; onClose: () => void; title: string; children: ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ margin: 0, fontSize: 20 }}>{title}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-muted)' }}>
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ─── StatCard ────────────────────────────────────────────────────────────────
export function StatCard({ label, value, sub, color, icon }: {
  label: string; value: string; sub?: string; color?: string; icon?: ReactNode;
}) {
  return (
    <div className="stat-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          {label}
        </div>
        {icon && (
          <div style={{ width: 36, height: 36, borderRadius: 8, background: color || 'var(--color-primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {icon}
          </div>
        )}
      </div>
      <div style={{ fontSize: 24, fontFamily: 'DM Serif Display, serif', color: color ? undefined : 'var(--color-ink)', marginTop: 8, lineHeight: 1.2 }}>
        {value}
      </div>
      {sub && <div style={{ fontSize: 12, color: 'var(--color-muted)', marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

// ─── Badge ───────────────────────────────────────────────────────────────────
export function Badge({ text, type }: { text: string; type: string }) {
  const cls = type.toLowerCase().replace(' ', '-');
  return <span className={`badge badge-${cls}`}>{text}</span>;
}

// ─── Empty State ─────────────────────────────────────────────────────────────
export function EmptyState({ icon, title, sub }: { icon: ReactNode; title: string; sub?: string }) {
  return (
    <div style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--color-muted)' }}>
      <div style={{ marginBottom: 12, opacity: 0.4 }}>{icon}</div>
      <div style={{ fontWeight: 600, fontSize: 16, color: 'var(--color-ink)', marginBottom: 4 }}>{title}</div>
      {sub && <div style={{ fontSize: 14 }}>{sub}</div>}
    </div>
  );
}

// ─── Section Header ──────────────────────────────────────────────────────
export function PageHeader({ title, subtitle, action, icon }: {
  title: string; subtitle?: string; action?: ReactNode; icon?: ReactNode;
}) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 24,
      flexDirection: 'column',
      gap: 16,
    }}>
      <div>
        <h1 style={{ margin: 0, fontSize: 'clamp(20px, 5vw, 26px)', display: 'flex', alignItems: 'center', gap: 10 }}>
          {icon && (
            <span style={{
              width: 34,
              height: 34,
              borderRadius: 10,
              background: 'var(--tone-primary-bg)',
              border: '1px solid #bfdbfe',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-primary)',
              flexShrink: 0,
            }}>
              {icon}
            </span>
          )}
          <span style={{
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            color: 'var(--color-primary)',
            fontWeight: 800,
          }}>
            {title}
          </span>
        </h1>
        {subtitle && <p style={{ margin: '4px 0 0', color: 'var(--color-muted)', fontSize: 14 }}>{subtitle}</p>}
      </div>
      {action && <div style={{ alignSelf: 'flex-start', width: '100%' }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {action}
        </div>
      </div>}
    </div>
  );
}

// ─── Search Input ────────────────────────────────────────────────────────
export function SearchInput({ value, onChange, placeholder }: {
  value: string; onChange: (v: string) => void; placeholder?: string;
}) {
  return (
    <input
      className="form-input"
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder || 'Search...'}
      style={{ maxWidth: '100%', width: '100%' }}
    />
  );
}

export function KpiTile({ label, value, tone = 'default', helper }: {
  label: string;
  value: ReactNode;
  tone?: 'default' | 'success' | 'danger' | 'accent' | 'primary';
  helper?: ReactNode;
}) {
  const tones: Record<string, string> = {
    default: 'var(--color-ink)',
    success: 'var(--color-success)',
    danger: 'var(--color-danger)',
    accent: 'var(--color-accent)',
    primary: 'var(--color-primary)',
  };
  return (
    <div className={`metric-card ${tone !== 'default' ? `metric-${tone}` : ''}`}>
      <div className="metric-label">{label}</div>
      <div className="metric-value" style={{ color: tones[tone] }}>{value}</div>
      {helper && <div style={{ marginTop: 8, color: 'var(--color-muted)', fontSize: 13 }}>{helper}</div>}
    </div>
  );
}

export function FilterChip({ label, active, onClick }: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '7px 14px',
        borderRadius: 999,
        fontSize: 13,
        fontWeight: 700,
        cursor: 'pointer',
        border: '1px solid',
        borderColor: active ? 'var(--color-primary)' : 'var(--color-border)',
        background: active ? 'var(--color-primary)' : 'white',
        color: active ? 'white' : 'var(--color-muted)',
      }}
    >
      {label}
    </button>
  );
}

import type { CSSProperties, ReactNode } from 'react';

export function Stack({
  children,
  gap = 12,
  direction = 'column',
  align = 'stretch',
  justify = 'flex-start',
  wrap = false,
  style,
}: {
  children: ReactNode;
  gap?: number;
  direction?: CSSProperties['flexDirection'];
  align?: CSSProperties['alignItems'];
  justify?: CSSProperties['justifyContent'];
  wrap?: boolean;
  style?: CSSProperties;
}) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: direction,
        alignItems: align,
        justifyContent: justify,
        gap,
        flexWrap: wrap ? 'wrap' : 'nowrap',
        minWidth: 0,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function Grid({
  children,
  gap = 12,
  min = 240,
  style,
}: {
  children: ReactNode;
  gap?: number;
  min?: number;
  style?: CSSProperties;
}) {
  return (
    <div
      style={{
        display: 'grid',
        gap,
        gridTemplateColumns: `repeat(auto-fit, minmax(${min}px, 1fr))`,
        minWidth: 0,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function Section({
  title,
  subtitle,
  action,
  children,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section style={{ marginBottom: 18 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 10, flexWrap: 'wrap' }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontWeight: 900, letterSpacing: '-0.01em' }}>{title}</div>
          {subtitle ? <div style={{ marginTop: 2, color: 'var(--text-muted)', fontWeight: 700, fontSize: 13 }}>{subtitle}</div> : null}
        </div>
        {action ? <div>{action}</div> : null}
      </div>
      {children}
    </section>
  );
}

export function Skeleton({ h = 12, w = '100%' }: { h?: number; w?: number | string }) {
  return (
    <div
      aria-hidden="true"
      style={{
        height: h,
        width: w,
        borderRadius: 12,
        background: 'linear-gradient(90deg, rgba(148,163,184,0.12), rgba(148,163,184,0.22), rgba(148,163,184,0.12))',
        backgroundSize: '200% 100%',
        animation: 'skeleton 1.2s ease-in-out infinite',
      }}
    />
  );
}


import { ArrowRight, BarChart3, CreditCard, Lock, Printer, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../components/UI';
import { useThemeStore } from '../theme/themeStore';

export default function Landing() {
  const toggleTheme = useThemeStore((s) => s.toggle);
  const mode = useThemeStore((s) => s.mode);

  return (
    <div className="landing">
      <div className="landing-nav">
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 38,
              height: 38,
              borderRadius: 14,
              background: 'linear-gradient(135deg, var(--brand-500) 0%, var(--brand-600) 100%)',
              boxShadow: '0 12px 26px rgba(37, 99, 235, 0.22)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Printer size={18} color="white" />
            </div>
            <div style={{ lineHeight: 1.1 }}>
              <div style={{ fontWeight: 900, letterSpacing: '-0.01em' }}>SmartPrint</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 700 }}>Printing MIS</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button className="icon-btn" onClick={toggleTheme} aria-label="Toggle theme" title={mode === 'dark' ? 'Light mode' : 'Dark mode'}>
              <Sparkles size={18} style={{ color: 'var(--text-muted)' }} />
            </button>
            <Link to="/login" style={{ textDecoration: 'none' }}>
              <Button size="md">
                Login
                <ArrowRight size={16} />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <section className="landing-hero">
        <div className="container">
          <div className="hero-grid">
            <div>
              <div className="pill">
                <Lock size={14} />
                Built for real business tracking
              </div>
              <h1 className="hero-title" style={{ marginTop: 14 }}>
                Know your profit. Track every order. Stop guessing.
              </h1>
              <p className="hero-subtitle">
                SmartPrint helps you run your printing business like a modern company: orders, payments, debts, expenses, and performance—cleanly organized and easy to use on mobile or desktop.
              </p>
              <div className="hero-actions">
                <Link to="/login" style={{ textDecoration: 'none' }}>
                  <Button size="md" style={{ padding: '12px 18px', borderRadius: 14 }}>
                    Go to Dashboard
                    <ArrowRight size={16} />
                  </Button>
                </Link>
                <a href="#features" style={{ textDecoration: 'none' }}>
                  <Button variant="secondary" size="md" style={{ padding: '12px 18px', borderRadius: 14 }}>
                    See features
                  </Button>
                </a>
              </div>

              <div id="features" className="feature-grid" style={{ marginTop: 22 }}>
                <div className="feature-card">
                  <div className="feature-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <CreditCard size={18} style={{ color: 'var(--brand-500)' }} />
                    Payments + debts, done right
                  </div>
                  <p className="feature-desc">
                    Capture upfront, partial, and pay-later orders. Always see who owes you and how much—without messy paper records.
                  </p>
                </div>
                <div className="feature-card">
                  <div className="feature-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <BarChart3 size={18} style={{ color: 'var(--success-600)' }} />
                    Business performance at a glance
                  </div>
                  <p className="feature-desc">
                    Revenue, expenses, outstanding balance, and your net result—designed for an owner who wants clarity fast.
                  </p>
                </div>
              </div>
            </div>

            <div className="mock" aria-hidden="true">
              <div className="mock-inner">
                <div className="mini-grid">
                  <div className="mini-card">
                    <div className="mini-label">Cash in (month)</div>
                    <div className="mini-value">$ 19,945</div>
                    <div className="mini-row">
                      <span style={{ color: 'var(--text-muted)', fontWeight: 800, fontSize: 12 }}>Trend</span>
                      <span style={{ color: 'var(--success-600)', fontWeight: 900 }}>+12%</span>
                    </div>
                  </div>
                  <div className="mini-card">
                    <div className="mini-label">Outstanding</div>
                    <div className="mini-value">$ 5,120</div>
                    <div className="mini-row">
                      <span style={{ color: 'var(--text-muted)', fontWeight: 800, fontSize: 12 }}>Delivered</span>
                      <span style={{ color: 'var(--warning-600)', fontWeight: 900 }}>9 orders</span>
                    </div>
                  </div>
                </div>
                <div style={{ marginTop: 12, display: 'grid', gap: 10 }}>
                  {[
                    { title: 'Order #PM-2408', meta: 'Form 3 • Biology • 12 copies', right: '$ 4,800' },
                    { title: 'Order #PM-2407', meta: 'Form 1 • Chichewa • 20 copies', right: '$ 3,200' },
                    { title: 'Order #PM-2406', meta: 'Form 4 • Physics • 8 copies', right: '$ 2,100' },
                  ].map((r) => (
                    <div key={r.title} className="mini-row" style={{ background: 'var(--bg-elevated)' }}>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontWeight: 900, letterSpacing: '-0.01em' }}>{r.title}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {r.meta}
                        </div>
                      </div>
                      <div style={{ fontFamily: 'var(--font-serif)', fontWeight: 800 }}>{r.right}</div>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 14, padding: 14, borderRadius: 16, border: '1px solid var(--border)', background: 'var(--bg-subtle)' }}>
                  <div style={{ fontWeight: 900, marginBottom: 6 }}>Fast workflow</div>
                  <div style={{ color: 'var(--text-muted)', fontWeight: 700, fontSize: 13, lineHeight: 1.55 }}>
                    Create an order in under a minute—optimized for your day-to-day operations.
                  </div>
                </div>
                <div style={{ marginTop: 14, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <span className="pill" style={{ background: 'var(--bg-elevated)' }}>Mobile-ready</span>
                  <span className="pill" style={{ background: 'var(--bg-elevated)' }}>Owner-first</span>
                  <span className="pill" style={{ background: 'var(--bg-elevated)' }}>Secure</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer style={{ padding: '26px 0 42px' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', gap: 14, flexWrap: 'wrap' }}>
          <div style={{ color: 'var(--text-muted)', fontWeight: 700 }}>
            SmartPrint · Built for printing businesses
          </div>
          <div style={{ color: 'var(--text-muted)', fontWeight: 700 }}>
            Secure by default · Responsive UI
          </div>
        </div>
      </footer>
    </div>
  );
}


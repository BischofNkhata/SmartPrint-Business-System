import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card } from '../components/UI';
import { useAuthStore } from '../authStore';
import { Printer, Lock, User, Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(username.trim(), password);
      navigate('/dashboard');
    } catch {
      setError('Invalid credentials. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        padding: 20,
        background: 'linear-gradient(135deg, #1A1F2E 0%, #2563EB 50%, #1E40AF 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Animated background shapes */}
      <div
        style={{
          position: 'absolute',
          top: '-10%',
          right: '-10%',
          width: 500,
          height: 500,
          background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
          borderRadius: '50%',
          animation: 'pulse 7s ease-in-out infinite',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '-15%',
          left: '-10%',
          width: 400,
          height: 400,
          background: 'radial-gradient(circle, rgba(255,255,255,0.06) 0%, transparent 70%)',
          borderRadius: '50%',
          animation: 'pulse 9s ease-in-out infinite reverse',
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: '40%',
          left: '60%',
          width: 200,
          height: 200,
          background: 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)',
          borderRadius: '50%',
          animation: 'pulse 5s ease-in-out infinite',
        }}
      />

      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 420 }}>
        {/* Logo header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 16,
              background: 'rgba(255,255,255,0.15)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.2)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 20,
            }}
          >
            <Printer size={30} color="white" />
          </div>
          <h1
            style={{
              margin: 0,
              fontSize: 28,
              fontFamily: 'DM Serif Display, serif',
              color: 'white',
              marginBottom: 8,
            }}
          >
            SmartPrint Business System
          </h1>
          <p style={{ margin: 0, color: 'rgba(255,255,255,0.7)', fontSize: 15 }}>
            Professional MIS for Printing Operations
          </p>
        </div>

        {/* Login Card */}
        <Card
          style={{
            background: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.3)',
            borderRadius: 20,
            padding: 'clamp(24px, 5vw, 36px)',
            boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
          }}
        >
          <h2
            style={{
              margin: '0 0 6px',
              fontSize: 22,
              fontFamily: 'DM Serif Display, serif',
              color: 'var(--color-ink)',
            }}
          >
            Welcome Back
          </h2>
          <p style={{ margin: '0 0 24px', color: 'var(--color-muted)', fontSize: 14 }}>
            Sign in to access your print shop dashboard
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 16 }}>
            <div>
              <label className="form-label" style={{ color: 'var(--color-muted)' }}>
                Username
              </label>
              <div style={{ position: 'relative' }}>
                <User
                  size={16}
                  style={{
                    position: 'absolute',
                    left: 12,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--color-muted)',
                    pointerEvents: 'none',
                  }}
                />
                <input
                  className="form-input"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  required
                  style={{ paddingLeft: 36 }}
                />
              </div>
            </div>

            <div>
              <label className="form-label" style={{ color: 'var(--color-muted)' }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock
                  size={16}
                  style={{
                    position: 'absolute',
                    left: 12,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--color-muted)',
                    pointerEvents: 'none',
                  }}
                />
                <input
                  className="form-input"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  style={{ paddingLeft: 36, paddingRight: 40 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: 10,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--color-muted)',
                    padding: 4,
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div
                style={{
                  background: 'var(--color-danger-light)',
                  color: 'var(--color-danger)',
                  padding: '10px 14px',
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <span style={{ fontSize: 16 }}>⚠</span>
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={submitting}
              size="md"
              style={{
                width: '100%',
                marginTop: 4,
                padding: '12px',
                fontSize: 15,
                borderRadius: 10,
              }}
            >
              {submitting ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
        </Card>

        <p
          style={{
            textAlign: 'center',
            color: 'rgba(255,255,255,0.5)',
            fontSize: 12,
            marginTop: 24,
          }}
        >
          SmartPrint Business System v1.0 · Secure Operations Management
        </p>
      </div>
    </div>
  );
}


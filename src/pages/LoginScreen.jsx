import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function LoginScreen() {
  const navigate = useNavigate();
  const { login, loginWithPin, failedAttempts, lockoutUntil, userName } = useAuth();
  const [mode, setMode] = useState('password');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pin, setPin] = useState('');
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Load remembered email on mount
  useEffect(() => {
    const remembered = localStorage.getItem('digilocker_remembered_email');
    if (remembered) {
      setEmail(remembered);
      setRemember(true);
    }
  }, []);

  // Lock check - calculate directly to avoid ESLint warning
  const isLocked = !!(lockoutUntil && Date.now() < lockoutUntil);
  const lockMins = isLocked ? Math.ceil((lockoutUntil - Date.now()) / 60000) : 0;

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    if (isLocked) return setError(`Account locked for ${lockMins} more minutes.`);
    setLoading(true);

    let result;
    if (mode === 'password') {
      if (!email.trim() || !password) {
        setLoading(false);
        return setError('Email and password required');
      }
      // Pass both email and password to login
      result = await login(email.trim(), password);
      if (result.success && remember) {
        localStorage.setItem('digilocker_remembered_email', email.trim());
      } else if (!remember) {
        localStorage.removeItem('digilocker_remembered_email');
      }
    } else {
      if (!pin) {
        setLoading(false);
        return setError('PIN required');
      }
      result = await loginWithPin(pin);
    }

    setLoading(false);

    if (result.success) {
      toast.success(`Welcome back, ${result.userName || userName || ''}! 👋`);
      navigate('/', { replace: true });
    } else {
      setError(result.error);
    }
  };

  const inputStyle = {
    width: '100%',
    background: '#F8FAFC',
    border: '1.5px solid #E2E8F0',
    borderRadius: 14,
    padding: '12px 14px',
    fontSize: 14,
    color: '#0F172A',
    fontFamily: 'Inter, sans-serif',
    outline: 'none',
    transition: 'border-color 0.2s',
  };

  const labelStyle = {
    fontSize: 11,
    fontWeight: 700,
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    display: 'block',
    marginBottom: 6,
  };

  return (
    <div style={{ minHeight: '100vh', background: '#fff', display: 'flex', flexDirection: 'column' }}
         className="dark:bg-slate-900">

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12,
                    padding: '20px 20px 16px' }}>
        <button
          onClick={() => navigate('/auth')}
          style={{ width: 38, height: 38, background: '#F8FAFC',
                   border: '1px solid #E2E8F0', borderRadius: 12,
                   display: 'flex', alignItems: 'center', justifyContent: 'center',
                   cursor: 'pointer', flexShrink: 0 }}
          className="dark:bg-slate-800 dark:border-slate-600">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M11 4L6 9l5 5" stroke="#64748B" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0F172A',
                       fontFamily: "'Plus Jakarta Sans', sans-serif", margin: 0 }}
              className="dark:text-white">
            Welcome Back!
          </h2>
          <p style={{ fontSize: 11, color: '#94A3B8', marginTop: 2, marginBottom: 0 }}>
            Unlock your vault to continue
          </p>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column',
                    padding: '0 20px 32px', gap: 20, overflowY: 'auto' }}>

        {/* Lock icon */}
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 8 }}>
          <div style={{ width: 60, height: 60, background: '#EFF6FF',
                        borderRadius: 18, display: 'flex',
                        alignItems: 'center', justifyContent: 'center',
                        border: '1px solid #DBEAFE' }}
               className="dark:bg-blue-900/30 dark:border-blue-800">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <path d="M14 3C10.5 3 8 5.5 8 9v2H6v13h16V11h-2V9c0-3.5-2.5-6-6-6zm0 3c1.9 0 3 1.1 3 3v2H11V9c0-1.9 1.1-3 3-3zm0 9a2 2 0 110 4 2 2 0 010-4z"
                    fill="#2563EB"/>
            </svg>
          </div>
        </div>

        {/* Mode Tabs */}
        <div style={{ display: 'flex', gap: 6, background: '#F1F5F9',
                      borderRadius: 14, padding: 4 }}>
          {[
            { key: 'password', label: '🔑 Password' },
            { key: 'pin',      label: '🔢 PIN' },
          ].map(t => (
            <button
              key={t.key}
              onClick={() => { setMode(t.key); setError(''); }}
              style={{
                flex: 1, padding: '9px', borderRadius: 11,
                fontSize: 13, fontWeight: 700, cursor: 'pointer',
                border: 'none',
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                background: mode === t.key ? '#fff' : 'transparent',
                color: mode === t.key ? '#2563EB' : '#64748B',
                boxShadow: mode === t.key ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                transition: 'all 0.25s',
              }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Error message */}
        {error && (
          <div style={{ background: '#FEF2F2', color: '#B91C1C',
                        border: '1px solid #FCA5A5', borderRadius: 12,
                        padding: '10px 14px', fontSize: 13, fontWeight: 500 }}>
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {mode === 'password' ? (
            <>
              {/* Email */}
              <div>
                <label style={labelStyle}>Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = '#2563EB'}
                  onBlur={e => e.target.style.borderColor = '#E2E8F0'}
                />
              </div>

              {/* Password */}
              <div>
                <label style={labelStyle}>Master Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = '#2563EB'}
                  onBlur={e => e.target.style.borderColor = '#E2E8F0'}
                />
              </div>

              {/* Remember me */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input
                  type="checkbox"
                  id="remember"
                  checked={remember}
                  onChange={e => setRemember(e.target.checked)}
                  style={{ width: 16, height: 16, accentColor: '#2563EB' }}
                />
                <label htmlFor="remember"
                       style={{ fontSize: 13, color: '#64748B', cursor: 'pointer' }}>
                  Remember email
                </label>
              </div>
            </>
          ) : (
            /* PIN input */
            <div>
              <label style={labelStyle}>Backup PIN</label>
              <input
                type="password"
                value={pin}
                onChange={e => setPin(e.target.value)}
                placeholder="••••"
                maxLength={6}
                inputMode="numeric"
                style={{ ...inputStyle, fontSize: 24, letterSpacing: 12, textAlign: 'center' }}
                onFocus={e => e.target.style.borderColor = '#2563EB'}
                onBlur={e => e.target.style.borderColor = '#E2E8F0'}
              />
            </div>
          )}

          {/* Failed attempts warning */}
          {failedAttempts > 0 && !isLocked && (
            <p style={{ fontSize: 12, color: '#EF4444', fontWeight: 600,
                        textAlign: 'center', margin: 0 }}>
              ⚠️ {5 - failedAttempts} attempts remaining before lockout
            </p>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading || isLocked}
            style={{
              background: loading || isLocked ? '#93C5FD' : '#2563EB',
              color: '#fff', border: 'none', borderRadius: 16,
              padding: '15px', fontSize: 15, fontWeight: 700,
              cursor: loading || isLocked ? 'not-allowed' : 'pointer',
              width: '100%',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              transition: 'background 0.2s, transform 0.1s',
            }}
            onMouseDown={e => { if (!loading && !isLocked) e.target.style.transform = 'scale(0.98)'; }}
            onMouseUp={e => e.target.style.transform = 'scale(1)'}
          >
            {loading ? 'Unlocking...' :
             isLocked ? `🔒 Locked (${lockMins} min)` :
             'Unlock Vault 🔓'}
          </button>
        </form>

        {/* Forgot Password */}
        {mode === 'password' && (
          <div style={{ textAlign: 'center' }}>
            <span
              onClick={() => navigate('/forgot')}
              style={{ fontSize: 13, color: '#2563EB', fontWeight: 600,
                       cursor: 'pointer', textDecoration: 'underline' }}>
              Forgot Password?
            </span>
          </div>
        )}

        {/* Register link */}
        <p style={{ fontSize: 13, color: '#64748B', textAlign: 'center', margin: 0 }}>
          New user?{' '}
          <span
            onClick={() => navigate('/register')}
            style={{ color: '#2563EB', fontWeight: 700, cursor: 'pointer' }}>
            Create account
          </span>
        </p>
      </div>
    </div>
  );
}
import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const REDIRECT_SECONDS = 3;

export default function RegisterSuccess() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const userName  = location.state?.userName || 'User';
  const [count, setCount] = useState(REDIRECT_SECONDS);

  useEffect(() => {
    // Har second countdown ghata o
    const interval = setInterval(() => {
      setCount(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          navigate('/login', { replace: true });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [navigate]);

  const goLogin = () => navigate('/login', { replace: true });

  // Progress: 0 → 1 over REDIRECT_SECONDS
  const progress = ((REDIRECT_SECONDS - count) / REDIRECT_SECONDS) * 100;

  return (
    <div style={{
      minHeight: '100vh',
      background: '#fff',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '32px 24px',
      fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
    }}
    className="dark:bg-slate-900">

      {/* ── Animated check circle ── */}
      <div style={{
        width: 96, height: 96,
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #10B981, #059669)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 28,
        boxShadow: '0 8px 32px rgba(16,185,129,0.35)',
        animation: 'popIn 0.5s cubic-bezier(0.34,1.56,0.64,1)',
      }}>
        <svg width="46" height="46" viewBox="0 0 46 46" fill="none">
          <path
            d="M10 23L19 32L36 14"
            stroke="#fff"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ animation: 'drawCheck 0.4s 0.3s ease forwards',
                     strokeDasharray: 40, strokeDashoffset: 40 }}
          />
        </svg>
      </div>

      {/* ── Heading ── */}
      <h1 style={{
        fontSize: 26, fontWeight: 800, color: '#0F172A',
        textAlign: 'center', marginBottom: 10, lineHeight: 1.25,
      }}
      className="dark:text-white">
        Registration Successful! 🎉
      </h1>

      {/* ── Welcome message ── */}
      <p style={{
        fontSize: 15, color: '#64748B', textAlign: 'center',
        lineHeight: 1.6, marginBottom: 36, maxWidth: 300,
      }}
      className="dark:text-slate-400">
        Welcome, <strong style={{ color: '#2563EB' }}>{userName}</strong>!
        <br/>Your vault has been created successfully.
        <br/>Please login to continue.
      </p>

      {/* ── Countdown ring ── */}
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        {/* Progress bar */}
        <div style={{
          width: 220, height: 6,
          background: '#E2E8F0', borderRadius: 3,
          overflow: 'hidden', margin: '0 auto 12px',
        }}>
          <div style={{
            height: '100%',
            width: `${progress}%`,
            background: 'linear-gradient(90deg, #2563EB, #10B981)',
            borderRadius: 3,
            transition: 'width 0.9s linear',
          }} />
        </div>
        <p style={{ fontSize: 13, color: '#94A3B8', margin: 0 }}>
          Redirecting to login in{' '}
          <strong style={{ color: '#2563EB', fontSize: 15 }}>{count}</strong>
          {' '}second{count !== 1 ? 's' : ''}...
        </p>
      </div>

      {/* ── Login now button ── */}
      <button
        onClick={goLogin}
        style={{
          background: '#2563EB',
          color: '#fff',
          border: 'none',
          borderRadius: 16,
          padding: '15px 40px',
          fontSize: 15,
          fontWeight: 700,
          cursor: 'pointer',
          width: '100%',
          maxWidth: 320,
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          boxShadow: '0 4px 16px rgba(37,99,235,0.3)',
          transition: 'transform 0.15s, box-shadow 0.15s',
        }}
        onMouseDown={e => { e.currentTarget.style.transform = 'scale(0.97)'; }}
        onMouseUp={e => { e.currentTarget.style.transform = 'scale(1)'; }}
      >
        Login Now →
      </button>

      {/* ── Info note ── */}
      <p style={{
        fontSize: 12, color: '#CBD5E1', textAlign: 'center',
        marginTop: 20, maxWidth: 260,
      }}>
        💡 Remember your Master Password and Backup PIN — they cannot be recovered if lost.
      </p>

      <style>{`
        @keyframes popIn {
          from { transform: scale(0.5); opacity: 0; }
          to   { transform: scale(1);   opacity: 1; }
        }
        @keyframes drawCheck {
          to { stroke-dashoffset: 0; }
        }
      `}</style>
    </div>
  );
}
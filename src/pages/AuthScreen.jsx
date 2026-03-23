import { useNavigate } from 'react-router-dom';

const features = [
  { icon: '🔐', label: 'AES-256 Encrypted', bg: '#EFF6FF' },
  { icon: '📱', label: 'Works 100% Offline', bg: '#F0FDF4' },
  { icon: '👨‍👩‍👧', label: 'All Family Members', bg: '#FAF5FF' },
];

export default function AuthScreen() {
  const navigate = useNavigate();

  return (
    <div className="page-enter min-h-screen bg-white dark:bg-slate-900 flex flex-col safe-top safe-bottom">

      {/* Top section */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pt-10">

        {/* Logo */}
        <div className="stagger-1" style={{
          width: 72, height: 72,
          background: '#EFF6FF',
          border: '1px solid #DBEAFE',
          borderRadius: 20,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 20,
        }}>
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <path d="M16 3C12.5 3 10 5.5 10 9v2H8v16h16V11h-2V9c0-3.5-2.5-6-6-6zm0 3c1.9 0 3 1.1 3 3v2H13V9c0-1.9 1.1-3 3-3zm0 10a2 2 0 110 4 2 2 0 010-4z"
                  fill="#2563EB"/>
          </svg>
        </div>

        {/* Title */}
        <div className="stagger-2 text-center mb-6">
          <h1 style={{
            fontSize: 26, fontWeight: 800,
            color: '#0F172A', letterSpacing: -0.5,
            fontFamily: "'Plus Jakarta Sans', sans-serif",
          }}
          className="dark:text-white">
            DigiLocker by OM
          </h1>
          <p style={{ fontSize: 13, color: '#64748B', marginTop: 8, lineHeight: 1.6 }}
             className="dark:text-slate-400">
            Store all your family documents<br/>safely & privately
          </p>
        </div>

        {/* Features */}
        <div className="w-full max-w-xs flex flex-col gap-3 mb-8">
          {features.map((f, i) => (
            <div key={i}
                 className={`stagger-${i + 3}`}
                 style={{
                   display: 'flex', alignItems: 'center', gap: 12,
                   padding: '10px 14px',
                   background: '#F8FAFC',
                   border: '1px solid #F1F5F9',
                   borderRadius: 14,
                 }}>
              <div style={{
                width: 34, height: 34, borderRadius: 10,
                background: f.bg,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 16, flexShrink: 0,
              }}>
                {f.icon}
              </div>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#334155' }}
                    className="dark:text-slate-300">
                {f.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Buttons */}
      <div className="px-6 pb-8 flex flex-col gap-3 stagger-6">
        <button
          onClick={() => navigate('/register')}
          className="btn-press w-full"
          style={{
            background: '#2563EB',
            color: '#fff',
            border: 'none',
            borderRadius: 16,
            padding: '15px',
            fontSize: 15,
            fontWeight: 700,
            cursor: 'pointer',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
          }}>
          Create Account
        </button>
        <button
          onClick={() => navigate('/login')}
          className="btn-press w-full"
          style={{
            background: '#fff',
            color: '#2563EB',
            border: '2px solid #BFDBFE',
            borderRadius: 16,
            padding: '14px',
            fontSize: 15,
            fontWeight: 700,
            cursor: 'pointer',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
          }}>
          I have an account
        </button>
        <p style={{ fontSize: 11, color: '#94A3B8', textAlign: 'center', marginTop: 4 }}>
          🔒 Your data never leaves your device
        </p>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

function getStrength(p) {
  if (!p) return { score: 0, label: '', color: '' };
  let s = 0;
  if (p.length >= 8) s++;
  if (/[A-Z]/.test(p)) s++;
  if (/[0-9]/.test(p)) s++;
  if (/[^A-Za-z0-9]/.test(p)) s++;
  const map = [
    { label: '', color: '' },
    { label: 'Weak', color: '#EF4444' },
    { label: 'Fair', color: '#F59E0B' },
    { label: 'Good', color: '#3B82F6' },
    { label: 'Strong', color: '#10B981' },
  ];
  return { score: s, ...map[s] };
}

export default function RegisterScreen() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '', pin: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const strength = getStrength(form.password);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.name.trim()) return setError('Name is required');
    if (!form.email.trim()) return setError('Email is required');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return setError('Invalid email format');
    if (form.password.length < 8) return setError('Password must be at least 8 characters');
    if (form.password !== form.confirm) return setError('Passwords do not match');
    if (form.pin.length < 4 || form.pin.length > 6) return setError('PIN must be 4-6 digits');

    setLoading(true);
    const result = await register(form.name, form.email, form.password, form.pin);
    setLoading(false);

    if (result.success) {
      toast.success('Vault created successfully! 🎉');
      navigate('/', { replace: true });
    } else if (result.alreadyExists) {
      setError(result.error);
    } else {
      setError(result.error || 'Something went wrong');
    }
  };

  return (
    <div className="page-enter min-h-screen bg-white dark:bg-slate-900 flex flex-col safe-top safe-bottom">

      {/* Header */}
      <div className="flex items-center gap-3 px-5 pt-5 pb-4 stagger-1">
        <button
          onClick={() => navigate('/auth')}
          style={{
            width: 38, height: 38,
            background: '#F8FAFC', border: '1px solid #E2E8F0',
            borderRadius: 12, display: 'flex', alignItems: 'center',
            justifyContent: 'center', cursor: 'pointer', flexShrink: 0,
          }}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M11 4L6 9l5 5" stroke="#64748B" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0F172A',
                       fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              className="dark:text-white">
            Create Your Vault
          </h2>
          <p style={{ fontSize: 11, color: '#94A3B8', marginTop: 1 }}>
            Set up your secure document locker
          </p>
        </div>
      </div>

      {/* Progress dots */}
      <div className="flex justify-center gap-2 mb-4 stagger-2">
        {[0,1,2].map(i => (
          <div key={i} style={{
            width: i === 0 ? 20 : 6, height: 6,
            borderRadius: 3,
            background: i === 0 ? '#2563EB' : '#E2E8F0',
            transition: 'all 0.3s',
          }} />
        ))}
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}
            className="flex-1 overflow-y-auto px-5 flex flex-col gap-4 pb-8">

        {error && (
          <div style={{
            background: '#FEF2F2', color: '#B91C1C',
            border: '1px solid #FCA5A5',
            borderRadius: 12, padding: '10px 14px',
            fontSize: 13, fontWeight: 500,
          }}
          className="stagger-1">
            {error}
            {error.includes('already exists') && (
              <button type="button"
                onClick={() => navigate('/login')}
                style={{ display: 'block', marginTop: 6, color: '#2563EB',
                         fontSize: 12, fontWeight: 700, background: 'none',
                         border: 'none', cursor: 'pointer', padding: 0 }}>
                Go to Login →
              </button>
            )}
          </div>
        )}

        {[
          { key: 'name',     label: 'Full Name',        type: 'text',     placeholder: 'Your full name' },
          { key: 'email',    label: 'Email Address',     type: 'email',    placeholder: 'your@email.com' },
          { key: 'password', label: 'Master Password',   type: 'password', placeholder: 'Min 8 characters' },
          { key: 'confirm',  label: 'Confirm Password',  type: 'password', placeholder: 'Repeat password' },
          { key: 'pin',      label: 'Backup PIN (4-6 digits)', type: 'password', placeholder: 'e.g. 1234' },
        ].map((f, i) => (
          <div key={f.key} className={`stagger-${i + 2}`}>
            <label style={{
              fontSize: 11, fontWeight: 700, color: '#64748B',
              textTransform: 'uppercase', letterSpacing: '0.5px',
              display: 'block', marginBottom: 6,
            }}>
              {f.label}
            </label>
            <input
              type={f.type}
              placeholder={f.placeholder}
              value={form[f.key]}
              onChange={e => set(f.key, e.target.value)}
              style={{
                width: '100%',
                background: '#F8FAFC', border: '1.5px solid #E2E8F0',
                borderRadius: 14, padding: '12px 14px',
                fontSize: 14, color: '#0F172A',
                fontFamily: 'Inter, sans-serif', outline: 'none',
                transition: 'border-color 0.2s, background 0.2s',
              }}
              className="dark:bg-slate-800 dark:border-slate-600 dark:text-white"
              onFocus={e => { e.target.style.borderColor = '#2563EB'; e.target.style.background = '#fff'; }}
              onBlur={e => { e.target.style.borderColor = '#E2E8F0'; e.target.style.background = '#F8FAFC'; }}
            />
            {/* Password strength */}
            {f.key === 'password' && form.password && (
              <div style={{ marginTop: 8 }}>
                <div style={{ height: 4, background: '#E2E8F0', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', borderRadius: 2,
                    width: `${strength.score * 25}%`,
                    background: strength.color,
                    transition: 'width 0.4s, background 0.3s',
                  }} />
                </div>
                <span style={{ fontSize: 11, color: strength.color, fontWeight: 600, marginTop: 3, display: 'block' }}>
                  {strength.label}
                </span>
              </div>
            )}
          </div>
        ))}

        <button type="submit" disabled={loading}
                className="btn-press"
                style={{
                  background: loading ? '#93C5FD' : '#2563EB',
                  color: '#fff', border: 'none',
                  borderRadius: 16, padding: '15px',
                  fontSize: 15, fontWeight: 700,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  marginTop: 4,
                }}>
          {loading ? 'Creating Vault...' : 'Create Vault 🔐'}
        </button>

        <p style={{ fontSize: 13, color: '#64748B', textAlign: 'center' }}>
          Already registered?{' '}
          <span style={{ color: '#2563EB', fontWeight: 700, cursor: 'pointer' }}
                onClick={() => navigate('/login')}>
            Login here
          </span>
        </p>
      </form>
    </div>
  );
}

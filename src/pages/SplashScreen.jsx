import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function SplashScreen() {
  const navigate = useNavigate();
  const { isSetupComplete, isUnlocked, isLoading } = useAuth();
  const [dot, setDot] = useState(0);

  // Animate dots
  useEffect(() => {
    const t = setInterval(() => setDot(d => (d + 1) % 3), 400);
    return () => clearInterval(t);
  }, []);

  // Navigate after 2.5s
  useEffect(() => {
    if (isLoading) return;
    const timer = setTimeout(() => {
      if (!isSetupComplete) {
        navigate('/auth', { replace: true });
      } else if (isUnlocked) {
        navigate('/', { replace: true });
      } else {
        navigate('/login', { replace: true });
      }
    }, 2500);
    return () => clearTimeout(timer);
  }, [isLoading, isSetupComplete, isUnlocked, navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center safe-top"
         style={{ background: 'linear-gradient(160deg, #1e40af 0%, #4f46e5 50%, #7c3aed 100%)' }}>

      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-white/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-purple-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '0.5s' }} />
        <div className="absolute top-1/2 right-1/3 w-32 h-32 bg-blue-400/10 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>
      <div className="animate-scale-in"
           style={{ animationDelay: '0s' }}>
        <div style={{
          width: 80, height: 80,
          background: 'rgba(255,255,255,0.15)',
          border: '1px solid rgba(255,255,255,0.25)',
          borderRadius: 22,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 20,
          backdropFilter: 'blur(10px)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
        }}>
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
            <path d="M20 4C15.5 4 12 7.5 12 12v3H9v21h22V15h-3v-3c0-4.5-3.5-8-8-8zm0 4c2.8 0 4 2.2 4 4v3H16v-3c0-1.8 1.2-4 4-4zm0 13a3 3 0 110 6 3 3 0 010-6z"
                  fill="white"/>
          </svg>
        </div>
      </div>

      {/* App Name */}
      <div className="stagger-1 text-center">
        <h1 style={{
          fontSize: 34,
          fontWeight: 800,
          color: '#fff',
          letterSpacing: -1,
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          lineHeight: 1.1,
          textShadow: '0 2px 10px rgba(0,0,0,0.2)',
        }}>
          DigiLocker
        </h1>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.75)', marginTop: 6, fontWeight: 600 }}>
          by OM
        </p>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', marginTop: 4 }}>
          Your Private Document Vault
        </p>
      </div>

      {/* Animated dots */}
      <div className="stagger-3" style={{ display: 'flex', gap: 8, marginTop: 48 }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            width: dot === i ? 22 : 8,
            height: 8,
            borderRadius: 4,
            background: dot === i ? '#fff' : 'rgba(255,255,255,0.35)',
            transition: 'all 0.35s cubic-bezier(0.34,1.56,0.64,1)',
          }} />
        ))}
      </div>

      {/* Bottom tagline */}
      <div className="stagger-5" style={{
        position: 'absolute', bottom: 40,
        fontSize: 11, color: 'rgba(255,255,255,0.35)',
        letterSpacing: 1, textTransform: 'uppercase',
      }}>
        Secured with AES-256 Encryption
      </div>
    </div>
  );
}

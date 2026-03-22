import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function SplashScreen() {
  const [fadeOut, setFadeOut] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Start fade out after 1.8 seconds (before 2s complete)
    const fadeTimer = setTimeout(() => {
      setFadeOut(true);
    }, 1800);

    // Navigate to auth after 2 seconds
    const navigateTimer = setTimeout(() => {
      navigate('/auth');
    }, 2000);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(navigateTimer);
    };
  }, [navigate]);

  return (
    <div 
      className={`min-h-screen w-full flex flex-col items-center justify-center transition-all duration-500 ${
        fadeOut ? 'opacity-0' : 'opacity-100'
      }`}
      style={{
        backgroundColor: '#1a73e8',
        background: 'linear-gradient(135deg, #1a73e8 0%, #0d47a1 100%)',
      }}
    >
      {/* Animated Logo Container */}
      <div className="relative mb-8">
        {/* Glow effect */}
        <div className="absolute inset-0 bg-white/20 blur-2xl rounded-full scale-150 animate-pulse"></div>
        
        {/* Icon */}
        <div className="relative w-24 h-24 bg-white/10 backdrop-blur-sm rounded-3xl flex items-center justify-center border border-white/20">
          <svg 
            className="w-14 h-14 text-white" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" 
            />
          </svg>
        </div>
      </div>

      {/* App Name */}
      <h1 
        className="text-4xl font-bold text-white mb-2 tracking-wide"
        style={{ textShadow: '0 2px 10px rgba(0,0,0,0.2)' }}
      >
        DigiLocker
      </h1>

      {/* Subtitle */}
      <p className="text-white/80 text-lg font-medium">
        by OM
      </p>

      {/* Loading indicator */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2">
        <div className="flex gap-1">
          <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    </div>
  );
}

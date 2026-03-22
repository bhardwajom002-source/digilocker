import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function SplashScreen() {
  const [fadeOut, setFadeOut] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    // Simulate loading progress
    const progressInterval = setInterval(() => {
      setLoadingProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 200);

    // Start fade out after 2.5 seconds
    const fadeTimer = setTimeout(() => {
      setFadeOut(true);
    }, 2500);

    // Navigate to auth after 3 seconds
    const navigateTimer = setTimeout(() => {
      navigate('/auth');
    }, 3000);

    return () => {
      clearInterval(progressInterval);
      clearTimeout(fadeTimer);
      clearTimeout(navigateTimer);
    };
  }, [navigate]);

  return (
    <div 
      className={`min-h-screen w-full flex flex-col items-center justify-center transition-all duration-700 ${
        fadeOut ? 'opacity-0 scale-110' : 'opacity-100 scale-100'
      }`}
      style={{
        backgroundColor: '#1a73e8',
        background: 'linear-gradient(135deg, #1a73e8 0%, #0d47a1 50%, #1565c0 100%)',
      }}
    >
      {/* Animated background patterns */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Animated Logo Container */}
      <div className="relative mb-10">
        {/* Glow effect */}
        <div className="absolute inset-0 bg-white/30 blur-3xl rounded-full scale-150 animate-pulse"></div>
        
        {/* Icon with animation */}
        <div className="relative w-28 h-28 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center border border-white/30 shadow-2xl animate-float">
          <svg 
            className="w-16 h-16 text-white drop-shadow-lg" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={1.5} 
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" 
            />
          </svg>
        </div>
      </div>

      {/* App Name */}
      <h1 
        className="text-5xl font-bold text-white mb-3 tracking-wide relative z-10"
        style={{ 
          textShadow: '0 4px 20px rgba(0,0,0,0.3)',
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}
      >
        DigiLocker
      </h1>

      {/* Subtitle */}
      <p className="text-white/90 text-xl font-medium mb-8 relative z-10">
        by OM
      </p>

      {/* Loading progress bar */}
      <div className="w-48 h-1.5 bg-white/20 rounded-full overflow-hidden mb-4">
        <div 
          className="h-full bg-white rounded-full transition-all duration-300 ease-out"
          style={{ width: `${Math.min(loadingProgress, 100)}%` }}
        ></div>
      </div>

      {/* Loading text */}
      <p className="text-white/60 text-sm">
        {loadingProgress < 30 ? 'Loading...' : 
         loadingProgress < 60 ? 'Preparing your vault...' :
         loadingProgress < 90 ? 'Almost ready...' : 'Welcome!'}
      </p>

      {/* Version */}
      <p className="absolute bottom-8 text-white/40 text-xs">
        Version 1.0.0
      </p>
    </div>
  );
}

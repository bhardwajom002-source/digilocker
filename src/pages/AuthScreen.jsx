import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Sparkles } from 'lucide-react';

export default function AuthScreen() {
  const [isAnimating, setIsAnimating] = useState(false);
  const navigate = useNavigate();

  const handleNavigation = (path) => {
    setIsAnimating(true);
    setTimeout(() => {
      navigate(path);
    }, 300);
  };

  return (
    <div 
      className={`min-h-screen w-full flex flex-col items-center justify-center px-6 py-8 transition-all duration-300 ${
        isAnimating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
      }`}
      style={{ 
        background: 'linear-gradient(180deg, #f8fafc 0%, #e2e8f0 100%)',
        backgroundColor: '#f8fafc'
      }}
    >
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 -left-20 w-60 h-60 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-40 -right-20 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl"></div>
      </div>

      {/* Logo Section */}
      <div className="relative mb-12">
        {/* Background glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 blur-3xl rounded-full scale-125"></div>
        
        {/* Icon */}
        <div className="relative w-24 h-24 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl flex items-center justify-center shadow-2xl border border-white/20">
          <Lock className="w-12 h-12 text-white" />
        </div>
      </div>

      {/* Title */}
      <div className="text-center mb-10">
        <h1 
          className="text-4xl font-bold text-gray-900 mb-2"
          style={{ 
            textShadow: '0 2px 10px rgba(0,0,0,0.05)',
            fontFamily: 'system-ui, -apple-system, sans-serif'
          }}
        >
          DigiLocker
        </h1>
        <p className="text-gray-500 text-lg font-medium mb-1">
          by OM
        </p>
        <p className="text-gray-400 text-sm">
          Your personal digital document vault
        </p>
      </div>

      {/* Card Container */}
      <div 
        className="w-full max-w-sm bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-8"
        style={{ 
          boxShadow: '0 20px 60px -20px rgba(26, 115, 232, 0.25)',
          border: '1px solid rgba(255,255,255,0.8)'
        }}
      >
        {/* Welcome Text */}
        <div className="text-center mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Welcome Back! 👋
          </h2>
          <p className="text-gray-500 text-sm">
            Sign in to access your documents securely
          </p>
        </div>

        {/* Buttons */}
        <div className="space-y-4">
          {/* Login Button */}
          <button
            onClick={() => handleNavigation('/login')}
            className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-2xl transition-all duration-200 hover:scale-[1.02] hover:shadow-lg hover:shadow-blue-500/25 active:scale-[0.98] flex items-center justify-center gap-3"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
            Login
          </button>

          {/* Register Button */}
          <button
            onClick={() => handleNavigation('/register')}
            className="w-full py-4 px-6 bg-white text-indigo-600 font-semibold rounded-2xl transition-all duration-200 hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] flex items-center justify-center gap-3 border-2 border-indigo-100 hover:border-indigo-200"
          >
            <Sparkles className="w-5 h-5" />
            Create Account
          </button>
        </div>

        {/* Features */}
        <div className="mt-8 pt-6 border-t border-gray-100">
          <div className="flex justify-center gap-6 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Secure
            </span>
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Private
            </span>
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
              </svg>
              Offline
            </span>
          </div>
        </div>
      </div>

      {/* Version info */}
      <p className="text-gray-400 text-xs mt-8">
        Version 1.0.0 • DigiLocker by OM
      </p>
    </div>
  );
}

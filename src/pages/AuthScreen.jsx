import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

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
      style={{ backgroundColor: '#f8fafc' }}
    >
      {/* Logo Section */}
      <div className="relative mb-10">
        {/* Background glow */}
        <div className="absolute inset-0 bg-primary/10 blur-2xl rounded-full scale-125"></div>
        
        {/* Icon */}
        <div className="relative w-20 h-20 bg-primary rounded-2xl flex items-center justify-center shadow-lg">
          <svg 
            className="w-12 h-12 text-white" 
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

      {/* Title */}
      <h1 
        className="text-3xl font-bold text-gray-900 mb-2"
        style={{ color: '#1a1a1a' }}
      >
        DigiLocker
      </h1>
      <p className="text-gray-500 mb-10 text-center">
        Your personal digital document vault
      </p>

      {/* Card Container */}
      <div 
        className="w-full max-w-sm bg-white rounded-3xl shadow-xl p-8"
        style={{ 
          boxShadow: '0 10px 40px -10px rgba(26, 115, 232, 0.15)',
          border: '1px solid rgba(26, 115, 232, 0.08)'
        }}
      >
        {/* Welcome Text */}
        <div className="text-center mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Welcome Back!
          </h2>
          <p className="text-gray-500 text-sm">
            Sign in to access your documents
          </p>
        </div>

        {/* Buttons */}
        <div className="space-y-4">
          {/* Login Button */}
          <button
            onClick={() => handleNavigation('/login')}
            className="w-full py-4 px-6 bg-primary text-white font-semibold rounded-2xl transition-all duration-200 hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] flex items-center justify-center gap-3"
            style={{ backgroundColor: '#1a73e8' }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
            Login
          </button>

          {/* Register Button */}
          <button
            onClick={() => handleNavigation('/register')}
            className="w-full py-4 px-6 bg-white text-primary font-semibold rounded-2xl transition-all duration-200 hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] flex items-center justify-center gap-3 border-2"
            style={{ 
              borderColor: '#1a73e8',
              color: '#1a73e8'
            }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
            Register
          </button>
        </div>

        {/* Footer */}
        <p className="text-center text-gray-400 text-xs mt-8">
          Secure • Private • Your Documents
        </p>
      </div>

      {/* Version info */}
      <p className="text-gray-400 text-xs mt-6">
        Version 1.0.0
      </p>
    </div>
  );
}

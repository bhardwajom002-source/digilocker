import { useState } from 'react';
import { Lock, KeyRound, Eye, EyeOff, Shield, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LockScreen() {
  const { unlock, unlockWithPin, userName, failedAttempts, lockoutUntil } = useAuth();
  const [password, setPassword] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState('password');

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!password) {
      setError('Please enter your password');
      return;
    }

    setIsLoading(true);
    const result = await unlock(password);
    setIsLoading(false);

    if (!result.success) {
      setError(result.error);
      setPassword('');
    }
  };

  const handlePinSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (pin.length < 4) {
      setError('Please enter your PIN');
      return;
    }

    setIsLoading(true);
    const result = await unlockWithPin(pin);
    setIsLoading(false);

    if (!result.success) {
      setError(result.error);
      setPin('');
    }
  };

  const isLocked = lockoutUntil && Date.now() < lockoutUntil;
  const remainingTime = lockoutUntil ? Math.ceil((lockoutUntil - Date.now()) / 1000 / 60) : 0;

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-accent/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="card p-8 animate-fade-in">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-primary/30 blur-2xl rounded-full" />
              <div className="w-24 h-24 bg-gradient-to-br from-primary via-primary-500 to-accent rounded-3xl flex items-center justify-center mx-auto mb-5 shadow-2xl shadow-primary/30 animate-float">
                <Shield className="w-12 h-12 text-white" />
              </div>
            </div>
            <h1 className="font-heading text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
              Welcome Back
            </h1>
            <p className="text-slate-500 mt-2 text-lg">
              {userName ? `Hello, ${userName}` : 'Unlock your vault'}
            </p>
          </div>

          {/* Lockout message */}
          {isLocked && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl">
              <p className="text-red-700 text-center font-semibold flex items-center justify-center gap-2">
                <Lock className="w-4 h-4" />
                Too many failed attempts
              </p>
              <p className="text-red-500 text-sm text-center mt-1">
                Please wait {remainingTime} minute(s) before trying again
              </p>
            </div>
          )}

          {/* Mode toggle */}
          <div className="flex mb-6 bg-slate-100 rounded-xl p-1.5">
            <button
              type="button"
              onClick={() => { setMode('password'); setError(''); }}
              className={`flex-1 py-3 px-4 rounded-lg text-sm font-semibold transition-all duration-200 ${
                mode === 'password' 
                  ? 'bg-white text-primary shadow-md' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <KeyRound className="w-4 h-4 inline mr-2" />
              Password
            </button>
            <button
              type="button"
              onClick={() => { setMode('pin'); setError(''); }}
              className={`flex-1 py-3 px-4 rounded-lg text-sm font-semibold transition-all duration-200 ${
                mode === 'pin' 
                  ? 'bg-white text-primary shadow-md' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Lock className="w-4 h-4 inline mr-2" />
              PIN
            </button>
          </div>

          {mode === 'password' ? (
            <form onSubmit={handlePasswordSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Master Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input pr-12"
                    placeholder="Enter your master password"
                    autoComplete="current-password"
                    disabled={isLocked}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full" />
                  {error}
                </div>
              )}

              {failedAttempts > 0 && !isLocked && (
                <p className="text-sm text-amber-600 text-center flex items-center justify-center gap-2">
                  <div className="w-2 h-2 bg-amber-500 rounded-full" />
                  {5 - failedAttempts} attempts remaining
                </p>
              )}

              <button
                type="submit"
                disabled={isLoading || isLocked}
                className="btn btn-primary w-full py-4 text-base shadow-lg shadow-primary/25"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Unlock Vault
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handlePinSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Backup PIN
                </label>
                <input
                  type="password"
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="input text-center text-3xl tracking-[0.6em] font-mono"
                  placeholder="••••"
                  maxLength={6}
                  inputMode="numeric"
                  autoComplete="off"
                  disabled={isLocked}
                />
              </div>

              {error && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full" />
                  {error}
                </div>
              )}

              {failedAttempts > 0 && !isLocked && (
                <p className="text-sm text-amber-600 text-center flex items-center justify-center gap-2">
                  <div className="w-2 h-2 bg-amber-500 rounded-full" />
                  {5 - failedAttempts} attempts remaining
                </p>
              )}

              <button
                type="submit"
                disabled={isLoading || isLocked}
                className="btn btn-primary w-full py-4 text-base shadow-lg shadow-primary/25"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <KeyRound className="w-5 h-5" />
                    Unlock with PIN
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Wifi, KeyRound, ArrowRight, Lock, CheckCircle2, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const steps = [
  {
    icon: Shield,
    title: 'Military-Grade Encryption',
    description: 'Your documents are secured with AES-256 encryption. Only you hold the key.',
    color: 'from-indigo-500 to-purple-500',
  },
  {
    icon: Wifi,
    title: 'Works Offline',
    description: 'Access your documents anywhere, anytime. No internet required after initial setup.',
    color: 'from-cyan-500 to-blue-500',
  },
  {
    icon: KeyRound,
    title: 'Your Password, Your Rules',
    description: 'Set your master password. Without it, nothing can be accessed. Total privacy.',
    color: 'from-amber-500 to-orange-500',
  },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const { setup } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [showSetup, setShowSetup] = useState(false);
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pin, setPin] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setShowSetup(true);
    }
  };

  const handleSetup = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (pin.length < 4 || pin.length > 6) {
      setError('PIN must be 4-6 digits');
      return;
    }

    setIsLoading(true);
    const result = await setup(password, pin, name);
    setIsLoading(false);

    if (result.success) {
      navigate('/');
    } else {
      setError(result.error || 'Setup failed');
    }
  };

  if (showSetup) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
        {/* Background decoration */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 -left-20 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-accent/10 rounded-full blur-3xl" />
        </div>

        <div className="w-full max-w-md relative z-10">
          <div className="card p-8 animate-fade-in">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-primary to-accent rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/30">
                <Lock className="w-10 h-10 text-white" />
              </div>
              <h1 className="font-heading text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                Create Your Vault
              </h1>
              <p className="text-slate-500 mt-2">
                Set up your master password and PIN to secure your documents
              </p>
            </div>

            <form onSubmit={handleSetup} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Your Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input"
                  placeholder="Enter your name"
                  autoComplete="name"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Master Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input"
                  placeholder="Create a strong password"
                  autoComplete="new-password"
                />
                <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  Must be at least 8 characters. This cannot be recovered!
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="input"
                  placeholder="Confirm your password"
                  autoComplete="new-password"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Backup PIN (4-6 digits)
                </label>
                <input
                  type="password"
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="input text-center text-2xl tracking-[0.5em] font-mono"
                  placeholder="••••"
                  maxLength={6}
                  inputMode="numeric"
                  autoComplete="off"
                />
              </div>

              {error && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full" />
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="btn btn-primary w-full py-4 text-base"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Create Vault
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-bg flex flex-col">
      {/* Progress indicator */}
      <div className="pt-8 px-6">
        <div className="flex items-center justify-center gap-2">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                index <= currentStep
                  ? 'w-8 bg-primary'
                  : 'w-4 bg-slate-300'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-sm">
          {/* Icon with glow */}
          <div className="text-center mb-10">
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-primary/30 blur-2xl rounded-full" />
              <div className={`w-28 h-28 bg-gradient-to-br ${steps[currentStep].color} rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl animate-float`}>
                {currentStep === 0 && <Shield className="w-14 h-14 text-white" />}
                {currentStep === 1 && <Wifi className="w-14 h-14 text-white" />}
                {currentStep === 2 && <KeyRound className="w-14 h-14 text-white" />}
              </div>
            </div>
            <h1 className="font-heading text-3xl font-bold text-slate-900 mb-2 animate-fade-in">
              DigiLocker by OM
            </h1>
            <p className="text-slate-500 text-lg">
              Your Family's Private Document Vault
            </p>
          </div>

          {/* Feature cards */}
          <div className="space-y-4">
            {steps.map((step, index) => (
              <div
                key={index}
                className={`card p-5 transition-all duration-500 ${
                  index === currentStep
                    ? 'opacity-100 scale-100'
                    : 'opacity-40 scale-95'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-14 h-14 bg-gradient-to-br ${step.color} rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg`}>
                    <step.icon className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-heading font-semibold text-slate-900 text-lg">{step.title}</h3>
                    <p className="text-slate-500 mt-1 text-sm leading-relaxed">{step.description}</p>
                  </div>
                  {index < currentStep && (
                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-1" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="p-6 bg-white/80 backdrop-blur-sm border-t border-slate-200/50">
        <button
          onClick={handleNext}
          className="btn btn-primary w-full py-4 text-base shadow-lg shadow-primary/25"
        >
          {currentStep === steps.length - 1 ? (
            <>
              Get Started
              <Sparkles className="w-5 h-5" />
            </>
          ) : (
            <>
              Continue
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}

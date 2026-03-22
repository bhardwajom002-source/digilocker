import { useNavigate } from 'react-router-dom';
import { Bell, Lock, Sun, Moon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

export default function TopBar() {
  const navigate = useNavigate();
  const { lock, userName } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const handleLock = async () => {
    await lock();
    navigate('/lock');
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-6">
      {/* Mobile Logo */}
      <div className="lg:hidden flex items-center gap-2">
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
          <Lock className="w-4 h-4 text-white" />
        </div>
        <span className="font-heading font-bold text-slate-900">DigiLocker</span>
      </div>

      {/* Spacer for desktop */}
      <div className="hidden lg:block" />

      {/* Right side actions */}
      <div className="flex items-center gap-2">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
          title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
        >
          {theme === 'light' ? (
            <Moon className="w-5 h-5" />
          ) : (
            <Sun className="w-5 h-5" />
          )}
        </button>

        {/* Notifications */}
        <button
          onClick={() => navigate('/notifications')}
          className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors relative"
          title="Notifications"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-danger rounded-full" />
        </button>

        {/* Lock button */}
        <button
          onClick={handleLock}
          className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
          title="Lock app"
        >
          <Lock className="w-5 h-5" />
        </button>

        {/* User avatar */}
        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-medium text-sm ml-1">
          {userName?.charAt(0)?.toUpperCase() || 'U'}
        </div>
      </div>
    </header>
  );
}

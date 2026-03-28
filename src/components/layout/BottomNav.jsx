import { NavLink } from 'react-router-dom';
import { Home, Users, Upload, Bell, Settings } from 'lucide-react';

const navItems = [
  { path: '/', icon: Home, label: 'Home' },
  { path: '/family', icon: Users, label: 'Family' },
  { path: '/upload', icon: Upload, label: 'Upload' },
  { path: '/notifications', icon: Bell, label: 'Alerts' },
  { path: '/settings', icon: Settings, label: 'Settings' },
];

export default function BottomNav() {
  return (
    <div className="bg-white/95 backdrop-blur-sm border-t border-slate-200/60 safe-area-bottom">
      <nav className="flex justify-around items-center h-16">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center flex-1 h-full transition-all duration-200 ${
                isActive
                  ? 'text-primary'
                  : 'text-slate-400 hover:text-slate-600'
              }`
            }
          >
            <item.icon className="w-5 h-5" />
            <span className="text-xs mt-1 font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}

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
    <div className="bg-white border-t border-slate-200 safe-area-bottom">
      <nav className="flex justify-around items-center h-16">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                isActive
                  ? 'text-primary'
                  : 'text-slate-500'
              }`
            }
          >
            <item.icon className="w-6 h-6" />
            <span className="text-xs mt-1 font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}

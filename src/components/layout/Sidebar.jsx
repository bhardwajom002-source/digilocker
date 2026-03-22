import { NavLink } from 'react-router-dom';
import { 
  Home, Users, FolderOpen, Upload, Search, 
  Bell, Settings, BarChart3, Shield, HardDrive 
} from 'lucide-react';

const navItems = [
  { path: '/', icon: Home, label: 'Dashboard' },
  { path: '/family', icon: Users, label: 'My Family' },
  { path: '/search', icon: Search, label: 'Search' },
  { path: '/categories', icon: FolderOpen, label: 'Categories' },
  { path: '/notifications', icon: Bell, label: 'Alerts' },
  { path: '/reports', icon: BarChart3, label: 'Reports' },
  { path: '/activity', icon: Shield, label: 'Activity Log' },
  { path: '/backup', icon: HardDrive, label: 'Backup' },
  { path: '/settings', icon: Settings, label: 'Settings' },
];

export default function Sidebar() {
  return (
    <div className="h-full bg-white border-r border-slate-200 flex flex-col">
      {/* Logo */}
      <div className="p-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-heading font-bold text-lg text-slate-900">DigiLocker</h1>
            <p className="text-xs text-slate-500">Your Private Vault</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                isActive
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-slate-600 hover:bg-slate-100'
              }`
            }
          >
            <item.icon className="w-5 h-5" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-200">
        <p className="text-xs text-slate-400 text-center">
          Personal DigiLocker v1.0
        </p>
      </div>
    </div>
  );
}

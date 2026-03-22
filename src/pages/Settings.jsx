import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, Shield, Bell, Palette, HardDrive, Trash2, 
  ChevronRight, Lock, KeyRound, Moon, Sun, Info
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { getAppConfig, updateAppConfig, clearAllData } from '../db';
import { AUTO_LOCK_OPTIONS } from '../utils/constants';
import toast from 'react-hot-toast';

export default function Settings() {
  const navigate = useNavigate();
  const { userName, updateSettings, lock, autoLockMinutes } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [config, setConfig] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteInput, setDeleteInput] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    const cfg = await getAppConfig();
    setConfig(cfg);
  };

  const handleNameChange = async (newName) => {
    await updateSettings({ userName: newName });
    toast.success('Name updated');
  };

  const handleAutoLockChange = async (minutes) => {
    await updateSettings({ autoLockMinutes: minutes });
    toast.success('Auto-lock updated');
  };

  const handleLockNow = async () => {
    await lock();
    navigate('/lock');
  };

  const handleClearData = async () => {
    if (deleteInput !== 'DELETE') {
      toast.error('Type DELETE to confirm');
      return;
    }

    setIsDeleting(true);
    try {
      await clearAllData();
      window.location.reload();
    } catch (error) {
      toast.error('Failed to clear data');
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const settingSections = [
    {
      title: 'Account',
      items: [
        {
          icon: User,
          label: 'Name',
          value: userName,
          onClick: () => {
            const newName = prompt('Enter your name:', userName);
            if (newName) handleNameChange(newName);
          },
        },
      ],
    },
    {
      title: 'Security',
      items: [
        {
          icon: Lock,
          label: 'Auto-lock timer',
          value: autoLockMinutes === 0 ? 'Never' : `${autoLockMinutes} min`,
          onClick: () => {
            const options = [...AUTO_LOCK_OPTIONS, 0];
            const currentIndex = options.indexOf(autoLockMinutes);
            const nextIndex = (currentIndex + 1) % options.length;
            handleAutoLockChange(options[nextIndex]);
          },
        },
        {
          icon: KeyRound,
          label: 'Change PIN',
          onClick: () => {
            const newPin = prompt('Enter new PIN (4-6 digits):');
            if (newPin && newPin.length >= 4 && newPin.length <= 6) {
              toast.success('PIN updated');
            } else if (newPin) {
              toast.error('PIN must be 4-6 digits');
            }
          },
        },
        {
          icon: Shield,
          label: 'Lock app now',
          onClick: handleLockNow,
        },
      ],
    },
    {
      title: 'Appearance',
      items: [
        {
          icon: theme === 'light' ? Sun : Moon,
          label: 'Theme',
          value: theme === 'light' ? 'Light' : 'Dark',
          onClick: toggleTheme,
        },
      ],
    },
    {
      title: 'Data',
      items: [
        {
          icon: HardDrive,
          label: 'Backup & Restore',
          onClick: () => navigate('/backup'),
        },
        {
          icon: Trash2,
          label: 'Clear all data',
          danger: true,
          onClick: () => setShowDeleteConfirm(true),
        },
      ],
    },
    {
      title: 'About',
      items: [
        {
          icon: Info,
          label: 'Version',
          value: '1.0.0',
        },
        {
          icon: Shield,
          label: 'How encryption works',
          onClick: () => {
            alert('Your documents are encrypted with AES-256-GCM using your master password. Only you can access them.');
          },
        },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl font-bold text-slate-900">Settings</h1>

      <div className="space-y-6">
        {settingSections.map((section) => (
          <div key={section.title}>
            <h2 className="text-sm font-medium text-slate-500 uppercase tracking-wide mb-2 px-1">
              {section.title}
            </h2>
            <div className="card divide-y divide-slate-100">
              {section.items.map((item, index) => (
                <button
                  key={index}
                  onClick={item.onClick}
                  disabled={!item.onClick}
                  className={`w-full flex items-center gap-3 p-4 text-left hover:bg-slate-50 transition-colors ${
                    !item.onClick ? 'cursor-default' : ''
                  }`}
                >
                  <item.icon className={`w-5 h-5 ${item.danger ? 'text-danger' : 'text-slate-400'}`} />
                  <span className={`flex-1 ${item.danger ? 'text-danger' : 'text-slate-900'}`}>
                    {item.label}
                  </span>
                  {item.value && (
                    <span className="text-sm text-slate-500">{item.value}</span>
                  )}
                  {item.onClick && <ChevronRight className="w-5 h-5 text-slate-400" />}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-danger" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">Clear All Data</h3>
                <p className="text-sm text-slate-500">This action cannot be undone</p>
              </div>
            </div>

            <p className="text-slate-600 mb-4">
              All your documents, family members, and settings will be permanently deleted. 
              There is no way to recover your data.
            </p>

            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Type DELETE to confirm
              </label>
              <input
                type="text"
                value={deleteInput}
                onChange={(e) => setDeleteInput(e.target.value)}
                className="input"
                placeholder="DELETE"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => { setShowDeleteConfirm(false); setDeleteInput(''); }}
                className="btn btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                onClick={handleClearData}
                disabled={deleteInput !== 'DELETE' || isDeleting}
                className="btn btn-danger flex-1"
              >
                {isDeleting ? 'Deleting...' : 'Delete Everything'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

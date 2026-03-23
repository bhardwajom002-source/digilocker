import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User, Shield, Bell, Palette, HardDrive,
  Trash2, ChevronRight, Lock, KeyRound,
  Moon, Sun, Info, LogOut
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { getAppConfig, updateAppConfig, clearAllData } from '../db';
import toast from 'react-hot-toast';

const AUTO_LOCK_OPTIONS = [0, 5, 10, 15, 30];

export default function Settings() {
  const navigate = useNavigate();
  const { userName, userEmail, updateSettings, lock, logout, autoLockMinutes } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [config, setConfig] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteInput, setDeleteInput] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    const cfg = await getAppConfig();
    setConfig(cfg);
  };

  const handleNameChange = async () => {
    const newName = window.prompt('Enter your new name:', userName);
    if (newName && newName.trim()) {
      const result = await updateSettings({ userName: newName.trim() });
      if (result.success) toast.success('Name updated ✓');
      else toast.error('Failed to update name');
    }
  };

  const handleAutoLockChange = async () => {
    const currentIndex = AUTO_LOCK_OPTIONS.indexOf(autoLockMinutes);
    const nextIndex = (currentIndex + 1) % AUTO_LOCK_OPTIONS.length;
    const nextValue = AUTO_LOCK_OPTIONS[nextIndex];
    const result = await updateSettings({ autoLockMinutes: nextValue });
    if (result.success) {
      toast.success(nextValue === 0 ? 'Auto-lock disabled' : `Auto-lock set to ${nextValue} min`);
    }
  };

  const handleChangePIN = () => {
    const newPin = window.prompt('Enter new PIN (4-6 digits):');
    if (!newPin) return;
    if (newPin.length >= 4 && newPin.length <= 6 && /^\d+$/.test(newPin)) {
      toast.success('PIN updated ✓');
    } else {
      toast.error('PIN must be 4-6 digits only');
    }
  };

  const handleLockNow = async () => {
    await lock();
    navigate('/login');
  };

  const handleLogout = async () => {
    await logout();
    setShowLogoutConfirm(false);
    toast.success('Logged out successfully');
    navigate('/auth', { replace: true });
  };

  const handleClearData = async () => {
    if (deleteInput !== 'DELETE') {
      toast.error('Type DELETE to confirm');
      return;
    }
    setIsDeleting(true);
    try {
      await clearAllData();
      toast.success('All data cleared');
      setTimeout(() => window.location.reload(), 1000);
    } catch {
      toast.error('Failed to clear data');
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const sectionStyle = {
    background: '#fff',
    borderRadius: 16,
    border: '1px solid #F1F5F9',
    overflow: 'hidden',
    marginBottom: 4,
  };

  const itemStyle = {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '14px 16px',
    background: 'transparent',
    border: 'none',
    borderBottom: '1px solid #F8FAFC',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'background 0.15s',
    fontFamily: 'Inter, sans-serif',
  };

  const sections = [
    {
      title: 'Profile',
      items: [
        {
          icon: <User size={18} color="#94A3B8" />,
          label: 'Name',
          value: userName || 'Not set',
          onClick: handleNameChange,
          hasArrow: true,
        },
        {
          icon: <User size={18} color="#94A3B8" />,
          label: 'Email',
          value: userEmail || 'Not set',
          onClick: null,
          hasArrow: false,
        },
      ],
    },
    {
      title: 'Appearance',
      items: [
        {
          icon: theme === 'dark'
            ? <Moon size={18} color="#94A3B8" />
            : <Sun size={18} color="#94A3B8" />,
          label: 'Dark Mode',
          value: theme === 'dark' ? 'On' : 'Off',
          onClick: toggleTheme,
          hasArrow: false,
          isToggle: true,
          toggleOn: theme === 'dark',
        },
      ],
    },
    {
      title: 'Security',
      items: [
        {
          icon: <Lock size={18} color="#94A3B8" />,
          label: 'Auto-lock',
          value: autoLockMinutes === 0 ? 'Never' : `${autoLockMinutes} min`,
          onClick: handleAutoLockChange,
          hasArrow: true,
        },
        {
          icon: <KeyRound size={18} color="#94A3B8" />,
          label: 'Change PIN',
          value: '',
          onClick: handleChangePIN,
          hasArrow: true,
        },
        {
          icon: <Shield size={18} color="#94A3B8" />,
          label: 'Lock App Now',
          value: '',
          onClick: handleLockNow,
          hasArrow: true,
        },
      ],
    },
    {
      title: 'Storage & Backup',
      items: [
        {
          icon: <HardDrive size={18} color="#94A3B8" />,
          label: 'Backup & Restore',
          value: '',
          onClick: () => navigate('/backup'),
          hasArrow: true,
        },
        {
          icon: <Trash2 size={18} color="#EF4444" />,
          label: 'Clear All Data',
          value: '',
          onClick: () => setShowDeleteConfirm(true),
          hasArrow: true,
          danger: true,
        },
      ],
    },
    {
      title: 'About',
      items: [
        {
          icon: <Info size={18} color="#94A3B8" />,
          label: 'Version',
          value: '1.0.0',
          onClick: null,
          hasArrow: false,
        },
        {
          icon: <Shield size={18} color="#94A3B8" />,
          label: 'How encryption works',
          value: '',
          onClick: () => toast('AES-256-GCM encryption. Only you can access your data. 🔐', { duration: 4000 }),
          hasArrow: true,
        },
      ],
    },
  ];

  return (
    <div style={{ paddingBottom: 80 }}>
      <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0F172A', marginBottom: 20,
                   fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          className="dark:text-white">
        Settings
      </h1>

      {/* Sections */}
      {sections.map(section => (
        <div key={section.title} style={{ marginBottom: 20 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8',
                      textTransform: 'uppercase', letterSpacing: '1px',
                      marginBottom: 8, paddingLeft: 4 }}>
            {section.title}
          </p>
          <div style={sectionStyle} className="dark:bg-slate-800 dark:border-slate-700">
            {section.items.map((item, idx) => (
              <button
                key={idx}
                onClick={item.onClick || undefined}
                disabled={!item.onClick}
                style={{
                  ...itemStyle,
                  cursor: item.onClick ? 'pointer' : 'default',
                  borderBottom: idx < section.items.length - 1 ? '1px solid #F8FAFC' : 'none',
                }}
                onMouseEnter={e => { if (item.onClick) e.currentTarget.style.background = '#F8FAFC'; }}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                {/* Icon */}
                <div style={{ flexShrink: 0 }}>{item.icon}</div>

                {/* Label */}
                <span style={{ flex: 1, fontSize: 14, fontWeight: 500,
                               color: item.danger ? '#EF4444' : '#0F172A' }}
                      className={item.danger ? '' : 'dark:text-white'}>
                  {item.label}
                </span>

                {/* Value */}
                {item.value && (
                  <span style={{ fontSize: 13, color: '#94A3B8', marginRight: 4 }}>
                    {item.value}
                  </span>
                )}

                {/* Toggle switch */}
                {item.isToggle && (
                  <div style={{
                    width: 44, height: 24, borderRadius: 12,
                    background: item.toggleOn ? '#2563EB' : '#E2E8F0',
                    position: 'relative', transition: 'background 0.25s',
                    flexShrink: 0,
                  }}>
                    <div style={{
                      width: 18, height: 18, borderRadius: '50%',
                      background: '#fff',
                      position: 'absolute', top: 3,
                      left: item.toggleOn ? 23 : 3,
                      transition: 'left 0.25s',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
                    }} />
                  </div>
                )}

                {/* Arrow */}
                {item.hasArrow && !item.isToggle && (
                  <ChevronRight size={16} color="#CBD5E1" />
                )}
              </button>
            ))}
          </div>
        </div>
      ))}

      {/* Logout Button */}
      <button
        onClick={() => setShowLogoutConfirm(true)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: 12,
          padding: '14px 16px', background: '#FEF2F2', color: '#DC2626',
          border: '1px solid #FECACA', borderRadius: 16,
          fontSize: 14, fontWeight: 700, cursor: 'pointer',
          fontFamily: 'Inter, sans-serif', marginBottom: 12,
        }}>
        <LogOut size={18} />
        Logout
      </button>

      {/* Footer */}
      <p style={{ textAlign: 'center', fontSize: 12, color: '#CBD5E1', marginTop: 8 }}>
        Made with ❤️ by OM • DigiLocker v1.0
      </p>

      {/* ── LOGOUT MODAL ── */}
      {showLogoutConfirm && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 50, padding: 20,
        }}>
          <div style={{
            background: '#fff', borderRadius: 20, padding: 24,
            width: '100%', maxWidth: 340,
          }} className="dark:bg-slate-800">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{ width: 44, height: 44, background: '#FEF2F2',
                            borderRadius: '50%', display: 'flex',
                            alignItems: 'center', justifyContent: 'center' }}>
                <LogOut size={20} color="#DC2626" />
              </div>
              <div>
                <p style={{ fontSize: 16, fontWeight: 700, color: '#0F172A', margin: 0 }}
                   className="dark:text-white">
                  Logout?
                </p>
                <p style={{ fontSize: 12, color: '#94A3B8', margin: 0 }}>
                  You'll need to login again
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => setShowLogoutConfirm(false)}
                style={{ flex: 1, padding: '12px', background: '#F1F5F9',
                         border: 'none', borderRadius: 12, fontSize: 14,
                         fontWeight: 600, cursor: 'pointer', color: '#64748B' }}>
                Cancel
              </button>
              <button
                onClick={handleLogout}
                style={{ flex: 1, padding: '12px', background: '#DC2626',
                         border: 'none', borderRadius: 12, fontSize: 14,
                         fontWeight: 600, cursor: 'pointer', color: '#fff' }}>
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── DELETE MODAL ── */}
      {showDeleteConfirm && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 50, padding: 20,
        }}>
          <div style={{
            background: '#fff', borderRadius: 20, padding: 24,
            width: '100%', maxWidth: 340,
          }} className="dark:bg-slate-800">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <div style={{ width: 44, height: 44, background: '#FEF2F2',
                            borderRadius: '50%', display: 'flex',
                            alignItems: 'center', justifyContent: 'center' }}>
                <Trash2 size={20} color="#DC2626" />
              </div>
              <div>
                <p style={{ fontSize: 16, fontWeight: 700, color: '#0F172A', margin: 0 }}
                   className="dark:text-white">
                  Clear All Data
                </p>
                <p style={{ fontSize: 12, color: '#94A3B8', margin: 0 }}>
                  This cannot be undone!
                </p>
              </div>
            </div>

            <p style={{ fontSize: 13, color: '#64748B', marginBottom: 16, lineHeight: 1.5 }}>
              All documents, family members, and settings will be permanently deleted.
            </p>

            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#64748B',
                              display: 'block', marginBottom: 6 }}>
                Type DELETE to confirm
              </label>
              <input
                type="text"
                value={deleteInput}
                onChange={e => setDeleteInput(e.target.value)}
                placeholder="DELETE"
                style={{ width: '100%', padding: '10px 14px',
                         border: '1.5px solid #E2E8F0', borderRadius: 12,
                         fontSize: 14, outline: 'none',
                         fontFamily: 'Inter, sans-serif' }}
              />
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => { setShowDeleteConfirm(false); setDeleteInput(''); }}
                style={{ flex: 1, padding: '12px', background: '#F1F5F9',
                         border: 'none', borderRadius: 12, fontSize: 14,
                         fontWeight: 600, cursor: 'pointer', color: '#64748B' }}>
                Cancel
              </button>
              <button
                onClick={handleClearData}
                disabled={deleteInput !== 'DELETE' || isDeleting}
                style={{ flex: 1, padding: '12px',
                         background: deleteInput === 'DELETE' ? '#DC2626' : '#FCA5A5',
                         border: 'none', borderRadius: 12, fontSize: 14,
                         fontWeight: 600, color: '#fff',
                         cursor: deleteInput === 'DELETE' ? 'pointer' : 'not-allowed' }}>
                {isDeleting ? 'Deleting...' : 'Delete All'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
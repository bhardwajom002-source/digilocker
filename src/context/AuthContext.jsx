import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getAppConfig, updateAppConfig, addActivityLog } from '../db';
import { deriveKey, hashPassword, hashPin } from '../crypto/encryption';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [isLoading, setIsLoading] = useState(true);
  const [isSetupComplete, setIsSetupComplete] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [cryptoKey, setCryptoKey] = useState(null);
  const [userName, setUserName] = useState('');
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutUntil, setLockoutUntil] = useState(null);
  const [autoLockMinutes, setAutoLockMinutes] = useState(0);
  
  let autoLockTimer = null;

  // Check if app is set up on load
  useEffect(() => {
    async function checkSetup() {
      try {
        const config = await getAppConfig();
        if (config?.setupComplete) {
          setIsSetupComplete(true);
          setUserName(config.userName || '');
          setAutoLockMinutes(config.autoLockMinutes || 10);
        } else {
          setIsSetupComplete(false);
        }
      } catch (error) {
        console.error('Error checking setup:', error);
      } finally {
        setIsLoading(false);
      }
    }
    checkSetup();
  }, []);

  // Auto-lock functionality
  useEffect(() => {
    if (!isUnlocked || autoLockMinutes === 0) return;

    const resetActivityTimer = () => {
      if (autoLockTimer) clearTimeout(autoLockTimer);
      
      autoLockTimer = setTimeout(() => {
        lock();
      }, autoLockMinutes * 60 * 1000);
    };

    const events = ['mousedown', 'keydown', 'touchstart', 'scroll'];
    events.forEach(event => {
      document.addEventListener(event, resetActivityTimer);
    });

    resetActivityTimer();

    return () => {
      if (autoLockTimer) clearTimeout(autoLockTimer);
      events.forEach(event => {
        document.removeEventListener(event, resetActivityTimer);
      });
    };
  }, [isUnlocked, autoLockMinutes]);

  // Check lockout
  useEffect(() => {
    if (lockoutUntil && Date.now() >= lockoutUntil) {
      setLockoutUntil(null);
      setFailedAttempts(0);
    }
  }, [lockoutUntil]);

  const setup = useCallback(async (password, pin, name) => {
    try {
      const salt = crypto.getRandomValues(new Uint8Array(32)).reduce((acc, b) => 
        acc + b.toString(16).padStart(2, '0'), ''
      );
      
      const passwordHash = await hashPassword(password);
      const pinHash = await hashPin(pin);
      
      // Derive the encryption key
      const key = await deriveKey(password, salt);
      
      // Store the key in memory
      setCryptoKey(key);
      
      // Save config to IndexedDB
      await updateAppConfig({
        setupComplete: true,
        userName: name,
        salt,
        passwordHash,
        pinHash,
        biometricEnabled: false,
        autoLockMinutes: 0,
        theme: 'light',
        language: 'en',
        createdAt: new Date(),
        lastUnlocked: new Date(),
      });
      
      setUserName(name);
      setIsSetupComplete(true);
      setIsUnlocked(true);
      
      await addActivityLog('app_setup', { userName: name });
      
      return { success: true };
    } catch (error) {
      console.error('Setup error:', error);
      return { success: false, error: error.message };
    }
  }, []);

  const unlock = useCallback(async (password) => {
    // Check lockout
    if (lockoutUntil && Date.now() < lockoutUntil) {
      const remaining = Math.ceil((lockoutUntil - Date.now()) / 1000 / 60);
      return { success: false, error: `Locked for ${remaining} minutes` };
    }

    try {
      const config = await getAppConfig();
      if (!config) {
        return { success: false, error: 'No configuration found' };
      }

      // Verify password
      const passwordHash = await hashPassword(password);
      if (passwordHash !== config.passwordHash) {
        const newAttempts = failedAttempts + 1;
        setFailedAttempts(newAttempts);
        
        if (newAttempts >= 5) {
          setLockoutUntil(Date.now() + 30 * 60 * 1000); // 30 min lockout
          return { success: false, error: 'Too many attempts. Locked for 30 minutes.' };
        }
        
        return { success: false, error: `Invalid password. ${5 - newAttempts} attempts remaining.` };
      }

      // Derive encryption key
      const key = await deriveKey(password, config.salt);
      
      // Store key in memory
      setCryptoKey(key);
      setIsUnlocked(true);
      setFailedAttempts(0);
      
      // Update last unlocked time
      await updateAppConfig({ lastUnlocked: new Date() });
      
      await addActivityLog('app_unlock', { userName: config.userName });
      
      return { success: true };
    } catch (error) {
      console.error('Unlock error:', error);
      return { success: false, error: error.message };
    }
  }, [failedAttempts, lockoutUntil]);

  const unlockWithPin = useCallback(async (pin) => {
    if (lockoutUntil && Date.now() < lockoutUntil) {
      const remaining = Math.ceil((lockoutUntil - Date.now()) / 1000 / 60);
      return { success: false, error: `Locked for ${remaining} minutes` };
    }

    try {
      const config = await getAppConfig();
      if (!config) {
        return { success: false, error: 'No configuration found' };
      }

      const pinHash = await hashPin(pin);
      if (pinHash !== config.pinHash) {
        const newAttempts = failedAttempts + 1;
        setFailedAttempts(newAttempts);
        
        if (newAttempts >= 5) {
          setLockoutUntil(Date.now() + 30 * 60 * 1000);
          return { success: false, error: 'Too many attempts. Locked for 30 minutes.' };
        }
        
        return { success: false, error: `Invalid PIN. ${5 - newAttempts} attempts remaining.` };
      }

      const key = await deriveKey(pin, config.salt);
      setCryptoKey(key);
      setIsUnlocked(true);
      setFailedAttempts(0);
      
      await updateAppConfig({ lastUnlocked: new Date() });
      await addActivityLog('app_unlock_pin', { userName: config.userName });
      
      return { success: true };
    } catch (error) {
      console.error('PIN unlock error:', error);
      return { success: false, error: error.message };
    }
  }, [failedAttempts, lockoutUntil]);

  const lock = useCallback(async () => {
    if (cryptoKey) {
      const config = await getAppConfig();
      await addActivityLog('app_lock', { userName: config?.userName });
    }
    
    setCryptoKey(null);
    setIsUnlocked(false);
  }, [cryptoKey]);

  const changePassword = useCallback(async (currentPassword, newPassword) => {
    try {
      const config = await getAppConfig();
      const passwordHash = await hashPassword(currentPassword);
      
      if (passwordHash !== config.passwordHash) {
        return { success: false, error: 'Current password is incorrect' };
      }

      const newSalt = crypto.getRandomValues(new Uint8Array(32)).reduce((acc, b) => 
        acc + b.toString(16).padStart(2, '0'), ''
      );
      const newPasswordHash = await hashPassword(newPassword);
      const newKey = await deriveKey(newPassword, newSalt);

      await updateAppConfig({
        salt: newSalt,
        passwordHash: newPasswordHash,
      });

      setCryptoKey(newKey);
      
      await addActivityLog('password_changed', { userName: config.userName });
      
      return { success: true };
    } catch (error) {
      console.error('Change password error:', error);
      return { success: false, error: error.message };
    }
  }, []);

  const changePin = useCallback(async (newPin) => {
    try {
      const pinHash = await hashPin(newPin);
      await updateAppConfig({ pinHash });
      
      await addActivityLog('pin_changed', {});
      
      return { success: true };
    } catch (error) {
      console.error('Change PIN error:', error);
      return { success: false, error: error.message };
    }
  }, []);

  const updateSettings = useCallback(async (settings) => {
    try {
      await updateAppConfig(settings);
      if (settings.autoLockMinutes !== undefined) {
        setAutoLockMinutes(settings.autoLockMinutes);
      }
      if (settings.userName !== undefined) {
        setUserName(settings.userName);
      }
      return { success: true };
    } catch (error) {
      console.error('Update settings error:', error);
      return { success: false, error: error.message };
    }
  }, []);

  const value = {
    isLoading,
    isSetupComplete,
    isUnlocked,
    cryptoKey,
    userName,
    failedAttempts,
    lockoutUntil,
    autoLockMinutes,
    setup,
    unlock,
    unlockWithPin,
    lock,
    changePassword,
    changePin,
    updateSettings,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

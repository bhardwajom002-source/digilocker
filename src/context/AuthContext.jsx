import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import {
  getAppConfig, updateAppConfig, isEmailRegistered,
  isUserLoggedIn, setLoggedIn, addActivityLog
} from '../db';
import { deriveKey, hashPassword, hashPin, generateSalt } from '../crypto/encryption';

const AuthContext = createContext(null);

// In-memory key store (never persisted)
const keyStore = { current: null };

export function AuthProvider({ children }) {
  const [isLoading,       setIsLoading]       = useState(true);
  const [isSetupComplete, setIsSetupComplete] = useState(false);
  const [isUnlocked,      setIsUnlocked]      = useState(false);
  const [userName,        setUserName]        = useState('');
  const [userEmail,       setUserEmail]       = useState('');
  const [failedAttempts,  setFailedAttempts]  = useState(0);
  const [lockoutUntil,    setLockoutUntil]    = useState(null);
  const [autoLockMinutes, setAutoLockMinutes] = useState(0);
  const [theme,           setTheme]           = useState('light');
  const lockTimerRef = useRef(null);

  // ─── Initialize on app start ─────────────────────────────────
  useEffect(() => {
    async function init() {
      try {
        const config = await getAppConfig();

        if (!config?.setupComplete) {
          // First time user
          setIsSetupComplete(false);
          setIsLoading(false);
          return;
        }

        setIsSetupComplete(true);
        setUserName(config.userName || '');
        setUserEmail(config.email || '');
        setAutoLockMinutes(config.autoLockMinutes || 0);

        // Apply saved theme
        const savedTheme = config.theme || localStorage.getItem('theme') || 'light';
        setTheme(savedTheme);
        applyTheme(savedTheme);

        // ✅ KEY FIX: Auto-restore session if user was logged in
        if (config.isLoggedIn === true) {
          // User was logged in — restore session without password
          setIsUnlocked(true);
        }

      } catch (err) {
        console.error('Auth init error:', err);
      } finally {
        setIsLoading(false);
      }
    }
    init();
  }, []);

  // ─── Theme ───────────────────────────────────────────────────
  function applyTheme(t) {
    if (t === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', t);
  }

  const toggleTheme = useCallback(() => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    applyTheme(next);
    updateAppConfig({ theme: next }).catch(console.error);
  }, [theme]);

  // ─── Auto-lock timer ─────────────────────────────────────────
  useEffect(() => {
    if (!isUnlocked || autoLockMinutes === 0) return;
    const reset = () => {
      if (lockTimerRef.current) clearTimeout(lockTimerRef.current);
      lockTimerRef.current = setTimeout(() => lock(), autoLockMinutes * 60 * 1000);
    };
    const events = ['mousedown','keydown','touchstart','scroll'];
    events.forEach(e => document.addEventListener(e, reset));
    reset();
    return () => {
      if (lockTimerRef.current) clearTimeout(lockTimerRef.current);
      events.forEach(e => document.removeEventListener(e, reset));
    };
  }, [isUnlocked, autoLockMinutes]);

  // ─── REGISTER ────────────────────────────────────────────────
  const register = useCallback(async (name, email, password, pin) => {
    try {
      // Check if already registered
      const emailExists = await isEmailRegistered(email);
      if (emailExists) {
        return {
          success: false,
          alreadyExists: true,
          error: 'You are already registered! Please login with your email.',
        };
      }

      // Also check if ANY account exists (single-user app)
      const config = await getAppConfig();
      if (config?.setupComplete) {
        return {
          success: false,
          alreadyExists: true,
          error: `An account already exists for ${config.email}. Please login.`,
        };
      }

      const salt = generateSalt();
      const pwdHash = await hashPassword(password, salt);
      const pinHash = await hashPin(pin, salt);
      const key = await deriveKey(password, salt);

      // Store key in memory
      keyStore.current = key;

      await updateAppConfig({
        setupComplete: true,
        email: email.toLowerCase().trim(),
        userName: name.trim(),
        salt,
        passwordHash: pwdHash,
        pinHash,
        isLoggedIn: true,
        autoLockMinutes: 0,
        theme: 'light',
        createdAt: new Date(),
        lastLogin: new Date(),
      });

      setUserName(name.trim());
      setUserEmail(email.toLowerCase().trim());
      setIsSetupComplete(true);
      setIsUnlocked(true);

      await addActivityLog('REGISTER', { userName: name, email });
      return { success: true };

    } catch (err) {
      console.error('Register error:', err);
      return { success: false, error: 'Registration failed. Please try again.' };
    }
  }, []);

  // ─── LOGIN ───────────────────────────────────────────────────
  const login = useCallback(async (password) => {
    try {
      // Lockout check
      if (lockoutUntil && Date.now() < lockoutUntil) {
        const mins = Math.ceil((lockoutUntil - Date.now()) / 60000);
        return { success: false, error: `Account locked for ${mins} more minutes.` };
      }

      const config = await getAppConfig();

      if (!config?.setupComplete) {
        return { success: false, error: 'No account found. Please register first.' };
      }

      // Password check
      const pwdHash = await hashPassword(password, config.salt);
      if (pwdHash !== config.passwordHash) {
        const attempts = failedAttempts + 1;
        setFailedAttempts(attempts);
        if (attempts >= 5) {
          const lockTime = Date.now() + 30 * 60 * 1000;
          setLockoutUntil(lockTime);
          return { success: false, error: 'Too many attempts! Account locked for 30 minutes.' };
        }
        return {
          success: false,
          error: `Wrong password. ${5 - attempts} attempts remaining.`
        };
      }

      // Derive crypto key
      const key = await deriveKey(password, config.salt);
      keyStore.current = key;

      // Save login state
      await setLoggedIn(true);
      await updateAppConfig({ lastLogin: new Date() });

      setIsUnlocked(true);
      setUserName(config.userName);
      setFailedAttempts(0);
      setLockoutUntil(null);

      await addActivityLog('LOGIN', { email: config.email });
      return { success: true, userName: config.userName };

    } catch (err) {
      console.error('Login error:', err);
      return { success: false, error: 'Login failed. Please try again.' };
    }
  }, [failedAttempts, lockoutUntil]);

  // ─── LOGIN WITH PIN ───────────────────────────────────────────
  const loginWithPin = useCallback(async (pin) => {
    try {
      if (lockoutUntil && Date.now() < lockoutUntil) {
        const mins = Math.ceil((lockoutUntil - Date.now()) / 60000);
        return { success: false, error: `Locked for ${mins} more minutes.` };
      }

      const config = await getAppConfig();
      if (!config?.setupComplete) {
        return { success: false, error: 'No account found.' };
      }

      const pinHash = await hashPin(pin, config.salt);
      if (pinHash !== config.pinHash) {
        const attempts = failedAttempts + 1;
        setFailedAttempts(attempts);
        if (attempts >= 5) {
          setLockoutUntil(Date.now() + 30 * 60 * 1000);
          return { success: false, error: 'Too many attempts! Locked for 30 minutes.' };
        }
        return {
          success: false,
          error: `Wrong PIN. ${5 - attempts} attempts remaining.`
        };
      }

      // PIN verified — derive key using PIN-based derivation
      const key = await deriveKey('PIN_KEY::' + pin, config.salt);
      keyStore.current = key;

      await setLoggedIn(true);
      await updateAppConfig({ lastLogin: new Date() });

      setIsUnlocked(true);
      setUserName(config.userName);
      setFailedAttempts(0);
      setLockoutUntil(null);

      await addActivityLog('LOGIN_PIN', {});
      return { success: true, userName: config.userName };

    } catch (err) {
      console.error('PIN login error:', err);
      return { success: false, error: 'PIN login failed.' };
    }
  }, [failedAttempts, lockoutUntil]);

  // ─── FORGOT PASSWORD (Offline — PIN based reset) ──────────────
  const verifyEmailForReset = useCallback(async (email) => {
    try {
      const config = await getAppConfig();
      if (!config?.setupComplete) {
        return { success: false, error: 'No account found.' };
      }
      if (config.email !== email.toLowerCase().trim()) {
        return { success: false, error: 'Email not found in our records.' };
      }
      // Email matches — allow PIN verification
      return { success: true, message: 'Email verified! Enter your backup PIN to reset password.' };
    } catch {
      return { success: false, error: 'Verification failed.' };
    }
  }, []);

  const resetPasswordWithPin = useCallback(async (email, pin, newPassword) => {
    try {
      const config = await getAppConfig();

      // Verify email
      if (config.email !== email.toLowerCase().trim()) {
        return { success: false, error: 'Email mismatch.' };
      }

      // Verify PIN
      const pinHash = await hashPin(pin, config.salt);
      if (pinHash !== config.pinHash) {
        return { success: false, error: 'Wrong PIN. Cannot reset password.' };
      }

      if (newPassword.length < 8) {
        return { success: false, error: 'Password must be at least 8 characters.' };
      }

      // Generate new salt + hash
      const newSalt = generateSalt();
      const newPwdHash = await hashPassword(newPassword, newSalt);
      const newPinHash = await hashPin(pin, newSalt);
      const newKey = await deriveKey(newPassword, newSalt);

      await updateAppConfig({
        salt: newSalt,
        passwordHash: newPwdHash,
        pinHash: newPinHash,
        lastPasswordReset: new Date(),
      });

      keyStore.current = newKey;
      setIsUnlocked(true);
      await setLoggedIn(true);

      await addActivityLog('PASSWORD_RESET', { email });
      return { success: true, message: 'Password reset successfully!' };

    } catch (err) {
      return { success: false, error: 'Reset failed. Try again.' };
    }
  }, []);

  // ─── LOGOUT ───────────────────────────────────────────────────
  const logout = useCallback(async () => {
    try {
      keyStore.current = null;
      await setLoggedIn(false);
      await addActivityLog('LOGOUT', { userName });
    } catch {}
    setIsUnlocked(false);
    if (lockTimerRef.current) clearTimeout(lockTimerRef.current);
  }, [userName]);

  // ─── LOCK (keep session, just lock screen) ───────────────────
  const lock = useCallback(async () => {
    keyStore.current = null;
    setIsUnlocked(false);
    // NOTE: isLoggedIn stays true in DB — user just needs to re-enter password
    if (lockTimerRef.current) clearTimeout(lockTimerRef.current);
  }, []);

  // ─── UPDATE SETTINGS ─────────────────────────────────────────
  const updateSettings = useCallback(async (settings) => {
    try {
      await updateAppConfig(settings);
      if (settings.autoLockMinutes !== undefined) setAutoLockMinutes(settings.autoLockMinutes);
      if (settings.userName) setUserName(settings.userName);
      return { success: true };
    } catch {
      return { success: false };
    }
  }, []);

  // ─── CHANGE PASSWORD ─────────────────────────────────────────
  const changePassword = useCallback(async (currentPwd, newPwd) => {
    try {
      const config = await getAppConfig();
      const hash = await hashPassword(currentPwd, config.salt);
      if (hash !== config.passwordHash) {
        return { success: false, error: 'Current password is incorrect.' };
      }
      const newSalt = generateSalt();
      const newHash = await hashPassword(newPwd, newSalt);
      const newKey = await deriveKey(newPwd, newSalt);
      await updateAppConfig({ salt: newSalt, passwordHash: newHash });
      keyStore.current = newKey;
      return { success: true };
    } catch {
      return { success: false, error: 'Password change failed.' };
    }
  }, []);

  const value = {
    isLoading,
    isSetupComplete,
    isUnlocked,
    cryptoKey: keyStore.current,
    userName,
    userEmail,
    failedAttempts,
    lockoutUntil,
    autoLockMinutes,
    theme,
    toggleTheme,
    register,
    login,
    loginWithPin,
    logout,
    lock,
    updateSettings,
    changePassword,
    verifyEmailForReset,
    resetPasswordWithPin,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}

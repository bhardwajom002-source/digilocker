import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import {
  getAppConfig, updateAppConfig,
  isUserLoggedIn, setLoggedIn, addActivityLog
} from '../db';
import { deriveKey, hashPassword, hashPin, generateSalt } from '../crypto/encryption';

const AuthContext = createContext(null);
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

  // ─── Initialize ──────────────────────────────────────────────
  useEffect(() => {
    async function init() {
      try {
        const config = await getAppConfig();
        if (!config?.setupComplete) {
          setIsSetupComplete(false);
          setIsLoading(false);
          return;
        }
        setIsSetupComplete(true);
        setUserName(config.userName || '');
        setUserEmail(config.email || '');
        setAutoLockMinutes(config.autoLockMinutes || 0);
        const savedTheme = config.theme || localStorage.getItem('theme') || 'light';
        setTheme(savedTheme);
        applyTheme(savedTheme);
        if (config.isLoggedIn === true) {
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
    if (t === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
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
    const events = ['mousedown', 'keydown', 'touchstart', 'scroll'];
    events.forEach(e => document.addEventListener(e, reset));
    reset();
    return () => {
      if (lockTimerRef.current) clearTimeout(lockTimerRef.current);
      events.forEach(e => document.removeEventListener(e, reset));
    };
  }, [isUnlocked, autoLockMinutes]);

  // ─── REGISTER ────────────────────────────────────────────────
  // BUG FIX #1:
  // Pehle: setupComplete hote hi SABKO block karta tha — same email ho ya alag.
  // Ab: Same email → "already registered, please login" show karo.
  //     Different email → New account banao (single-user app reset).
  //     No account yet → Fresh registration.
  const register = useCallback(async (name, email, password, pin) => {
    try {
      const config = await getAppConfig();
      const normalizedEmail = email.toLowerCase().trim();

      if (config?.setupComplete) {
        // ── Same email registered hai ──
        if (config.email === normalizedEmail) {
          return {
            success: false,
            alreadyExists: true,
            sameEmail: true,
            error: 'This email is already registered. Please login instead.',
          };
        }
        // ── Alag email — single-user app mein reset karke naya account banao ──
        // (Agar multi-user chahiye toh yahan different logic lagega)
        // Abhi: allow karo, purana account overwrite ho jayega
      }

      // ── Fresh registration (ya different-email reset) ──
      const salt    = generateSalt();
      const pwdHash = await hashPassword(password, salt);
      const pinHash = await hashPin(pin, salt);
      const key     = await deriveKey(password, salt);
      keyStore.current = key;

      await updateAppConfig({
        setupComplete:  true,
        email:          normalizedEmail,
        userName:       name.trim(),
        salt,
        passwordHash:   pwdHash,
        pinHash,
        isLoggedIn:     true,
        autoLockMinutes: 0,
        theme:          'light',
        createdAt:      new Date(),
        lastLogin:      new Date(),
      });

      setUserName(name.trim());
      setUserEmail(normalizedEmail);
      setIsSetupComplete(true);
      setIsUnlocked(true);
      await addActivityLog('REGISTER', { userName: name, email: normalizedEmail });
      return { success: true };

    } catch (err) {
      console.error('Register error:', err);
      return { success: false, error: 'Registration failed. Please try again.' };
    }
  }, []);

  // ─── LOGIN ───────────────────────────────────────────────────
  // BUG FIX #2:
  // Pehle: login(password) — sirf password leta tha, email verify nahi hota tha.
  //        LoginScreen login(email, password) bhej raha tha — dusra argument
  //        ignore ho jaata tha, aur password match kabhi nahi hota tha.
  // Ab:   login(email, password) — pehle email match check, phir password hash check.
  const login = useCallback(async (email, password) => {
    try {
      if (lockoutUntil && Date.now() < lockoutUntil) {
        const mins = Math.ceil((lockoutUntil - Date.now()) / 60000);
        return { success: false, error: `Account locked for ${mins} more minutes.` };
      }

      const config = await getAppConfig();
      if (!config?.setupComplete) {
        return { success: false, error: 'No account found. Please register first.' };
      }

      // ── Email verify karo ──
      const normalizedEmail = email.toLowerCase().trim();
      if (config.email !== normalizedEmail) {
        return {
          success: false,
          error: 'Email not registered. Please check your email or register.',
        };
      }

      // ── Password verify karo ──
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
          error: `Wrong password. ${5 - attempts} attempt${5 - attempts === 1 ? '' : 's'} remaining.`,
        };
      }

      const key = await deriveKey(password, config.salt);
      keyStore.current = key;

      await setLoggedIn(true);
      await updateAppConfig({ lastLogin: new Date() });

      setIsUnlocked(true);
      setUserName(config.userName);
      setUserEmail(config.email);
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
        return { success: false, error: `Wrong PIN. ${5 - attempts} attempts remaining.` };
      }

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

  // ─── VERIFY EMAIL FOR RESET ──────────────────────────────────
  const verifyEmailForReset = useCallback(async (email) => {
    try {
      const config = await getAppConfig();
      if (!config?.setupComplete) {
        return { success: false, error: 'No account found. Please register first.' };
      }
      if (config.email !== email.toLowerCase().trim()) {
        return { success: false, error: 'Email not found. Please enter your registered email.' };
      }
      return {
        success: true,
        message: 'Email verified! Now enter your backup PIN and new password.',
        userName: config.userName,
      };
    } catch {
      return { success: false, error: 'Verification failed. Please try again.' };
    }
  }, []);

  // ─── RESET PASSWORD WITH PIN ─────────────────────────────────
  const resetPasswordWithPin = useCallback(async (email, pin, newPassword) => {
    try {
      const config = await getAppConfig();
      if (!config?.setupComplete) {
        return { success: false, error: 'No account found.' };
      }
      if (config.email !== email.toLowerCase().trim()) {
        return { success: false, error: 'Email mismatch. Please try again.' };
      }
      const pinHash = await hashPin(pin, config.salt);
      if (pinHash !== config.pinHash) {
        return { success: false, error: 'Wrong PIN. Please enter your backup PIN correctly.' };
      }
      if (newPassword.length < 8) {
        return { success: false, error: 'Password must be at least 8 characters.' };
      }

      const newSalt    = generateSalt();
      const newPwdHash = await hashPassword(newPassword, newSalt);
      const newPinHash = await hashPin(pin, newSalt);
      const newKey     = await deriveKey(newPassword, newSalt);

      await updateAppConfig({
        salt:              newSalt,
        passwordHash:      newPwdHash,
        pinHash:           newPinHash,
        isLoggedIn:        true,
        lastPasswordReset: new Date(),
      });

      keyStore.current = newKey;
      setIsUnlocked(true);
      setUserName(config.userName);
      setUserEmail(config.email);
      setIsSetupComplete(true);

      await addActivityLog('PASSWORD_RESET', { email });
      return { success: true, message: 'Password reset successfully!' };

    } catch (err) {
      console.error('Reset error:', err);
      return { success: false, error: 'Reset failed. Please try again.' };
    }
  }, []);

  // ─── LOGOUT ──────────────────────────────────────────────────
  const logout = useCallback(async () => {
    try {
      keyStore.current = null;
      await setLoggedIn(false);
      await addActivityLog('LOGOUT', { userName });
    } catch {}
    setIsUnlocked(false);
    if (lockTimerRef.current) clearTimeout(lockTimerRef.current);
  }, [userName]);

  // ─── LOCK ────────────────────────────────────────────────────
  const lock = useCallback(async () => {
    keyStore.current = null;
    setIsUnlocked(false);
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
      const newSalt    = generateSalt();
      const newHash    = await hashPassword(newPwd, newSalt);
      const newPinHash = config.pinHash
        ? await hashPin('', newSalt)
        : null;
      const newKey = await deriveKey(newPwd, newSalt);

      await updateAppConfig({ salt: newSalt, passwordHash: newHash });
      keyStore.current = newKey;
      return { success: true };
    } catch {
      return { success: false, error: 'Password change failed.' };
    }
  }, []);

  // ─── RESET ACCOUNT ───────────────────────────────────────────
  const resetAccount = useCallback(async () => {
    try {
      await updateAppConfig({
        setupComplete: false,
        email:         null,
        userName:      null,
        salt:          null,
        passwordHash:  null,
        pinHash:       null,
        isLoggedIn:    false,
      });
      keyStore.current = null;
      setIsSetupComplete(false);
      setIsUnlocked(false);
      setUserName('');
      setUserEmail('');
      return { success: true };
    } catch {
      return { success: false };
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
    resetAccount,
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
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

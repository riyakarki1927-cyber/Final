import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import authService from '@/services/authService';
import { storage } from '@/utils/helpers';
import { STORAGE_KEYS, ROLES } from '@/utils/constants';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(() => storage.get(STORAGE_KEYS.USER));
  const [token,   setToken]   = useState(() => storage.get(STORAGE_KEYS.TOKEN));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const hydrate = async () => {
      if (!token) { setLoading(false); return; }
      try {
        const { data } = await authService.getMe();
        const u = data.data.user;
        setUser(u);
        storage.set(STORAGE_KEYS.USER, u);
      } catch {
        clearAuth();
      } finally {
        setLoading(false);
      }
    };
    hydrate();
  }, []);

  const clearAuth = useCallback(() => {
    setUser(null); setToken(null);
    storage.remove(STORAGE_KEYS.TOKEN);
    storage.remove(STORAGE_KEYS.REFRESH_TOKEN);
    storage.remove(STORAGE_KEYS.USER);
  }, []);

  const login = useCallback(async (creds) => {
    const { data } = await authService.login(creds);
    storage.set(STORAGE_KEYS.TOKEN,         data.token);
    storage.set(STORAGE_KEYS.REFRESH_TOKEN, data.refreshToken);
    storage.set(STORAGE_KEYS.USER,          data.data.user);
    setToken(data.token);
    setUser(data.data.user);
    return data.data.user;
  }, []);

  const register = useCallback(async (payload) => {
    const { data } = await authService.register(payload);
    storage.set(STORAGE_KEYS.TOKEN,         data.token);
    storage.set(STORAGE_KEYS.REFRESH_TOKEN, data.refreshToken);
    storage.set(STORAGE_KEYS.USER,          data.data.user);
    setToken(data.token);
    setUser(data.data.user);
    return data.data.user;
  }, []);

  const logout = useCallback(async () => {
    try { await authService.logout(); } catch {}
    clearAuth();
  }, [clearAuth]);

  return (
    <AuthContext.Provider value={{
      user, token, loading,
      login, register, logout, clearAuth,
      isPassenger: user?.role === ROLES.PASSENGER,
      isDriver:    user?.role === ROLES.DRIVER,
      isAdmin:     user?.role === ROLES.ADMIN,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
};
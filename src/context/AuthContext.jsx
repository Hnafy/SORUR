import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { authApi, TOKEN_KEY, USER_KEY, readTokens, saveTokens, clearTokens } from '../services/api';

const AuthContext = createContext(null);

const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || '';
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || '';

function decideRole(email, password) {
  const isAdmin =
    ADMIN_EMAIL.length > 0 &&
    ADMIN_PASSWORD.length > 0 &&
    email.toLowerCase() === ADMIN_EMAIL.toLowerCase() &&
    password === ADMIN_PASSWORD;
  return isAdmin ? 'ADMIN' : 'USER';
}

function withRole(user, role) {
  return user ? { ...user, role } : user;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const hydrate = async () => {
      const tokens = readTokens();
      if (!tokens || !tokens.accessToken) {
        if (active) setLoading(false);
        return;
      }
      try {
        const res = await authApi.currentUser();
        if (active && res?.success) {
          const stored = localStorage.getItem(USER_KEY);
          const role = stored ? JSON.parse(stored).role : 'USER';
          setUser(withRole(res.data, role));
          localStorage.setItem(USER_KEY, JSON.stringify(withRole(res.data, role)));
        }
      } catch {
        if (active) {
          setUser(null);
          clearTokens();
        }
      } finally {
        if (active) setLoading(false);
      }
    };
    hydrate();
    return () => {
      active = false;
    };
  }, []);

  const persistSession = useCallback((accessToken, refreshToken, userPayload, role) => {
    saveTokens(accessToken, refreshToken);
    const finalUser = withRole(userPayload, role);
    localStorage.setItem(USER_KEY, JSON.stringify(finalUser));
    setUser(finalUser);
    return finalUser;
  }, []);

  const login = useCallback(
    async (email, password) => {
      const res = await authApi.login(email, password);
      const { accessToken, refreshToken, user: apiUser } = res.data;
      // Prefer the real role from the backend when it is already an ADMIN,
      // otherwise fall back to the client-side env admin check. This keeps the
      // label aligned with what FreeAPI actually enforces server-side.
      const role = apiUser?.role === 'ADMIN' ? 'ADMIN' : decideRole(email, password);
      const finalUser = persistSession(accessToken, refreshToken, apiUser, role);
      return { ...res, data: { accessToken, refreshToken, user: finalUser } };
    },
    [persistSession]
  );

  const register = useCallback(async (username, email, password, _role) => {
    // If the credentials match the env admin, request the ADMIN role on the
    // backend so the issued JWT carries the admin claim (otherwise FreeAPI
    // returns 403 for every admin-only mutation).
    const role = decideRole(email, password) === 'ADMIN' ? 'ADMIN' : 'USER';
    return await authApi.register({ username, email, password, role });
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // ignore server errors on logout
    }
    clearTokens();
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    const tokens = readTokens();
    if (!tokens || !tokens.accessToken) return null;
    try {
      const res = await authApi.currentUser();
      if (res?.success) {
        const stored = localStorage.getItem(USER_KEY);
        const role = stored ? JSON.parse(stored).role : 'USER';
        const finalUser = withRole(res.data, role);
        setUser(finalUser);
        localStorage.setItem(USER_KEY, JSON.stringify(finalUser));
        return finalUser;
      }
    } catch {
      /* blocked */
    }
    return null;
  }, []);

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    isAdmin: !!user && user.role === 'ADMIN',
    login,
    register,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
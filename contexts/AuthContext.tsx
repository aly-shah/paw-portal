import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AuthUser, UserRole } from '../types';
import { api, setToken, getToken } from '../services/api';

interface RegisterInput {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

interface AuthValue {
  user: AuthUser | null;
  loading: boolean; // true while we resolve an existing token on first load
  login: (email: string, password: string) => Promise<AuthUser>;
  register: (input: RegisterInput) => Promise<AuthUser>;
  updateProfile: (patch: { name?: string; avatar?: string }) => Promise<AuthUser>;
  logout: () => void;
}

const AuthContext = createContext<AuthValue | null>(null);

export const useAuth = (): AuthValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // On first load, if we have a stored token, resolve the current user.
  useEffect(() => {
    let cancelled = false;
    if (!getToken()) { setLoading(false); return; }
    api.me()
      .then(({ user }) => { if (!cancelled) setUser(user); })
      .catch(() => { setToken(null); }) // stale/invalid token
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { token, user } = await api.login({ email, password });
    setToken(token);
    setUser(user);
    return user;
  }, []);

  const register = useCallback(async (input: RegisterInput) => {
    const { token, user } = await api.register(input);
    setToken(token);
    setUser(user);
    return user;
  }, []);

  const updateProfile = useCallback(async (patch: { name?: string; avatar?: string }) => {
    const { user } = await api.updateMe(patch);
    setUser(user);
    return user;
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, updateProfile, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export type UserRole = 'buyer' | 'admin';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  phone?: string;
  addresses: unknown[];
  role: UserRole;
  createdAt: string;
  updatedAt?: string;
}

interface AuthContextValue {
  token: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshMe: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const TOKEN_KEY = 'cloth.auth.token';

async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`/api${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json?.error || `请求失败 (${res.status})`);
  }
  return json.data as T;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState<AuthUser | null>(null);

  const isAuthenticated = Boolean(token);

  const refreshMe = useCallback(async () => {
    if (!token) {
      setUser(null);
      return;
    }

    const me = await apiRequest<AuthUser>('/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    });
    setUser(me);
  }, [token]);

  useEffect(() => {
    void refreshMe();
  }, [refreshMe]);

  const login = useCallback(async (email: string, password: string) => {
    const result = await apiRequest<{ token: string; user: AuthUser }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    localStorage.setItem(TOKEN_KEY, result.token);
    setToken(result.token);
    setUser(result.user);
  }, []);

  const register = useCallback(async (email: string, password: string, name: string) => {
    const result = await apiRequest<{ token: string; user: AuthUser }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });

    localStorage.setItem(TOKEN_KEY, result.token);
    setToken(result.token);
    setUser(result.user);
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiRequest<{ success: boolean }>('/auth/logout', { method: 'POST' });
    } catch {
      // ignore
    }

    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
    navigate('/');
  }, [navigate]);

  const value = useMemo<AuthContextValue>(() => ({
    token,
    user,
    isAuthenticated,
    login,
    register,
    logout,
    refreshMe,
  }), [token, user, isAuthenticated, login, register, logout, refreshMe]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}

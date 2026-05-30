import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

export type UserRole = 'buyer' | 'admin';

export interface Address {
  id: string;
  label?: string;
  recipientName: string;
  phone?: string;
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  phone?: string;
  addresses: Address[];
  role: UserRole;
  createdAt: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (patch: Partial<Pick<AuthUser, 'name' | 'phone' | 'addresses'>>) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const TOKEN_KEY = 'cloth_jwt';

async function apiRequest<T>(path: string, options: RequestInit = {}, token?: string | null): Promise<T> {
  const res = await fetch(`/api${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers ?? {}),
    },
    ...options,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || `请求失败 (${res.status})`);
  }

  return data.data as T;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(!!token);

  // Restore session on refresh
  useEffect(() => {
    let cancelled = false;

    async function loadMe() {
      if (!token) {
        setUser(null);
        setIsLoading(false);
        return;
      }

      try {
        const me = await apiRequest<AuthUser>('/auth/me', { method: 'GET' }, token);
        if (!cancelled) setUser(me);
      } catch {
        // token invalid/expired
        localStorage.removeItem(TOKEN_KEY);
        if (!cancelled) {
          setToken(null);
          setUser(null);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    loadMe();
    return () => {
      cancelled = true;
    };
  }, [token]);

  async function login(email: string, password: string) {
    const res = await apiRequest<{ token: string; user: AuthUser }>(
      '/auth/login',
      { method: 'POST', body: JSON.stringify({ email, password }) },
      null
    );

    localStorage.setItem(TOKEN_KEY, res.token);
    setToken(res.token);
    setUser(res.user);
  }

  async function register(email: string, password: string, name: string) {
    const res = await apiRequest<{ token: string; user: AuthUser }>(
      '/auth/register',
      { method: 'POST', body: JSON.stringify({ email, password, name }) },
      null
    );

    localStorage.setItem(TOKEN_KEY, res.token);
    setToken(res.token);
    setUser(res.user);
  }

  async function logout() {
    try {
      if (token) await apiRequest('/auth/logout', { method: 'POST' }, token);
    } finally {
      localStorage.removeItem(TOKEN_KEY);
      setToken(null);
      setUser(null);
    }
  }

  async function updateProfile(patch: Partial<Pick<AuthUser, 'name' | 'phone' | 'addresses'>>) {
    if (!token) throw new Error('未登录');
    const updated = await apiRequest<AuthUser>(
      '/auth/me',
      { method: 'PUT', body: JSON.stringify(patch) },
      token
    );
    setUser(updated);
  }

  const value = useMemo<AuthContextValue>(() => ({
    user,
    token,
    isLoading,
    login,
    register,
    logout,
    updateProfile,
  }), [user, token, isLoading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export function withAdminGuard<TProps extends object>(Component: React.ComponentType<TProps>) {
  return function AdminGuarded(props: TProps) {
    const { user, isLoading } = useAuth();

    if (isLoading) {
      return <div className="loading-spinner"><div className="spinner" /></div>;
    }

    if (!user || user.role !== 'admin') {
      return <div className="empty-state"><h3>无权限</h3><p>请使用管理员账号登录。</p></div>;
    }

    return <Component {...(props as TProps)} />;
  };
}

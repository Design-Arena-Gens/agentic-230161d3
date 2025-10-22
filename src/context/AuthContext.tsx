'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import type { SafeUser } from '@/types/user';

type AuthContextValue = {
  user: SafeUser | null;
  loading: boolean;
  error?: string | null;
  login: (input: { email: string; password: string }) => Promise<SafeUser>;
  signup: (input: {
    email: string;
    password: string;
    role: 'employer' | 'seeker';
    name: string;
    company?: string;
    skills?: string[];
    experience?: string;
    preferredRole?: string;
    preferredLocation?: string;
  }) => Promise<SafeUser>;
  logout: () => Promise<void>;
  refresh: () => Promise<SafeUser | null>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

async function parseResponse(response: Response) {
  const data = await response.json().catch(() => ({ error: 'Unexpected server response' }));
  if (!response.ok) {
    throw new Error(data.error ?? 'Request failed');
  }
  return data;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SafeUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async (): Promise<SafeUser | null> => {
    try {
      const response = await fetch('/api/auth/me', { credentials: 'include' });
      const data = await response.json();
      setUser(data.user ?? null);
      return data.user ?? null;
    } catch (err) {
      console.error('Failed to refresh session', err);
      setUser(null);
      return null;
    }
  }, []);

  useEffect(() => {
    (async () => {
      await refresh();
      setLoading(false);
    })();
  }, [refresh]);

  const login = useCallback(async (input: { email: string; password: string }) => {
    setError(null);
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
      credentials: 'include'
    });
    const data = await parseResponse(response);
    setUser(data.user);
    return data.user;
  }, []);

  const signup = useCallback(
    async (input: {
      email: string;
      password: string;
      role: 'employer' | 'seeker';
      name: string;
      company?: string;
      skills?: string[];
      experience?: string;
      preferredRole?: string;
      preferredLocation?: string;
    }) => {
      setError(null);
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
        credentials: 'include'
      });
      const data = await parseResponse(response);
      setUser(data.user);
      return data.user;
    },
    []
  );

  const logout = useCallback(async () => {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      error,
      login,
      signup,
      logout,
      refresh
    }),
    [user, loading, error, login, signup, logout, refresh]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}

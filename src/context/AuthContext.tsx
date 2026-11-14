'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  CompanyUser,
  getAuthToken,
  getAuthUser,
  setAuthSession,
  clearAuthSession,
  isTokenExpired,
} from '@/lib/auth';
import { apiRequest } from '@/lib/api';

interface AuthContextType {
  user: CompanyUser | null;
  isLoading: boolean;
  login: (token: string, user: CompanyUser) => void;
  logout: (reason?: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<CompanyUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const logout = (reason?: string) => {
    clearAuthSession();
    setUser(null);
    const query = reason ? `?reason=${encodeURIComponent(reason)}` : '';
    router.replace(`/login${query}`);
  };

  const login = (token: string, newUser: CompanyUser) => {
    setAuthSession(token, newUser);
    setUser(newUser);
  };

  useEffect(() => {
    const verifySession = async () => {
      const token = getAuthToken();

      if (!token || isTokenExpired(token)) {
        clearAuthSession();
        setUser(null);
        setIsLoading(false);
        return;
      }

      // Populate from cached cookie first for instantaneous render
      const cachedUser = getAuthUser();
      if (cachedUser) {
        setUser(cachedUser);
      }

      // Verify token with backend /api/v1/auth/me
      try {
        const freshUser = await apiRequest<CompanyUser>('/auth/me');
        setUser(freshUser);
        setAuthSession(token, freshUser);
      } catch (err: any) {
        console.warn('Session verification failed, logging out:', err.message);
        clearAuthSession();
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    verifySession();
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
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

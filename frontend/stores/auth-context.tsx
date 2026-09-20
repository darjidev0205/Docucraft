'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, SignupInput, LoginInput } from '@docucraft/shared';
import { authClient } from '../lib/auth-client';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  login: (data: LoginInput) => Promise<void>;
  signup: (data: SignupInput) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const data = await authClient.me();
      setUser(data ? data.user : null);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (data: LoginInput) => {
    const res = await authClient.login(data);
    setUser(res.user);
  };

  const signup = async (data: SignupInput) => {
    const res = await authClient.signup(data);
    setUser(res.user);
  };

  const logout = () => {
    authClient.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, refreshUser }}>
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

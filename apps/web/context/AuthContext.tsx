'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, getUser as getAuthUser, logout as authLogout } from '@/lib/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (userData: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window !== 'undefined') {
      return getAuthUser();
    }
    return null;
  });
  const [loading] = useState(false);

  // No longer need immediate check in useEffect if initialized synchronously
  useEffect(() => {
    // This could still be used for watching changes if needed, 
    // but the sync initialization handles the hydration error/standard case.
  }, []);

  const login = (userData: User) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(userData));
    }
    setUser(userData);
  };

  const logout = () => {
    authLogout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

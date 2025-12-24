import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getUser, authAPI, removeAuthToken } from '@/service/api';

interface User {
  email: string;
  roles: string[];
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  refreshUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  const refreshUser = () => {
    const storedUser = getUser();
    setUser(storedUser);
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await authAPI.login(email, password);
      if (response.data?.accessToken) {
        refreshUser();
        return { success: true };
      }
      return { success: false, error: response.message || 'Login failed' };
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  };

  const logout = () => {
    authAPI.logout();
    setUser(null);
  };

  const isAuthenticated = !!user;
  const isAdmin = user?.roles?.includes('ADMIN') || user?.roles?.includes('SUPER_ADMIN') || false;
  const isSuperAdmin = user?.roles?.includes('SUPER_ADMIN') || false;

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isAdmin, isSuperAdmin, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

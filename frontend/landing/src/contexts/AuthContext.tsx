// Auth Context for managing authentication state
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';

interface User {
  id: string;
  email: string;
  full_name?: string;
  consumer_id?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (email: string, password: string, fullName?: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on mount
    const token = apiClient.getToken();
    if (token) {
      // Verify token by fetching user info
      apiClient.getMe()
        .then((data: any) => {
          setUser({
            id: data.id,
            email: data.phone, // Backend uses phone field for email
            full_name: data.full_name,
            consumer_id: data.consumer_id,
          });
        })
        .catch(() => {
          apiClient.clearToken();
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const response = await apiClient.login(email, password);
    apiClient.setToken(response.access_token);
    setUser({
      id: response.user.id,
      email: (response.user as any).email || (response.user as any).phone || email,
      full_name: response.user.full_name,
      consumer_id: response.user.consumer_id,
    });
  };

  const register = async (email: string, password: string, fullName?: string) => {
    await apiClient.register(email, password, fullName);
    // Auto-login after registration
    await login(email, password);
  };

  const logout = () => {
    apiClient.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        register,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Auth Context for managing authentication state with Supabase
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, signIn, signUp, signOut, getSession, onAuthStateChange } from '@/lib/supabase';
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
  logout: () => Promise<void>;
  register: (email: string, password: string, fullName?: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUserProfile = async (authUser: any) => {
    try {
      const session = await getSession();
      if (session?.access_token) {
        apiClient.setToken(session.access_token);
        const profile = await apiClient.getMe();
        const userData = {
          id: profile.id,
          email: profile.email || authUser.email,
          full_name: profile.full_name || authUser.user_metadata?.full_name,
          consumer_id: profile.consumer_id,
        };
        setUser(userData);
        return userData;
      }
    } catch (error) {
      // User might not exist in public.users yet, use auth user data
      const userData = {
        id: authUser.id,
        email: authUser.email,
        full_name: authUser.user_metadata?.full_name,
      };
      setUser(userData);
      return userData;
    }
    return null;
  };

  useEffect(() => {
    let mounted = true;

    // Initialize auth state
    const initAuth = async () => {
      try {
        const session = await getSession();
        if (session?.user && mounted) {
          await fetchUserProfile(session.user);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    initAuth();

    // Listen for auth changes
    const { data: { subscription } } = onAuthStateChange(async (event, session) => {
      console.log('Auth state change:', event, session?.user?.email);
      if (!mounted) return;

      if (session?.user) {
        await fetchUserProfile(session.user);
      } else {
        setUser(null);
        apiClient.clearToken();
      }
      setIsLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    console.log('Attempting login for:', email);
    try {
      const data = await signIn(email, password);
      console.log('Sign in successful, session:', !!data.session);

      if (data.session?.access_token) {
        apiClient.setToken(data.session.access_token);
      }

      // Manually fetch and set user profile after successful login
      if (data.session?.user) {
        await fetchUserProfile(data.session.user);
      }

      // Wait a bit for state to update
      await new Promise(resolve => setTimeout(resolve, 300));
    } catch (error: any) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (email: string, password: string, fullName?: string) => {
    console.log('Attempting registration for:', email);
    try {
      const data = await signUp(email, password, fullName || '');
      console.log('Sign up successful, session:', !!data.session);

      if (data.session?.access_token) {
        apiClient.setToken(data.session.access_token);
      }

      // Manually fetch and set user profile after successful registration
      if (data.session?.user) {
        await fetchUserProfile(data.session.user);
      }

      // Wait for state update
      await new Promise(resolve => setTimeout(resolve, 300));
    } catch (error: any) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const logout = async () => {
    await signOut();
    apiClient.clearToken();
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

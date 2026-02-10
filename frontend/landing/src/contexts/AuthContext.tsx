// Auth Context for managing authentication state with Supabase
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, signIn, signUp, signOut, getSession, getUser, onAuthStateChange } from '@/lib/supabase';
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

  useEffect(() => {
    // Initialize auth state
    const initAuth = async () => {
      try {
        const session = await getSession();
        if (session?.user) {
          // Get user profile from public.users table via API
          await fetchUserProfile(session.user);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();

    // Listen for auth changes
    const { data: { subscription } } = onAuthStateChange(async (event, session) => {
      if (session?.user) {
        await fetchUserProfile(session.user);
      } else {
        setUser(null);
        apiClient.clearToken();
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchUserProfile = async (authUser: any) => {
    try {
      // Get the access token for API calls
      const session = await getSession();
      if (session?.access_token) {
        apiClient.setToken(session.access_token);

        // Fetch user profile from our API (which queries public.users)
        const profile = await apiClient.getMe();
        setUser({
          id: profile.id,
          email: profile.email || authUser.email,
          full_name: profile.full_name || authUser.user_metadata?.full_name,
          consumer_id: profile.consumer_id,
        });
      }
    } catch (error) {
      // User might not exist in public.users yet, use auth user data
      setUser({
        id: authUser.id,
        email: authUser.email,
        full_name: authUser.user_metadata?.full_name,
      });
    }
  };

  const login = async (email: string, password: string) => {
    const data = await signIn(email, password);
    if (data.session?.access_token) {
      apiClient.setToken(data.session.access_token);
    }
    // Auth state change listener will update user
  };

  const register = async (email: string, password: string, fullName?: string) => {
    const data = await signUp(email, password, fullName || '');
    if (data.session?.access_token) {
      apiClient.setToken(data.session.access_token);
    }
    // Auth state change listener will update user
    // Note: Supabase creates auth.users entry automatically
    // The database trigger will create public.users entry
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

// Auth Context for managing authentication state with Supabase
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
  const router = useRouter();

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

    // Listen for auth changes - this is key for proper state management
    const { data: { subscription } } = onAuthStateChange(async (event, session) => {
      console.log('Auth state change:', event, session?.user?.email);
      if (!mounted) return;

      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        if (session?.user) {
          const userData = await fetchUserProfile(session.user);
          if (userData) {
            // Successfully logged in - redirect to dashboard
            router.replace('/dashboard');
          }
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        apiClient.clearToken();
      }
      setIsLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [router]);

  // Login with timeout workaround for known Supabase issue
  const login = async (email: string, password: string) => {
    console.log('Attempting login for:', email);

    // Use Promise.race with timeout to handle the hanging promise issue
    // See: https://github.com/orgs/supabase/discussions/41329
    const signInWithTimeout = Promise.race([
      signIn(email, password),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Login timeout')), 5000)
      )
    ]);

    try {
      const data = await signInWithTimeout as any;
      console.log('Sign in completed');

      // Don't manually fetch user here - let onAuthStateChange handle it
      // Just return immediately and let the auth state change listener redirect
      return;
    } catch (error: any) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (email: string, password: string, fullName?: string) => {
    console.log('Attempting registration for:', email);
    try {
      const data = await signUp(email, password, fullName || '');
      console.log('Sign up completed');

      // Don't manually fetch user - let onAuthStateChange handle it
      return;
    } catch (error: any) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const logout = async () => {
    await signOut();
    apiClient.clearToken();
    setUser(null);
    router.push('/login');
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

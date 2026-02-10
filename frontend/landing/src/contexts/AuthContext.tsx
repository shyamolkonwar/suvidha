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
    let isRedirecting = false;

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
      if (!mounted || isRedirecting) return;

      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        if (session?.user) {
          const userData = await fetchUserProfile(session.user);
          if (userData && !isRedirecting) {
            // Successfully logged in - redirect to dashboard
            isRedirecting = true;
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

  // Login - fire and forget, let onAuthStateChange handle the rest
  const login = async (email: string, password: string) => {
    console.log('Attempting login for:', email);

    // Call signIn without awaiting - let it complete in background
    // The onAuthStateChange listener will handle the success case
    signIn(email, password).catch((error) => {
      console.error('Sign in failed:', error);
      throw error;
    });

    // Return immediately after initiating sign in
    // The auth state change listener will handle redirect
    return Promise.resolve();
  };

  const register = async (email: string, password: string, fullName?: string) => {
    console.log('Attempting registration for:', email);

    // Call signUp without awaiting
    signUp(email, password, fullName || '').catch((error) => {
      console.error('Sign up failed:', error);
      throw error;
    });

    return Promise.resolve();
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

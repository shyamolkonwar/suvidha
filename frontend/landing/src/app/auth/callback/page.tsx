// Supabase Auth Callback Page
'use client';

import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    // Handle the OAuth callback or email confirmation
    supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        // User is signed in, redirect to dashboard
        router.replace('/dashboard');
      }
    });

    // Check if there's a session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.replace('/dashboard');
      } else {
        // No session, redirect to login
        router.replace('/login');
      }
    });
  }, [router]);

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      backgroundColor: '#0A3D2E',
      color: '#00D26A',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: '48px',
          height: '48px',
          border: '4px solid #00D26A',
          borderTopColor: 'transparent',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 20px'
        }} />
        <p>Verifying your email...</p>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  );
}

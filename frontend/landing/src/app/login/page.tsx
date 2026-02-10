// Login Page - "The Identity Gate"
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import './login.css';

export default function LoginPage() {
  const router = useRouter();
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(email, password, fullName);
      }
      // Note: AuthContext handles redirect to dashboard automatically
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* Left Half - Visual */}
      <div className="login-visual">
        <div className="shield-illustration">
          <svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Shield */}
            <path
              d="M100 10L180 40V100C180 150 100 190 100 190C100 190 20 150 20 100V40L100 10Z"
              stroke="#064E3B"
              strokeWidth="3"
              fill="none"
            />
            {/* Leaf inside */}
            <path
              d="M100 50C100 50 130 70 130 100C130 130 100 150 100 150C100 150 70 130 70 100C70 70 100 50 100 50"
              fill="#10B981"
            />
            <circle cx="100" cy="100" r="15" fill="#064E3B" />
          </svg>
        </div>
        <p className="visual-caption">Your Gateway to Smart Governance</p>
      </div>

      {/* Right Half - Login Card */}
      <div className="login-interaction">
        <div className="login-card">
          <div className="login-header">
            <h1>{isLogin ? 'Welcome Back' : 'Create Account'}</h1>
            <p className="login-subtitle">
              {isLogin
                ? 'Access your civic services dashboard'
                : 'Join thousands of smart citizens'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            {!isLogin && (
              <div className="form-group">
                <label htmlFor="fullName">Full Name</label>
                <input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your full name"
                  className="form-input"
                />
              </div>
            )}

            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                minLength={6}
                className="form-input"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="login-button"
            >
              {isLoading ? (
                <span className="spinner"></span>
              ) : (
                isLogin ? 'Sign In' : 'Create Account'
              )}
            </button>
          </form>

          <div className="login-footer">
            <p>
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError('');
                }}
                className="link-button"
              >
                {isLogin ? 'Create one' : 'Sign in'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

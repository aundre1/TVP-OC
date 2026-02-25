// ============================================
// THE VIDEO POOL - LOGIN PAGE
// ============================================

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/stores/authStore';
import SocialLoginGrid from '@/components/SocialLoginGrid';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, verify2FA, requires2FA, error, isLoading, clearError } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const redirectAfterLogin = () => {
    const user = useAuthStore.getState().user;
    if (user && user.phoneVerified === false) {
      navigate('/verify-phone');
    } else {
      navigate('/');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    const success = await login({ username, password });
    if (success) {
      redirectAfterLogin();
    }
  };

  const handle2FAVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    const success = await verify2FA(twoFactorCode);
    if (success) {
      redirectAfterLogin();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-tvp-bg-primary p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5">
            <div className="w-12 h-12">
              <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="2" y="8" width="36" height="28" rx="4" stroke="var(--accent-cyan)" strokeWidth="2.5" fill="none"/>
                <path d="M14 8 L20 2 L26 8" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                <path d="M16 16 L16 28 L28 22 Z" fill="var(--accent-cyan)"/>
              </svg>
            </div>
            <span className="font-bebas text-3xl tracking-wide text-tvp-text-primary">
              THEVIDEO<span className="text-tvp-accent-cyan">POOL</span>
            </span>
          </Link>
          <p className="mt-2 text-tvp-text-secondary">Professional Video DJ Platform</p>
        </div>

        {/* Login Form */}
        <div className="bg-tvp-bg-secondary border border-tvp-border-subtle rounded-2xl p-8">
          <h1 className="text-2xl font-semibold text-tvp-text-primary text-center mb-6">
            {requires2FA ? 'Two-Factor Authentication' : 'Sign In'}
          </h1>

          {error && (
            <div className="mb-4 p-3 bg-tvp-error/10 border border-tvp-error/20 rounded-lg text-sm text-tvp-error">
              {error}
            </div>
          )}

          {!requires2FA ? (
            <>
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-tvp-text-secondary mb-1.5">
                    Username or Email
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-4 py-3 bg-tvp-bg-tertiary border border-tvp-border-default rounded-xl text-tvp-text-primary placeholder:text-tvp-text-muted focus:border-tvp-accent-cyan focus:ring-2 focus:ring-tvp-accent-cyan/20 outline-none transition-all"
                    placeholder="Enter your username"
                    required
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-tvp-text-secondary mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3 pr-12 bg-tvp-bg-tertiary border border-tvp-border-default rounded-xl text-tvp-text-primary placeholder:text-tvp-text-muted focus:border-tvp-accent-cyan focus:ring-2 focus:ring-tvp-accent-cyan/20 outline-none transition-all"
                      placeholder="Enter your password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-tvp-text-muted hover:text-tvp-text-primary"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="w-4 h-4 rounded border-tvp-border-default bg-tvp-bg-tertiary text-tvp-accent-cyan focus:ring-tvp-accent-cyan/20" />
                    <span className="text-sm text-tvp-text-secondary">Remember me</span>
                  </label>
                  <Link to="/forgot-password" className="text-sm text-tvp-accent-cyan hover:text-tvp-accent-cyan-hover">
                    Forgot password?
                  </Link>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-tvp-accent-cyan hover:bg-tvp-accent-cyan-hover text-tvp-bg-primary font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    'Sign In'
                  )}
                </button>
              </form>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-tvp-border-subtle"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-tvp-bg-secondary text-tvp-text-muted">
                    or continue with
                  </span>
                </div>
              </div>

              {/* Google Login */}
              <SocialLoginGrid mode="login" />
            </>
          ) : (
            <form onSubmit={handle2FAVerify} className="space-y-4">
              <p className="text-sm text-tvp-text-secondary text-center mb-4">
                Enter the 6-digit code from your authenticator app
              </p>

              <div>
                <input
                  type="text"
                  value={twoFactorCode}
                  onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="w-full px-4 py-4 bg-tvp-bg-tertiary border border-tvp-border-default rounded-xl text-tvp-text-primary text-center text-2xl tracking-widest font-mono focus:border-tvp-accent-cyan focus:ring-2 focus:ring-tvp-accent-cyan/20 outline-none transition-all"
                  placeholder="000000"
                  maxLength={6}
                  required
                  autoFocus
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || twoFactorCode.length !== 6}
                className="w-full py-3 bg-tvp-accent-cyan hover:bg-tvp-accent-cyan-hover text-tvp-bg-primary font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  'Verify'
                )}
              </button>
            </form>
          )}

          <div className="mt-6 text-center">
            <span className="text-sm text-tvp-text-muted">
              Don't have an account?{' '}
              <Link to="/register" className="text-tvp-accent-cyan hover:text-tvp-accent-cyan-hover font-medium">
                Sign up free
              </Link>
            </span>
          </div>
        </div>

        {/* Footer */}
        <p className="mt-8 text-center text-xs text-tvp-text-muted">
          By signing in, you agree to our{' '}
          <a href="/terms" className="text-tvp-text-secondary hover:text-tvp-text-primary">Terms of Service</a>
          {' '}and{' '}
          <a href="/privacy" className="text-tvp-text-secondary hover:text-tvp-text-primary">Privacy Policy</a>
        </p>
      </div>
    </div>
  );
}

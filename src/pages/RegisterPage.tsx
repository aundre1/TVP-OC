// ============================================
// THE VIDEO POOL - REGISTER PAGE
// ============================================

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2, CheckCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import SocialLoginGrid from '@/components/SocialLoginGrid';
import { usePageMeta } from '@/hooks/usePageMeta';

export default function RegisterPage() {
  usePageMeta({
    title: 'Start Free Trial | The Video Pool — DJ Music Videos',
    description: 'Join The Video Pool free. Access 26,000+ HD music videos for DJs. Hip-hop, R&B, EDM, Latin & more. No credit card required to start.',
    canonical: 'https://thevideopool.com/register',
  });

  const { register, error, isLoading, clearError } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [smsOptIn, setSmsOptIn] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState(false);
  const [devCode, setDevCode] = useState<string | null>(null);

  const passwordRequirements = [
    { label: 'At least 8 characters', met: password.length >= 8 },
    { label: 'Contains uppercase letter', met: /[A-Z]/.test(password) },
    { label: 'Contains lowercase letter', met: /[a-z]/.test(password) },
    { label: 'Contains number', met: /\d/.test(password) },
  ];

  const isPasswordValid = passwordRequirements.every((req) => req.met);
  const doPasswordsMatch = password === confirmPassword && confirmPassword.length > 0;
  const isPhoneValid = /^\+[1-9]\d{6,14}$/.test(phone);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (!isPasswordValid) {
      return;
    }

    if (!doPasswordsMatch) {
      return;
    }

    if (!isPhoneValid) return;
    const result = await register({ name: username, email, password, phone, smsOptIn });
    if (result) {
      // Navigate to verification page with email and dev code
      navigate('/verify-email', {
        state: {
          email,
          _devCode: result._devCode // Pass dev code if available
        }
      });
    }
  };

  // Success state is handled by navigating to /verify-email

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

        {/* Register Form */}
        <div className="bg-tvp-bg-secondary border border-tvp-border-subtle rounded-2xl p-8">
          <h1 className="text-2xl font-semibold text-tvp-text-primary text-center mb-6">
            Create Your Account
          </h1>

          {error && (
            <div className="mb-4 p-3 bg-tvp-error/10 border border-tvp-error/20 rounded-lg text-sm text-tvp-error">
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-tvp-text-secondary mb-1.5">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 bg-tvp-bg-tertiary border border-tvp-border-default rounded-xl text-tvp-text-primary placeholder:text-tvp-text-muted focus:border-tvp-accent-cyan focus:ring-2 focus:ring-tvp-accent-cyan/20 outline-none transition-all"
                placeholder="Choose a username"
                required
                autoFocus
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-tvp-text-secondary mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-tvp-bg-tertiary border border-tvp-border-default rounded-xl text-tvp-text-primary placeholder:text-tvp-text-muted focus:border-tvp-accent-cyan focus:ring-2 focus:ring-tvp-accent-cyan/20 outline-none transition-all"
                placeholder="Enter your email"
                required
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
                  placeholder="Create a password"
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

              {/* Password Requirements */}
              {password.length > 0 && (
                <div className="mt-2 space-y-1">
                  {passwordRequirements.map((req, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs">
                      <div className={`w-1.5 h-1.5 rounded-full ${req.met ? 'bg-tvp-success' : 'bg-tvp-text-muted'}`} />
                      <span className={req.met ? 'text-tvp-success' : 'text-tvp-text-muted'}>
                        {req.label}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-tvp-text-secondary mb-1.5">
                Confirm Password
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`w-full px-4 py-3 bg-tvp-bg-tertiary border rounded-xl text-tvp-text-primary placeholder:text-tvp-text-muted focus:ring-2 outline-none transition-all ${
                  confirmPassword.length > 0
                    ? doPasswordsMatch
                      ? 'border-tvp-success focus:border-tvp-success focus:ring-tvp-success/20'
                      : 'border-tvp-error focus:border-tvp-error focus:ring-tvp-error/20'
                    : 'border-tvp-border-default focus:border-tvp-accent-cyan focus:ring-tvp-accent-cyan/20'
                }`}
                placeholder="Confirm your password"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-tvp-text-secondary mb-1.5">
                Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className={`w-full px-4 py-3 bg-tvp-bg-tertiary border rounded-xl text-tvp-text-primary placeholder:text-tvp-text-muted focus:ring-2 outline-none transition-all ${
                  phone.length > 0
                    ? isPhoneValid
                      ? 'border-tvp-success focus:border-tvp-success focus:ring-tvp-success/20'
                      : 'border-tvp-error focus:border-tvp-error focus:ring-tvp-error/20'
                    : 'border-tvp-border-default focus:border-tvp-accent-cyan focus:ring-tvp-accent-cyan/20'
                }`}
                placeholder="+1XXXXXXXXXX"
                required
              />
              {phone.length > 0 && !isPhoneValid && (
                <p className="text-xs text-tvp-error mt-1">Enter a valid phone number with country code (e.g. +12125551234)</p>
              )}
            </div>

            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                id="smsOptIn"
                checked={smsOptIn}
                onChange={(e) => setSmsOptIn(e.target.checked)}
                className="w-4 h-4 mt-0.5 rounded border-tvp-border-default bg-tvp-bg-tertiary text-tvp-accent-cyan focus:ring-tvp-accent-cyan/20"
              />
              <label htmlFor="smsOptIn" className="text-sm text-tvp-text-secondary">
                Yes, send me occasional updates via text (max 2/month). We'll never share or sell your info.
              </label>
            </div>

            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                id="terms"
                required
                className="w-4 h-4 mt-0.5 rounded border-tvp-border-default bg-tvp-bg-tertiary text-tvp-accent-cyan focus:ring-tvp-accent-cyan/20"
              />
              <label htmlFor="terms" className="text-sm text-tvp-text-secondary">
                I agree to the{' '}
                <a href="/terms" className="text-tvp-accent-cyan hover:text-tvp-accent-cyan-hover">Terms of Service</a>
                {' '}and{' '}
                <a href="/privacy" className="text-tvp-accent-cyan hover:text-tvp-accent-cyan-hover">Privacy Policy</a>
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading || !isPasswordValid || !doPasswordsMatch || !isPhoneValid}
              className="w-full py-3 bg-tvp-accent-cyan hover:bg-tvp-accent-cyan-hover text-tvp-bg-primary font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creating account...
                </>
              ) : (
                'Create Account'
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
                or sign up with
              </span>
            </div>
          </div>

          {/* Google Sign Up */}
          <SocialLoginGrid mode="signup" />

          <div className="mt-6 text-center">
            <span className="text-sm text-tvp-text-muted">
              Already have an account?{' '}
              <Link to="/login" className="text-tvp-accent-cyan hover:text-tvp-accent-cyan-hover font-medium">
                Sign in
              </Link>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

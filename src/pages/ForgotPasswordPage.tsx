// ============================================
// THE VIDEO POOL - FORGOT PASSWORD PAGE
// ============================================

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Loader2, CheckCircle, ArrowLeft } from 'lucide-react';
import { authApi } from '@/api/auth';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await authApi.forgotPassword(email);
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to send reset email');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-tvp-bg-primary p-4">
        <div className="w-full max-w-md text-center">
          <div className="w-16 h-16 bg-tvp-success/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-tvp-success" />
          </div>
          <h1 className="text-2xl font-semibold text-tvp-text-primary mb-2">Check Your Email</h1>
          <p className="text-tvp-text-secondary mb-6">
            We've sent a password reset link to <strong className="text-tvp-text-primary">{email}</strong>.
            Please check your inbox and follow the instructions.
          </p>
          <p className="text-sm text-tvp-text-muted mb-6">
            Didn't receive the email? Check your spam folder or try again.
          </p>
          <Link
            to="/login"
            className="inline-block px-6 py-3 bg-tvp-accent-cyan hover:bg-tvp-accent-cyan-hover text-tvp-bg-primary font-semibold rounded-xl transition-colors"
          >
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-tvp-bg-primary p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5">
            <img
              src="/logo.png"
              alt="The Video Pool"
              className="h-12 w-auto object-contain"
            />
          </Link>
        </div>

        {/* Form */}
        <div className="bg-tvp-bg-secondary border border-tvp-border-subtle rounded-2xl p-8">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-sm text-tvp-text-secondary hover:text-tvp-text-primary mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Login
          </Link>

          <h1 className="text-2xl font-semibold text-tvp-text-primary mb-2">
            Forgot Password?
          </h1>
          <p className="text-tvp-text-secondary mb-6">
            No worries! Enter your email and we'll send you a reset link.
          </p>

          {error && (
            <div className="mb-4 p-3 bg-tvp-error/10 border border-tvp-error/20 rounded-lg text-sm text-tvp-error">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-tvp-text-secondary mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-tvp-text-muted" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-tvp-bg-tertiary border border-tvp-border-default rounded-xl text-tvp-text-primary placeholder:text-tvp-text-muted focus:border-tvp-accent-cyan focus:ring-2 focus:ring-tvp-accent-cyan/20 outline-none transition-all"
                  placeholder="Enter your email"
                  required
                  autoFocus
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-tvp-accent-cyan hover:bg-tvp-accent-cyan-hover text-tvp-bg-primary font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Sending...
                </>
              ) : (
                'Send Reset Link'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

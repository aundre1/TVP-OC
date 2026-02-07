// ============================================
// THE VIDEO POOL - EMAIL VERIFICATION PAGE
// Code entry flow for faster verification UX
// ============================================

import { useState, useEffect, useRef } from 'react';
import { Link, useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { Loader2, CheckCircle, XCircle, Mail, RefreshCw } from 'lucide-react';
import { authApi } from '@/api/auth';
import { clsx } from 'clsx';

export default function EmailVerificationPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Get email from location state (passed from registration) or URL
  const emailFromState = location.state?.email;
  const emailFromParams = searchParams.get('email');
  const email = emailFromState || emailFromParams || '';

  // For backward compatibility - check for token-based verification
  const token = searchParams.get('token');

  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [isVerifying, setIsVerifying] = useState(!!token);
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState('');
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [devCode, setDevCode] = useState<string | null>(
    location.state?._devCode || null
  );

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Token-based verification (backward compatibility)
  useEffect(() => {
    if (!token) return;

    const verifyWithToken = async () => {
      try {
        const result = await authApi.verifyEmail(token);
        setIsVerified(result.verified);
        if (!result.verified) {
          setError(result.message || 'Verification failed');
        }
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to verify email');
      } finally {
        setIsVerifying(false);
      }
    };

    verifyWithToken();
  }, [token]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  // Handle code input
  const handleCodeChange = (index: number, value: string) => {
    // Only allow digits
    const digit = value.replace(/\D/g, '').slice(-1);

    const newCode = [...code];
    newCode[index] = digit;
    setCode(newCode);
    setError('');

    // Auto-focus next input
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when complete
    if (digit && index === 5) {
      const fullCode = newCode.join('');
      if (fullCode.length === 6) {
        verifyCode(fullCode);
      }
    }
  };

  // Handle backspace
  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Handle paste
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);

    if (pastedData.length > 0) {
      const newCode = pastedData.split('').concat(Array(6).fill('')).slice(0, 6);
      setCode(newCode);

      // Focus the next empty input or the last one
      const focusIndex = Math.min(pastedData.length, 5);
      inputRefs.current[focusIndex]?.focus();

      // Auto-submit if complete
      if (pastedData.length === 6) {
        verifyCode(pastedData);
      }
    }
  };

  // Verify the code
  const verifyCode = async (codeStr: string) => {
    if (!email) {
      setError('Email address is required');
      return;
    }

    setIsVerifying(true);
    setError('');

    try {
      const result = await authApi.verifyEmailWithCode(email, codeStr);
      setIsVerified(true);
      // Redirect to login or home after short delay
      setTimeout(() => navigate('/login', { state: { verified: true } }), 2000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Invalid verification code');
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setIsVerifying(false);
    }
  };

  // Resend verification code
  const handleResend = async () => {
    if (!email || resendCooldown > 0) return;

    setIsResending(true);
    setError('');

    try {
      const result = await authApi.resendVerification(email);
      setResendCooldown(60); // 60 second cooldown
      // In dev mode, show the code
      if (result._devCode) {
        setDevCode(result._devCode);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to resend code');
    } finally {
      setIsResending(false);
    }
  };

  // Loading state (token-based verification)
  if (isVerifying && token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-tvp-bg-primary">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <Mail className="w-16 h-16 text-tvp-accent-cyan" />
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-tvp-bg-primary rounded-full flex items-center justify-center">
              <Loader2 className="w-4 h-4 text-tvp-accent-cyan animate-spin" />
            </div>
          </div>
          <span className="text-tvp-text-secondary">Verifying your email...</span>
        </div>
      </div>
    );
  }

  // Success state
  if (isVerified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-tvp-bg-primary p-4">
        <div className="w-full max-w-md text-center">
          <div className="w-20 h-20 bg-tvp-success/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-tvp-success" />
          </div>
          <h1 className="text-2xl font-semibold text-tvp-text-primary mb-2">Email Verified!</h1>
          <p className="text-tvp-text-secondary mb-6">
            Your email has been successfully verified. You now have full access to The Video Pool.
          </p>
          <div className="space-y-3">
            <Link
              to="/login"
              className="block w-full py-3 bg-tvp-accent-cyan hover:bg-tvp-accent-cyan-hover text-tvp-bg-primary font-semibold rounded-xl transition-colors"
            >
              Sign In to Your Account
            </Link>
            <Link
              to="/membership"
              className="block w-full py-3 border border-tvp-border-default hover:border-tvp-accent-cyan text-tvp-text-primary font-medium rounded-xl transition-colors"
            >
              View Membership Plans
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Code entry form
  return (
    <div className="min-h-screen flex items-center justify-center bg-tvp-bg-primary p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-tvp-accent-cyan/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-tvp-accent-cyan" />
          </div>
          <h1 className="text-2xl font-semibold text-tvp-text-primary mb-2">
            Verify Your Email
          </h1>
          <p className="text-tvp-text-secondary">
            {email ? (
              <>
                We've sent a 6-digit code to <br />
                <span className="text-tvp-text-primary font-medium">{email}</span>
              </>
            ) : (
              'Enter the 6-digit code from your email'
            )}
          </p>
        </div>

        {/* Dev mode code display */}
        {devCode && (
          <div className="mb-6 p-3 bg-tvp-bg-tertiary border border-tvp-border-subtle rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-xs text-tvp-text-muted">Dev Mode - Your code:</span>
              <span className="font-mono text-lg text-tvp-accent-cyan font-bold tracking-wider">
                {devCode}
              </span>
            </div>
          </div>
        )}

        {/* Code Input */}
        <div className="mb-6">
          <div className="flex justify-center gap-3" onPaste={handlePaste}>
            {code.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleCodeChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className={clsx(
                  'w-12 h-14 text-center text-2xl font-semibold rounded-xl',
                  'bg-tvp-bg-tertiary border-2 transition-all duration-fast',
                  'focus:outline-none',
                  error
                    ? 'border-tvp-error text-tvp-error'
                    : 'border-tvp-border-subtle focus:border-tvp-accent-cyan text-tvp-text-primary'
                )}
                autoFocus={index === 0}
              />
            ))}
          </div>

          {/* Error message */}
          {error && (
            <div className="mt-3 flex items-center justify-center gap-2 text-tvp-error text-sm">
              <XCircle className="w-4 h-4" />
              {error}
            </div>
          )}
        </div>

        {/* Verify Button */}
        <button
          onClick={() => verifyCode(code.join(''))}
          disabled={code.join('').length !== 6 || isVerifying}
          className={clsx(
            'w-full py-3 rounded-xl font-semibold transition-all duration-fast',
            'flex items-center justify-center gap-2',
            code.join('').length === 6 && !isVerifying
              ? 'bg-tvp-accent-cyan hover:bg-tvp-accent-cyan-hover text-black'
              : 'bg-tvp-bg-tertiary text-tvp-text-muted cursor-not-allowed'
          )}
        >
          {isVerifying ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Verifying...
            </>
          ) : (
            'Verify Email'
          )}
        </button>

        {/* Resend Code */}
        <div className="mt-6 text-center">
          <p className="text-sm text-tvp-text-muted mb-2">Didn't receive the code?</p>
          <button
            onClick={handleResend}
            disabled={isResending || resendCooldown > 0}
            className={clsx(
              'inline-flex items-center gap-2 text-sm font-medium transition-colors',
              resendCooldown > 0 || isResending
                ? 'text-tvp-text-muted cursor-not-allowed'
                : 'text-tvp-accent-cyan hover:text-tvp-accent-cyan-hover'
            )}
          >
            {isResending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Sending...
              </>
            ) : resendCooldown > 0 ? (
              <>
                <RefreshCw className="w-4 h-4" />
                Resend in {resendCooldown}s
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4" />
                Resend Code
              </>
            )}
          </button>
        </div>

        {/* Back to Login */}
        <div className="mt-8 text-center">
          <Link
            to="/login"
            className="text-sm text-tvp-text-muted hover:text-tvp-text-primary transition-colors"
          >
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}

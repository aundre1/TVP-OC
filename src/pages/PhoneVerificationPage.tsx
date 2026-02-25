// ============================================
// THE VIDEO POOL - PHONE VERIFICATION PAGE
// SMS MFA — verifies user's phone number after login
// ============================================

import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Smartphone, CheckCircle, RefreshCw, XCircle } from 'lucide-react';
import { authApi } from '@/api/auth';
import { useAuthStore } from '@/stores/authStore';
import { clsx } from 'clsx';

export default function PhoneVerificationPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);

  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const [codeSent, setCodeSent] = useState(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Auto-send SMS on mount
  useEffect(() => {
    sendCode();
  }, []);

  // Countdown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const t = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [resendCooldown]);

  const sendCode = async () => {
    setIsSending(true);
    setError('');
    try {
      await authApi.sendPhoneVerification();
      setCodeSent(true);
      setResendCooldown(60);
      // Focus first input after sending
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to send verification code');
    } finally {
      setIsSending(false);
    }
  };

  const handleCodeChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    const newCode = [...code];
    newCode[index] = digit;
    setCode(newCode);
    setError('');

    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    if (digit && index === 5) {
      const full = newCode.join('');
      if (full.length === 6) verifyCode(full);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length > 0) {
      const newCode = pasted.split('').concat(Array(6).fill('')).slice(0, 6);
      setCode(newCode);
      const focusIdx = Math.min(pasted.length, 5);
      inputRefs.current[focusIdx]?.focus();
      if (pasted.length === 6) verifyCode(pasted);
    }
  };

  const verifyCode = async (codeStr: string) => {
    setIsVerifying(true);
    setError('');
    try {
      await authApi.verifyPhoneCode(codeStr);
      setIsVerified(true);

      // Update user in store to reflect phoneVerified
      if (user) {
        setUser({ ...user, phoneVerified: true });
      }

      // Redirect to home after short delay
      setTimeout(() => navigate('/home'), 2000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Invalid code. Please try again.');
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setIsVerifying(false);
    }
  };

  // Success state
  if (isVerified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-tvp-bg-primary p-4">
        <div className="w-full max-w-md text-center">
          <div className="w-20 h-20 bg-tvp-success/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-tvp-success" />
          </div>
          <h1 className="text-2xl font-semibold text-tvp-text-primary mb-2">Phone Verified!</h1>
          <p className="text-tvp-text-secondary mb-6">
            Your phone number has been verified. SMS alerts are now active on your account.
          </p>
          <div className="flex items-center justify-center gap-2 text-tvp-text-muted text-sm">
            <Loader2 className="w-4 h-4 animate-spin" />
            Redirecting to dashboard...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-tvp-bg-primary p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-tvp-accent-cyan/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Smartphone className="w-8 h-8 text-tvp-accent-cyan" />
          </div>
          <h1 className="text-2xl font-semibold text-tvp-text-primary mb-2">
            Verify Your Phone
          </h1>
          <p className="text-tvp-text-secondary text-sm">
            {isSending ? (
              'Sending verification code...'
            ) : codeSent ? (
              <>
                A 6-digit code has been sent to your phone.<br />
                <span className="text-tvp-text-muted text-xs mt-1 block">
                  Check your SMS messages.
                </span>
              </>
            ) : (
              'We\'ll send a code to your registered phone number.'
            )}
          </p>
        </div>

        <div className="bg-tvp-bg-secondary border border-tvp-border-subtle rounded-2xl p-8">
          {/* Sending state */}
          {isSending && (
            <div className="flex flex-col items-center gap-3 py-6">
              <Loader2 className="w-8 h-8 text-tvp-accent-cyan animate-spin" />
              <span className="text-tvp-text-secondary text-sm">Sending code via SMS...</span>
            </div>
          )}

          {/* Code entry */}
          {!isSending && codeSent && (
            <>
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
                        'bg-tvp-bg-tertiary border-2 transition-all',
                        'focus:outline-none',
                        error
                          ? 'border-tvp-error text-tvp-error'
                          : 'border-tvp-border-subtle focus:border-tvp-accent-cyan text-tvp-text-primary'
                      )}
                    />
                  ))}
                </div>

                {error && (
                  <div className="mt-3 flex items-center justify-center gap-2 text-tvp-error text-sm">
                    <XCircle className="w-4 h-4" />
                    {error}
                  </div>
                )}
              </div>

              {/* Verify button */}
              <button
                onClick={() => verifyCode(code.join(''))}
                disabled={code.join('').length !== 6 || isVerifying}
                className={clsx(
                  'w-full py-3 rounded-xl font-semibold transition-all',
                  'flex items-center justify-center gap-2',
                  code.join('').length === 6 && !isVerifying
                    ? 'bg-tvp-accent-cyan hover:bg-tvp-accent-cyan-hover text-tvp-bg-primary'
                    : 'bg-tvp-bg-tertiary text-tvp-text-muted cursor-not-allowed'
                )}
              >
                {isVerifying ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  'Verify Phone'
                )}
              </button>

              {/* Resend */}
              <div className="mt-4 text-center">
                <p className="text-xs text-tvp-text-muted mb-2">Didn't receive the code?</p>
                <button
                  onClick={sendCode}
                  disabled={isSending || resendCooldown > 0}
                  className={clsx(
                    'inline-flex items-center gap-2 text-sm font-medium transition-colors',
                    resendCooldown > 0 || isSending
                      ? 'text-tvp-text-muted cursor-not-allowed'
                      : 'text-tvp-accent-cyan hover:text-tvp-accent-cyan-hover'
                  )}
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
                </button>
              </div>
            </>
          )}

          {/* Skip option */}
          <div className="mt-6 pt-4 border-t border-tvp-border-subtle text-center">
            <button
              onClick={() => navigate('/home')}
              className="text-xs text-tvp-text-muted hover:text-tvp-text-secondary transition-colors"
            >
              Skip for now — verify phone in Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

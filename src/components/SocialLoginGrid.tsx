// ============================================
// THE VIDEO POOL - SOCIAL LOGIN GRID
// 2 rows of 4 — symmetrical identity providers
// ============================================

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import { Loader2 } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useToast } from '@/components/Toast';
import { OAUTH_CONFIG } from '@/config/oauth';

interface SocialLoginGridProps {
  mode?: 'login' | 'signup';
}

// Check if Google OAuth is properly configured
const isGoogleConfigured: boolean = !!(
  OAUTH_CONFIG.google.clientId &&
  OAUTH_CONFIG.google.clientId !== 'your-client-id-here'
);

// ── Icon Components ──────────────────────────────────────────

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="#1877F2" className="w-5 h-5">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-white">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
    </svg>
  );
}

function MicrosoftIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5">
      <path fill="#F25022" d="M1 1h10v10H1z"/>
      <path fill="#7FBA00" d="M13 1h10v10H13z"/>
      <path fill="#00A4EF" d="M1 13h10v10H1z"/>
      <path fill="#FFB900" d="M13 13h10v10H13z"/>
    </svg>
  );
}

function SpotifyIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="#1DB954" className="w-5 h-5">
      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
    </svg>
  );
}

function TwitterXIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-white">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5">
      <defs>
        <linearGradient id="ig-grad" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#F58529"/>
          <stop offset="50%" stopColor="#DD2A7B"/>
          <stop offset="100%" stopColor="#8134AF"/>
        </linearGradient>
      </defs>
      <path fill="url(#ig-grad)" d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
    </svg>
  );
}

function TikTokIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-white">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V9.41a8.16 8.16 0 004.77 1.52V7.49a4.85 4.85 0 01-1-.8z"/>
    </svg>
  );
}

// ── Provider Config ──────────────────────────────────────────

interface Provider {
  id: string;
  label: string;
  icon: JSX.Element;
  available: boolean;
  bg: string;
  border: string;
}

const PROVIDERS: Provider[][] = [
  [
    { id: 'google',    label: 'Google',    icon: <GoogleIcon />,    available: isGoogleConfigured,  bg: 'bg-white/5 hover:bg-white/10',            border: 'border-white/10 hover:border-[#4285F4]/60' },
    { id: 'facebook',  label: 'Facebook',  icon: <FacebookIcon />,  available: false, bg: 'bg-white/5 hover:bg-white/10',            border: 'border-white/10 hover:border-[#1877F2]/60' },
    { id: 'apple',     label: 'Apple',     icon: <AppleIcon />,     available: false, bg: 'bg-white/5 hover:bg-white/10',            border: 'border-white/10 hover:border-white/30'     },
    { id: 'microsoft', label: 'Microsoft', icon: <MicrosoftIcon />, available: false, bg: 'bg-white/5 hover:bg-white/10',            border: 'border-white/10 hover:border-[#00A4EF]/60' },
  ],
  [
    { id: 'spotify',   label: 'Spotify',   icon: <SpotifyIcon />,   available: false, bg: 'bg-white/5 hover:bg-white/10',            border: 'border-white/10 hover:border-[#1DB954]/60' },
    { id: 'twitter',   label: 'X / Twitter', icon: <TwitterXIcon />,available: false, bg: 'bg-white/5 hover:bg-white/10',            border: 'border-white/10 hover:border-white/30'     },
    { id: 'instagram', label: 'Instagram', icon: <InstagramIcon />, available: false, bg: 'bg-white/5 hover:bg-white/10',            border: 'border-white/10 hover:border-[#DD2A7B]/60' },
    { id: 'tiktok',    label: 'TikTok',    icon: <TikTokIcon />,    available: false, bg: 'bg-white/5 hover:bg-white/10',            border: 'border-white/10 hover:border-white/30'     },
  ],
];

// ── Google Login Hook (child component to isolate the hook call) ──

function GoogleLoginHook({
  onReady,
  onSuccess,
  onError,
}: {
  onReady: (loginFn: () => void) => void;
  onSuccess: (accessToken: string) => void;
  onError: () => void;
}) {
  const googleLogin = useGoogleLogin({
    onSuccess: (tokenResponse) => {
      onSuccess(tokenResponse.access_token);
    },
    onError: () => {
      onError();
    },
  });

  // Pass the login function to the parent
  useEffect(() => {
    onReady(googleLogin);
  }, [googleLogin, onReady]);

  return null; // Renders nothing — just provides the hook
}

// ── Main Component ───────────────────────────────────────────

export default function SocialLoginGrid({ mode = 'login' }: SocialLoginGridProps) {
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);
  const [googleLoginFn, setGoogleLoginFn] = useState<(() => void) | null>(null);
  const loginWithGoogle = useAuthStore((state) => state.loginWithGoogle);
  const navigate = useNavigate();
  const toast = useToast();

  const handleGoogleReady = useCallback((loginFn: () => void) => {
    setGoogleLoginFn(() => loginFn);
  }, []);

  const handleGoogleSuccess = useCallback(async (accessToken: string) => {
    setLoadingProvider('google');
    try {
      const success = await loginWithGoogle(accessToken);
      if (success) {
        toast.success('Signed in with Google');
        const user = useAuthStore.getState().user;
        if (user && user.phoneVerified === false) {
          navigate('/verify-phone');
        } else {
          navigate('/home');
        }
      } else {
        toast.error('Google sign-in failed. Please try again.');
      }
    } catch {
      toast.error('Google sign-in failed. Please try again.');
    } finally {
      setLoadingProvider(null);
    }
  }, [loginWithGoogle, navigate, toast]);

  const handleGoogleError = useCallback(() => {
    toast.error('Google sign-in is unavailable. Please use email/password to log in.');
    setLoadingProvider(null);
  }, [toast]);

  const handleProviderClick = (provider: Provider) => {
    if (!provider.available) return;
    if (provider.id === 'google' && googleLoginFn) {
      setLoadingProvider('google');
      googleLoginFn();
    }
  };

  return (
    <>
      {/* Invisible hook component — only mounts when Google OAuth is configured */}
      {isGoogleConfigured && (
        <GoogleLoginHook
          onReady={handleGoogleReady}
          onSuccess={handleGoogleSuccess}
          onError={handleGoogleError}
        />
      )}

      <div className="space-y-2">
        {PROVIDERS.map((row, rowIdx) => (
          <div key={rowIdx} className="grid grid-cols-4 gap-2">
            {row.map((provider) => {
              const isLoading = loadingProvider === provider.id;
              const isDisabled = !provider.available || (loadingProvider !== null && loadingProvider !== provider.id);

              return (
                <div key={provider.id} className="relative group">
                  <button
                    type="button"
                    onClick={() => handleProviderClick(provider)}
                    disabled={isDisabled || isLoading}
                    title={provider.available ? `${mode === 'signup' ? 'Sign up' : 'Sign in'} with ${provider.label}` : `${provider.label} — Coming soon`}
                    className={`
                      w-full h-11
                      flex flex-col items-center justify-center gap-1
                      rounded-xl border transition-all duration-200
                      ${provider.bg} ${provider.border}
                      ${!provider.available ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
                      ${isLoading ? 'opacity-70' : ''}
                      ${isDisabled && provider.available ? 'opacity-50' : ''}
                    `}
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin text-tvp-text-muted" />
                    ) : (
                      provider.icon
                    )}
                  </button>

                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-tvp-bg-primary border border-tvp-border-subtle rounded-lg text-xs text-tvp-text-secondary whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                    {provider.available
                      ? `${mode === 'signup' ? 'Sign up' : 'Sign in'} with ${provider.label}`
                      : `${provider.label} — Coming soon`}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-tvp-border-subtle" />
                  </div>
                </div>
              );
            })}
          </div>
        ))}

        <p className="text-center text-xs text-tvp-text-muted pt-1">
          More sign-in options coming soon
        </p>
      </div>
    </>
  );
}

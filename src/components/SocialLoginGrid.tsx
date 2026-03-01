// ============================================
// THE VIDEO POOL - SOCIAL LOGIN GRID
// 2 rows of 4 — symmetrical identity providers
// ============================================

import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import { Loader2 } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useToast } from '@/components/Toast';
import { OAUTH_CONFIG } from '@/config/oauth';

// Extend window for Facebook SDK and Apple Sign In
declare global {
  interface Window {
    FB: any;
    fbAsyncInit: () => void;
    AppleID: any;
  }
}

interface SocialLoginGridProps {
  mode?: 'login' | 'signup';
}

// Check if Google OAuth is properly configured
const isGoogleConfigured: boolean = !!(
  OAUTH_CONFIG.google.clientId &&
  OAUTH_CONFIG.google.clientId !== 'your-client-id-here'
);

// Check if Facebook OAuth is properly configured
const isFacebookConfigured: boolean = !!(
  OAUTH_CONFIG.facebook.appId &&
  OAUTH_CONFIG.facebook.appId !== 'your-facebook-app-id-here'
);

// Check if Apple OAuth is properly configured
const isAppleConfigured: boolean = !!(
  OAUTH_CONFIG.apple.teamId &&
  OAUTH_CONFIG.apple.teamId !== 'your-team-id-here' &&
  OAUTH_CONFIG.apple.bundleId &&
  OAUTH_CONFIG.apple.bundleId !== 'your-bundle-id-here' &&
  OAUTH_CONFIG.apple.keyId &&
  OAUTH_CONFIG.apple.keyId !== 'your-key-id-here'
);

// Check if Spotify OAuth is properly configured
const isSpotifyConfigured: boolean = !!(
  OAUTH_CONFIG.spotify.clientId &&
  OAUTH_CONFIG.spotify.clientId !== 'your-client-id-here'
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

function SpotifyIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="#1DB954" className="w-5 h-5">
      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
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

const PROVIDERS: Provider[] = [
  { id: 'google',    label: 'Google',    icon: <GoogleIcon />,    available: isGoogleConfigured,   bg: 'bg-white/5 hover:bg-white/10', border: 'border-white/10 hover:border-[#4285F4]/60' },
  { id: 'facebook',  label: 'Facebook',  icon: <FacebookIcon />,  available: isFacebookConfigured, bg: 'bg-white/5 hover:bg-white/10', border: 'border-white/10 hover:border-[#1877F2]/60' },
  { id: 'apple',     label: 'Apple',     icon: <AppleIcon />,     available: isAppleConfigured,    bg: 'bg-white/5 hover:bg-white/10', border: 'border-white/10 hover:border-white/30'     },
  { id: 'spotify',   label: 'Spotify',   icon: <SpotifyIcon />,   available: isSpotifyConfigured,  bg: 'bg-white/5 hover:bg-white/10', border: 'border-white/10 hover:border-[#1DB954]/60' },
];

// ── Facebook Login Hook ───────────────────────────────────────

function FacebookLoginHook({
  appId,
  onReady,
  onSuccess,
  onError,
}: {
  appId: string;
  onReady: (loginFn: () => void) => void;
  onSuccess: (accessToken: string) => void;
  onError: () => void;
}) {
  const onReadyRef = useRef(onReady);
  const onSuccessRef = useRef(onSuccess);
  const onErrorRef = useRef(onError);

  useEffect(() => {
    onReadyRef.current = onReady;
    onSuccessRef.current = onSuccess;
    onErrorRef.current = onError;
  });

  useEffect(() => {
    if (!appId) return;

    const initAndRegister = () => {
      if (window.FB) {
        window.FB.init({ appId, cookie: true, xfbml: false, version: 'v19.0' });
      }
      onReadyRef.current(() => {
        window.FB.login(
          (response: any) => {
            if (response.status === 'connected' && response.authResponse?.accessToken) {
              onSuccessRef.current(response.authResponse.accessToken);
            } else {
              onErrorRef.current();
            }
          },
          { scope: 'public_profile,email' }
        );
      });
    };

    if (window.FB) {
      initAndRegister();
      return;
    }

    window.fbAsyncInit = initAndRegister;

    if (!document.getElementById('facebook-jssdk')) {
      const script = document.createElement('script');
      script.id = 'facebook-jssdk';
      script.src = 'https://connect.facebook.net/en_US/sdk.js';
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }
  }, [appId]);

  return null;
}

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
  const [facebookLoginFn, setFacebookLoginFn] = useState<(() => void) | null>(null);
  const loginWithGoogle = useAuthStore((state) => state.loginWithGoogle);
  const loginWithFacebook = useAuthStore((state) => state.loginWithFacebook);
  const loginWithApple = useAuthStore((state) => state.loginWithApple);
  const loginWithSpotify = useAuthStore((state) => state.loginWithSpotify);
  const navigate = useNavigate();
  const toast = useToast();

  // ── Redirect helper ───────────────────────────────────────
  const redirectAfterOAuth = useCallback(() => {
    const user = useAuthStore.getState().user;
    if (user && user.phoneVerified === false) {
      navigate('/verify-phone');
    } else {
      navigate('/home');
    }
  }, [navigate]);

  // ── Google handlers ───────────────────────────────────────
  const handleGoogleReady = useCallback((loginFn: () => void) => {
    setGoogleLoginFn(() => loginFn);
  }, []);

  const handleGoogleSuccess = useCallback(async (accessToken: string) => {
    try {
      const success = await loginWithGoogle(accessToken);
      if (success) {
        toast.success('Signed in with Google');
        redirectAfterOAuth();
      } else {
        toast.error('Google sign-in failed. Please try again.');
      }
    } catch {
      toast.error('Google sign-in failed. Please try again.');
    } finally {
      setLoadingProvider(null);
    }
  }, [loginWithGoogle, redirectAfterOAuth, toast]);

  const handleGoogleError = useCallback(() => {
    toast.error('Google sign-in is unavailable. Please use email/password to log in.');
    setLoadingProvider(null);
  }, [toast]);

  // ── Facebook handlers ─────────────────────────────────────
  const handleFacebookReady = useCallback((loginFn: () => void) => {
    setFacebookLoginFn(() => loginFn);
  }, []);

  const handleFacebookSuccess = useCallback(async (accessToken: string) => {
    setLoadingProvider('facebook');
    try {
      const success = await loginWithFacebook(accessToken);
      if (success) {
        toast.success('Signed in with Facebook');
        redirectAfterOAuth();
      } else {
        toast.error('Facebook sign-in failed. Please try again.');
      }
    } catch {
      toast.error('Facebook sign-in failed. Please try again.');
    } finally {
      setLoadingProvider(null);
    }
  }, [loginWithFacebook, redirectAfterOAuth, toast]);

  const handleFacebookError = useCallback(() => {
    toast.error('Facebook sign-in is unavailable. Please use email/password to log in.');
    setLoadingProvider(null);
  }, [toast]);

  // ── Apple handlers ────────────────────────────────────────
  const handleAppleClick = useCallback(async () => {
    if (!isAppleConfigured) {
      toast.error('Apple Sign In is not configured. Please use email/password.');
      return;
    }

    setLoadingProvider('apple');
    try {
      // Check if AppleID is available on the window
      if (window.AppleID && window.AppleID.auth) {
        window.AppleID.auth.init({
          clientId: OAUTH_CONFIG.apple.bundleId,
          teamId: OAUTH_CONFIG.apple.teamId,
          keyId: OAUTH_CONFIG.apple.keyId,
          redirectURI: `${window.location.origin}/auth/apple/callback`,
          usePopup: true,
        });

        window.AppleID.auth.signIn().then(async (response: any) => {
          try {
            const success = await loginWithApple(response.authorization.id_token);
            if (success) {
              toast.success('Signed in with Apple');
              const user = useAuthStore.getState().user;
              if (user && user.phoneVerified === false) {
                navigate('/verify-phone');
              } else {
                navigate('/home');
              }
            } else {
              toast.error('Apple sign-in failed. Please try again.');
            }
          } catch (error: any) {
            toast.error('Apple sign-in failed. Please try again.');
          } finally {
            setLoadingProvider(null);
          }
        }).catch(() => {
          toast.error('Apple sign-in was cancelled. Please try again.');
          setLoadingProvider(null);
        });
      } else {
        toast.error('Apple SDK not loaded. Please refresh and try again.');
        setLoadingProvider(null);
      }
    } catch (error: any) {
      toast.error('Apple sign-in is unavailable. Please use email/password to log in.');
      setLoadingProvider(null);
    }
  }, [loginWithApple, navigate, toast, isAppleConfigured]);

  // ── Spotify handlers (PKCE Authorization Code Flow) ──────────
  const handleSpotifyClick = useCallback(async () => {
    if (!isSpotifyConfigured) {
      toast.error('Spotify Sign In is not configured. Please use email/password.');
      return;
    }

    setLoadingProvider('spotify');

    try {
      // Generate PKCE code_verifier
      const array = new Uint8Array(32);
      crypto.getRandomValues(array);
      const codeVerifier = btoa(String.fromCharCode(...array))
        .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');

      // Generate code_challenge = base64url(sha256(codeVerifier))
      const encoder = new TextEncoder();
      const data = encoder.encode(codeVerifier);
      const digest = await crypto.subtle.digest('SHA-256', data);
      const codeChallenge = btoa(String.fromCharCode(...new Uint8Array(digest)))
        .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');

      // Persist verifier so callback page can use it
      sessionStorage.setItem('spotify_code_verifier', codeVerifier);

      const redirectUri = `${window.location.origin}/auth/spotify/callback`;
      const params = new URLSearchParams({
        client_id: OAUTH_CONFIG.spotify.clientId,
        response_type: 'code',
        redirect_uri: redirectUri,
        code_challenge_method: 'S256',
        code_challenge: codeChallenge,
        scope: 'user-read-email user-read-private',
      });

      // Open popup — Spotify will redirect back to /auth/spotify/callback
      const popup = window.open(
        `https://accounts.spotify.com/authorize?${params}`,
        'spotify-oauth',
        'width=500,height=700,left=200,top=100'
      );

      // Listen for access token posted back by callback page
      const handleMessage = async (event: MessageEvent) => {
        if (event.origin !== window.location.origin) return;
        if (event.data?.type !== 'spotify-oauth-token') return;

        window.removeEventListener('message', handleMessage);
        if (popup && !popup.closed) popup.close();

        const { accessToken } = event.data;
        if (!accessToken) {
          toast.error('Spotify sign-in failed. Please try again.');
          setLoadingProvider(null);
          return;
        }

        try {
          const success = await loginWithSpotify(accessToken);
          if (success) {
            toast.success('Signed in with Spotify');
            redirectAfterOAuth();
          } else {
            toast.error('Spotify sign-in failed. Please try again.');
          }
        } catch {
          toast.error('Spotify sign-in failed. Please try again.');
        } finally {
          setLoadingProvider(null);
        }
      };

      window.addEventListener('message', handleMessage);

      // Cleanup if popup is closed without completing
      const checkClosed = setInterval(() => {
        if (popup && popup.closed) {
          clearInterval(checkClosed);
          window.removeEventListener('message', handleMessage);
          setLoadingProvider(null);
        }
      }, 500);
    } catch {
      toast.error('Spotify sign-in is unavailable. Please use email/password.');
      setLoadingProvider(null);
    }
  }, [loginWithSpotify, redirectAfterOAuth, toast]);

  const handleProviderClick = (provider: Provider) => {
    if (!provider.available) return;

    if (provider.id === 'google') {
      if (!googleLoginFn) {
        toast.info('Initializing Google Sign In...');
        return;
      }
      setLoadingProvider('google');
      googleLoginFn();
    } else if (provider.id === 'facebook') {
      if (!facebookLoginFn) {
        toast.info('Initializing Facebook Sign In...');
        return;
      }
      setLoadingProvider('facebook');
      facebookLoginFn();
    } else if (provider.id === 'apple') {
      handleAppleClick();
    } else if (provider.id === 'spotify') {
      handleSpotifyClick();
    }
  };

  return (
    <>
      {/* Invisible hook components — only mount when configured */}
      {isGoogleConfigured && (
        <GoogleLoginHook
          onReady={handleGoogleReady}
          onSuccess={handleGoogleSuccess}
          onError={handleGoogleError}
        />
      )}
      {isFacebookConfigured && (
        <FacebookLoginHook
          appId={OAUTH_CONFIG.facebook.appId}
          onReady={handleFacebookReady}
          onSuccess={handleFacebookSuccess}
          onError={handleFacebookError}
        />
      )}

      <div className="space-y-3">
        <div className="grid grid-cols-4 gap-2">
          {PROVIDERS.map((provider) => {
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
      </div>
    </>
  );
}

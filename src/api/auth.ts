// ============================================
// THE VIDEO POOL - AUTH API
// ============================================

import { get, post } from './client';
import { DEV_CONFIG } from '@/config/dev';
import type { User, LoginCredentials, RegisterData, TwoFactorVerifyData } from '@/types';

interface LoginResponse {
  user?: User;
  success: boolean;
  message: string;
  requires2FA?: boolean;
  // accessToken and refreshToken are now HttpOnly cookies (tvp_token, tvp_refresh_token)
  // tempToken is also an HttpOnly cookie (tvp_temp_token) when 2FA required
}

interface GoogleLoginResponse {
  user: User;
  success: boolean;
  message: string;
  // accessToken and refreshToken are now HttpOnly cookies (tvp_token, tvp_refresh_token)
}

interface FacebookLoginResponse {
  user: User;
  success: boolean;
  message: string;
  // accessToken and refreshToken are now HttpOnly cookies (tvp_token, tvp_refresh_token)
}

interface SpotifyLoginResponse {
  user: User;
  success: boolean;
  message: string;
  // accessToken and refreshToken are now HttpOnly cookies (tvp_token, tvp_refresh_token)
}

interface AppleLoginResponse {
  user: User;
  success: boolean;
  message: string;
  // accessToken and refreshToken are now HttpOnly cookies (tvp_token, tvp_refresh_token)
}

interface RegisterResponse {
  message: string;
  verificationSent: boolean;
  _devCode?: string; // Only in dev mode for testing
}

interface VerifyEmailResponse {
  message: string;
  verified: boolean;
}

interface TwoFactorSetupResponse {
  secret: string;
  qrCode: string;
  backupCodes: string[];
}

interface TwoFactorStatusResponse {
  enabled: boolean;
  backupCodesRemaining: number;
}

// ============================================
// USER NORMALIZATION
// Maps either backend's user object to our User type.
//   Our backend:    camelCase fields, success wrapper
//   Steve's backend: may use snake_case, flat response, different field names
// ============================================
function normalizeUser(raw: Record<string, unknown>): User {
  const membershipType = (raw.membershipType ?? raw.membership_type ?? 'free') as string;
  const validTiers = ['free', 'starter', 'pro', 'elite'] as const;
  const resolvedTier = validTiers.includes(membershipType as typeof validTiers[number])
    ? (membershipType as typeof validTiers[number])
    : 'free';

  return {
    id: (raw.id as number),
    username: (raw.username ?? raw.name ?? (raw.email as string)?.split('@')[0] ?? '') as string,
    email: (raw.email ?? '') as string,
    membershipId: (raw.membershipId ?? raw.membership_id ?? null) as number | null,
    membershipType: resolvedTier,
    isAdmin: Boolean(raw.isAdmin ?? raw.is_admin ?? (raw.role === 'admin')),
    emailVerified: Boolean(raw.emailVerified ?? raw.email_verified ?? raw.email_verified_at != null),
    phoneVerified: Boolean(raw.phoneVerified ?? raw.phone_verified ?? false),
    twoFactorEnabled: Boolean(raw.twoFactorEnabled ?? raw.two_factor_enabled ?? false),
    profileImage: (raw.profileImage ?? raw.profile_image ?? raw.avatar_url ?? undefined) as string | undefined,
    createdAt: (raw.createdAt ?? raw.created_at ?? new Date().toISOString()) as string,
    downloadsThisMonth: (raw.downloadsThisMonth ?? raw.downloads_this_month ?? 0) as number,
    downloadLimit: (raw.downloadLimit ?? raw.monthly_download_limit ?? raw.download_limit ?? null) as number | null,
    bonusCredits: (raw.bonusCredits ?? raw.bonus_credits ?? 0) as number,
    freeTrialStartedAt: (raw.freeTrialStartedAt ?? raw.free_trial_started_at ?? undefined) as string | undefined,
    freeTrialExpiresAt: (raw.freeTrialExpiresAt ?? raw.free_trial_expires_at ?? undefined) as string | undefined,
  };
}

export const authApi = {
  // Login with email/password
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    // Mock mode for development
    if (DEV_CONFIG.useMockAuth) {
      return {
        success: true,
        message: 'Login successful (mock)',
        user: DEV_CONFIG.mockUser,
        // No accessToken in response — tokens now in HttpOnly cookies only
      };
    }

    const response = await post<LoginResponse>('/auth/login', credentials);

    // Tokens are now set as HttpOnly cookies by backend
    // Normalize user object to handle both our format and Steve's format
    if (response.user) {
      response.user = normalizeUser(response.user as unknown as Record<string, unknown>);
    }

    return response;
  },

  // Login with Google OAuth
  async loginWithGoogle(accessToken: string): Promise<GoogleLoginResponse> {
    // Mock mode for development
    if (DEV_CONFIG.useMockAuth) {
      const mockGoogleUser: User = {
        ...DEV_CONFIG.mockUser,
        id: 1001,
        username: 'GoogleUser',
        email: 'googleuser@gmail.com',
      };
      return {
        user: mockGoogleUser,
        success: true,
        message: 'Google authentication successful (mock)',
        // No accessToken in response — tokens now in HttpOnly cookies only
      };
    }

    const response = await post<GoogleLoginResponse>('/auth/google', { accessToken });

    // Tokens are now set as HttpOnly cookies by backend
    if (response.user) {
      response.user = normalizeUser(response.user as unknown as Record<string, unknown>);
    }

    return response;
  },

  // Login with Facebook OAuth
  async loginWithFacebook(accessToken: string): Promise<FacebookLoginResponse> {
    if (DEV_CONFIG.useMockAuth) {
      const mockFacebookUser: User = {
        ...DEV_CONFIG.mockUser,
        id: 1002,
        username: 'FacebookUser',
        email: 'facebookuser@example.com',
      };
      return {
        user: mockFacebookUser,
        success: true,
        message: 'Facebook authentication successful (mock)',
        // No accessToken in response — tokens now in HttpOnly cookies only
      };
    }

    const response = await post<FacebookLoginResponse>('/auth/facebook', { accessToken });

    // Tokens are now set as HttpOnly cookies by backend
    if (response.user) {
      response.user = normalizeUser(response.user as unknown as Record<string, unknown>);
    }

    return response;
  },

  // Complete 2FA verification during login
  async verify2FA(data: TwoFactorVerifyData): Promise<LoginResponse> {
    // Mock mode for development
    if (DEV_CONFIG.useMockAuth) {
      return {
        success: true,
        message: 'Login successful (mock)',
        user: DEV_CONFIG.mockUser,
        // No accessToken in response — tokens now in HttpOnly cookies only
      };
    }

    const response = await post<LoginResponse>('/auth/login/2fa', data);

    // Tokens are now set as HttpOnly cookies by backend
    if (response.user) {
      response.user = normalizeUser(response.user as unknown as Record<string, unknown>);
    }

    return response;
  },

  // Register new account
  async register(data: RegisterData): Promise<RegisterResponse> {
    // Mock mode for development
    if (DEV_CONFIG.useMockAuth) {
      // Generate a mock 6-digit code for dev testing
      const mockCode = String(Math.floor(100000 + Math.random() * 900000));
      return {
        message: 'Registration successful (mock)',
        verificationSent: true,
        _devCode: mockCode,
      };
    }

    return post<RegisterResponse>('/auth/register', data);
  },

  // Logout
  async logout(): Promise<void> {
    // Mock mode for development
    if (DEV_CONFIG.useMockAuth) {
      // No token handling needed — cookies are cleared by browser defaults
      return;
    }

    try {
      await post('/auth/logout');
      // Backend clears tvp_token and tvp_refresh_token cookies
    } catch (error) {
      // Even if logout fails, redirect to login (handled by app)
      throw error;
    }
  },

  // Get current user
  async getCurrentUser(): Promise<User | null> {
    // Mock mode for development
    if (DEV_CONFIG.useMockAuth) {
      // If skipAutoLogin is true, return null to show landing page
      if (DEV_CONFIG.skipAutoLogin) {
        return null;
      }
      return DEV_CONFIG.mockUser;
    }

    try {
      // GET /auth/me reads tvp_token from HttpOnly cookie automatically
      // Handles two response shapes:
      //   Our backend:    { success: true, user: { ...fields } }
      //   Steve's backend: { ...fields } (flat) or { user: { ...fields } }
      const response = await get<Record<string, unknown>>('/auth/me');
      if (!response) return null;

      // Prefer the nested user object; fall back to the response itself if it has an id
      const raw = (response.user as Record<string, unknown>) ?? (response.id ? response : null);
      if (!raw) return null;

      return normalizeUser(raw);
    } catch {
      // 401 (no valid token) returns null
      // This allows app to show landing page instead of hanging
      // Expected on first load when no session cookie exists
      return null;
    }
  },

  // Email verification (token-based - backward compatibility)
  async verifyEmail(token: string): Promise<VerifyEmailResponse> {
    if (DEV_CONFIG.useMockAuth) {
      return { message: 'Email verified (mock)', verified: true };
    }
    return post<VerifyEmailResponse>('/auth/verify-email', { token });
  },

  // Email verification (code-based - preferred UX)
  async verifyEmailWithCode(email: string, code: string): Promise<VerifyEmailResponse> {
    if (DEV_CONFIG.useMockAuth) {
      // In mock mode, accept any 6-digit code
      if (code.length === 6 && /^\d+$/.test(code)) {
        return { message: 'Email verified (mock)', verified: true };
      }
      throw { response: { data: { error: 'Invalid verification code' } } };
    }
    return post<VerifyEmailResponse>('/auth/verify-email-code', { email, code });
  },

  async resendVerification(email?: string): Promise<{ message: string; _devCode?: string }> {
    if (DEV_CONFIG.useMockAuth) {
      // Generate a mock code for dev mode
      const mockCode = String(Math.floor(100000 + Math.random() * 900000));
      return {
        message: 'Verification email sent (mock)',
        _devCode: mockCode
      };
    }
    return post<{ message: string; _devCode?: string }>(
      '/auth/resend-verification',
      email ? { email } : undefined
    );
  },

  async getVerificationStatus(): Promise<{ verified: boolean }> {
    if (DEV_CONFIG.useMockAuth) {
      return { verified: true };
    }
    return get<{ verified: boolean }>('/auth/verification-status');
  },

  // Password reset
  async forgotPassword(email: string): Promise<{ message: string }> {
    if (DEV_CONFIG.useMockAuth) {
      return { message: 'Password reset email sent (mock)' };
    }
    return post<{ message: string }>('/auth/forgot-password', { email });
  },

  async validateResetToken(token: string): Promise<{ valid: boolean }> {
    if (DEV_CONFIG.useMockAuth) {
      return { valid: true };
    }
    return post<{ valid: boolean }>('/auth/validate-reset-token', { token });
  },

  async resetPassword(token: string, password: string): Promise<{ message: string }> {
    if (DEV_CONFIG.useMockAuth) {
      return { message: 'Password reset successful (mock)' };
    }
    return post<{ message: string }>('/auth/reset-password', { token, password });
  },

  // Two-Factor Authentication
  async get2FAStatus(): Promise<TwoFactorStatusResponse> {
    if (DEV_CONFIG.useMockAuth) {
      return { enabled: false, backupCodesRemaining: 10 };
    }
    return get<TwoFactorStatusResponse>('/auth/2fa/status');
  },

  async setup2FA(): Promise<TwoFactorSetupResponse> {
    if (DEV_CONFIG.useMockAuth) {
      return {
        secret: 'MOCK_SECRET',
        qrCode: 'data:image/png;base64,mock',
        backupCodes: ['MOCK-1234', 'MOCK-5678'],
      };
    }
    return post<TwoFactorSetupResponse>('/auth/2fa/setup');
  },

  async enable2FA(code: string): Promise<{ message: string }> {
    if (DEV_CONFIG.useMockAuth) {
      return { message: '2FA enabled (mock)' };
    }
    return post<{ message: string }>('/auth/2fa/verify', { code });
  },

  async disable2FA(code: string): Promise<{ message: string }> {
    if (DEV_CONFIG.useMockAuth) {
      return { message: '2FA disabled (mock)' };
    }
    return post<{ message: string }>('/auth/2fa/disable', { code });
  },

  async regenerateBackupCodes(code: string): Promise<{ backupCodes: string[] }> {
    if (DEV_CONFIG.useMockAuth) {
      return { backupCodes: ['NEW-1234', 'NEW-5678'] };
    }
    return post<{ backupCodes: string[] }>('/auth/2fa/backup-codes/regenerate', { code });
  },

  // Phone verification
  async sendPhoneVerification(): Promise<{ message: string; stub?: boolean }> {
    if (DEV_CONFIG.useMockAuth) {
      return { message: 'Verification code sent (mock)', stub: true };
    }
    return post<{ message: string; stub?: boolean }>('/auth/send-phone-verification');
  },

  async verifyPhoneCode(code: string): Promise<{ message: string }> {
    if (DEV_CONFIG.useMockAuth) {
      return { message: 'Phone verified (mock)' };
    }
    return post<{ message: string }>('/auth/verify-phone-code', { code });
  },

  // Login with Spotify OAuth
  async loginWithSpotify(accessToken: string): Promise<SpotifyLoginResponse> {
    if (DEV_CONFIG.useMockAuth) {
      const mockSpotifyUser: User = {
        ...DEV_CONFIG.mockUser,
        id: 1003,
        username: 'SpotifyUser',
        email: 'spotifyuser@example.com',
      };
      return {
        user: mockSpotifyUser,
        success: true,
        message: 'Spotify authentication successful (mock)',
      };
    }

    const response = await post<SpotifyLoginResponse>('/auth/spotify', { accessToken });

    // Tokens are now set as HttpOnly cookies by backend
    if (response.user) {
      response.user = normalizeUser(response.user as unknown as Record<string, unknown>);
    }

    return response;
  },

  // Login with Apple OAuth
  async loginWithApple(identityToken: string, user?: any): Promise<AppleLoginResponse> {
    if (DEV_CONFIG.useMockAuth) {
      const mockAppleUser: User = {
        ...DEV_CONFIG.mockUser,
        id: 1004,
        username: 'AppleUser',
        email: 'appleuser@example.com',
      };
      return {
        user: mockAppleUser,
        success: true,
        message: 'Apple authentication successful (mock)',
      };
    }

    const response = await post<AppleLoginResponse>('/auth/apple', {
      identityToken,
      user,
    });

    // Tokens are now set as HttpOnly cookies by backend
    if (response.user) {
      response.user = normalizeUser(response.user as unknown as Record<string, unknown>);
    }

    return response;
  },
};

export default authApi;

// ============================================
// THE VIDEO POOL - AUTH API
// ============================================

import { get, post, setAuthToken } from './client';
import { DEV_CONFIG } from '@/config/dev';
import type { User, LoginCredentials, RegisterData, TwoFactorVerifyData } from '@/types';

interface LoginResponse {
  user: User;
  token?: string;
  requires2FA?: boolean;
  tempUserId?: number;
}

interface GoogleLoginResponse {
  user: User;
  token: string;
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

export const authApi = {
  // Login with username/password
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    // Mock mode for development
    if (DEV_CONFIG.useMockAuth) {
      return {
        user: DEV_CONFIG.mockUser,
        token: 'mock-dev-token',
      };
    }

    const response = await post<LoginResponse>('/auth/login', credentials);

    // If no 2FA required and token provided, store it
    if (!response.requires2FA && response.token) {
      setAuthToken(response.token);
    }

    return response;
  },

  // Login with Google OAuth
  async loginWithGoogle(accessToken: string): Promise<GoogleLoginResponse> {
    // Mock mode for development - decode access token to create mock user
    if (DEV_CONFIG.useMockAuth) {
      // In mock mode, create a Google user with some mock data
      const mockGoogleUser: User = {
        ...DEV_CONFIG.mockUser,
        id: 1001,
        username: 'GoogleUser',
        email: 'googleuser@gmail.com',
      };
      return {
        user: mockGoogleUser,
        token: 'mock-google-token',
      };
    }

    const response = await post<GoogleLoginResponse>('/auth/google', { accessToken });

    if (response.token) {
      setAuthToken(response.token);
    }

    return response;
  },

  // Complete 2FA verification during login
  async verify2FA(data: TwoFactorVerifyData): Promise<LoginResponse> {
    // Mock mode for development
    if (DEV_CONFIG.useMockAuth) {
      return {
        user: DEV_CONFIG.mockUser,
        token: 'mock-dev-token',
      };
    }

    const response = await post<LoginResponse>('/auth/login/2fa', data);

    if (response.token) {
      setAuthToken(response.token);
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
      setAuthToken(null);
      return;
    }

    try {
      await post('/auth/logout');
    } finally {
      setAuthToken(null);
    }
  },

  // Get current user
  async getCurrentUser(): Promise<User | null> {
    // Mock mode for development
    if (DEV_CONFIG.useMockAuth) {
      // If skipAutoLogin is true, return null to show landing page
      // User must explicitly login to get authenticated
      if (DEV_CONFIG.skipAutoLogin) {
        return null;
      }
      return DEV_CONFIG.mockUser;
    }

    try {
      // Attempt to fetch current user
      // If no token or unauthorized, this will fail gracefully and return null
      const user = await get<User>('/auth/me');
      return user;
    } catch (error) {
      // Any error (401, timeout, network, etc.) returns null
      // This allows the app to show landing page instead of hanging
      // The error is expected on first load when there's no token
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
};

export default authApi;

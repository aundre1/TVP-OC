// ============================================
// THE VIDEO POOL - AUTH STORE (Zustand)
// ============================================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi } from '@/api/auth';
import type { User, LoginCredentials, RegisterData } from '@/types';

// Extracts a user-facing error message from either backend format:
//   Our backend:   { error: "Invalid credentials", code: "INVALID_CREDENTIALS" }
//   Steve's backend: { message: "Invalid credentials" }
const extractError = (err: unknown, fallback: string): string => {
  const data = (err as any)?.response?.data;
  return data?.error ?? data?.message ?? fallback;
};

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  requires2FA: boolean;
  tempToken: string | null;
  error: string | null;
}

interface RegisterResult {
  success: boolean;
  _devCode?: string;
}

interface AuthActions {
  login: (credentials: LoginCredentials) => Promise<boolean>;
  loginWithGoogle: (accessToken: string) => Promise<boolean>;
  loginWithFacebook: (accessToken: string) => Promise<boolean>;
  loginWithApple: (identityToken: string) => Promise<boolean>;
  loginWithSpotify: (accessToken: string) => Promise<boolean>;
  verify2FA: (code: string) => Promise<boolean>;
  register: (data: RegisterData) => Promise<RegisterResult | null>;
  logout: () => Promise<void>;
  fetchCurrentUser: () => Promise<void>;
  clearError: () => void;
  setUser: (user: User | null) => void;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      isAuthenticated: false,
      isLoading: true,
      requires2FA: false,
      tempToken: null,
      error: null,

      // Actions
      login: async (credentials: LoginCredentials) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authApi.login(credentials);

          // tempToken is now stored as HttpOnly cookie by backend
          if (response.requires2FA) {
            set({
              requires2FA: true,
              // tempToken is in httpOnly cookie (tvp_temp_token), not in store
              isLoading: false,
            });
            return false; // Not fully logged in yet
          }

          set({
            user: response.user,
            isAuthenticated: true,
            requires2FA: false,
            tempToken: null,
            isLoading: false,
          });
          return true;
        } catch (error: unknown) {
          set({
            error: extractError(error, 'Login failed'),
            isLoading: false,
          });
          return false;
        }
      },

      loginWithGoogle: async (accessToken: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authApi.loginWithGoogle(accessToken);

          set({
            user: response.user,
            isAuthenticated: true,
            requires2FA: false,
            tempToken: null,
            isLoading: false,
          });
          return true;
        } catch (error: unknown) {
          set({
            error: extractError(error, 'Google sign-in is temporarily unavailable. Please use email/password.'),
            isLoading: false,
          });
          return false;
        }
      },

      loginWithFacebook: async (accessToken: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authApi.loginWithFacebook(accessToken);

          set({
            user: response.user,
            isAuthenticated: true,
            requires2FA: false,
            tempToken: null,
            isLoading: false,
          });
          return true;
        } catch (error: unknown) {
          set({
            error: extractError(error, 'Facebook sign-in is temporarily unavailable. Please use email/password.'),
            isLoading: false,
          });
          return false;
        }
      },

      loginWithApple: async (identityToken: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authApi.loginWithApple(identityToken);

          set({
            user: response.user,
            isAuthenticated: true,
            requires2FA: false,
            tempToken: null,
            isLoading: false,
          });
          return true;
        } catch (error: unknown) {
          set({
            error: extractError(error, 'Apple sign-in is temporarily unavailable. Please use email/password.'),
            isLoading: false,
          });
          return false;
        }
      },

      loginWithSpotify: async (accessToken: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authApi.loginWithSpotify(accessToken);

          set({
            user: response.user,
            isAuthenticated: true,
            requires2FA: false,
            tempToken: null,
            isLoading: false,
          });
          return true;
        } catch (error: unknown) {
          set({
            error: extractError(error, 'Spotify sign-in is temporarily unavailable. Please use email/password.'),
            isLoading: false,
          });
          return false;
        }
      },

      verify2FA: async (code: string) => {
        // tempToken is now in HttpOnly cookie (tvp_temp_token), backend reads it automatically
        set({ isLoading: true, error: null });
        try {
          const response = await authApi.verify2FA({ code });

          set({
            user: response.user,
            isAuthenticated: true,
            requires2FA: false,
            tempToken: null,
            isLoading: false,
          });
          return true;
        } catch (error: unknown) {
          set({
            error: extractError(error, 'Invalid 2FA code'),
            isLoading: false,
          });
          return false;
        }
      },

      register: async (data: RegisterData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authApi.register(data);
          set({ isLoading: false });
          return {
            success: true,
            _devCode: response._devCode,
          };
        } catch (error: unknown) {
          set({
            error: extractError(error, 'Registration failed'),
            isLoading: false,
          });
          return null;
        }
      },

      logout: async () => {
        set({ isLoading: true });
        try {
          await authApi.logout();
        } finally {
          set({
            user: null,
            isAuthenticated: false,
            requires2FA: false,
            tempToken: null,
            isLoading: false,
            error: null,
          });
        }
      },

      fetchCurrentUser: async () => {
        set({ isLoading: true });
        try {
          const user = await authApi.getCurrentUser();
          set({
            user,
            isAuthenticated: !!user,
            isLoading: false,
          });
        } catch {
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      },

      clearError: () => set({ error: null }),

      setUser: (user: User | null) => set({
        user,
        isAuthenticated: !!user,
      }),
    }),
    {
      name: 'tvp-auth',
      partialize: (state) => ({
        // Only persist minimal auth state
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export default useAuthStore;

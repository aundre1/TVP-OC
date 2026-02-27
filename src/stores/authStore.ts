// ============================================
// THE VIDEO POOL - AUTH STORE (Zustand)
// ============================================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi } from '@/api/auth';
import type { User, LoginCredentials, RegisterData } from '@/types';

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

          if (response.requires2FA && response.tempToken) {
            set({
              requires2FA: true,
              tempToken: response.tempToken,
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
        } catch (error: any) {
          set({
            error: error.response?.data?.error || 'Login failed',
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
        } catch (error: any) {
          const message = error.response?.data?.error || 'Google sign-in is temporarily unavailable. Please use email/password.';
          set({
            error: message,
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
        } catch (error: any) {
          const message = error.response?.data?.error || 'Facebook sign-in is temporarily unavailable. Please use email/password.';
          set({
            error: message,
            isLoading: false,
          });
          return false;
        }
      },

      verify2FA: async (code: string) => {
        const { tempToken } = get();
        if (!tempToken) {
          set({ error: '2FA session expired' });
          return false;
        }

        set({ isLoading: true, error: null });
        try {
          const response = await authApi.verify2FA({ tempToken, code });

          set({
            user: response.user,
            isAuthenticated: true,
            requires2FA: false,
            tempToken: null,
            isLoading: false,
          });
          return true;
        } catch (error: any) {
          set({
            error: error.response?.data?.error || 'Invalid 2FA code',
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
        } catch (error: any) {
          set({
            error: error.response?.data?.error || 'Registration failed',
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

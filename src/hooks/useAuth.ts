// ============================================
// THE VIDEO POOL - AUTH HOOK
// ============================================

import { useAuthStore } from '@/stores/authStore';

export function useAuth() {
  const {
    user,
    isAuthenticated,
    isLoading,
    requires2FA,
    error,
    login,
    verify2FA,
    register,
    logout,
    fetchCurrentUser,
    clearError,
  } = useAuthStore();

  // NOTE: fetchCurrentUser is called ONCE in App.tsx on mount.
  // Do NOT call it here — multiple components use useAuth(),
  // and each would trigger a separate API call + loading spinner.

  return {
    user,
    isAuthenticated,
    isLoading,
    requires2FA,
    error,
    login,
    verify2FA,
    register,
    logout,
    fetchCurrentUser,
    clearError,

    // Computed helpers
    isAdmin: user?.isAdmin ?? false,
    membershipType: user?.membershipType ?? 'free',
    canDownload: user?.downloadsThisMonth !== undefined
      ? (user.downloadLimit === null || user.downloadsThisMonth < user.downloadLimit)
      : false,
    downloadsRemaining: user?.downloadLimit === null
      ? 'unlimited'
      : (user?.downloadLimit ?? 0) - (user?.downloadsThisMonth ?? 0),
  };
}

export default useAuth;

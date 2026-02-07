// ============================================
// THE VIDEO POOL - AUTH HOOK
// ============================================

import { useEffect } from 'react';
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

  // Fetch current user on mount
  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

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

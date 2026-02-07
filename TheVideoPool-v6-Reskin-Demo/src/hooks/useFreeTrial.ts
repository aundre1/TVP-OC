// ============================================
// THE VIDEO POOL - FREE TRIAL HOOK
// Hook that provides free trial status and expiration logic
// ============================================

import { useMemo } from 'react';
import { useAuthStore } from '@/stores/authStore';

interface FreeTrialStatus {
  isOnFreeTrial: boolean;
  daysRemaining: number;
  trialExpiresAt: Date | null;
  isTrialExpired: boolean;
  isTrialEndingSoon: boolean; // Less than 7 days remaining
  trialStartedAt: Date | null;
}

export function useFreeTrial(): FreeTrialStatus {
  const user = useAuthStore((state) => state.user);

  return useMemo(() => {
    // Default state for non-authenticated or non-trial users
    const defaultState: FreeTrialStatus = {
      isOnFreeTrial: false,
      daysRemaining: 0,
      trialExpiresAt: null,
      isTrialExpired: false,
      isTrialEndingSoon: false,
      trialStartedAt: null,
    };

    // If no user or user is not on free tier, return default
    if (!user || user.membershipType !== 'free') {
      return defaultState;
    }

    // If no trial dates set, user is on free tier but not in trial
    if (!user.freeTrialStartedAt || !user.freeTrialExpiresAt) {
      return defaultState;
    }

    const now = new Date();
    const trialStartedAt = new Date(user.freeTrialStartedAt);
    const trialExpiresAt = new Date(user.freeTrialExpiresAt);

    // Calculate days remaining (rounded up for display)
    const msRemaining = trialExpiresAt.getTime() - now.getTime();
    const daysRemaining = Math.max(0, Math.ceil(msRemaining / (1000 * 60 * 60 * 24)));

    // Determine trial status
    const isTrialExpired = msRemaining <= 0;
    const isOnFreeTrial = !isTrialExpired;
    const isTrialEndingSoon = isOnFreeTrial && daysRemaining <= 7;

    return {
      isOnFreeTrial,
      daysRemaining,
      trialExpiresAt,
      isTrialExpired,
      isTrialEndingSoon,
      trialStartedAt,
    };
  }, [user]);
}

export default useFreeTrial;

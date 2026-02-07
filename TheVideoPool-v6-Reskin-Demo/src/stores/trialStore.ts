// ============================================
// THE VIDEO POOL - TRIAL STORE (Zustand)
// Manages free trial banner dismissal state
// ============================================

import { create } from 'zustand';

interface TrialState {
  // Banner dismissal state (session-only, not persisted)
  isBannerDismissed: boolean;
}

interface TrialActions {
  dismissBanner: () => void;
  resetBannerDismissal: () => void;
}

type TrialStore = TrialState & TrialActions;

export const useTrialStore = create<TrialStore>((set) => ({
  // Initial state - banner not dismissed
  isBannerDismissed: false,

  // Actions
  dismissBanner: () => set({ isBannerDismissed: true }),
  resetBannerDismissal: () => set({ isBannerDismissed: false }),
}));

export default useTrialStore;

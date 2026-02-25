/**
 * View Store
 * Manages view mode preference: table, grid, or tile
 * Persists to localStorage
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ViewMode, ViewState } from '@/types/browse';

const STORAGE_KEY = 'tvp-view-mode';
const DEFAULT_VIEW: ViewMode = 'table';

export const useViewStore = create<ViewState>()(
  persist(
    (set) => ({
      viewMode: DEFAULT_VIEW,

      setViewMode: (mode: ViewMode) => {
        set({ viewMode: mode });
      },

      loadViewPreference: () => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored && ['table', 'grid'].includes(stored)) {
          set({ viewMode: stored as ViewMode });
        }
      },
    }),
    {
      name: STORAGE_KEY,
      partialize: (state) => ({ viewMode: state.viewMode }),
    }
  )
);

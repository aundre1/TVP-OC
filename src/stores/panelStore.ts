/**
 * Panel Store
 * Manages breakout panels: preview, details, download, library, admin
 */

import { create } from 'zustand';
import { PanelState, PanelType, Video } from '@/types/browse';

export const usePanelStore = create<PanelState>((set) => ({
  activePanel: null,
  panelData: null,
  isAnimating: false,

  openPanel: (panel: Exclude<PanelType, null>, data: Video) => {
    // Start animation
    set({ isAnimating: true });

    // Set panel and data
    set({
      activePanel: panel,
      panelData: data,
    });

    // End animation after brief delay (for transition)
    setTimeout(() => {
      set({ isAnimating: false });
    }, 300);
  },

  closePanel: () => {
    // Start closing animation
    set({ isAnimating: true });

    // Wait for animation, then close
    setTimeout(() => {
      set({
        activePanel: null,
        panelData: null,
        isAnimating: false,
      });
    }, 300);
  },

  setAnimating: (animating: boolean) => {
    set({ isAnimating: animating });
  },
}));

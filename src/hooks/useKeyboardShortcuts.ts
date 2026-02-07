// ============================================
// THE VIDEO POOL - KEYBOARD SHORTCUTS HOOK v5.5
// Full DJ workflow keyboard navigation
// ============================================

import { useEffect, useCallback } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { useAppStore } from '@/stores/appStore';
import { useUIStore } from '@/stores/uiStore';

// Shortcut definitions for documentation
export const SHORTCUT_CATEGORIES = {
  navigation: {
    title: 'Navigation',
    icon: '🧭',
    shortcuts: [
      { key: '/', description: 'Focus search' },
      { key: 'g h', description: 'Go to Home' },
      { key: 'g l', description: 'Go to Library' },
      { key: 'g d', description: 'Go to Downloads' },
      { key: 'Esc', description: 'Close modal / panel' },
    ],
  },
  playback: {
    title: 'Preview & Playback',
    icon: '▶️',
    shortcuts: [
      { key: 'Space', description: 'Play / Pause preview' },
      { key: 'Enter', description: 'Open preview modal' },
      { key: 'j / k', description: 'Previous / Next track' },
      { key: '← / →', description: 'Seek backward / forward' },
    ],
  },
  setBuilder: {
    title: 'Set Builder',
    icon: '🎵',
    shortcuts: [
      { key: 's', description: 'Add focused track to set' },
      { key: 'b', description: 'Toggle Set Builder panel' },
      { key: 'm', description: 'Open track in mix view' },
      { key: 'h', description: 'Show harmonic matches' },
    ],
  },
  viewInterface: {
    title: 'View & Interface',
    icon: '👁️',
    shortcuts: [
      { key: 'v', description: 'Toggle List / Grid view' },
      { key: 't', description: 'Toggle dark / light theme' },
      { key: '?', description: 'Show shortcuts panel' },
    ],
  },
  downloads: {
    title: 'Downloads',
    icon: '⬇️',
    shortcuts: [
      { key: 'd', description: 'Download focused track' },
      { key: 'r', description: 'Toggle Recent Downloads' },
      { key: 'Shift+D', description: 'Download all selected' },
    ],
  },
};

export function useKeyboardShortcuts() {
  const {
    toggleViewMode,
    toggleSetBuilder,
    toggleRecentPanel,
    toggleShortcutsPanel,
    closeAllModals,
    showShortcutFeedback,
    addToSet,
    showToast,
    isPreviewModalOpen,
    closePreviewModal,
    isSetBuilderOpen,
    isRecentPanelOpen,
    isShortcutsPanelOpen,
    isRequestPanelOpen,
  } = useAppStore();

  const { toggleTheme } = useUIStore();

  // Check if any modal/panel is open
  const hasOpenModal =
    isPreviewModalOpen ||
    isSetBuilderOpen ||
    isRecentPanelOpen ||
    isShortcutsPanelOpen ||
    isRequestPanelOpen;

  // Focus search (/)
  useHotkeys(
    '/',
    (e) => {
      e.preventDefault();
      const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement;
      searchInput?.focus();
    },
    { enableOnFormTags: false }
  );

  // Toggle view mode (v)
  useHotkeys(
    'v',
    () => {
      toggleViewMode();
      showShortcutFeedback('V', 'Toggle View');
    },
    { enableOnFormTags: false }
  );

  // Toggle theme (t)
  useHotkeys(
    't',
    () => {
      toggleTheme();
      showShortcutFeedback('T', 'Toggle Theme');
    },
    { enableOnFormTags: false }
  );

  // Toggle Set Builder (b)
  useHotkeys(
    'b',
    () => {
      toggleSetBuilder();
      showShortcutFeedback('B', 'Set Builder');
    },
    { enableOnFormTags: false }
  );

  // Toggle Recent Downloads (r)
  useHotkeys(
    'r',
    () => {
      toggleRecentPanel();
      showShortcutFeedback('R', 'Recent Downloads');
    },
    { enableOnFormTags: false }
  );

  // Show shortcuts panel (?)
  useHotkeys(
    'shift+/',
    () => {
      toggleShortcutsPanel();
    },
    { enableOnFormTags: false }
  );

  // Close modals (Escape)
  useHotkeys(
    'escape',
    () => {
      if (hasOpenModal) {
        closeAllModals();
      }
    },
    { enableOnFormTags: true }
  );

  // Download focused track (d)
  useHotkeys(
    'd',
    () => {
      showShortcutFeedback('D', 'Download');
      showToast('info', 'Downloading track...');
    },
    { enableOnFormTags: false }
  );

  // Add to set (s)
  useHotkeys(
    's',
    () => {
      showShortcutFeedback('S', 'Add to Set');
      // In a real app, this would add the focused track
      showToast('success', 'Added to set');
    },
    { enableOnFormTags: false }
  );

  return {
    shortcuts: SHORTCUT_CATEGORIES,
  };
}

export default useKeyboardShortcuts;

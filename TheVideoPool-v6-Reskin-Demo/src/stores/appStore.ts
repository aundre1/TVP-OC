// ============================================
// THE VIDEO POOL - APP STORE v5.5 (Zustand)
// Handles: Set Builder, Toasts, Layout Presets,
// View Mode, Selected Tracks, Recent Panel, etc.
// ============================================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  Track,
  SetBuilderTrack,
  Toast,
  LayoutPreset,
  ShortcutFeedback,
  Section
} from '@/types';

// ============================================
// SET BUILDER RECOMMENDATION ALGORITHM
// Council-approved: BPM/Key primary, subgenre secondary
// ============================================

// Camelot wheel key compatibility
const CAMELOT_WHEEL: Record<string, string[]> = {
  '1A': ['1A', '12A', '2A', '1B'],
  '2A': ['2A', '1A', '3A', '2B'],
  '3A': ['3A', '2A', '4A', '3B'],
  '4A': ['4A', '3A', '5A', '4B'],
  '5A': ['5A', '4A', '6A', '5B'],
  '6A': ['6A', '5A', '7A', '6B'],
  '7A': ['7A', '6A', '8A', '7B'],
  '8A': ['8A', '7A', '9A', '8B'],
  '9A': ['9A', '8A', '10A', '9B'],
  '10A': ['10A', '9A', '11A', '10B'],
  '11A': ['11A', '10A', '12A', '11B'],
  '12A': ['12A', '11A', '1A', '12B'],
  '1B': ['1B', '12B', '2B', '1A'],
  '2B': ['2B', '1B', '3B', '2A'],
  '3B': ['3B', '2B', '4B', '3A'],
  '4B': ['4B', '3B', '5B', '4A'],
  '5B': ['5B', '4B', '6B', '5A'],
  '6B': ['6B', '5B', '7B', '6A'],
  '7B': ['7B', '6B', '8B', '7A'],
  '8B': ['8B', '7B', '9B', '8A'],
  '9B': ['9B', '8B', '10B', '9A'],
  '10B': ['10B', '9B', '11B', '10A'],
  '11B': ['11B', '10B', '12B', '11A'],
  '12B': ['12B', '11B', '1B', '12A'],
};

function isKeyCompatible(key1: string, key2: string): boolean {
  const compatible = CAMELOT_WHEEL[key1];
  return compatible ? compatible.includes(key2) : false;
}

function calculateRecommendationScore(
  candidate: Track,
  setTracks: SetBuilderTrack[]
): { score: number; reasons: string[] } {
  if (setTracks.length === 0) return { score: 0, reasons: [] };

  const lastTrack = setTracks[setTracks.length - 1];
  let score = 0;
  const reasons: string[] = [];

  // BPM compatibility (within ±8 BPM) - 40 points max
  const bpmDiff = Math.abs(candidate.bpm - lastTrack.bpm);
  if (bpmDiff <= 8) {
    score += 40 - (bpmDiff * 3);
    reasons.push(`BPM: ${candidate.bpm} (±${bpmDiff} from ${lastTrack.bpm})`);
  } else if (bpmDiff <= 16) {
    score += 20 - (bpmDiff - 8);
    reasons.push(`BPM: ${candidate.bpm} (manageable transition)`);
  }

  // Key compatibility - 35 points max
  if (isKeyCompatible(lastTrack.key, candidate.key)) {
    score += 35;
    reasons.push(`Key: ${candidate.key} (harmonic with ${lastTrack.key})`);
  } else if (lastTrack.key === candidate.key) {
    score += 30;
    reasons.push(`Key: ${candidate.key} (same key)`);
  }

  // Same subgenre bonus - 15 points
  if (candidate.subgenre && lastTrack.subgenre && candidate.subgenre === lastTrack.subgenre) {
    score += 15;
    reasons.push(`Subgenre: ${candidate.subgenre}`);
  }
  // Same genre bonus - 10 points
  else if (candidate.genre === lastTrack.genre) {
    score += 10;
    reasons.push(`Genre: ${candidate.genre}`);
  }

  return { score, reasons };
}

// ============================================
// STORE INTERFACE
// ============================================

interface AppState {
  // View Mode
  viewMode: 'grid' | 'list';

  // Layout Preset
  layoutPreset: LayoutPreset;

  // Set Builder
  setBuilderTracks: SetBuilderTrack[];
  isSetBuilderOpen: boolean;

  // Selected Tracks (for batch operations)
  selectedTrackIds: Set<number>;

  // Recent Downloads Panel
  isRecentPanelOpen: boolean;

  // Request Panel
  isRequestPanelOpen: boolean;

  // Toasts (v5.5 Minimal Pill Style)
  toasts: Toast[];

  // Keyboard Shortcut Feedback
  shortcutFeedback: ShortcutFeedback | null;

  // Shortcuts Panel
  isShortcutsPanelOpen: boolean;

  // Preview Modal
  previewTrackId: number | null;
  isPreviewModalOpen: boolean;

  // Section Order (for drag-drop reordering)
  sectionOrder: string[];
  collapsedSections: string[];

  // Active Genre Filter
  activeGenre: string | null;
  activeSubgenre: string | null;

  // Search
  searchQuery: string;
  isSearchDropdownOpen: boolean;

  // Download Limit Modal
  isDownloadLimitModalOpen: boolean;

  // Download Quality Modal
  isDownloadQualityModalOpen: boolean;
  downloadQualityTrackId: number | null;

  // Batch Download Modal
  isBatchDownloadModalOpen: boolean;

  // Scoring Explanation Modal
  isScoringModalOpen: boolean;

  // Duplicate Detection Modal
  isDuplicateModalOpen: boolean;
  pendingDuplicateTrack: Track | null;
  existingSimilarTrack: Track | null;
}

interface AppActions {
  // View Mode
  setViewMode: (mode: 'grid' | 'list') => void;
  toggleViewMode: () => void;

  // Layout Preset
  setLayoutPreset: (preset: LayoutPreset) => void;

  // Set Builder
  addToSet: (track: Track) => void;
  removeFromSet: (trackId: number) => void;
  reorderSet: (fromIndex: number, toIndex: number) => void;
  clearSet: () => void;
  toggleSetBuilder: () => void;
  openSetBuilder: () => void;
  closeSetBuilder: () => void;
  getSetRecommendations: (allTracks: Track[], limit?: number) => { track: Track; score: number; reasons: string[] }[];

  // Selected Tracks
  selectTrack: (trackId: number) => void;
  deselectTrack: (trackId: number) => void;
  toggleTrackSelection: (trackId: number) => void;
  selectAllTracks: (trackIds: number[]) => void;
  clearSelection: () => void;

  // Recent Panel
  toggleRecentPanel: () => void;
  openRecentPanel: () => void;
  closeRecentPanel: () => void;

  // Request Panel
  toggleRequestPanel: () => void;
  openRequestPanel: () => void;
  closeRequestPanel: () => void;

  // Toasts
  showToast: (type: Toast['type'], message: string, duration?: number) => void;
  dismissToast: (id: string) => void;
  clearToasts: () => void;

  // Keyboard Shortcut Feedback
  showShortcutFeedback: (key: string, action: string) => void;
  hideShortcutFeedback: () => void;

  // Shortcuts Panel
  toggleShortcutsPanel: () => void;
  openShortcutsPanel: () => void;
  closeShortcutsPanel: () => void;

  // Preview Modal
  openPreviewModal: (trackId: number) => void;
  closePreviewModal: () => void;

  // Section Order
  setSectionOrder: (order: string[]) => void;
  toggleSectionCollapse: (sectionId: string) => void;

  // Genre Filter
  setActiveGenre: (genre: string | null) => void;
  setActiveSubgenre: (subgenre: string | null) => void;
  clearGenreFilter: () => void;

  // Search
  setSearchQuery: (query: string) => void;
  setSearchDropdownOpen: (open: boolean) => void;

  // Download Limit Modal
  openDownloadLimitModal: () => void;
  closeDownloadLimitModal: () => void;

  // Download Quality Modal
  openDownloadQualityModal: (trackId: number) => void;
  closeDownloadQualityModal: () => void;

  // Batch Download Modal
  openBatchDownloadModal: () => void;
  closeBatchDownloadModal: () => void;

  // Scoring Explanation Modal
  openScoringModal: () => void;
  closeScoringModal: () => void;

  // Duplicate Detection Modal
  openDuplicateModal: (pendingTrack: Track, similarTrack: Track) => void;
  closeDuplicateModal: () => void;
  confirmAddDuplicate: () => void;

  // Close All Modals
  closeAllModals: () => void;
}

type AppStore = AppState & AppActions;

// Default section order
const DEFAULT_SECTION_ORDER = [
  'trending',
  'latest',
  'forYou',
  'throwbacks',
  'remixes',
];

// ============================================
// STORE IMPLEMENTATION
// ============================================

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      // Initial state
      viewMode: 'grid',
      layoutPreset: 'custom',
      setBuilderTracks: [],
      isSetBuilderOpen: false,
      selectedTrackIds: new Set(),
      isRecentPanelOpen: false,
      isRequestPanelOpen: false,
      toasts: [],
      shortcutFeedback: null,
      isShortcutsPanelOpen: false,
      previewTrackId: null,
      isPreviewModalOpen: false,
      sectionOrder: DEFAULT_SECTION_ORDER,
      collapsedSections: [],
      activeGenre: null,
      activeSubgenre: null,
      searchQuery: '',
      isSearchDropdownOpen: false,
      isDownloadLimitModalOpen: false,
      isDownloadQualityModalOpen: false,
      downloadQualityTrackId: null,
      isBatchDownloadModalOpen: false,
      isScoringModalOpen: false,
      isDuplicateModalOpen: false,
      pendingDuplicateTrack: null,
      existingSimilarTrack: null,

      // View Mode Actions
      setViewMode: (mode) => set({ viewMode: mode }),
      toggleViewMode: () => set((state) => ({
        viewMode: state.viewMode === 'grid' ? 'list' : 'grid',
      })),

      // Layout Preset Actions
      setLayoutPreset: (preset) => {
        const presetSettings: Record<LayoutPreset, Partial<AppState>> = {
          club: {
            isSetBuilderOpen: true,
            isRecentPanelOpen: false,
            viewMode: 'list',
          },
          prep: {
            isSetBuilderOpen: false,
            isRecentPanelOpen: true,
            viewMode: 'grid',
          },
          custom: {},
        };

        set({ layoutPreset: preset, ...presetSettings[preset] });
      },

      // Set Builder Actions
      addToSet: (track) => {
        const state = get();

        // Check exact duplicate
        if (state.setBuilderTracks.some(t => t.id === track.id)) {
          get().showToast('warning', `"${track.title}" is already in your set`);
          return;
        }

        // Check for similar track (same artist + similar title)
        const similarTrack = state.setBuilderTracks.find(t =>
          t.artist.toLowerCase() === track.artist.toLowerCase() &&
          (t.title.toLowerCase().includes(track.title.toLowerCase().slice(0, 10)) ||
           track.title.toLowerCase().includes(t.title.toLowerCase().slice(0, 10)))
        );

        if (similarTrack) {
          // Show duplicate confirmation modal
          set({
            pendingDuplicateTrack: track,
            existingSimilarTrack: similarTrack,
            isDuplicateModalOpen: true,
          });
          return;
        }

        // Add track normally
        const setTrack: SetBuilderTrack = {
          ...track,
          addedAt: Date.now(),
        };

        set((state) => ({
          setBuilderTracks: [...state.setBuilderTracks, setTrack],
          isSetBuilderOpen: true,
        }));

        get().showToast('success', `Added "${track.title}" to set`);
      },

      removeFromSet: (trackId) => set((state) => ({
        setBuilderTracks: state.setBuilderTracks.filter(t => t.id !== trackId),
      })),

      reorderSet: (fromIndex, toIndex) => set((state) => {
        const tracks = [...state.setBuilderTracks];
        const [removed] = tracks.splice(fromIndex, 1);
        tracks.splice(toIndex, 0, removed);
        return { setBuilderTracks: tracks };
      }),

      clearSet: () => {
        set({ setBuilderTracks: [] });
        get().showToast('info', 'Set cleared');
      },

      toggleSetBuilder: () => set((state) => ({
        isSetBuilderOpen: !state.isSetBuilderOpen,
      })),

      openSetBuilder: () => set({ isSetBuilderOpen: true }),
      closeSetBuilder: () => set({ isSetBuilderOpen: false }),

      getSetRecommendations: (allTracks, limit = 5) => {
        const state = get();
        if (state.setBuilderTracks.length === 0) return [];

        const setTrackIds = new Set(state.setBuilderTracks.map(t => t.id));

        const recommendations = allTracks
          .filter(track => !setTrackIds.has(track.id))
          .map(track => {
            const { score, reasons } = calculateRecommendationScore(track, state.setBuilderTracks);
            return { track, score, reasons };
          })
          .filter(rec => rec.score > 20)
          .sort((a, b) => b.score - a.score)
          .slice(0, limit);

        return recommendations;
      },

      // Selected Tracks Actions
      selectTrack: (trackId) => set((state) => {
        const newSet = new Set(state.selectedTrackIds);
        newSet.add(trackId);
        return { selectedTrackIds: newSet };
      }),

      deselectTrack: (trackId) => set((state) => {
        const newSet = new Set(state.selectedTrackIds);
        newSet.delete(trackId);
        return { selectedTrackIds: newSet };
      }),

      toggleTrackSelection: (trackId) => set((state) => {
        const newSet = new Set(state.selectedTrackIds);
        if (newSet.has(trackId)) {
          newSet.delete(trackId);
        } else {
          newSet.add(trackId);
        }
        return { selectedTrackIds: newSet };
      }),

      selectAllTracks: (trackIds) => set({
        selectedTrackIds: new Set(trackIds),
      }),

      clearSelection: () => set({ selectedTrackIds: new Set() }),

      // Recent Panel Actions
      toggleRecentPanel: () => set((state) => ({
        isRecentPanelOpen: !state.isRecentPanelOpen,
      })),
      openRecentPanel: () => set({ isRecentPanelOpen: true }),
      closeRecentPanel: () => set({ isRecentPanelOpen: false }),

      // Request Panel Actions
      toggleRequestPanel: () => set((state) => ({
        isRequestPanelOpen: !state.isRequestPanelOpen,
      })),
      openRequestPanel: () => set({ isRequestPanelOpen: true }),
      closeRequestPanel: () => set({ isRequestPanelOpen: false }),

      // Toast Actions
      showToast: (type, message, duration = 3000) => {
        const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const toast: Toast = { id, type, message, duration };

        set((state) => ({
          toasts: [...state.toasts, toast],
        }));

        // Auto-dismiss
        if (duration > 0) {
          setTimeout(() => {
            get().dismissToast(id);
          }, duration);
        }
      },

      dismissToast: (id) => set((state) => ({
        toasts: state.toasts.filter(t => t.id !== id),
      })),

      clearToasts: () => set({ toasts: [] }),

      // Shortcut Feedback Actions
      showShortcutFeedback: (key, action) => {
        set({ shortcutFeedback: { key, action, visible: true } });

        setTimeout(() => {
          get().hideShortcutFeedback();
        }, 400);
      },

      hideShortcutFeedback: () => set({ shortcutFeedback: null }),

      // Shortcuts Panel Actions
      toggleShortcutsPanel: () => set((state) => ({
        isShortcutsPanelOpen: !state.isShortcutsPanelOpen,
      })),
      openShortcutsPanel: () => set({ isShortcutsPanelOpen: true }),
      closeShortcutsPanel: () => set({ isShortcutsPanelOpen: false }),

      // Preview Modal Actions
      openPreviewModal: (trackId) => set({
        previewTrackId: trackId,
        isPreviewModalOpen: true,
      }),
      closePreviewModal: () => set({
        previewTrackId: null,
        isPreviewModalOpen: false,
      }),

      // Section Order Actions
      setSectionOrder: (order) => set({ sectionOrder: order }),

      toggleSectionCollapse: (sectionId) => set((state) => {
        const isCollapsed = state.collapsedSections.includes(sectionId);
        return {
          collapsedSections: isCollapsed
            ? state.collapsedSections.filter(id => id !== sectionId)
            : [...state.collapsedSections, sectionId],
        };
      }),

      // Genre Filter Actions
      setActiveGenre: (genre) => set({
        activeGenre: genre,
        activeSubgenre: null,
      }),
      setActiveSubgenre: (subgenre) => set({ activeSubgenre: subgenre }),
      clearGenreFilter: () => set({
        activeGenre: null,
        activeSubgenre: null,
      }),

      // Search Actions
      setSearchQuery: (query) => set({ searchQuery: query }),
      setSearchDropdownOpen: (open) => set({ isSearchDropdownOpen: open }),

      // Download Limit Modal Actions
      openDownloadLimitModal: () => set({ isDownloadLimitModalOpen: true }),
      closeDownloadLimitModal: () => set({ isDownloadLimitModalOpen: false }),

      // Download Quality Modal Actions
      openDownloadQualityModal: (trackId) => set({
        isDownloadQualityModalOpen: true,
        downloadQualityTrackId: trackId,
      }),
      closeDownloadQualityModal: () => set({
        isDownloadQualityModalOpen: false,
        downloadQualityTrackId: null,
      }),

      // Batch Download Modal Actions
      openBatchDownloadModal: () => set({ isBatchDownloadModalOpen: true }),
      closeBatchDownloadModal: () => set({ isBatchDownloadModalOpen: false }),

      // Scoring Explanation Modal Actions
      openScoringModal: () => set({ isScoringModalOpen: true }),
      closeScoringModal: () => set({ isScoringModalOpen: false }),

      // Duplicate Detection Modal Actions
      openDuplicateModal: (pendingTrack, similarTrack) => set({
        isDuplicateModalOpen: true,
        pendingDuplicateTrack: pendingTrack,
        existingSimilarTrack: similarTrack,
      }),
      closeDuplicateModal: () => set({
        isDuplicateModalOpen: false,
        pendingDuplicateTrack: null,
        existingSimilarTrack: null,
      }),
      confirmAddDuplicate: () => {
        const state = get();
        const track = state.pendingDuplicateTrack;

        if (track) {
          const setTrack: SetBuilderTrack = {
            ...track,
            addedAt: Date.now(),
          };

          set((s) => ({
            setBuilderTracks: [...s.setBuilderTracks, setTrack],
            isSetBuilderOpen: true,
            isDuplicateModalOpen: false,
            pendingDuplicateTrack: null,
            existingSimilarTrack: null,
          }));

          get().showToast('success', `Added "${track.title}" to set`);
        }
      },

      // Close All Modals
      closeAllModals: () => set({
        isRecentPanelOpen: false,
        isRequestPanelOpen: false,
        isShortcutsPanelOpen: false,
        isPreviewModalOpen: false,
        previewTrackId: null,
        isDownloadLimitModalOpen: false,
        isDownloadQualityModalOpen: false,
        downloadQualityTrackId: null,
        isBatchDownloadModalOpen: false,
        isScoringModalOpen: false,
        isDuplicateModalOpen: false,
        pendingDuplicateTrack: null,
        existingSimilarTrack: null,
      }),
    }),
    {
      name: 'tvp-app',
      partialize: (state) => ({
        viewMode: state.viewMode,
        layoutPreset: state.layoutPreset,
        setBuilderTracks: state.setBuilderTracks,
        sectionOrder: state.sectionOrder,
        collapsedSections: state.collapsedSections,
      }),
    }
  )
);

export default useAppStore;

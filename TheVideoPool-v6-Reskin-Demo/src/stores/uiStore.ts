// ============================================
// THE VIDEO POOL - UI STORE (Zustand)
// ============================================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Video, SectionPreferences, DownloadQueueItem, Notification } from '@/types';

interface UIState {
  // Theme
  theme: 'dark' | 'light';

  // Section preferences (order, collapsed state)
  sectionPreferences: SectionPreferences;

  // Preview modal
  previewVideo: Video | null;
  isPreviewOpen: boolean;

  // Download queue
  downloadQueue: DownloadQueueItem[];
  isDownloadFABOpen: boolean;

  // Slide-in panels
  activeSidePanel: 'seeAll' | 'library' | 'notifications' | 'settings' | 'weeklyPack' | null;
  sidePanelData: any;

  // Notifications
  notifications: Notification[];
  unreadCount: number;

  // Search
  searchQuery: string;
  isSearchFocused: boolean;

  // Mobile menu
  isMobileMenuOpen: boolean;
}

interface UIActions {
  // Theme
  setTheme: (theme: 'dark' | 'light') => void;
  toggleTheme: () => void;

  // Section preferences
  setSectionOrder: (order: string[]) => void;
  toggleSectionCollapse: (sectionId: string) => void;
  setTopGenres: (genres: string[]) => void;

  // Preview modal
  openPreview: (video: Video) => void;
  closePreview: () => void;

  // Download queue
  addToDownloadQueue: (item: DownloadQueueItem) => void;
  updateDownloadProgress: (id: string, progress: number, status?: DownloadQueueItem['status']) => void;
  removeFromDownloadQueue: (id: string) => void;
  clearDownloadQueue: () => void;
  toggleDownloadFAB: () => void;

  // Side panels
  openSidePanel: (panel: UIState['activeSidePanel'], data?: any) => void;
  closeSidePanel: () => void;

  // Notifications
  addNotification: (notification: Notification) => void;
  markNotificationRead: (id: number) => void;
  markAllNotificationsRead: () => void;
  clearNotifications: () => void;

  // Search
  setSearchQuery: (query: string) => void;
  setSearchFocused: (focused: boolean) => void;

  // Mobile
  toggleMobileMenu: () => void;
  closeMobileMenu: () => void;
}

type UIStore = UIState & UIActions;

const DEFAULT_SECTION_ORDER = [
  'weekly-pack',
  'trending',
  'new-releases',
  'for-you',
  'hip-hop',
  'edm',
  'latin',
  'pop',
];

const DEFAULT_TOP_GENRES = ['Hip-Hop', 'EDM', 'Latin', 'Pop'];

export const useUIStore = create<UIStore>()(
  persist(
    (set) => ({
      // Initial state
      theme: 'dark',
      sectionPreferences: {
        order: DEFAULT_SECTION_ORDER,
        collapsed: [],
        topGenres: DEFAULT_TOP_GENRES,
      },
      previewVideo: null,
      isPreviewOpen: false,
      downloadQueue: [],
      isDownloadFABOpen: false,
      activeSidePanel: null,
      sidePanelData: null,
      notifications: [],
      unreadCount: 0,
      searchQuery: '',
      isSearchFocused: false,
      isMobileMenuOpen: false,

      // Theme actions
      setTheme: (theme) => set({ theme }),
      toggleTheme: () => set((state) => ({
        theme: state.theme === 'dark' ? 'light' : 'dark',
      })),

      // Section preference actions
      setSectionOrder: (order) => set((state) => ({
        sectionPreferences: { ...state.sectionPreferences, order },
      })),

      toggleSectionCollapse: (sectionId) => set((state) => {
        const collapsed = state.sectionPreferences.collapsed.includes(sectionId)
          ? state.sectionPreferences.collapsed.filter(id => id !== sectionId)
          : [...state.sectionPreferences.collapsed, sectionId];
        return {
          sectionPreferences: { ...state.sectionPreferences, collapsed },
        };
      }),

      setTopGenres: (genres) => set((state) => ({
        sectionPreferences: { ...state.sectionPreferences, topGenres: genres },
      })),

      // Preview modal actions
      openPreview: (video) => set({ previewVideo: video, isPreviewOpen: true }),
      closePreview: () => set({ previewVideo: null, isPreviewOpen: false }),

      // Download queue actions
      addToDownloadQueue: (item) => set((state) => ({
        downloadQueue: [...state.downloadQueue, item],
        isDownloadFABOpen: true,
      })),

      updateDownloadProgress: (id, progress, status) => set((state) => ({
        downloadQueue: state.downloadQueue.map(item =>
          item.id === id
            ? { ...item, progress, status: status || item.status }
            : item
        ),
      })),

      removeFromDownloadQueue: (id) => set((state) => ({
        downloadQueue: state.downloadQueue.filter(item => item.id !== id),
      })),

      clearDownloadQueue: () => set({ downloadQueue: [] }),

      toggleDownloadFAB: () => set((state) => ({
        isDownloadFABOpen: !state.isDownloadFABOpen,
      })),

      // Side panel actions
      openSidePanel: (panel, data) => set({
        activeSidePanel: panel,
        sidePanelData: data,
      }),

      closeSidePanel: () => set({
        activeSidePanel: null,
        sidePanelData: null,
      }),

      // Notification actions
      addNotification: (notification) => set((state) => ({
        notifications: [notification, ...state.notifications],
        unreadCount: state.unreadCount + 1,
      })),

      markNotificationRead: (id) => set((state) => ({
        notifications: state.notifications.map(n =>
          n.id === id ? { ...n, read: true } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      })),

      markAllNotificationsRead: () => set((state) => ({
        notifications: state.notifications.map(n => ({ ...n, read: true })),
        unreadCount: 0,
      })),

      clearNotifications: () => set({ notifications: [], unreadCount: 0 }),

      // Search actions
      setSearchQuery: (query) => set({ searchQuery: query }),
      setSearchFocused: (focused) => set({ isSearchFocused: focused }),

      // Mobile actions
      toggleMobileMenu: () => set((state) => ({
        isMobileMenuOpen: !state.isMobileMenuOpen,
      })),
      closeMobileMenu: () => set({ isMobileMenuOpen: false }),
    }),
    {
      name: 'tvp-ui',
      partialize: (state) => ({
        theme: state.theme,
        sectionPreferences: state.sectionPreferences,
      }),
    }
  )
);

export default useUIStore;

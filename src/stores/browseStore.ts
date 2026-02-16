/**
 * Browse Store
 * Manages video browsing state: filters, sorting, pagination, data
 */

import { create } from 'zustand';
import { BrowseState, SortField, SortOrder, Video, APIVideoResponse } from '@/types/browse';
import * as videosApi from '@/api/videosApi';

const INITIAL_PAGE_SIZE = 100;

export const useBrowseStore = create<BrowseState>((set, get) => ({
  // Initial state
  selectedGenres: new Set(),
  searchQuery: '',
  sortBy: 'date',
  sortOrder: 'desc',
  page: 1,
  pageSize: INITIAL_PAGE_SIZE,
  videos: [],
  isLoading: false,
  error: null,
  hasMore: true,
  totalCount: 0,

  // Genre filter actions
  setGenres: (genres: string[]) => {
    set({
      selectedGenres: new Set(genres),
      page: 1, // Reset to first page when filter changes
    });
    get().fetchVideos();
  },

  addGenre: (genre: string) => {
    const current = new Set(get().selectedGenres);
    current.add(genre);
    set({
      selectedGenres: current,
      page: 1,
    });
    get().fetchVideos();
  },

  removeGenre: (genre: string) => {
    const current = new Set(get().selectedGenres);
    current.delete(genre);
    set({
      selectedGenres: current,
      page: 1,
    });
    get().fetchVideos();
  },

  clearGenres: () => {
    set({
      selectedGenres: new Set(),
      page: 1,
    });
    get().fetchVideos();
  },

  // Search actions
  setSearch: (query: string) => {
    set({
      searchQuery: query,
      page: 1,
    });
    get().fetchVideos();
  },

  // Sort actions
  setSortBy: (field: SortField, order?: SortOrder) => {
    const currentSort = get().sortBy;
    const currentOrder = get().sortOrder;

    // If clicking same field, toggle order
    const newOrder =
      field === currentSort && order === undefined
        ? currentOrder === 'asc'
          ? 'desc'
          : 'asc'
        : order || 'desc';

    set({
      sortBy: field,
      sortOrder: newOrder,
      page: 1,
    });
    get().fetchVideos();
  },

  // Pagination actions
  setPage: (page: number) => {
    set({ page });
    get().fetchVideos();
  },

  // Fetch videos from API
  fetchVideos: async () => {
    const state = get();

    set({ isLoading: true, error: null });

    try {
      const response = await videosApi.getVideos({
        genres: Array.from(state.selectedGenres),
        search: state.searchQuery,
        sortBy: state.sortBy,
        sortOrder: state.sortOrder,
        page: state.page,
        limit: state.pageSize,
      });

      set({
        videos: response.videos,
        totalCount: response.total,
        hasMore: response.hasMore,
        isLoading: false,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch videos';
      set({
        error: errorMessage,
        isLoading: false,
      });
    }
  },

  // Reset all filters
  resetFilters: () => {
    set({
      selectedGenres: new Set(),
      searchQuery: '',
      sortBy: 'date',
      sortOrder: 'desc',
      page: 1,
      videos: [],
    });
    get().fetchVideos();
  },
}));

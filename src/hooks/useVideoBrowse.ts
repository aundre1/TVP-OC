/**
 * Video Browse Hook
 * Shared hook for Browse Table, Grid, and Tile views
 * Integrates with browseStore and React Query for data fetching
 */

import { useQuery } from '@tanstack/react-query';
import { useBrowseStore } from '@/stores/browseStore';
import * as videosApi from '@/api/videosApi';
import { APIVideoFilters, APIVideoResponse } from '@/types/browse';

export function useVideoBrowse() {
  // Get state from browseStore
  const selectedGenres = useBrowseStore((state) => state.selectedGenres);
  const searchQuery = useBrowseStore((state) => state.searchQuery);
  const sortBy = useBrowseStore((state) => state.sortBy);
  const sortOrder = useBrowseStore((state) => state.sortOrder);
  const page = useBrowseStore((state) => state.page);
  const pageSize = useBrowseStore((state) => state.pageSize);

  // Build filters object
  const filters: APIVideoFilters = {
    genres: Array.from(selectedGenres),
    search: searchQuery,
    sortBy,
    sortOrder,
    page,
    limit: pageSize,
  };

  // React Query for data fetching with caching
  const query = useQuery<APIVideoResponse, Error>({
    queryKey: ['browse-videos', filters],
    queryFn: () => videosApi.getVideos(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes - data stays fresh
    gcTime: 5 * 60 * 1000, // 5 minutes - cache time (formerly cacheTime)
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  return {
    // Data
    videos: query.data?.videos || [],
    totalCount: query.data?.total || 0,
    hasMore: query.data?.hasMore || false,

    // Loading states
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,

    // Actions
    refetch: query.refetch,

    // Store state and actions
    sortBy,
    sortOrder,
    page,
    pageSize,
    selectedGenres: Array.from(selectedGenres),
    searchQuery,
  };
}

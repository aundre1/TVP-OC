// ============================================
// THE VIDEO POOL - VIDEOS HOOKS
// ============================================

import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { videosApi } from '@/api/videos';
import type { SearchFilters } from '@/types';

// Fetch homepage sections
export function useHomeSections() {
  return useQuery({
    queryKey: ['home-sections'],
    queryFn: () => videosApi.getHomeSections(),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

// Fetch featured videos
export function useFeaturedVideos() {
  return useQuery({
    queryKey: ['featured-videos'],
    queryFn: () => videosApi.getFeaturedVideos(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Fetch single video
export function useVideo(id: number | undefined) {
  return useQuery({
    queryKey: ['video', id],
    queryFn: () => videosApi.getVideo(id!),
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Fetch related videos
export function useRelatedVideos(videoId: number | undefined) {
  return useQuery({
    queryKey: ['related-videos', videoId],
    queryFn: () => videosApi.getRelatedVideos(videoId!),
    enabled: !!videoId,
    staleTime: 5 * 60 * 1000,
  });
}

// Fetch recommended videos
export function useRecommendedVideos(limit: number = 20) {
  return useQuery({
    queryKey: ['recommended-videos', limit],
    queryFn: () => videosApi.getRecommendedVideos(limit),
    staleTime: 5 * 60 * 1000,
  });
}

// Search videos with pagination
export function useSearchVideos(filters: SearchFilters) {
  return useInfiniteQuery({
    queryKey: ['search-videos', filters],
    queryFn: ({ pageParam = 1 }) =>
      videosApi.searchVideos({ ...filters, page: pageParam }),
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined,
    initialPageParam: 1,
    // Always enabled — shows all videos when no filters, filtered results otherwise
    enabled: true,
    staleTime: 2 * 60 * 1000,
  });
}

// Fetch videos by genre
export function useVideosByGenre(genre: string, limit: number = 20) {
  return useQuery({
    queryKey: ['videos-by-genre', genre, limit],
    queryFn: () => videosApi.getByGenre(genre, limit),
    enabled: !!genre,
    staleTime: 2 * 60 * 1000,
  });
}

// Fetch trending videos
export function useTrendingVideos(limit: number = 20) {
  return useQuery({
    queryKey: ['trending-videos', limit],
    queryFn: () => videosApi.getTrending(limit),
    staleTime: 2 * 60 * 1000,
  });
}

// Fetch new releases
export function useNewReleases(limit: number = 20) {
  return useQuery({
    queryKey: ['new-releases', limit],
    queryFn: () => videosApi.getNewReleases(limit),
    staleTime: 2 * 60 * 1000,
  });
}

// Fetch presigned preview URL for a video (1-hour expiry, lazy-loaded)
export function usePreviewUrl(id: number | undefined) {
  return useQuery({
    queryKey: ['preview-url', id],
    queryFn: () => videosApi.getPreviewUrl(id!),
    enabled: !!id,
    staleTime: 50 * 60 * 1000, // 50 min — URL expires in 1 hr
    retry: false,               // Don't retry if preview doesn't exist
  });
}

// Fetch categories
export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => videosApi.getCategories(),
    staleTime: 30 * 60 * 1000, // 30 minutes - categories don't change often
  });
}

// Fetch videos by category
export function useCategoryVideos(categoryId: number | undefined, filters?: SearchFilters) {
  return useQuery({
    queryKey: ['category-videos', categoryId, filters],
    queryFn: () => videosApi.getCategoryVideos(categoryId!, filters),
    enabled: !!categoryId,
    staleTime: 2 * 60 * 1000,
  });
}

export default {
  useHomeSections,
  useFeaturedVideos,
  useVideo,
  useRelatedVideos,
  useRecommendedVideos,
  useSearchVideos,
  useVideosByGenre,
  useTrendingVideos,
  useNewReleases,
  useCategories,
  useCategoryVideos,
};

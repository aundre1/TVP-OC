// ============================================
// THE VIDEO POOL - LIBRARY HOOKS
// ============================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { libraryApi } from '@/api/library';

// Get all crates
export function useCrates() {
  return useQuery({
    queryKey: ['crates'],
    queryFn: () => libraryApi.getCrates(),
    staleTime: 2 * 60 * 1000,
  });
}

// Get single crate with videos
export function useCrate(id: number | undefined) {
  return useQuery({
    queryKey: ['crate', id],
    queryFn: () => libraryApi.getCrate(id!),
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
  });
}

// Create crate
export function useCreateCrate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { name: string; description?: string; isPublic?: boolean }) =>
      libraryApi.createCrate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crates'] });
    },
  });
}

// Update crate
export function useUpdateCrate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: { name?: string; description?: string; isPublic?: boolean };
    }) => libraryApi.updateCrate(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['crates'] });
      queryClient.invalidateQueries({ queryKey: ['crate', id] });
    },
  });
}

// Delete crate
export function useDeleteCrate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => libraryApi.deleteCrate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crates'] });
    },
  });
}

// Add video to crate
export function useAddToCrate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ crateId, videoId }: { crateId: number; videoId: number }) =>
      libraryApi.addToCrate(crateId, videoId),
    onSuccess: (_, { crateId }) => {
      queryClient.invalidateQueries({ queryKey: ['crates'] });
      queryClient.invalidateQueries({ queryKey: ['crate', crateId] });
    },
  });
}

// Remove video from crate
export function useRemoveFromCrate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ crateId, videoId }: { crateId: number; videoId: number }) =>
      libraryApi.removeFromCrate(crateId, videoId),
    onSuccess: (_, { crateId }) => {
      queryClient.invalidateQueries({ queryKey: ['crates'] });
      queryClient.invalidateQueries({ queryKey: ['crate', crateId] });
    },
  });
}

// Get watch history
export function useWatchHistory(limit: number = 20, offset: number = 0) {
  return useQuery({
    queryKey: ['watch-history', limit, offset],
    queryFn: () => libraryApi.getWatchHistory(limit, offset),
    staleTime: 2 * 60 * 1000,
  });
}

// Get continue watching
export function useContinueWatching(limit: number = 10) {
  return useQuery({
    queryKey: ['continue-watching', limit],
    queryFn: () => libraryApi.getContinueWatching(limit),
    staleTime: 60 * 1000,
  });
}

// Update watch progress
export function useUpdateWatchProgress() {
  return useMutation({
    mutationFn: ({
      videoId,
      progress,
      duration,
    }: {
      videoId: number;
      progress: number;
      duration: number;
    }) => libraryApi.updateWatchProgress(videoId, progress, duration),
  });
}

// Get favorites
export function useFavorites() {
  return useQuery({
    queryKey: ['favorites'],
    queryFn: () => libraryApi.getFavorites(),
    staleTime: 2 * 60 * 1000,
  });
}

// Add to favorites
export function useAddToFavorites() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (videoId: number) => libraryApi.addToFavorites(videoId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      queryClient.invalidateQueries({ queryKey: ['crates'] });
    },
  });
}

// Remove from favorites
export function useRemoveFromFavorites() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (videoId: number) => libraryApi.removeFromFavorites(videoId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      queryClient.invalidateQueries({ queryKey: ['crates'] });
    },
  });
}

// Get watch stats
export function useWatchStats() {
  return useQuery({
    queryKey: ['watch-stats'],
    queryFn: () => libraryApi.getWatchStats(),
    staleTime: 5 * 60 * 1000,
  });
}

export default {
  useCrates,
  useCrate,
  useCreateCrate,
  useUpdateCrate,
  useDeleteCrate,
  useAddToCrate,
  useRemoveFromCrate,
  useWatchHistory,
  useContinueWatching,
  useUpdateWatchProgress,
  useFavorites,
  useAddToFavorites,
  useRemoveFromFavorites,
  useWatchStats,
};

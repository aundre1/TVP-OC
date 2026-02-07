// ============================================
// THE VIDEO POOL - LIBRARY API
// ============================================

import { get, post, put, del } from './client';
import type { Crate, CrateWithVideos, Video } from '@/types';

interface CreateCrateData {
  name: string;
  description?: string;
  isPublic?: boolean;
}

interface WatchHistoryEntry {
  videoId: number;
  video: Video;
  progress: number;
  duration: number;
  completed: boolean;
  lastWatchedAt: string;
}

interface WatchHistoryResponse {
  history: WatchHistoryEntry[];
  total: number;
}

export const libraryApi = {
  // Playlists (called "Crates" in UI for DJ terminology)
  async getCrates(): Promise<Crate[]> {
    return get<Crate[]>('/playlists');
  },

  async getCrate(id: number): Promise<CrateWithVideos> {
    return get<CrateWithVideos>(`/playlists/${id}`);
  },

  async createCrate(data: CreateCrateData): Promise<Crate> {
    return post<Crate>('/playlists', data);
  },

  async updateCrate(id: number, data: Partial<CreateCrateData>): Promise<Crate> {
    return put<Crate>(`/playlists/${id}`, data);
  },

  async deleteCrate(id: number): Promise<void> {
    return del(`/playlists/${id}`);
  },

  async addToCrate(crateId: number, videoId: number): Promise<void> {
    return post(`/playlists/${crateId}/videos`, { videoId });
  },

  async removeFromCrate(crateId: number, videoId: number): Promise<void> {
    return del(`/playlists/${crateId}/videos/${videoId}`);
  },

  async reorderCrate(crateId: number, videoIds: number[]): Promise<void> {
    return put(`/playlists/${crateId}/reorder`, { videoIds });
  },

  // Shared playlists
  async getSharedPlaylist(token: string): Promise<CrateWithVideos> {
    return get<CrateWithVideos>(`/shared-playlist/${token}`);
  },

  // Watch History
  async getWatchHistory(limit: number = 20, offset: number = 0): Promise<WatchHistoryResponse> {
    const result = await get<WatchHistoryEntry[]>('/watch-history', { limit, offset });
    return {
      history: result,
      total: result.length,
    };
  },

  async getContinueWatching(limit: number = 10): Promise<WatchHistoryEntry[]> {
    return get<WatchHistoryEntry[]>('/watch-history/continue', { limit });
  },

  async updateWatchProgress(videoId: number, progress: number, duration: number): Promise<void> {
    return post('/watch-history/progress', { videoId, progress, duration });
  },

  async getVideoProgress(videoId: number): Promise<{ progress: number; duration: number; completed: boolean }> {
    return get<{ progress: number; duration: number; completed: boolean }>(`/watch-history/video/${videoId}`);
  },

  async clearVideoHistory(videoId: number): Promise<void> {
    return del(`/watch-history/video/${videoId}`);
  },

  async clearAllHistory(): Promise<void> {
    return del('/watch-history');
  },

  async getWatchStats(): Promise<{
    totalWatched: number;
    totalTime: number;
    topGenres: Array<{ genre: string; count: number }>;
  }> {
    return get('/watch-history/stats');
  },

  // Favorites - Using dedicated backend endpoints
  async getFavorites(): Promise<Video[]> {
    return get<Video[]>('/favorites');
  },

  async addToFavorites(videoId: number): Promise<void> {
    return post(`/favorites/${videoId}`);
  },

  async removeFromFavorites(videoId: number): Promise<void> {
    return del(`/favorites/${videoId}`);
  },

  async isFavorite(videoId: number): Promise<boolean> {
    const result = await get<{ isFavorite: boolean }>(`/favorites/check/${videoId}`);
    return result.isFavorite;
  },
};

export default libraryApi;

/**
 * Videos Browse API
 * Specialized API for browse page: filtering, sorting, pagination
 * Extends existing videos.ts functionality
 */

import { APIVideoFilters, APIVideoResponse, Video } from '@/types/browse';
import { get, post, put } from './client';

/**
 * Get videos with filtering, sorting, and pagination
 */
export async function getVideos(filters: APIVideoFilters): Promise<APIVideoResponse> {
  try {
    const params = new URLSearchParams();

    // Build query parameters
    if (filters.genres && filters.genres.length > 0) {
      params.append('genres', filters.genres.join(','));
    }

    if (filters.search) {
      params.append('search', filters.search);
    }

    if (filters.sortBy) {
      params.append('sortBy', filters.sortBy);
    }

    if (filters.sortOrder) {
      params.append('sortOrder', filters.sortOrder);
    }

    if (filters.page) {
      params.append('page', filters.page.toString());
    }

    if (filters.limit) {
      params.append('limit', filters.limit.toString());
    }

    const queryString = params.toString();
    const url = `/api/videos/browse${queryString ? `?${queryString}` : ''}`;

    const response = await get<APIVideoResponse>(url);
    return response;
  } catch (error) {
    throw error;
  }
}

/**
 * Get available genres for filtering
 */
export async function getGenres(): Promise<string[]> {
  try {
    const response = await get<{ genres: string[] }>('/api/videos/genres');
    return response.genres || [];
  } catch (error) {
    return [];
  }
}

/**
 * Get single video with details and related videos
 */
export async function getVideoDetails(videoId: string): Promise<Video> {
  try {
    const response = await get<Video>(`/api/videos/${videoId}`);
    return response;
  } catch (error) {
    throw error;
  }
}

/**
 * Toggle favorite status for a video
 */
export async function toggleFavorite(videoId: string): Promise<{ isFavorited: boolean }> {
  try {
    const response = await post<{ isFavorited: boolean }>(`/api/videos/${videoId}/favorite`, {});
    return response;
  } catch (error) {
    throw error;
  }
}

/**
 * Add video to a playlist
 */
export async function addToPlaylist(
  videoId: string,
  playlistId: string
): Promise<{ success: boolean }> {
  try {
    const response = await post<{ success: boolean }>(
      `/api/videos/${videoId}/playlist/${playlistId}`,
      {}
    );
    return response;
  } catch (error) {
    throw error;
  }
}

/**
 * Remove video from playlist
 */
export async function removeFromPlaylist(
  videoId: string,
  playlistId: string
): Promise<{ success: boolean }> {
  try {
    const response = await post<{ success: boolean }>(
      `/api/videos/${videoId}/playlist/${playlistId}/remove`,
      {}
    );
    return response;
  } catch (error) {
    throw error;
  }
}

/**
 * Initialize download for a video with quality selection
 */
export async function initiateDownload(
  videoId: string,
  quality: string
): Promise<{ downloadUrl: string; expiresAt: string }> {
  try {
    const response = await post<{ downloadUrl: string; expiresAt: string }>(
      `/api/videos/${videoId}/download`,
      { quality }
    );
    return response;
  } catch (error) {
    throw error;
  }
}

/**
 * Get user's download history
 */
export async function getDownloadHistory(limit = 20): Promise<Video[]> {
  try {
    const response = await get<{ videos: Video[] }>(
      `/api/user/downloads?limit=${limit}`
    );
    return response.videos || [];
  } catch (error) {
    return [];
  }
}

/**
 * Update video metadata (admin only)
 */
export async function updateVideo(
  videoId: string,
  data: Record<string, string>
): Promise<Video> {
  try {
    const response = await put<Video>(`/api/videos/${videoId}`, data);
    return response;
  } catch (error) {
    throw error;
  }
}

/**
 * Search videos with query string
 */
export async function searchVideos(
  query: string,
  limit = 20
): Promise<Video[]> {
  try {
    const response = await get<{ videos: Video[] }>(
      `/api/videos/search?q=${encodeURIComponent(query)}&limit=${limit}`
    );
    return response.videos || [];
  } catch (error) {
    return [];
  }
}

/**
 * Videos Browse API
 * Specialized API for browse page: filtering, sorting, pagination
 * Extends existing videos.ts functionality
 */

import { APIVideoFilters, APIVideoResponse, Video } from '@/types/browse';
import { get, post, put } from './client';
import { extractTracks } from './adapters';

// Map browse SortField to server sortBy param
function mapSortBy(sortBy?: string, sortOrder?: string): string | undefined {
  if (!sortBy) return undefined;
  const map: Record<string, string> = {
    date: 'newest',
    popularity: 'popular',
    trending: 'popular',
    artist: 'artist',
    title: 'title',
    genre: 'genre',
    released: 'newest',
  };
  return map[sortBy] || sortBy;
}

// Map a Track (from adapter) to the Browse Video shape
function trackToBrowseVideo(track: ReturnType<typeof extractTracks>[number]): Video {
  return {
    id: String(track.id),
    title: track.title,
    artist: track.artist,
    label: track.label || '',
    genre: track.genre,
    duration: typeof track.duration === 'number' ? track.duration : 0,
    releaseDate: track.addedDate || new Date().toISOString(),
    coverArt: track.thumbnailUrl || `https://picsum.photos/320/180?random=${track.id}`,
    quality: track.quality,
    version: track.versions?.[0] || undefined,
    isFavorited: track.isFavorite ?? false,
    metadata: {
      bpm: track.bpm,
      key: track.key,
    },
  };
}

/**
 * Get videos with filtering, sorting, and pagination
 * Calls /api/videos (the real server endpoint) and maps to APIVideoResponse.
 */
export async function getVideos(filters: APIVideoFilters): Promise<APIVideoResponse> {
  try {
    const params: Record<string, unknown> = {};

    // Map genre array to single genre param (server supports one genre filter at a time)
    if (filters.genres && filters.genres.length > 0) {
      params.genre = filters.genres[0];
    }

    if (filters.search) {
      params.search = filters.search;
    }

    const mappedSortBy = mapSortBy(filters.sortBy, filters.sortOrder);
    if (mappedSortBy) {
      params.sortBy = mappedSortBy;
    }

    if (filters.page) {
      params.page = filters.page;
    }

    if (filters.limit) {
      params.limit = filters.limit;
    }

    const raw = await get<unknown>('/videos', params);

    // Extract and adapt tracks using the shared adapter
    const serverTracks = extractTracks(raw);
    const browseVideos = serverTracks.map(trackToBrowseVideo);

    // Extract pagination info from raw response
    const obj = raw as Record<string, unknown>;
    const total = typeof obj.total === 'number' ? obj.total : browseVideos.length;
    const page = typeof obj.page === 'number' ? obj.page : filters.page || 1;
    const limit = filters.limit || 100;
    const hasMore = browseVideos.length >= limit;

    return {
      videos: browseVideos,
      total,
      page,
      pageSize: limit,
      hasMore,
    };
  } catch (error) {
    throw error;
  }
}

/**
 * Get available genres for filtering
 * Derived from the video list since the server has no dedicated genres endpoint.
 */
export async function getGenres(): Promise<string[]> {
  try {
    const raw = await get<unknown>('/videos', { limit: 100 });
    const tracks = extractTracks(raw);
    const genres = [...new Set(tracks.map(t => t.genre).filter(Boolean))].sort();
    return genres;
  } catch (error) {
    // Return a sensible default list if the API call fails
    return ['Country', 'EDM', 'Hip-Hop', 'Latin', 'Pop', 'R&B', 'Rock'];
  }
}

/**
 * Get single video with details and related videos
 */
export async function getVideoDetails(videoId: string): Promise<Video> {
  try {
    const raw = await get<unknown>(`/videos/${videoId}`);
    const tracks = extractTracks(raw);
    if (tracks.length > 0) return trackToBrowseVideo(tracks[0]);
    // If single object returned
    const obj = raw as Record<string, unknown>;
    if (obj && obj.id) return trackToBrowseVideo(extractTracks([obj])[0]);
    throw new Error('Video not found');
  } catch (error) {
    throw error;
  }
}

/**
 * Toggle favorite status for a video
 */
export async function toggleFavorite(videoId: string): Promise<{ isFavorited: boolean }> {
  try {
    const response = await post<{ isFavorited: boolean }>(`/videos/${videoId}/favorite`, {});
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
      `/videos/${videoId}/playlist/${playlistId}`,
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
      `/videos/${videoId}/playlist/${playlistId}/remove`,
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
      `/videos/${videoId}/download`,
      { quality }
    );
    return response;
  } catch (error) {
    throw error;
  }
}

/**
 * Get user's download history (browse-specific)
 */
export async function getDownloadHistory(limit = 20): Promise<Video[]> {
  try {
    const response = await get<{ videos: Video[] }>('/user/downloads', { limit });
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
    const response = await put<Video>(`/videos/${videoId}`, data);
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
    const raw = await get<unknown>('/videos', { search: query, limit });
    return extractTracks(raw).map(trackToBrowseVideo);
  } catch (error) {
    return [];
  }
}

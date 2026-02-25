// ============================================
// THE VIDEO POOL - VIDEOS API
// ============================================

import { get } from './client';
import { DEV_CONFIG } from '@/config/dev';
import { sampleTracks, trendingTracks, latestTracks, forYouTracks } from '@/data/tracks';
import { extractVideos } from './adapters';
import type { Video, SearchFilters, SearchResult, Category, Track } from '@/types';

interface HomeSectionsResponse {
  trending: Video[];
  newReleases: Video[];
  forYou: Video[];
  continueWatching: Video[];
  recentlyDownloaded: Video[];
  genres: {
    [key: string]: Video[];
  };
}

interface VideoResponse extends Video {
  relatedVideos?: Video[];
}

// Helper to parse duration string/number to seconds
function parseDuration(dur: string | number): number {
  if (typeof dur === 'number') return dur;
  const parts = dur.split(':');
  if (parts.length === 2) {
    return parseInt(parts[0]) * 60 + parseInt(parts[1]);
  }
  return parseInt(dur, 10) || 180; // default 3 minutes
}

// Helper to map quality to allowed values
function mapQuality(quality: string): '720p' | '1080p' | '4K' {
  if (quality === '4K') return '4K';
  if (quality === '1080p') return '1080p';
  return '720p'; // Default for 720p, 480p, 320p
}

// Convert Track to Video format for mock data
function trackToVideo(track: Track): Video {
  return {
    id: track.id,
    title: track.title,
    artist: track.artist,
    bpm: track.bpm,
    key: track.key,
    duration: parseDuration(track.duration),
    quality: mapQuality(track.quality),
    genre: track.genre,
    subGenre: track.subgenre,
    thumbnailUrl: track.thumbnailUrl || `https://picsum.photos/320/180?random=${track.id}`,
    previewUrl: '',
    downloadCount: track.downloads || Math.floor(Math.random() * 10000),
    isNew: track.isNew || false,
    isTrending: track.isHot || false,
    isExclusive: false,
    releaseDate: track.addedDate || new Date().toISOString(),
    tags: [track.genre, track.subgenre].filter(Boolean) as string[],
    versions: [],
  };
}

// Mock video data generation
const mockTrending = trendingTracks.map(trackToVideo);
const mockNewReleases = latestTracks.map(trackToVideo);
const mockForYou = forYouTracks.map(trackToVideo);
const mockAllVideos = sampleTracks.map(trackToVideo);

// Filter videos by genre
function filterByGenre(genre: string): Video[] {
  return [...mockAllVideos, ...mockTrending, ...mockNewReleases, ...mockForYou]
    .filter(v => v.genre?.toLowerCase() === genre.toLowerCase())
    .slice(0, 20);
}

export const videosApi = {
  // Get all videos with pagination and filters
  async getVideos(filters?: SearchFilters): Promise<SearchResult> {
    if (DEV_CONFIG.useMockAuth) {
      const videos = mockAllVideos.slice(0, filters?.limit || 20);
      return {
        videos,
        total: mockAllVideos.length,
        page: 1,
        totalPages: Math.ceil(mockAllVideos.length / (filters?.limit || 20)),
        filters: filters || {},
      };
    }
    const raw = await get<unknown>('/videos', filters as Record<string, unknown>);
    const obj = raw as Record<string, unknown>;
    const videos = extractVideos(raw);
    const total = typeof obj.total === 'number' ? obj.total : videos.length;
    const page = typeof obj.page === 'number' ? obj.page : 1;
    const totalPages = typeof obj.totalPages === 'number' ? obj.totalPages : 1;
    return {
      videos,
      total,
      page,
      totalPages,
      filters: filters || {},
    };
  },

  // Get featured/homepage sections
  async getFeaturedVideos(): Promise<Video[]> {
    if (DEV_CONFIG.useMockAuth) {
      return mockTrending.slice(0, 10);
    }
    const raw = await get<unknown>('/videos/featured');
    return extractVideos(raw);
  },

  // Get homepage sections (trending, new, for you, etc.)
  async getHomeSections(): Promise<HomeSectionsResponse> {
    if (DEV_CONFIG.useMockAuth) {
      return {
        trending: mockTrending,
        newReleases: mockNewReleases,
        forYou: mockForYou,
        continueWatching: [],
        recentlyDownloaded: [],
        genres: {
          'Hip-Hop': filterByGenre('Hip-Hop'),
          'EDM': filterByGenre('EDM'),
          'Latin': filterByGenre('Latin'),
          'Pop': filterByGenre('Pop'),
        },
      };
    }

    const [trendingRaw, newReleasesRaw, recommendedRaw] = await Promise.all([
      get<unknown>('/videos', { sortBy: 'popular', limit: 20 }),
      get<unknown>('/videos', { sortBy: 'newest', limit: 20 }),
      get<unknown>('/videos/recommended'),
    ]);

    return {
      trending: extractVideos(trendingRaw),
      newReleases: extractVideos(newReleasesRaw),
      forYou: extractVideos(recommendedRaw),
      continueWatching: [],
      recentlyDownloaded: [],
      genres: {},
    };
  },

  // Get single video by ID
  async getVideo(id: number): Promise<VideoResponse> {
    if (DEV_CONFIG.useMockAuth) {
      const allVideos = [...mockAllVideos, ...mockTrending, ...mockNewReleases, ...mockForYou];
      const video = allVideos.find(v => v.id === id) || mockAllVideos[0];
      return {
        ...video,
        relatedVideos: mockAllVideos.slice(0, 6),
      };
    }
    // Server /api/videos/{id} has a UUID vs int issue; fall back to list search
    try {
      const raw = await get<unknown>(`/videos/${id}`);
      const videos = extractVideos(raw);
      if (videos.length > 0) return videos[0] as VideoResponse;
      // If server returns single object directly (no wrapper)
      const obj = raw as Record<string, unknown>;
      if (obj && obj.id) {
        // Wrap in array for extractVideos to handle
        const wrapped = extractVideos([raw]);
        if (wrapped.length > 0) return wrapped[0] as VideoResponse;
      }
    } catch {
      // fall through to list search below
    }
    // Fallback: fetch full list and find by id
    const listRaw = await get<unknown>('/videos', { limit: 100 });
    const allVideos = extractVideos(listRaw);
    const found = allVideos.find(v => v.id === id);
    if (found) return found as VideoResponse;
    throw new Error(`Video ${id} not found`);
  },

  // Get related videos
  async getRelatedVideos(id: number): Promise<Video[]> {
    if (DEV_CONFIG.useMockAuth) {
      return mockAllVideos.slice(0, 10);
    }
    // /videos/related/{id} has a server-side issue; fall back to genre-based related
    try {
      const raw = await get<unknown>(`/videos/related/${id}`);
      const videos = extractVideos(raw);
      if (videos.length > 0) return videos;
    } catch {
      // fall through
    }
    // Fallback: return recent videos as "related"
    const raw = await get<unknown>('/videos', { sortBy: 'newest', limit: 12 });
    return extractVideos(raw).filter(v => v.id !== id).slice(0, 12);
  },

  // Get recommended videos for user
  async getRecommendedVideos(limit: number = 20): Promise<Video[]> {
    if (DEV_CONFIG.useMockAuth) {
      return mockForYou.slice(0, limit);
    }
    const raw = await get<unknown>('/videos/recommended', { limit });
    return extractVideos(raw);
  },

  // Search videos
  async searchVideos(filters: SearchFilters): Promise<SearchResult> {
    if (DEV_CONFIG.useMockAuth) {
      let results = [...mockAllVideos, ...mockTrending, ...mockNewReleases];

      if (filters.query) {
        const q = filters.query.toLowerCase();
        results = results.filter(v =>
          v.title.toLowerCase().includes(q) ||
          v.artist.toLowerCase().includes(q)
        );
      }

      if (filters.genre) {
        results = results.filter(v => v.genre?.toLowerCase() === filters.genre?.toLowerCase());
      }

      return {
        videos: results.slice(0, filters.limit || 20),
        total: results.length,
        page: filters.page || 1,
        totalPages: Math.ceil(results.length / (filters.limit || 20)),
        filters,
      };
    }

    const raw = await get<unknown>('/videos', {
      search: filters.query,
      genre: filters.genre,
      subgenre: filters.subGenre,
      bpmMin: filters.bpmMin,
      bpmMax: filters.bpmMax,
      key: filters.key,
      quality: filters.quality,
      version: filters.version,
      sortBy: filters.sortBy,
      page: filters.page,
      limit: filters.limit,
    });
    const obj = raw as Record<string, unknown>;
    const videos = extractVideos(raw);
    const total = typeof obj.total === 'number' ? obj.total : videos.length;
    const page = typeof obj.page === 'number' ? obj.page : filters.page ?? 1;
    const totalPages = typeof obj.totalPages === 'number' ? obj.totalPages : 1;
    return {
      videos,
      total,
      page,
      totalPages,
      filters,
    };
  },

  // Get video preview URL
  async getPreviewUrl(id: number): Promise<{ previewUrl: string; duration: number }> {
    if (DEV_CONFIG.useMockAuth) {
      return { previewUrl: '', duration: 180 };
    }
    return get<{ previewUrl: string; duration: number }>(`/videos/${id}/preview`);
  },

  // Get categories
  async getCategories(): Promise<Category[]> {
    if (DEV_CONFIG.useMockAuth) {
      return [
        { id: 1, name: 'Pop', slug: 'pop', videoCount: 5000 },
        { id: 2, name: 'Hip-Hop', slug: 'hip-hop', videoCount: 4500 },
        { id: 3, name: 'EDM', slug: 'edm', videoCount: 3200 },
        { id: 4, name: 'Latin', slug: 'latin', videoCount: 2800 },
        { id: 5, name: 'R&B', slug: 'rnb', videoCount: 2400 },
        { id: 6, name: 'Country', slug: 'country', videoCount: 1800 },
        { id: 7, name: 'Rock', slug: 'rock', videoCount: 1500 },
        { id: 8, name: 'Throwbacks', slug: 'throwbacks', videoCount: 3000 },
      ];
    }
    return get<Category[]>('/categories');
  },

  // Get videos by category
  async getCategoryVideos(categoryId: number, filters?: SearchFilters): Promise<SearchResult> {
    if (DEV_CONFIG.useMockAuth) {
      return {
        videos: mockAllVideos.slice(0, 20),
        total: mockAllVideos.length,
        page: 1,
        totalPages: 5,
        filters: filters || {},
      };
    }
    return get<SearchResult>(`/categories/${categoryId}`, filters as Record<string, unknown>);
  },

  // Get trending videos
  async getTrending(limit: number = 20): Promise<Video[]> {
    if (DEV_CONFIG.useMockAuth) {
      return mockTrending.slice(0, limit);
    }
    const data = await get<unknown>('/videos', { sortBy: 'popular', limit });
    return extractVideos(data);
  },

  // Get new releases
  async getNewReleases(limit: number = 20): Promise<Video[]> {
    if (DEV_CONFIG.useMockAuth) {
      return mockNewReleases.slice(0, limit);
    }
    const data = await get<unknown>('/videos', { sortBy: 'newest', limit });
    return extractVideos(data);
  },

  // Get videos by genre
  async getByGenre(genre: string, limit: number = 20): Promise<Video[]> {
    if (DEV_CONFIG.useMockAuth) {
      return filterByGenre(genre).slice(0, limit);
    }
    const data = await get<unknown>('/videos', { genre, limit });
    return extractVideos(data);
  },
};

export default videosApi;

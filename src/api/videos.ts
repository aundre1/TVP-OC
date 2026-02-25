// ============================================
// THE VIDEO POOL - VIDEOS API
// ============================================

import { get } from './client';
import { DEV_CONFIG } from '@/config/dev';
import { sampleTracks, trendingTracks, latestTracks, forYouTracks } from '@/data/tracks';
import { extractTracks, extractPaginatedTracks } from './adapters';
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
    return get<SearchResult>('/videos', filters as Record<string, unknown>);
  },

  // Get featured/homepage sections
  async getFeaturedVideos(): Promise<Video[]> {
    if (DEV_CONFIG.useMockAuth) {
      return mockTrending.slice(0, 10);
    }
    return get<Video[]>('/videos/featured');
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

    const [trending, newReleases, recommended] = await Promise.all([
      get<Video[]>('/videos', { sortBy: 'popular', limit: 20 }),
      get<Video[]>('/videos', { sortBy: 'newest', limit: 20 }),
      get<Video[]>('/videos/recommended'),
    ]);

    return {
      trending,
      newReleases,
      forYou: recommended,
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
    return get<VideoResponse>(`/videos/${id}`);
  },

  // Get related videos
  async getRelatedVideos(id: number): Promise<Video[]> {
    if (DEV_CONFIG.useMockAuth) {
      return mockAllVideos.slice(0, 10);
    }
    return get<Video[]>(`/videos/related/${id}`);
  },

  // Get recommended videos for user
  async getRecommendedVideos(limit: number = 20): Promise<Video[]> {
    if (DEV_CONFIG.useMockAuth) {
      return mockForYou.slice(0, limit);
    }
    return get<Video[]>('/videos/recommended', { limit });
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

    return get<SearchResult>('/videos', {
      q: filters.query,
      genre: filters.genre,
      subGenre: filters.subGenre,
      bpmMin: filters.bpmMin,
      bpmMax: filters.bpmMax,
      key: filters.key,
      quality: filters.quality,
      version: filters.version,
      sortBy: filters.sortBy,
      page: filters.page,
      limit: filters.limit,
    });
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
    return extractTracks(data) as unknown as Video[];
  },

  // Get new releases
  async getNewReleases(limit: number = 20): Promise<Video[]> {
    if (DEV_CONFIG.useMockAuth) {
      return mockNewReleases.slice(0, limit);
    }
    const data = await get<unknown>('/videos', { sortBy: 'newest', limit });
    return extractTracks(data) as unknown as Video[];
  },

  // Get videos by genre
  async getByGenre(genre: string, limit: number = 20): Promise<Video[]> {
    if (DEV_CONFIG.useMockAuth) {
      return filterByGenre(genre).slice(0, limit);
    }
    const data = await get<unknown>('/videos', { genre, limit });
    return extractTracks(data) as unknown as Video[];
  },
};

export default videosApi;

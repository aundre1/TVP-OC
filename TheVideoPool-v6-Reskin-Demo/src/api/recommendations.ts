// ============================================
// THE VIDEO POOL - RECOMMENDATIONS API
// ============================================

import { get, post } from './client';
import type { Video, WeeklyPack, Recommendation } from '@/types';

interface TasteProfile {
  topGenres: Array<{ genre: string; affinity: number }>;
  bpmRange: { min: number; max: number };
  preferredEras: string[];
  favoriteArtists: string[];
  lastUpdated: string;
}

export const recommendationsApi = {
  // Get personalized "For You" recommendations
  async getForYou(limit: number = 20): Promise<Recommendation[]> {
    const videos = await get<Video[]>('/videos/recommended', { limit });
    return videos.map(video => ({
      video,
      score: 0.9,
      reason: 'Based on your listening history',
    }));
  },

  // Get similar videos to a specific video
  async getSimilar(videoId: number, limit: number = 10): Promise<Video[]> {
    return get<Video[]>(`/videos/related/${videoId}`, { limit });
  },

  // Get trending videos
  async getTrending(limit: number = 20): Promise<Video[]> {
    return get<Video[]>('/videos', { sortBy: 'popular', limit });
  },

  // Get weekly discovery pack
  async getWeeklyPack(): Promise<WeeklyPack | null> {
    try {
      // This would be a dedicated endpoint in production
      const videos = await get<Video[]>('/videos/recommended', { limit: 20 });
      return {
        id: 1,
        weekOf: new Date().toISOString(),
        videos,
        generatedAt: new Date().toISOString(),
      };
    } catch {
      return null;
    }
  },

  // Get user's taste profile
  async getTasteProfile(): Promise<TasteProfile> {
    // This would be a dedicated endpoint
    return {
      topGenres: [
        { genre: 'Hip-Hop', affinity: 0.85 },
        { genre: 'EDM', affinity: 0.72 },
        { genre: 'R&B', affinity: 0.65 },
      ],
      bpmRange: { min: 90, max: 140 },
      preferredEras: ['2020s', '2010s'],
      favoriteArtists: [],
      lastUpdated: new Date().toISOString(),
    };
  },

  // Update taste preferences
  async updatePreferences(preferences: {
    topGenres?: string[];
    bpmRange?: { min: number; max: number };
    excludeGenres?: string[];
  }): Promise<void> {
    await post('/user/preferences', preferences);
  },

  // Get "Because you downloaded X" recommendations
  async getBecauseYouDownloaded(videoId: number, limit: number = 6): Promise<Video[]> {
    return get<Video[]>(`/videos/related/${videoId}`, { limit });
  },

  // Get new releases in user's preferred genres
  async getNewInYourGenres(limit: number = 20): Promise<Video[]> {
    return get<Video[]>('/videos', {
      sortBy: 'newest',
      limit,
    });
  },

  // Get artist recommendations based on user's history
  async getArtistRecommendations(): Promise<Array<{
    artist: string;
    videos: Video[];
    reason: string;
  }>> {
    // This would aggregate videos by recommended artists
    return [];
  },

  // Report that a recommendation was not helpful
  async reportBadRecommendation(videoId: number, reason: string): Promise<void> {
    // Would help improve recommendations
    console.log('Bad recommendation reported:', videoId, reason);
  },
};

export default recommendationsApi;

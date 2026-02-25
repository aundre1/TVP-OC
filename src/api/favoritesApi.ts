import { get, post, del } from './client';

export interface Favorite {
  id: number;
  user_id: number;
  video_id: number;
  created_at: string;
  title: string;
  artist: string;
  genre: string;
  subgenre: string;
  bpm: number;
  key: string;
  duration: number;
  thumbnail_url: string;
  highest_quality: string;
  is_explicit: boolean;
}

export async function getFavorites(userId: string | number): Promise<Favorite[]> {
  return get<Favorite[]>(`/favorites/${userId}`);
}

export async function addFavorite(userId: string | number, videoId: number): Promise<Favorite> {
  return post<Favorite>('/favorites', { userId, videoId });
}

export async function removeFavorite(userId: string | number, videoId: number): Promise<void> {
  return del<void>(`/favorites/${userId}/${videoId}`);
}

export async function checkFavorite(userId: string | number, videoId: number): Promise<{ isFavorite: boolean }> {
  return get<{ isFavorite: boolean }>(`/favorites/${userId}/${videoId}/check`);
}

import { get, post, del } from './client';
import apiClient from './client';

export interface Playlist {
  id: number;
  uuid: string;
  user_id: number;
  name: string;
  description: string | null;
  is_public: boolean;
  track_count: number;
  created_at: string;
  updated_at: string;
}

export interface PlaylistDetail extends Playlist {
  videos: Array<{
    id: number;
    title: string;
    artist: string;
    genre: string;
    subgenre: string;
    bpm: number;
    key: string;
    duration: number;
    thumbnail_url: string;
    highest_quality: string;
    position: number;
    notes: string | null;
    cue_point: number | null;
    added_at: string;
  }>;
}

export async function getPlaylists(userId: string | number): Promise<Playlist[]> {
  return get<Playlist[]>(`/playlists/${userId}`);
}

export async function getPlaylistDetail(id: number): Promise<PlaylistDetail> {
  return get<PlaylistDetail>(`/playlists/detail/${id}`);
}

export async function createPlaylist(userId: string | number, name: string, description?: string, isPublic?: boolean): Promise<Playlist> {
  return post<Playlist>('/playlists', { userId, name, description, isPublic });
}

export async function updatePlaylist(id: number, data: { name?: string; description?: string; isPublic?: boolean }): Promise<Playlist> {
  const response = await apiClient.patch<Playlist>(`/playlists/${id}`, data);
  return response.data;
}

export async function deletePlaylist(id: number): Promise<void> {
  return del<void>(`/playlists/${id}`);
}

export async function addVideoToPlaylist(playlistId: number, videoId: number, position?: number): Promise<void> {
  return post<void>(`/playlists/${playlistId}/videos`, { videoId, position });
}

export async function removeVideoFromPlaylist(playlistId: number, videoId: number): Promise<void> {
  return del<void>(`/playlists/${playlistId}/videos/${videoId}`);
}

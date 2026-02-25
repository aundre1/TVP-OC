import { get, post } from './client';

export interface DownloadRecord {
  id: number;
  user_id: number;
  video_id: number;
  version_type: string;
  quality: string;
  downloaded_at: string;
  title: string;
  artist: string;
  genre: string;
  thumbnail_url: string;
  // Optional enriched fields used by RecentDownloadsPanel
  bpm?: number;
  key?: string;
  downloadCount?: number;
  date?: string;
}

export async function getDownloadHistory(userId: string | number, limit = 50): Promise<DownloadRecord[]> {
  return get<DownloadRecord[]>(`/downloads/${userId}`, { limit });
}

export async function recordDownload(userId: string | number, videoId: number, quality?: string): Promise<DownloadRecord> {
  return post<DownloadRecord>('/downloads', { userId, videoId, quality });
}

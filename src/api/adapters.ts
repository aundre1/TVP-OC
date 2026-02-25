// ============================================
// THE VIDEO POOL - API RESPONSE ADAPTERS
// Maps server response format to frontend types
// ============================================

import type { Track, VideoQuality, VersionType } from '@/types';

// Server video version shape
interface ServerVersion {
  id: number;
  versionType: string;
  quality: string;
  fileSize?: number;
}

// Server track shape (from /api/videos)
interface ServerTrack {
  id: number;
  title: string;
  artist: string;
  genre: string;
  subgenre?: string;
  bpm?: number;
  key?: string;
  camelotKey?: string;
  duration?: number;
  year?: number;
  label?: string;
  thumbnailUrl?: string;
  isNew?: boolean;
  isHot?: boolean;
  downloadCount?: number;
  createdAt?: string;
  versions?: ServerVersion[];
}

// Server paginated response
export interface ServerTracksResponse {
  tracks: ServerTrack[];
  total: number;
  page: number;
  limit?: number;
  totalPages: number;
}

// Map server version type string to frontend VersionType
function mapVersionType(vt: string): VersionType {
  const map: Record<string, VersionType> = {
    clean: 'Clean',
    dirty: 'Explicit',
    explicit: 'Explicit',
    extended: 'Xtendz',
    intro: 'Intro',
    outro: 'Outro',
    quickhit: 'Quick Hit',
    'quick hit': 'Quick Hit',
    instrumental: 'Clean',
    acapella: 'Clean',
    radio: 'Clean',
    remix: 'Clean',
  };
  return map[vt.toLowerCase()] ?? 'Clean';
}

// Derive best quality from version list
function bestQuality(versions?: ServerVersion[]): VideoQuality {
  if (!versions || versions.length === 0) return '720p';
  const order: VideoQuality[] = ['4K', '1080p', '720p', '480p', '320p'];
  for (const q of order) {
    if (versions.some((v) => v.quality === q || v.quality === q.toLowerCase())) {
      return q;
    }
  }
  return '720p';
}

// Convert a server Track to the frontend Track interface
export function adaptTrack(s: ServerTrack): Track {
  const versionTypes: VersionType[] = s.versions
    ? [...new Set(s.versions.map((v) => mapVersionType(v.versionType)))]
    : ['Clean'];

  return {
    id: s.id,
    title: s.title,
    artist: s.artist,
    bpm: s.bpm ?? 0,
    key: s.key ?? '',
    camelotKey: s.camelotKey,
    duration: s.duration ?? 0,
    quality: bestQuality(s.versions),
    genre: s.genre,
    subgenre: s.subgenre,
    label: s.label,
    isNew: s.isNew ?? false,
    isHot: s.isHot ?? false,
    downloads: s.downloadCount ?? 0,
    addedDate: s.createdAt,
    thumbnailUrl: s.thumbnailUrl,
    versions: versionTypes,
  };
}

// Extract tracks array from either a paginated response or a plain array
export function extractTracks(data: unknown): Track[] {
  if (!data) return [];
  if (Array.isArray(data)) return (data as ServerTrack[]).map(adaptTrack);
  const obj = data as Record<string, unknown>;
  if (Array.isArray(obj.tracks)) return (obj.tracks as ServerTrack[]).map(adaptTrack);
  if (Array.isArray(obj.videos)) return (obj.videos as ServerTrack[]).map(adaptTrack);
  return [];
}

// Extract paginated response info
export function extractPaginatedTracks(data: unknown): {
  tracks: Track[];
  total: number;
  page: number;
  totalPages: number;
} {
  if (!data) return { tracks: [], total: 0, page: 1, totalPages: 0 };
  if (Array.isArray(data)) {
    const tracks = (data as ServerTrack[]).map(adaptTrack);
    return { tracks, total: tracks.length, page: 1, totalPages: 1 };
  }
  const obj = data as Record<string, unknown>;
  const raw = (Array.isArray(obj.tracks) ? obj.tracks : Array.isArray(obj.videos) ? obj.videos : []) as ServerTrack[];
  return {
    tracks: raw.map(adaptTrack),
    total: (obj.total as number) ?? raw.length,
    page: (obj.page as number) ?? 1,
    totalPages: (obj.totalPages as number) ?? 1,
  };
}

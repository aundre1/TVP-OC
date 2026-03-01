// ============================================
// THE VIDEO POOL - API RESPONSE ADAPTERS
// Maps server response format to frontend types
// Supports two backend formats:
//   - OUR format: { tracks/videos: [{ ...fields, versions: [...] }] }
//   - STEVE format: { videos: [{ videoUrl, resolution, thumbnailUrl, ... }] }
// ============================================

import type { Track, Video, VideoQuality, VideoVersion, VersionType } from '@/types';

// Server video version shape (our Railway backend)
interface ServerVersion {
  id: number;
  versionType: string;
  quality: string;
  fileSize?: number;
  fileUrl?: string;
  previewUrl?: string;
}

// Server track shape (our Railway backend — /api/videos)
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

// Server paginated response (our Railway backend)
export interface ServerTracksResponse {
  tracks: ServerTrack[];
  total: number;
  page: number;
  limit?: number;
  totalPages: number;
}

// ============================================
// STEVE FORMAT — www.thevideopool.com backend
// Flat video objects with direct CDN URLs
// ============================================

export interface SteveVideo {
  id: number;
  title: string;
  artist?: string;          // may not exist in all responses
  duration?: number;        // seconds
  resolution?: string;      // "1920x1080", "1280x720", "3840x2160", etc.
  genre?: string;
  bpm?: number;
  key?: string;             // musical key (e.g. "Am", "C")
  videoUrl?: string;        // BunnyCDN direct URL
  thumbnailUrl?: string;    // BunnyCDN thumbnail URL
  audioUrl?: string;        // BunnyCDN audio extract
  releaseDate?: string;
  year?: number;
  label?: string;
  downloadCount?: number;
  isNew?: boolean;
  isHot?: boolean;
  createdAt?: string;
  audioExtractedAt?: string;
}

// Parse "1920x1080" → "1080p", "3840x2160" → "4K", "1280x720" → "720p"
function parseResolution(resolution?: string): '720p' | '1080p' | '4K' {
  if (!resolution) return '720p';
  const height = parseInt(resolution.split('x')[1] ?? '0', 10);
  if (height >= 2160) return '4K';
  if (height >= 1080) return '1080p';
  return '720p';
}

// Detect Steve's format: flat object with videoUrl but no versions array
function isSteveFormat(obj: Record<string, unknown>): boolean {
  return typeof obj.videoUrl === 'string' && !Array.isArray(obj.versions);
}

// Extract artist from Steve's video — uses artist field if present,
// otherwise attempts "Artist - Title" heuristic split
function extractArtist(s: SteveVideo): string {
  if (s.artist) return s.artist;
  const dashIdx = s.title.indexOf(' - ');
  if (dashIdx > 0 && dashIdx < 50) {
    return s.title.substring(0, dashIdx).trim();
  }
  return '';
}

// Convert Steve's flat video to the frontend Track interface
export function adaptSteveVideo(s: SteveVideo): Track {
  const quality = parseResolution(s.resolution);
  const artist = extractArtist(s);
  return {
    id: s.id,
    title: s.title,
    artist,
    bpm: s.bpm ?? 0,
    key: s.key ?? '',
    camelotKey: undefined,
    duration: s.duration ?? 0,
    quality,
    genre: s.genre ?? '',
    subgenre: undefined,
    label: s.label,
    isNew: s.isNew ?? false,
    isHot: s.isHot ?? false,
    downloads: s.downloadCount ?? 0,
    addedDate: s.createdAt ?? s.releaseDate,
    thumbnailUrl: s.thumbnailUrl,
    versions: ['Clean'], // Steve has one file per video; split versions unknown
  };
}

// Convert Steve's flat video to the frontend Video interface
// Synthesizes a versions[] array from the flat videoUrl + resolution fields
export function adaptSteveVideoToVideo(s: SteveVideo): Video {
  const quality = parseResolution(s.resolution);
  const artist = extractArtist(s);

  const syntheticVersions: VideoVersion[] = [];
  if (s.videoUrl) {
    syntheticVersions.push({
      id: s.id * 100,
      type: 'clean',
      quality,
      fileSize: 0,
      format: 'mp4',
      url: s.videoUrl,
      previewUrl: undefined,
    });
  }
  if (s.audioUrl) {
    syntheticVersions.push({
      id: s.id * 100 + 1,
      type: 'clean',
      quality: '720p',
      fileSize: 0,
      format: 'mp3',
      url: s.audioUrl,
      previewUrl: undefined,
    });
  }

  return {
    id: s.id,
    title: s.title,
    artist,
    thumbnailUrl: s.thumbnailUrl || `https://picsum.photos/320/180?random=${s.id}`,
    previewUrl: undefined,
    streamUrl: s.videoUrl,
    duration: s.duration ?? 0,
    bpm: s.bpm,
    key: s.key,
    genre: s.genre ?? '',
    subGenre: undefined,
    quality,
    releaseDate: s.releaseDate ?? s.createdAt ?? new Date().toISOString(),
    downloadCount: s.downloadCount ?? 0,
    isExclusive: false,
    isTrending: s.isHot ?? false,
    isNew: s.isNew ?? false,
    tags: [s.genre].filter(Boolean) as string[],
    versions: syntheticVersions,
  };
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
// Handles both our Railway format and Steve's flat format automatically
export function extractTracks(data: unknown): Track[] {
  if (!data) return [];
  if (Array.isArray(data)) {
    const first = data[0] as Record<string, unknown> | undefined;
    if (first && isSteveFormat(first)) return (data as SteveVideo[]).map(adaptSteveVideo);
    return (data as ServerTrack[]).map(adaptTrack);
  }
  const obj = data as Record<string, unknown>;
  const arr = Array.isArray(obj.tracks) ? obj.tracks
    : Array.isArray(obj.videos) ? obj.videos
    : [];
  if (arr.length === 0) return [];
  const first = arr[0] as Record<string, unknown>;
  if (isSteveFormat(first)) return (arr as SteveVideo[]).map(adaptSteveVideo);
  return (arr as ServerTrack[]).map(adaptTrack);
}

// Map quality string to Video's allowed quality values
function mapVideoQuality(q: string): '720p' | '1080p' | '4K' {
  if (q === '4K' || q === '4k') return '4K';
  if (q === '1080p') return '1080p';
  return '720p';
}

// Map server versionType to VideoVersion type
function mapVideoVersionType(vt: string): VideoVersion['type'] {
  const map: Record<string, VideoVersion['type']> = {
    clean: 'clean',
    dirty: 'explicit',
    explicit: 'explicit',
    extended: 'extended',
    instrumental: 'instrumental',
    quickhit: 'quickhitter',
    quickhitter: 'quickhitter',
    'quick hit': 'quickhitter',
    acapella: 'clean',
    radio: 'clean',
    remix: 'clean',
    intro: 'clean',
    outro: 'clean',
  };
  return map[vt.toLowerCase()] ?? 'clean';
}

// Convert a server Track directly to the Video interface (used by pages that expect Video, not Track)
export function adaptServerTrackToVideo(s: ServerTrack): Video {
  const versions: VideoVersion[] = (s.versions || []).map((v) => ({
    id: v.id,
    type: mapVideoVersionType(v.versionType),
    quality: mapVideoQuality(v.quality),
    fileSize: v.fileSize ?? 0,
    format: 'mp4',
    url: v.fileUrl,
    previewUrl: v.previewUrl,
  }));

  const firstPreview = s.versions?.find((v) => v.previewUrl)?.previewUrl;
  const firstFileUrl = s.versions?.find((v) => v.fileUrl)?.fileUrl;

  return {
    id: s.id,
    title: s.title,
    artist: s.artist,
    thumbnailUrl: s.thumbnailUrl || `https://picsum.photos/320/180?random=${s.id}`,
    previewUrl: firstPreview,
    streamUrl: firstFileUrl,
    duration: s.duration ?? 0,
    bpm: s.bpm,
    key: s.key,
    genre: s.genre,
    subGenre: s.subgenre,
    quality: mapVideoQuality(bestQuality(s.versions)),
    releaseDate: s.createdAt || new Date().toISOString(),
    downloadCount: s.downloadCount ?? 0,
    isExclusive: false,
    isTrending: s.isHot ?? false,
    isNew: s.isNew ?? false,
    tags: [s.genre, s.subgenre].filter(Boolean) as string[],
    versions,
  };
}

// Extract Video[] from server response (for pages that use the Video type)
// Handles both our Railway format and Steve's flat format automatically
export function extractVideos(data: unknown): Video[] {
  if (!data) return [];
  if (Array.isArray(data)) {
    const first = data[0] as Record<string, unknown> | undefined;
    if (first && isSteveFormat(first)) return (data as SteveVideo[]).map(adaptSteveVideoToVideo);
    return (data as ServerTrack[]).map(adaptServerTrackToVideo);
  }
  const obj = data as Record<string, unknown>;
  const arr = Array.isArray(obj.tracks) ? obj.tracks
    : Array.isArray(obj.videos) ? obj.videos
    : [];
  if (arr.length === 0) return [];
  const first = arr[0] as Record<string, unknown>;
  if (isSteveFormat(first)) return (arr as SteveVideo[]).map(adaptSteveVideoToVideo);
  return (arr as ServerTrack[]).map(adaptServerTrackToVideo);
}

// Extract paginated response info
// Handles both our Railway format and Steve's flat format automatically
export function extractPaginatedTracks(data: unknown): {
  tracks: Track[];
  total: number;
  page: number;
  totalPages: number;
} {
  if (!data) return { tracks: [], total: 0, page: 1, totalPages: 0 };
  if (Array.isArray(data)) {
    const first = data[0] as Record<string, unknown> | undefined;
    const tracks = first && isSteveFormat(first)
      ? (data as SteveVideo[]).map(adaptSteveVideo)
      : (data as ServerTrack[]).map(adaptTrack);
    return { tracks, total: tracks.length, page: 1, totalPages: 1 };
  }
  const obj = data as Record<string, unknown>;
  const raw = Array.isArray(obj.tracks) ? obj.tracks
    : Array.isArray(obj.videos) ? obj.videos
    : [];
  const first = raw[0] as Record<string, unknown> | undefined;
  const tracks = first && isSteveFormat(first)
    ? (raw as SteveVideo[]).map(adaptSteveVideo)
    : (raw as ServerTrack[]).map(adaptTrack);
  return {
    tracks,
    total: (obj.total as number) ?? tracks.length,
    page: (obj.page as number) ?? 1,
    totalPages: (obj.totalPages as number) ?? 1,
  };
}

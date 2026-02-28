// ============================================
// THE VIDEO POOL - TYPE DEFINITIONS v5.5
// ============================================

// Track Types (v5.5 - includes label, versions)
export type VideoQuality = '320p' | '480p' | '720p' | '1080p' | '4K';
export type AspectRatio = '16:9' | '4:3' | '1:1';
export type VersionType = 'Clean' | 'Explicit' | 'Intro' | 'Outro' | 'Quick Hit' | 'Xtendz';

export interface Track {
  id: number;
  title: string;
  artist: string;
  bpm: number;
  key: string;
  camelotKey?: string; // Camelot notation for DJ mixing (e.g., "8A", "11B")
  duration: string | number; // "3:45" or 225 (seconds)
  quality: VideoQuality;
  aspect?: AspectRatio;
  genre: string;
  subgenre?: string;
  label?: string;
  isNew?: boolean;
  isHot?: boolean;
  isExclusive?: boolean;
  isFavorite?: boolean;
  downloads?: number;
  addedDate?: string;
  thumbnailUrl?: string;
  versions?: VersionType[]; // Available version types
}

export interface TrackVersion {
  id: number;
  trackId: number;
  type: VersionType;
  quality: VideoQuality;
  audioQuality: '192' | '320';
  fileSize: string;
}

export interface RecentDownload {
  id: number;
  title: string;
  artist: string;
  bpm: number;
  key: string;
  date: string;
  downloadCount: number;
}

// Set Builder Types (v5.5)
export interface SetBuilderTrack extends Track {
  addedAt: number;
}

export interface SetRecommendation {
  track: Track;
  score: number;
  reasons: string[];
}

// Genre Types (v5.5)
export interface Genre {
  id: string;
  name: string;
  icon?: string;
  subgenres: Subgenre[];
}

export interface Subgenre {
  id: string;
  name: string;
  count: number;
}

// Layout Preset Types (v5.5)
export type LayoutPreset = 'club' | 'prep' | 'custom';

export interface LayoutPresetConfig {
  id: LayoutPreset;
  name: string;
  description: string;
  icon: string;
  settings: {
    setBuilderOpen: boolean;
    recentPanelOpen: boolean;
    viewMode: 'grid' | 'list';
    sectionsCollapsed: string[];
  };
}

// Toast Types (v5.5 - Minimal Pill Style)
export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

// Keyboard Shortcut Types
export interface KeyboardShortcut {
  key: string;
  description: string;
  category: string;
  action: () => void;
}

export interface ShortcutFeedback {
  key: string;
  action: string;
  visible: boolean;
}

// Section Types (v5.5 - Draggable)
export interface Section {
  id: string;
  title: string;
  type: 'trending' | 'latest' | 'forYou' | 'throwbacks' | 'remixes' | 'genre';
  collapsed: boolean;
  order: number;
}

// User & Auth Types
export interface User {
  id: number;
  username: string;
  email: string;
  membershipId: number | null;
  membershipType: 'free' | 'starter' | 'pro' | 'elite';
  isAdmin: boolean;
  emailVerified: boolean;
  phoneVerified?: boolean;
  twoFactorEnabled: boolean;
  profileImage?: string;
  createdAt: string;
  downloadsThisMonth: number;
  downloadLimit: number | null;
  bonusCredits: number;
  freeTrialStartedAt?: string;
  freeTrialExpiresAt?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  requires2FA: boolean;
  tempToken?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone: string;
  smsOptIn?: boolean;
}

export interface TwoFactorVerifyData {
  // tempToken is now stored as HttpOnly cookie (tvp_temp_token) by backend
  // Frontend only needs to send the 2FA code
  code: string;
}

// Video Types
export interface Video {
  id: number;
  title: string;
  artist: string;
  thumbnailUrl: string;
  previewUrl?: string;
  streamUrl?: string;
  duration: number;
  bpm?: number;
  key?: string;
  genre: string;
  subGenre?: string;
  quality: '720p' | '1080p' | '4K';
  releaseDate: string;
  downloadCount: number;
  isExclusive: boolean;
  isTrending: boolean;
  isNew: boolean;
  tags: string[];
  versions: VideoVersion[];
}

export interface VideoVersion {
  id: number;
  type: 'clean' | 'explicit' | 'extended' | 'instrumental' | 'quickhitter';
  quality: '720p' | '1080p' | '4K';
  fileSize: number;
  format: 'mp4' | 'mp3';
  url?: string;
  previewUrl?: string;
}

export interface VideoSection {
  id: string;
  title: string;
  videos: Video[];
  type: 'trending' | 'new' | 'genre' | 'recommended' | 'history';
}

// Search & Filter Types
export interface SearchFilters {
  query?: string;
  genre?: string;
  subGenre?: string;
  bpmMin?: number;
  bpmMax?: number;
  key?: string;
  quality?: string;
  version?: string;
  sortBy?: 'newest' | 'popular' | 'title' | 'artist';
  page?: number;
  limit?: number;
}

export interface SearchResult {
  videos: Video[];
  total: number;
  page: number;
  totalPages: number;
  filters: SearchFilters;
}

// Download Types
export interface Download {
  id: number;
  videoId: number;
  video: Video;
  version: VideoVersion;
  downloadedAt: string;
  status: 'pending' | 'downloading' | 'completed' | 'failed';
}

export interface DownloadLimits {
  tier: string;
  used: number;
  limit: number | 'unlimited';
  resetsAt: string;
  bonusCredits: number;
}

export interface DownloadRequest {
  videoId: number;
  versionId: number;
}

export interface DownloadResponse {
  signedUrl: string;
  expiresIn: number;
  remainingDownloads: number;
  downloadId: number;
}

// Library Types
export interface Crate {
  id: number;
  name: string;
  description?: string;
  videoCount: number;
  coverImage?: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CrateWithVideos extends Crate {
  videos: Video[];
}

// Subscription Types
export type BillingInterval = 'month' | 'quarter' | 'year';

export interface Membership {
  id: number;
  name: string;
  slug: 'free' | 'paid';
  price: number;
  quarterlyPrice: number;
  annualPrice: number;
  downloadLimit: number | null;
  features: string[];
  isPopular?: boolean;
}

export interface MembershipStatus {
  currentMembership: Membership;
  subscriptionStatus: 'active' | 'cancelled' | 'past_due' | 'trialing';
  periodEnd: string;
  cancelAtPeriodEnd: boolean;
  downloadsUsed: number;
  downloadsRemaining: number | 'unlimited';
}

export interface CheckoutSession {
  url: string;
  sessionId: string;
}

// Recommendation Types
export interface Recommendation {
  video: Video;
  score: number;
  reason: string;
}

export interface WeeklyPack {
  id: number;
  weekOf: string;
  videos: Video[];
  generatedAt: string;
}

// Notification Types
export interface Notification {
  id: number;
  type: 'new_release' | 'weekly_pack' | 'download_complete' | 'system';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  data?: Record<string, unknown>;
}

// UI State Types
export interface SectionPreferences {
  order: string[];
  collapsed: string[];
  topGenres: string[];
}

export interface DownloadQueueItem {
  id: string;
  video: Video;
  version: VideoVersion;
  progress: number;
  status: 'queued' | 'downloading' | 'completed' | 'failed';
  error?: string;
}

// Category Types
export interface Category {
  id: number;
  name: string;
  slug: string;
  icon?: string;
  videoCount: number;
  subCategories?: SubCategory[];
}

export interface SubCategory {
  id: number;
  name: string;
  slug: string;
  videoCount: number;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface ApiError {
  error: string;
  code?: string;
  details?: Record<string, string>;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

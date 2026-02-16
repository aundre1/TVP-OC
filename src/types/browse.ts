/**
 * Browse Page Type Definitions
 * Comprehensive types for the table/grid/tile layout system
 */

export type ViewMode = 'table' | 'grid' | 'tile';
export type SortField = 'date' | 'popularity' | 'trending' | 'artist' | 'title';
export type SortOrder = 'asc' | 'desc';
export type PanelType = 'preview' | 'details' | 'download' | 'library' | 'admin' | null;

export interface Video {
  id: string;
  title: string;
  artist: string;
  label: string;
  genre: string;
  duration: number; // in seconds
  releaseDate: string; // ISO date
  coverArt: string; // URL
  quality?: string; // 4K, 1080p, 720p, etc
  bracket?: string; // Quality bracket
  version?: string; // Version/remix
  previewUrl?: string; // Preview audio URL
  downloadUrl?: string; // Download URL (protected)
  isFavorited?: boolean;
  inPlaylist?: boolean;
  playlistIds?: string[];
  metadata?: {
    bpm?: number;
    key?: string;
    energy?: number;
    mood?: string;
    [key: string]: any;
  };
}

export interface BrowseState {
  // Filtering
  selectedGenres: Set<string>;
  searchQuery: string;

  // Sorting
  sortBy: SortField;
  sortOrder: SortOrder;

  // Pagination
  page: number;
  pageSize: number;

  // Data
  videos: Video[];
  isLoading: boolean;
  error: string | null;
  hasMore: boolean;
  totalCount: number;

  // Actions
  setGenres: (genres: string[]) => void;
  addGenre: (genre: string) => void;
  removeGenre: (genre: string) => void;
  clearGenres: () => void;
  setSearch: (query: string) => void;
  setSortBy: (field: SortField, order?: SortOrder) => void;
  setPage: (page: number) => void;
  fetchVideos: () => Promise<void>;
  resetFilters: () => void;
}

export interface ViewState {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  // Persist to localStorage
  loadViewPreference: () => void;
}

export interface PanelState {
  activePanel: PanelType;
  panelData: Video | null;
  isAnimating: boolean;

  // Actions
  openPanel: (panel: Exclude<PanelType, null>, data: Video) => void;
  closePanel: () => void;
  setAnimating: (animating: boolean) => void;
}

export interface GenreFilterProps {
  selectedGenres: string[];
  availableGenres: string[];
  onGenreChange: (genres: string[]) => void;
  isLoading?: boolean;
}

export interface BrowseTableProps {
  onRowClick: (video: Video) => void;
  onPreview: (video: Video) => void;
  onDownload: (video: Video) => void;
  onFavorite: (video: Video) => void;
}

export interface BrowseGridProps {
  columns?: number;
  onCardClick: (video: Video) => void;
  onCardAction?: (action: string, video: Video) => void;
}

export interface BrowseTileProps {
  onTileClick: (video: Video) => void;
  onTileAction?: (action: string, video: Video) => void;
}

export interface VideoRowProps {
  video: Video;
  onClick: (video: Video) => void;
  onPreview: (video: Video) => void;
  onDownload: (video: Video) => void;
  onFavorite: (video: Video) => void;
  isSelected?: boolean;
}

export interface APIVideoFilters {
  genres?: string[];
  search?: string;
  sortBy?: SortField;
  sortOrder?: SortOrder;
  page?: number;
  limit?: number;
}

export interface APIVideoResponse {
  videos: Video[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface SidebarItem {
  id: string;
  label: string;
  icon?: string;
  action: () => void;
  badge?: number;
}

export interface BrowsePageState {
  browse: BrowseState;
  view: ViewState;
  panel: PanelState;
}

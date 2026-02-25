// ============================================
// THE VIDEO POOL - SEARCH PAGE
// ============================================

import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, Play, Download, Heart } from 'lucide-react';
import { useSearchVideos } from '@/hooks/useVideos';
import { useViewStore } from '@/stores/viewStore';
import { ViewToggle } from '@/components/Browse/ViewToggle';
import VideoCard from '@/components/VideoCard';
import type { SearchFilters, Video } from '@/types';

const GENRES = ['Hip-Hop', 'EDM', 'Pop', 'R&B', 'Latin', 'Rock', 'Country', 'Dance'];
const BPM_RANGES = [
  { label: 'All BPMs', min: 0, max: 300 },
  { label: '50-70 (Slow)', min: 50, max: 70 },
  { label: '70-90 (Downtempo)', min: 70, max: 90 },
  { label: '90-110 (Mid-tempo)', min: 90, max: 110 },
  { label: '110-130 (House)', min: 110, max: 130 },
  { label: '130-150 (High Energy)', min: 130, max: 150 },
  { label: '150-180 (Drum & Bass)', min: 150, max: 180 },
  { label: '180+ (Fast)', min: 180, max: 300 },
];
const KEYS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const QUALITIES = ['All', '720p', '1080p', '4K'];
const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'title', label: 'Title A-Z' },
  { value: 'artist', label: 'Artist A-Z' },
];

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);
  const viewMode = useViewStore((state) => state.viewMode);
  const setViewMode = useViewStore((state) => state.setViewMode);

  const [filters, setFilters] = useState<SearchFilters>({
    query: searchParams.get('q') || '',
    genre: searchParams.get('genre') || undefined,
    bpmMin: searchParams.get('bpmMin') ? parseInt(searchParams.get('bpmMin')!) : undefined,
    bpmMax: searchParams.get('bpmMax') ? parseInt(searchParams.get('bpmMax')!) : undefined,
    key: searchParams.get('key') || undefined,
    quality: searchParams.get('quality') || undefined,
    sortBy: (searchParams.get('sort') as SearchFilters['sortBy']) || 'newest',
    limit: 24,
  });

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useSearchVideos(filters);

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.query) params.set('q', filters.query);
    if (filters.genre) params.set('genre', filters.genre);
    if (filters.bpmMin) params.set('bpmMin', filters.bpmMin.toString());
    if (filters.bpmMax) params.set('bpmMax', filters.bpmMax.toString());
    if (filters.key) params.set('key', filters.key);
    if (filters.quality) params.set('quality', filters.quality);
    if (filters.sortBy !== 'newest') params.set('sort', filters.sortBy!);
    setSearchParams(params);
  }, [filters, setSearchParams]);

  const updateFilter = (key: keyof SearchFilters, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      query: filters.query,
      sortBy: 'newest',
      limit: 24,
    });
  };

  const activeFilterCount = [
    filters.genre,
    filters.bpmMin,
    filters.key,
    filters.quality,
  ].filter(Boolean).length;

  // Server returns tracks key; videos.ts searchVideos() now adapts it into SearchResult.videos
  const allVideos = data?.pages.flatMap((page) => page.videos) || [];
  const totalResults = data?.pages[0]?.total || allVideos.length;

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Search Header */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-tvp-text-muted" />
          <input
            type="text"
            value={filters.query}
            onChange={(e) => updateFilter('query', e.target.value)}
            placeholder="Search videos, artists, genres..."
            className="w-full pl-12 pr-4 py-3 bg-tvp-bg-secondary border border-tvp-border-subtle rounded-xl text-tvp-text-primary placeholder:text-tvp-text-muted focus:border-tvp-accent-cyan focus:ring-2 focus:ring-tvp-accent-cyan/20 outline-none transition-all"
          />
        </div>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-3 rounded-xl transition-colors ${
            showFilters || activeFilterCount > 0
              ? 'bg-tvp-accent-cyan text-tvp-bg-primary'
              : 'bg-tvp-bg-secondary text-tvp-text-secondary hover:text-tvp-text-primary border border-tvp-border-subtle'
          }`}
        >
          <SlidersHorizontal className="w-5 h-5" />
          Filters
          {activeFilterCount > 0 && (
            <span className="w-5 h-5 bg-tvp-bg-primary text-tvp-accent-cyan text-xs font-bold rounded-full flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </button>

        <select
          value={filters.sortBy}
          onChange={(e) => updateFilter('sortBy', e.target.value)}
          className="px-4 py-3 bg-tvp-bg-secondary border border-tvp-border-subtle rounded-xl text-tvp-text-primary outline-none focus:border-tvp-accent-cyan"
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-tvp-bg-secondary border border-tvp-border-subtle rounded-xl p-6 mb-6 animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-tvp-text-primary">Filters</h3>
            {activeFilterCount > 0 && (
              <button
                onClick={clearFilters}
                className="text-sm text-tvp-accent-cyan hover:text-tvp-accent-cyan-hover"
              >
                Clear all
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Genre */}
            <div>
              <label className="block text-xs text-tvp-text-muted mb-2">Genre</label>
              <select
                value={filters.genre || ''}
                onChange={(e) => updateFilter('genre', e.target.value || undefined)}
                className="w-full px-3 py-2 bg-tvp-bg-tertiary border border-tvp-border-subtle rounded-lg text-sm text-tvp-text-primary outline-none focus:border-tvp-accent-cyan"
              >
                <option value="">All Genres</option>
                {GENRES.map((genre) => (
                  <option key={genre} value={genre}>
                    {genre}
                  </option>
                ))}
              </select>
            </div>

            {/* BPM Range */}
            <div>
              <label className="block text-xs text-tvp-text-muted mb-2">BPM Range</label>
              <select
                value={`${filters.bpmMin || 0}-${filters.bpmMax || 300}`}
                onChange={(e) => {
                  const [min, max] = e.target.value.split('-').map(Number);
                  updateFilter('bpmMin', min || undefined);
                  updateFilter('bpmMax', max === 300 ? undefined : max);
                }}
                className="w-full px-3 py-2 bg-tvp-bg-tertiary border border-tvp-border-subtle rounded-lg text-sm text-tvp-text-primary outline-none focus:border-tvp-accent-cyan"
              >
                {BPM_RANGES.map((range) => (
                  <option key={range.label} value={`${range.min}-${range.max}`}>
                    {range.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Key */}
            <div>
              <label className="block text-xs text-tvp-text-muted mb-2">Key</label>
              <select
                value={filters.key || ''}
                onChange={(e) => updateFilter('key', e.target.value || undefined)}
                className="w-full px-3 py-2 bg-tvp-bg-tertiary border border-tvp-border-subtle rounded-lg text-sm text-tvp-text-primary outline-none focus:border-tvp-accent-cyan"
              >
                <option value="">All Keys</option>
                {KEYS.map((key) => (
                  <option key={key} value={key}>
                    {key}
                  </option>
                ))}
              </select>
            </div>

            {/* Quality */}
            <div>
              <label className="block text-xs text-tvp-text-muted mb-2">Quality</label>
              <select
                value={filters.quality || 'All'}
                onChange={(e) => updateFilter('quality', e.target.value === 'All' ? undefined : e.target.value)}
                className="w-full px-3 py-2 bg-tvp-bg-tertiary border border-tvp-border-subtle rounded-lg text-sm text-tvp-text-primary outline-none focus:border-tvp-accent-cyan"
              >
                {QUALITIES.map((quality) => (
                  <option key={quality} value={quality}>
                    {quality}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Results Count + View Toggle */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-tvp-text-muted">
          {filters.query && (
            <>
              Showing results for "<span className="text-tvp-text-primary">{filters.query}</span>" •{' '}
            </>
          )}
          {totalResults.toLocaleString()} videos found
        </p>
        <ViewToggle currentView={viewMode} onViewChange={setViewMode} compact />
      </div>

      {/* Results */}
      {isLoading ? (
        <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-7 gap-3">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-video bg-tvp-bg-tertiary rounded-lg" />
              <div className="h-4 w-full bg-tvp-bg-tertiary rounded mt-2" />
              <div className="h-3 w-2/3 bg-tvp-bg-tertiary rounded mt-1" />
            </div>
          ))}
        </div>
      ) : allVideos.length === 0 ? (
        <div className="text-center py-16">
          <Search className="w-12 h-12 text-tvp-text-muted mx-auto mb-4" />
          <h3 className="text-lg font-medium text-tvp-text-primary mb-2">No videos found</h3>
          <p className="text-tvp-text-secondary">
            Try adjusting your search or filters to find what you're looking for.
          </p>
        </div>
      ) : (
        <>
          {/* Grid View */}
          {viewMode === 'grid' && (
            <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-7 gap-3">
              {allVideos.map((video) => (
                <VideoCard key={video.id} video={video} size="sm" />
              ))}
            </div>
          )}

          {/* Table View */}
          {viewMode === 'table' && (
            <div className="rounded-xl overflow-hidden border border-tvp-border-subtle">
              <table className="w-full">
                <thead>
                  <tr className="bg-tvp-bg-secondary text-tvp-text-muted text-[10px] font-semibold uppercase">
                    <th className="px-2 py-2 text-left w-10"></th>
                    <th className="px-2 py-2 text-left">Title</th>
                    <th className="px-2 py-2 text-left">Artist</th>
                    <th className="px-2 py-2 text-left hidden md:table-cell">Genre</th>
                    <th className="px-2 py-2 text-left hidden lg:table-cell">Quality</th>
                    <th className="px-2 py-2 text-left hidden lg:table-cell">BPM</th>
                    <th className="px-2 py-2 text-right w-20">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {allVideos.map((video, idx) => (
                    <tr
                      key={video.id}
                      className={`border-t border-tvp-border-subtle hover:bg-tvp-bg-tertiary transition-colors cursor-pointer ${
                        idx % 2 === 0 ? 'bg-tvp-bg-primary' : 'bg-tvp-bg-secondary'
                      }`}
                    >
                      <td className="px-2 py-1.5">
                        <button className="p-1 hover:text-tvp-accent-cyan text-tvp-text-muted rounded transition-colors">
                          <Play size={14} fill="currentColor" />
                        </button>
                      </td>
                      <td className="px-2 py-1.5 text-xs text-tvp-text-primary font-medium truncate max-w-[200px]">{video.title}</td>
                      <td className="px-2 py-1.5 text-xs text-tvp-text-secondary truncate max-w-[150px]">{video.artist}</td>
                      <td className="px-2 py-1.5 hidden md:table-cell">
                        <span className="px-1.5 py-0.5 bg-tvp-bg-tertiary text-[10px] rounded text-tvp-text-secondary">{video.genre}</span>
                      </td>
                      <td className="px-2 py-1.5 hidden lg:table-cell">
                        <span className="text-[10px] font-bold text-tvp-accent-cyan">{video.quality}</span>
                      </td>
                      <td className="px-2 py-1.5 hidden lg:table-cell text-xs text-tvp-text-muted font-mono">{video.bpm || '-'}</td>
                      <td className="px-2 py-1.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button className="p-1 hover:text-tvp-accent-cyan text-tvp-text-muted rounded transition-colors" title="Download">
                            <Download size={14} />
                          </button>
                          <button className="p-1 hover:text-pink-500 text-tvp-text-muted rounded transition-colors" title="Favorite">
                            <Heart size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* tile view removed */}

          {/* Load More */}
          {hasNextPage && (
            <div className="mt-6 text-center">
              <button
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                className="px-8 py-2.5 bg-tvp-bg-secondary border border-tvp-border-subtle hover:border-tvp-accent-cyan text-tvp-text-primary text-sm rounded-xl transition-colors disabled:opacity-50"
              >
                {isFetchingNextPage ? 'Loading...' : 'Load More'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ============================================
// THE VIDEO POOL - SEARCH AUTOCOMPLETE v5.6
// Enhanced with BPM/Key DJ filters
// Searchable: artist, title, label, BPM, Key
// ============================================

import { useState, useRef, useEffect, useCallback } from 'react';
import { useDebounce } from 'use-debounce';
import { Search, X, SlidersHorizontal, Music, Activity, Clock, Trash2 } from 'lucide-react';
import { clsx } from 'clsx';
import { Track } from '@/types';
import { getAllTracks } from '@/data/tracks';
import { useAppStore } from '@/stores/appStore';

// Search history types
interface SearchHistoryItem {
  query: string;
  timestamp: number;
  trackId?: number;
  trackTitle?: string;
  trackArtist?: string;
}

const MAX_HISTORY_ITEMS = 10;
const SEARCH_HISTORY_KEY = 'tvp_search_history';

interface SearchResult {
  track: Track;
  matchType: 'title' | 'artist' | 'label' | 'bpm' | 'key';
}

interface GroupedResults {
  songs: SearchResult[];
  artists: SearchResult[];
  labels: SearchResult[];
}

interface SearchFilters {
  bpmMin: number | null;
  bpmMax: number | null;
  key: string | null;
}

// All musical keys for the selector
const MUSICAL_KEYS = [
  // Major keys (B suffix in Camelot)
  { key: 'C', camelot: '8B', type: 'major' },
  { key: 'G', camelot: '9B', type: 'major' },
  { key: 'D', camelot: '10B', type: 'major' },
  { key: 'A', camelot: '11B', type: 'major' },
  { key: 'E', camelot: '12B', type: 'major' },
  { key: 'B', camelot: '1B', type: 'major' },
  { key: 'F#', camelot: '2B', type: 'major' },
  { key: 'Db', camelot: '3B', type: 'major' },
  { key: 'Ab', camelot: '4B', type: 'major' },
  { key: 'Eb', camelot: '5B', type: 'major' },
  { key: 'Bb', camelot: '6B', type: 'major' },
  { key: 'F', camelot: '7B', type: 'major' },
  // Minor keys (A suffix in Camelot)
  { key: 'Am', camelot: '8A', type: 'minor' },
  { key: 'Em', camelot: '9A', type: 'minor' },
  { key: 'Bm', camelot: '10A', type: 'minor' },
  { key: 'F#m', camelot: '11A', type: 'minor' },
  { key: 'C#m', camelot: '12A', type: 'minor' },
  { key: 'G#m', camelot: '1A', type: 'minor' },
  { key: 'D#m', camelot: '2A', type: 'minor' },
  { key: 'A#m', camelot: '3A', type: 'minor' },
  { key: 'Fm', camelot: '4A', type: 'minor' },
  { key: 'Cm', camelot: '5A', type: 'minor' },
  { key: 'Gm', camelot: '6A', type: 'minor' },
  { key: 'Dm', camelot: '7A', type: 'minor' },
];

// BPM presets for quick selection
const BPM_PRESETS = [
  { label: 'Hip-Hop', min: 80, max: 100 },
  { label: 'R&B', min: 90, max: 110 },
  { label: 'House', min: 120, max: 130 },
  { label: 'Techno', min: 128, max: 140 },
  { label: 'D&B', min: 160, max: 180 },
  { label: 'All', min: null, max: null },
];

export default function SearchAutocomplete() {
  const [query, setQuery] = useState('');
  const [debouncedQuery] = useDebounce(query, 100); // Reduced from 200ms to 100ms
  const [results, setResults] = useState<GroupedResults>({ songs: [], artists: [], labels: [] });
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    bpmMin: null,
    bpmMax: null,
    key: null,
  });
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { openPreviewModal, showToast } = useAppStore();

  // Search history state
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>(() => {
    try {
      const stored = localStorage.getItem(SEARCH_HISTORY_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [showHistory, setShowHistory] = useState(false);

  // Save search history to localStorage
  useEffect(() => {
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(searchHistory));
  }, [searchHistory]);

  // Add to search history
  const addToHistory = useCallback((searchQuery: string, track?: Track) => {
    if (searchQuery.length < 2 && !track) return;

    const newItem: SearchHistoryItem = {
      query: searchQuery || track?.title || '',
      timestamp: Date.now(),
      trackId: track?.id,
      trackTitle: track?.title,
      trackArtist: track?.artist,
    };

    setSearchHistory(prev => {
      // Remove duplicate if exists
      const filtered = prev.filter(item =>
        !(item.query.toLowerCase() === newItem.query.toLowerCase() ||
          (item.trackId && item.trackId === newItem.trackId))
      );
      // Add new item at beginning, limit to MAX_HISTORY_ITEMS
      return [newItem, ...filtered].slice(0, MAX_HISTORY_ITEMS);
    });
  }, []);

  // Clear search history
  const clearHistory = useCallback(() => {
    setSearchHistory([]);
    showToast('success', 'Search history cleared');
  }, [showToast]);

  // Remove single history item
  const removeHistoryItem = useCallback((timestamp: number) => {
    setSearchHistory(prev => prev.filter(item => item.timestamp !== timestamp));
  }, []);

  // Check if any filters are active
  const hasActiveFilters = filters.bpmMin !== null || filters.bpmMax !== null || filters.key !== null;

  // Flatten results for keyboard navigation
  const flatResults = [...results.songs, ...results.artists, ...results.labels];

  // Perform search with filters
  const performSearch = useCallback((searchQuery: string, currentFilters: SearchFilters) => {
    const allTracks = getAllTracks();
    const lowerQuery = searchQuery.toLowerCase();
    const hasTextQuery = searchQuery.length >= 2;
    const hasFilters = currentFilters.bpmMin !== null || currentFilters.bpmMax !== null || currentFilters.key !== null;

    // If no query and no filters, close dropdown
    if (!hasTextQuery && !hasFilters) {
      setResults({ songs: [], artists: [], labels: [] });
      setIsOpen(false);
      return;
    }

    const songs: SearchResult[] = [];
    const artists: SearchResult[] = [];
    const labels: SearchResult[] = [];
    const seenIds = new Set<number>();

    allTracks.forEach(track => {
      if (seenIds.has(track.id)) return;

      // Apply BPM filter
      if (currentFilters.bpmMin !== null && track.bpm < currentFilters.bpmMin) return;
      if (currentFilters.bpmMax !== null && track.bpm > currentFilters.bpmMax) return;

      // Apply Key filter
      if (currentFilters.key !== null) {
        const keyMatch = MUSICAL_KEYS.find(k => k.key === currentFilters.key);
        if (keyMatch) {
          // Match either the key name or Camelot notation
          if (track.key !== keyMatch.key && track.camelotKey !== keyMatch.camelot) {
            return;
          }
        }
      }

      // If filters are active but no text query, show all matching tracks
      if (!hasTextQuery && hasFilters) {
        songs.push({ track, matchType: 'bpm' });
        seenIds.add(track.id);
        return;
      }

      // Text search
      const titleMatch = track.title.toLowerCase().includes(lowerQuery);
      const artistMatch = track.artist.toLowerCase().includes(lowerQuery);
      const labelMatch = track.label?.toLowerCase().includes(lowerQuery);
      const artistParts = track.artist.toLowerCase().split(/[\s&,]+/);
      const namePartMatch = artistParts.some(part => part.startsWith(lowerQuery));

      if (titleMatch) {
        songs.push({ track, matchType: 'title' });
        seenIds.add(track.id);
      } else if (artistMatch || namePartMatch) {
        artists.push({ track, matchType: 'artist' });
        seenIds.add(track.id);
      } else if (labelMatch) {
        labels.push({ track, matchType: 'label' });
        seenIds.add(track.id);
      }
    });

    // Increased limits from 5/3/2 to 10/5/3
    setResults({
      songs: songs.slice(0, 10),
      artists: artists.slice(0, 5),
      labels: labels.slice(0, 3),
    });

    setIsOpen(true);
    setSelectedIndex(-1);
  }, []);

  // Search when query or filters change
  useEffect(() => {
    if (debouncedQuery.length >= 2 || hasActiveFilters) {
      setShowHistory(false);
    }
    performSearch(debouncedQuery, filters);
  }, [debouncedQuery, filters, performSearch, hasActiveFilters]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || flatResults.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, flatResults.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && flatResults[selectedIndex]) {
          handleSelect(flatResults[selectedIndex].track);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        setShowFilters(false);
        setShowHistory(false);
        break;
    }
  };

  // Handle selection
  const handleSelect = (track: Track) => {
    // Add to search history
    addToHistory(query, track);

    openPreviewModal(track.id);
    setIsOpen(false);
    setQuery('');
    setSelectedIndex(-1);
    setShowHistory(false);
  };

  // Handle history item selection
  const handleHistorySelect = (item: SearchHistoryItem) => {
    if (item.trackId) {
      openPreviewModal(item.trackId);
      setIsOpen(false);
      setQuery('');
    } else {
      setQuery(item.query);
    }
    setShowHistory(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        !inputRef.current?.contains(e.target as Node)
      ) {
        setIsOpen(false);
        setShowFilters(false);
        setShowHistory(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Highlight matching text
  const highlightMatch = (text: string, query: string) => {
    if (!query) return text;
    const regex = new RegExp(`(${query})`, 'gi');
    const parts = text.split(regex);

    return parts.map((part, i) =>
      regex.test(part) ? (
        <mark
          key={i}
          className="bg-tvp-accent-cyan-subtle text-tvp-accent-cyan rounded px-0.5"
        >
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  // Calculate cumulative index for selection
  const getResultIndex = (section: 'songs' | 'artists' | 'labels', index: number): number => {
    let offset = 0;
    if (section === 'artists') offset = results.songs.length;
    if (section === 'labels') offset = results.songs.length + results.artists.length;
    return offset + index;
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({ bpmMin: null, bpmMax: null, key: null });
  };

  // Apply BPM preset
  const applyBpmPreset = (preset: typeof BPM_PRESETS[0]) => {
    setFilters(prev => ({
      ...prev,
      bpmMin: preset.min,
      bpmMax: preset.max,
    }));
  };

  const hasResults = flatResults.length > 0;

  return (
    <div className="relative flex-1 max-w-[600px] mx-auto">
      {/* Search Input with Filter Toggle */}
      <div
        className={clsx(
          'flex items-center gap-2 w-full min-w-[300px] px-3 py-2',
          'bg-tvp-bg-tertiary border-2 border-tvp-border-subtle rounded-[10px]',
          'transition-all duration-fast',
          (isOpen || showFilters) && 'border-tvp-accent-cyan shadow-[0_0_0_4px_var(--accent-cyan-subtle)]'
        )}
      >
        <Search className="w-5 h-5 text-tvp-text-muted flex-shrink-0" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (query.length >= 2 || hasActiveFilters) {
              setIsOpen(true);
              setShowHistory(false);
            } else if (searchHistory.length > 0) {
              setShowHistory(true);
              setIsOpen(true);
            }
          }}
          onKeyDown={handleKeyDown}
          placeholder="Search artists, songs, labels..."
          className="flex-1 bg-transparent border-none text-tvp-text-primary text-sm outline-none placeholder:text-tvp-text-muted min-w-0"
        />

        {/* Active Filter Chips */}
        {hasActiveFilters && (
          <div className="flex items-center gap-1.5">
            {(filters.bpmMin !== null || filters.bpmMax !== null) && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-tvp-accent-cyan/20 text-tvp-accent-cyan rounded-full">
                <Activity className="w-3 h-3" />
                {filters.bpmMin ?? '?'}-{filters.bpmMax ?? '?'}
              </span>
            )}
            {filters.key && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-tvp-accent-purple/20 text-tvp-accent-purple rounded-full">
                <Music className="w-3 h-3" />
                {filters.key}
              </span>
            )}
          </div>
        )}

        {query && (
          <button
            onClick={() => {
              setQuery('');
              inputRef.current?.focus();
            }}
            className="p-1 hover:bg-tvp-bg-elevated rounded transition-colors"
          >
            <X className="w-4 h-4 text-tvp-text-muted" />
          </button>
        )}

        {/* Filter Toggle Button */}
        <button
          onClick={() => {
            setShowFilters(!showFilters);
            setIsOpen(true);
          }}
          className={clsx(
            'p-1.5 rounded transition-colors',
            showFilters || hasActiveFilters
              ? 'bg-tvp-accent-cyan/20 text-tvp-accent-cyan'
              : 'hover:bg-tvp-bg-elevated text-tvp-text-muted'
          )}
          title="DJ Filters (BPM/Key)"
        >
          <SlidersHorizontal className="w-4 h-4" />
        </button>

        <span className="kbd hidden sm:inline-flex">⌘K</span>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className={clsx(
            'absolute top-[calc(100%+8px)] left-0 right-0',
            'bg-tvp-bg-secondary border border-tvp-border-default rounded-xl',
            'shadow-elevated max-h-[500px] overflow-y-auto z-200',
            'animate-fade-in'
          )}
        >
          {/* Filter Panel */}
          {showFilters && (
            <div className="p-4 border-b border-tvp-border-subtle bg-tvp-bg-tertiary/50">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-tvp-text-muted uppercase tracking-wider">
                  DJ Filters
                </span>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="text-xs text-tvp-accent-cyan hover:underline"
                  >
                    Clear all
                  </button>
                )}
              </div>

              {/* BPM Range */}
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="w-4 h-4 text-tvp-accent-cyan" />
                  <span className="text-sm font-medium text-tvp-text-primary">BPM Range</span>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.bpmMin ?? ''}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      bpmMin: e.target.value ? parseInt(e.target.value) : null
                    }))}
                    className="w-20 px-2 py-1.5 text-sm bg-tvp-bg-elevated border border-tvp-border-subtle rounded text-tvp-text-primary placeholder:text-tvp-text-muted focus:border-tvp-accent-cyan focus:outline-none"
                  />
                  <span className="text-tvp-text-muted">—</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.bpmMax ?? ''}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      bpmMax: e.target.value ? parseInt(e.target.value) : null
                    }))}
                    className="w-20 px-2 py-1.5 text-sm bg-tvp-bg-elevated border border-tvp-border-subtle rounded text-tvp-text-primary placeholder:text-tvp-text-muted focus:border-tvp-accent-cyan focus:outline-none"
                  />
                  <span className="text-xs text-tvp-text-muted">BPM</span>
                </div>
                {/* BPM Presets */}
                <div className="flex flex-wrap gap-1.5">
                  {BPM_PRESETS.map(preset => (
                    <button
                      key={preset.label}
                      onClick={() => applyBpmPreset(preset)}
                      className={clsx(
                        'px-2 py-1 text-xs rounded-full transition-colors',
                        filters.bpmMin === preset.min && filters.bpmMax === preset.max
                          ? 'bg-tvp-accent-cyan text-black font-medium'
                          : 'bg-tvp-bg-elevated text-tvp-text-muted hover:text-tvp-text-primary hover:bg-tvp-bg-tertiary'
                      )}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Musical Key */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Music className="w-4 h-4 text-tvp-accent-purple" />
                  <span className="text-sm font-medium text-tvp-text-primary">Musical Key</span>
                  {filters.key && (
                    <button
                      onClick={() => setFilters(prev => ({ ...prev, key: null }))}
                      className="ml-auto text-xs text-tvp-text-muted hover:text-tvp-text-primary"
                    >
                      Clear
                    </button>
                  )}
                </div>
                {/* Key Grid - Minor Keys */}
                <div className="mb-2">
                  <div className="text-[10px] text-tvp-text-muted mb-1 uppercase">Minor</div>
                  <div className="flex flex-wrap gap-1">
                    {MUSICAL_KEYS.filter(k => k.type === 'minor').map(keyObj => (
                      <button
                        key={keyObj.key}
                        onClick={() => setFilters(prev => ({
                          ...prev,
                          key: prev.key === keyObj.key ? null : keyObj.key
                        }))}
                        className={clsx(
                          'w-10 h-8 text-xs rounded transition-colors flex flex-col items-center justify-center leading-none',
                          filters.key === keyObj.key
                            ? 'bg-tvp-accent-purple text-white font-medium'
                            : 'bg-tvp-bg-elevated text-tvp-text-muted hover:text-tvp-text-primary hover:bg-tvp-bg-tertiary'
                        )}
                        title={`${keyObj.key} (${keyObj.camelot})`}
                      >
                        <span className="text-[11px] font-medium">{keyObj.key}</span>
                        <span className="text-[9px] opacity-60">{keyObj.camelot}</span>
                      </button>
                    ))}
                  </div>
                </div>
                {/* Key Grid - Major Keys */}
                <div>
                  <div className="text-[10px] text-tvp-text-muted mb-1 uppercase">Major</div>
                  <div className="flex flex-wrap gap-1">
                    {MUSICAL_KEYS.filter(k => k.type === 'major').map(keyObj => (
                      <button
                        key={keyObj.key}
                        onClick={() => setFilters(prev => ({
                          ...prev,
                          key: prev.key === keyObj.key ? null : keyObj.key
                        }))}
                        className={clsx(
                          'w-10 h-8 text-xs rounded transition-colors flex flex-col items-center justify-center leading-none',
                          filters.key === keyObj.key
                            ? 'bg-tvp-accent-cyan text-black font-medium'
                            : 'bg-tvp-bg-elevated text-tvp-text-muted hover:text-tvp-text-primary hover:bg-tvp-bg-tertiary'
                        )}
                        title={`${keyObj.key} (${keyObj.camelot})`}
                      >
                        <span className="text-[11px] font-medium">{keyObj.key}</span>
                        <span className="text-[9px] opacity-60">{keyObj.camelot}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Search History */}
          {showHistory && searchHistory.length > 0 && !hasResults && query.length < 2 && (
            <div className="py-2">
              <div className="px-4 py-1.5 flex items-center justify-between">
                <span className="text-xs font-semibold text-tvp-text-muted uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-3 h-3" />
                  Recent Searches
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    clearHistory();
                  }}
                  className="text-xs text-tvp-text-muted hover:text-tvp-accent-coral transition-colors flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" />
                  Clear
                </button>
              </div>
              {searchHistory.map((item) => (
                <div
                  key={item.timestamp}
                  className="flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-tvp-bg-tertiary transition-colors group"
                  onClick={() => handleHistorySelect(item)}
                >
                  <Clock className="w-4 h-4 text-tvp-text-muted flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    {item.trackTitle ? (
                      <>
                        <div className="text-sm font-medium text-tvp-text-primary truncate">
                          {item.trackTitle}
                        </div>
                        <div className="text-xs text-tvp-text-muted truncate">
                          {item.trackArtist}
                        </div>
                      </>
                    ) : (
                      <div className="text-sm text-tvp-text-primary truncate">
                        {item.query}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeHistoryItem(item.timestamp);
                    }}
                    className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-tvp-bg-elevated transition-all"
                    title="Remove from history"
                  >
                    <X className="w-3 h-3 text-tvp-text-muted" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* No Results */}
          {!hasResults && !showHistory && (debouncedQuery.length >= 2 || hasActiveFilters) && (
            <div className="py-6 px-4 text-center text-tvp-text-muted text-sm">
              {hasActiveFilters ? (
                <>
                  No tracks found with current filters
                  <button
                    onClick={clearFilters}
                    className="block mx-auto mt-2 text-tvp-accent-cyan hover:underline"
                  >
                    Clear filters
                  </button>
                </>
              ) : (
                `No results for "${debouncedQuery}"`
              )}
            </div>
          )}

          {/* Results Count */}
          {hasResults && (
            <div className="px-4 py-2 text-xs text-tvp-text-muted border-b border-tvp-border-subtle">
              {flatResults.length} result{flatResults.length !== 1 ? 's' : ''}
              {hasActiveFilters && ' (filtered)'}
            </div>
          )}

          {/* Songs Section */}
          {results.songs.length > 0 && (
            <div className="py-2 border-b border-tvp-border-subtle">
              <div className="px-4 py-1.5 text-xs font-semibold text-tvp-text-muted uppercase tracking-wider">
                Songs
              </div>
              {results.songs.map((result, index) => (
                <SearchResultItem
                  key={result.track.id}
                  result={result}
                  query={debouncedQuery}
                  isSelected={selectedIndex === getResultIndex('songs', index)}
                  onSelect={() => handleSelect(result.track)}
                  highlightMatch={highlightMatch}
                  filters={filters}
                />
              ))}
            </div>
          )}

          {/* Artists Section */}
          {results.artists.length > 0 && (
            <div className="py-2 border-b border-tvp-border-subtle last:border-b-0">
              <div className="px-4 py-1.5 text-xs font-semibold text-tvp-text-muted uppercase tracking-wider">
                Artists
              </div>
              {results.artists.map((result, index) => (
                <SearchResultItem
                  key={result.track.id}
                  result={result}
                  query={debouncedQuery}
                  isSelected={selectedIndex === getResultIndex('artists', index)}
                  onSelect={() => handleSelect(result.track)}
                  highlightMatch={highlightMatch}
                  filters={filters}
                />
              ))}
            </div>
          )}

          {/* Labels Section */}
          {results.labels.length > 0 && (
            <div className="py-2">
              <div className="px-4 py-1.5 text-xs font-semibold text-tvp-text-muted uppercase tracking-wider">
                Labels
              </div>
              {results.labels.map((result, index) => (
                <SearchResultItem
                  key={result.track.id}
                  result={result}
                  query={debouncedQuery}
                  isSelected={selectedIndex === getResultIndex('labels', index)}
                  onSelect={() => handleSelect(result.track)}
                  highlightMatch={highlightMatch}
                  filters={filters}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Search Result Item Component
interface SearchResultItemProps {
  result: SearchResult;
  query: string;
  isSelected: boolean;
  onSelect: () => void;
  highlightMatch: (text: string, query: string) => React.ReactNode;
  filters: SearchFilters;
}

function SearchResultItem({
  result,
  query,
  isSelected,
  onSelect,
  highlightMatch,
  filters,
}: SearchResultItemProps) {
  const { track } = result;

  // Check if BPM/Key match filters (for highlighting)
  const bpmMatches = (filters.bpmMin !== null || filters.bpmMax !== null) &&
    (filters.bpmMin === null || track.bpm >= filters.bpmMin) &&
    (filters.bpmMax === null || track.bpm <= filters.bpmMax);

  const keyMatches = filters.key !== null && (
    track.key === filters.key ||
    MUSICAL_KEYS.find(k => k.key === filters.key)?.camelot === track.camelotKey
  );

  return (
    <div
      onClick={onSelect}
      className={clsx(
        'flex items-center gap-3 px-4 py-2.5 cursor-pointer',
        'transition-colors duration-fast',
        isSelected ? 'bg-tvp-bg-tertiary' : 'hover:bg-tvp-bg-tertiary'
      )}
    >
      {/* Thumbnail */}
      <div className="w-10 h-10 rounded overflow-hidden flex-shrink-0 bg-tvp-bg-elevated">
        <img
          src={track.thumbnailUrl || `https://picsum.photos/80/80?random=${track.id}`}
          alt=""
          className="w-full h-full object-cover"
        />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-tvp-text-primary truncate">
          {highlightMatch(track.title, query)}
        </div>
        <div className="text-xs text-tvp-text-muted truncate">
          {highlightMatch(track.artist, query)}
          {track.label && (
            <>
              {' · '}
              {highlightMatch(track.label, query)}
            </>
          )}
        </div>
      </div>

      {/* BPM/Key Badges */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <span
          className={clsx(
            'text-[10px] font-mono px-1.5 py-0.5 rounded',
            bpmMatches
              ? 'bg-tvp-accent-cyan/20 text-tvp-accent-cyan'
              : 'bg-tvp-bg-elevated text-tvp-text-muted'
          )}
        >
          {track.bpm}
        </span>
        <span
          className={clsx(
            'text-[10px] font-mono px-1.5 py-0.5 rounded',
            keyMatches
              ? 'bg-tvp-accent-purple/20 text-tvp-accent-purple'
              : 'bg-tvp-bg-elevated text-tvp-text-muted'
          )}
        >
          {track.camelotKey || track.key}
        </span>
      </div>

      {/* Genre Badge */}
      <span className="text-[10px] font-semibold text-tvp-text-muted uppercase bg-tvp-bg-elevated px-1.5 py-0.5 rounded flex-shrink-0">
        {track.genre || 'Track'}
      </span>
    </div>
  );
}

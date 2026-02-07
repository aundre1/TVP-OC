// ============================================
// THE VIDEO POOL - AI SEARCH INPUT
// Natural language search with intelligent query parsing
// ============================================

import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Search, Loader2, X, Lightbulb } from 'lucide-react';
import { clsx } from 'clsx';
import type { SearchFilters } from '@/types';

// Example AI queries for inspiration
const EXAMPLE_QUERIES = [
  "upbeat hip-hop tracks for a club warmup",
  "chill R&B songs in minor keys around 90 BPM",
  "high energy EDM bangers for peak hour",
  "Latin tracks between 100-120 BPM",
  "throwback 90s hip-hop classics",
  "moody trap beats for late night sets",
  "feel-good pop hits from the 2020s",
  "house music transitions around 125 BPM",
];

// NLP parsing helpers
const GENRE_KEYWORDS: Record<string, string> = {
  'hip-hop': 'Hip-Hop',
  'hip hop': 'Hip-Hop',
  'hiphop': 'Hip-Hop',
  'rap': 'Hip-Hop',
  'trap': 'Hip-Hop',
  'edm': 'EDM',
  'electronic': 'EDM',
  'house': 'EDM',
  'techno': 'EDM',
  'dance': 'EDM',
  'pop': 'Pop',
  'r&b': 'R&B',
  'rnb': 'R&B',
  'r and b': 'R&B',
  'soul': 'R&B',
  'latin': 'Latin',
  'reggaeton': 'Latin',
  'salsa': 'Latin',
  'bachata': 'Latin',
  'rock': 'Rock',
  'alternative': 'Rock',
  'indie': 'Rock',
  'country': 'Country',
  'throwback': 'Throwbacks',
  'throwbacks': 'Throwbacks',
  'classic': 'Throwbacks',
  'classics': 'Throwbacks',
  'oldies': 'Throwbacks',
  '90s': 'Throwbacks',
  '80s': 'Throwbacks',
  '2000s': 'Throwbacks',
};

const MOOD_TO_BPM: Record<string, { min: number; max: number }> = {
  'chill': { min: 60, max: 95 },
  'relaxed': { min: 60, max: 90 },
  'mellow': { min: 65, max: 95 },
  'slow': { min: 50, max: 80 },
  'downtempo': { min: 70, max: 95 },
  'mid-tempo': { min: 95, max: 115 },
  'upbeat': { min: 110, max: 140 },
  'energetic': { min: 120, max: 150 },
  'high energy': { min: 125, max: 160 },
  'fast': { min: 140, max: 180 },
  'banger': { min: 120, max: 145 },
  'bangers': { min: 120, max: 145 },
  'peak hour': { min: 125, max: 135 },
  'warmup': { min: 95, max: 115 },
  'warm up': { min: 95, max: 115 },
  'opening': { min: 90, max: 110 },
  'closing': { min: 100, max: 120 },
};

const KEY_KEYWORDS: Record<string, string[]> = {
  'minor': ['Am', 'Bm', 'Cm', 'Dm', 'Em', 'Fm', 'Gm'],
  'major': ['C', 'D', 'E', 'F', 'G', 'A', 'B'],
  'dark': ['Am', 'Dm', 'Em', 'Bm'],
  'bright': ['C', 'G', 'D', 'A'],
  'moody': ['Am', 'Dm', 'Fm', 'Cm'],
  'happy': ['C', 'G', 'F', 'D'],
  'sad': ['Am', 'Dm', 'Em'],
};

interface ParsedQuery {
  filters: SearchFilters;
  interpretation: string;
  confidence: 'high' | 'medium' | 'low';
}

function parseNaturalLanguageQuery(query: string): ParsedQuery {
  const lowerQuery = query.toLowerCase();
  const filters: SearchFilters = {};
  const interpretations: string[] = [];

  // Extract genre
  for (const [keyword, genre] of Object.entries(GENRE_KEYWORDS)) {
    if (lowerQuery.includes(keyword)) {
      filters.genre = genre;
      interpretations.push(`Genre: ${genre}`);
      break;
    }
  }

  // Extract BPM range from explicit numbers
  const bpmMatch = lowerQuery.match(/(\d{2,3})\s*(?:-|to)\s*(\d{2,3})\s*bpm/i);
  const singleBpmMatch = lowerQuery.match(/(?:around|about|~|near)\s*(\d{2,3})\s*bpm/i);
  const justBpmMatch = lowerQuery.match(/(\d{2,3})\s*bpm/i);

  if (bpmMatch) {
    filters.bpmMin = parseInt(bpmMatch[1]);
    filters.bpmMax = parseInt(bpmMatch[2]);
    interpretations.push(`BPM: ${filters.bpmMin}-${filters.bpmMax}`);
  } else if (singleBpmMatch) {
    const target = parseInt(singleBpmMatch[1]);
    filters.bpmMin = target - 5;
    filters.bpmMax = target + 5;
    interpretations.push(`BPM: ~${target}`);
  } else if (justBpmMatch) {
    const target = parseInt(justBpmMatch[1]);
    filters.bpmMin = target - 3;
    filters.bpmMax = target + 3;
    interpretations.push(`BPM: ${target}`);
  } else {
    // Extract BPM from mood keywords
    for (const [mood, range] of Object.entries(MOOD_TO_BPM)) {
      if (lowerQuery.includes(mood)) {
        filters.bpmMin = range.min;
        filters.bpmMax = range.max;
        interpretations.push(`Tempo: ${mood} (${range.min}-${range.max} BPM)`);
        break;
      }
    }
  }

  // Extract key preference
  for (const [keyword, keys] of Object.entries(KEY_KEYWORDS)) {
    if (lowerQuery.includes(keyword)) {
      // Pick a representative key (first one) - in real AI this would be smarter
      filters.key = keys[0];
      interpretations.push(`Key: ${keyword} keys`);
      break;
    }
  }

  // Extract sort preference
  if (lowerQuery.includes('new') || lowerQuery.includes('latest') || lowerQuery.includes('recent')) {
    filters.sortBy = 'newest';
    interpretations.push('Sort: Newest');
  } else if (lowerQuery.includes('popular') || lowerQuery.includes('trending') || lowerQuery.includes('hot')) {
    filters.sortBy = 'popular';
    interpretations.push('Sort: Popular');
  }

  // If no specific filters found, use query as text search
  if (interpretations.length === 0) {
    filters.query = query;
    interpretations.push('Text search');
  }

  // Calculate confidence
  let confidence: 'high' | 'medium' | 'low' = 'low';
  if (interpretations.length >= 3) confidence = 'high';
  else if (interpretations.length >= 2) confidence = 'medium';

  return {
    filters,
    interpretation: interpretations.join(' • '),
    confidence,
  };
}

interface AISearchInputProps {
  onSearch?: (filters: SearchFilters, interpretation: string) => void;
  placeholder?: string;
  className?: string;
  showExamples?: boolean;
}

export default function AISearchInput({
  onSearch,
  placeholder = "Try: 'upbeat hip-hop tracks for a club warmup'",
  className,
  showExamples = true,
}: AISearchInputProps) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [parsedPreview, setParsedPreview] = useState<ParsedQuery | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Parse query in real-time for preview
  useEffect(() => {
    if (query.length >= 3) {
      const parsed = parseNaturalLanguageQuery(query);
      setParsedPreview(parsed);
    } else {
      setParsedPreview(null);
    }
  }, [query]);

  const handleSearch = useCallback(async () => {
    if (!query.trim()) return;

    setIsProcessing(true);

    // Simulate AI processing delay for UX feedback
    await new Promise((resolve) => setTimeout(resolve, 300));

    const parsed = parseNaturalLanguageQuery(query);

    if (onSearch) {
      onSearch(parsed.filters, parsed.interpretation);
    } else {
      // Navigate to search page with filters
      const params = new URLSearchParams();
      if (parsed.filters.query) params.set('q', parsed.filters.query);
      if (parsed.filters.genre) params.set('genre', parsed.filters.genre);
      if (parsed.filters.bpmMin) params.set('bpmMin', parsed.filters.bpmMin.toString());
      if (parsed.filters.bpmMax) params.set('bpmMax', parsed.filters.bpmMax.toString());
      if (parsed.filters.key) params.set('key', parsed.filters.key);
      if (parsed.filters.sortBy) params.set('sort', parsed.filters.sortBy);
      params.set('ai', '1'); // Mark as AI search

      navigate(`/search?${params.toString()}`);
    }

    setIsProcessing(false);
    setShowSuggestions(false);
  }, [query, onSearch, navigate]);

  const handleExampleClick = (example: string) => {
    setQuery(example);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const confidenceColor = {
    high: 'text-tvp-success',
    medium: 'text-tvp-warning',
    low: 'text-tvp-text-muted',
  };

  return (
    <div className={clsx('relative', className)}>
      {/* Input Container */}
      <div
        className={clsx(
          'flex items-center gap-3 w-full px-4 py-3',
          'bg-gradient-to-r from-tvp-bg-secondary to-tvp-bg-tertiary',
          'border-2 rounded-2xl transition-all duration-200',
          isFocused
            ? 'border-tvp-accent-cyan shadow-[0_0_20px_rgba(0,212,255,0.15)]'
            : 'border-tvp-border-subtle hover:border-tvp-border-default'
        )}
      >
        {/* AI Icon */}
        <div className="flex items-center gap-2">
          <Sparkles
            className={clsx(
              'w-5 h-5 transition-colors',
              isFocused ? 'text-tvp-accent-cyan' : 'text-tvp-text-muted'
            )}
          />
        </div>

        {/* Input */}
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            setIsFocused(true);
            if (showExamples && !query) setShowSuggestions(true);
          }}
          onBlur={() => {
            setIsFocused(false);
            // Delay hiding to allow click on suggestions
            setTimeout(() => setShowSuggestions(false), 200);
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="flex-1 bg-transparent border-none text-tvp-text-primary outline-none placeholder:text-tvp-text-muted"
        />

        {/* Clear Button */}
        {query && (
          <button
            onClick={() => {
              setQuery('');
              setParsedPreview(null);
              inputRef.current?.focus();
            }}
            className="p-1 hover:bg-tvp-bg-elevated rounded-lg transition-colors"
          >
            <X className="w-4 h-4 text-tvp-text-muted" />
          </button>
        )}

        {/* Search Button */}
        <button
          onClick={handleSearch}
          disabled={!query.trim() || isProcessing}
          className={clsx(
            'flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all',
            query.trim()
              ? 'bg-tvp-accent-cyan text-tvp-bg-primary hover:bg-tvp-accent-cyan-hover'
              : 'bg-tvp-bg-elevated text-tvp-text-muted cursor-not-allowed'
          )}
        >
          {isProcessing ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Search className="w-4 h-4" />
          )}
          <span className="hidden sm:inline">Search</span>
        </button>
      </div>

      {/* Real-time Parse Preview */}
      {parsedPreview && isFocused && (
        <div className="absolute top-full left-0 right-0 mt-2 p-3 bg-tvp-bg-secondary border border-tvp-border-subtle rounded-xl shadow-elevated z-50 animate-fade-in">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-tvp-text-muted">AI understood:</span>
            <span className="text-tvp-text-primary">{parsedPreview.interpretation}</span>
            <span
              className={clsx(
                'ml-auto text-xs px-2 py-0.5 rounded-full bg-tvp-bg-elevated',
                confidenceColor[parsedPreview.confidence]
              )}
            >
              {parsedPreview.confidence} match
            </span>
          </div>
        </div>
      )}

      {/* Example Suggestions Dropdown */}
      {showSuggestions && showExamples && !query && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-tvp-bg-secondary border border-tvp-border-subtle rounded-xl shadow-elevated z-50 animate-fade-in overflow-hidden">
          <div className="px-4 py-3 border-b border-tvp-border-subtle">
            <div className="flex items-center gap-2 text-sm text-tvp-text-muted">
              <Lightbulb className="w-4 h-4 text-tvp-warning" />
              Try asking in natural language:
            </div>
          </div>
          <div className="max-h-64 overflow-y-auto">
            {EXAMPLE_QUERIES.map((example, index) => (
              <button
                key={index}
                onClick={() => handleExampleClick(example)}
                className="w-full px-4 py-3 text-left text-sm text-tvp-text-secondary hover:bg-tvp-bg-tertiary hover:text-tvp-text-primary transition-colors"
              >
                "{example}"
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

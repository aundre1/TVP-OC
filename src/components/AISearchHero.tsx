// ============================================
// THE VIDEO POOL - AI SEARCH HERO SECTION
// Prominent AI search feature for homepage
// ============================================

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Zap, Music, TrendingUp } from 'lucide-react';
import { clsx } from 'clsx';
import AISearchInput from './AISearchInput';
import type { SearchFilters } from '@/types';

// Quick filter chips for common searches
const QUICK_FILTERS = [
  { label: 'Trending Now', icon: TrendingUp, filters: { sortBy: 'popular' as const } },
  { label: 'New Releases', icon: Zap, filters: { sortBy: 'newest' as const } },
  { label: 'Hip-Hop Bangers', icon: Music, filters: { genre: 'Hip-Hop', bpmMin: 120, bpmMax: 145 } },
  { label: 'EDM Peak Hour', icon: Sparkles, filters: { genre: 'EDM', bpmMin: 125, bpmMax: 135 } },
];

interface AISearchHeroProps {
  compact?: boolean;
  showQuickFilters?: boolean;
}

export default function AISearchHero({ compact = false, showQuickFilters = true }: AISearchHeroProps) {
  const navigate = useNavigate();
  const [recentSearches] = useState<string[]>([
    'upbeat hip-hop for warmup',
    'chill R&B vibes',
    'latin party tracks',
  ]);

  const handleQuickFilter = (filters: SearchFilters) => {
    const params = new URLSearchParams();
    if (filters.genre) params.set('genre', filters.genre);
    if (filters.bpmMin) params.set('bpmMin', filters.bpmMin.toString());
    if (filters.bpmMax) params.set('bpmMax', filters.bpmMax.toString());
    if (filters.sortBy) params.set('sort', filters.sortBy);
    navigate(`/search?${params.toString()}`);
  };

  if (compact) {
    return (
      <div className="w-full max-w-2xl mx-auto">
        <AISearchInput showExamples={false} />
      </div>
    );
  }

  return (
    <section className="relative overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-tvp-accent-cyan/5 via-transparent to-transparent pointer-events-none" />

      {/* Decorative Elements */}
      <div className="absolute top-10 left-10 w-32 h-32 bg-tvp-accent-cyan/10 rounded-full blur-3xl" />
      <div className="absolute bottom-10 right-10 w-40 h-40 bg-tvp-accent-coral/10 rounded-full blur-3xl" />

      <div className="relative max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-tvp-accent-cyan/10 border border-tvp-accent-cyan/20 rounded-full mb-4">
            <Sparkles className="w-4 h-4 text-tvp-accent-cyan" />
            <span className="text-sm font-medium text-tvp-accent-cyan">AI-Powered Search</span>
          </div>

          <h2 className="text-3xl md:text-4xl font-bold text-tvp-text-primary mb-3">
            Find the perfect track in{' '}
            <span className="text-tvp-accent-cyan">natural language</span>
          </h2>

          <p className="text-tvp-text-secondary max-w-xl mx-auto">
            Describe what you're looking for and our AI will find matching tracks.
            Try "upbeat hip-hop for a club warmup" or "chill R&B in minor keys".
          </p>
        </div>

        {/* Search Input */}
        <AISearchInput className="mb-8" />

        {/* Quick Filters */}
        {showQuickFilters && (
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {QUICK_FILTERS.map((filter) => (
              <button
                key={filter.label}
                onClick={() => handleQuickFilter(filter.filters)}
                className={clsx(
                  'flex items-center gap-2 px-4 py-2 rounded-full',
                  'bg-tvp-bg-secondary border border-tvp-border-subtle',
                  'text-sm text-tvp-text-secondary',
                  'hover:border-tvp-accent-cyan hover:text-tvp-text-primary',
                  'transition-all duration-200'
                )}
              >
                <filter.icon className="w-4 h-4" />
                {filter.label}
              </button>
            ))}
          </div>
        )}

        {/* Recent Searches */}
        {recentSearches.length > 0 && (
          <div className="flex items-center justify-center gap-2 text-sm">
            <span className="text-tvp-text-muted">Recent:</span>
            {recentSearches.map((search, index) => (
              <button
                key={index}
                onClick={() => navigate(`/search?q=${encodeURIComponent(search)}&ai=1`)}
                className="text-tvp-text-secondary hover:text-tvp-accent-cyan transition-colors"
              >
                {search}
                {index < recentSearches.length - 1 && <span className="ml-2 text-tvp-border-subtle">•</span>}
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

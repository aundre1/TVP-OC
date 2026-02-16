/**
 * Genre Filter Component
 * Multi-select genre filter with OR logic
 * Shows: Pop | Dance | House | ... | All Genres (reset)
 * Connected to browseStore for reactive state updates
 */

import React from 'react';
import { RotateCcw } from 'lucide-react';
import { useBrowseStore } from '@/stores/browseStore';

interface GenreFilterProps {
  availableGenres: string[];
  isLoading?: boolean;
}

export const GenreFilter: React.FC<GenreFilterProps> = ({
  availableGenres,
  isLoading = false,
}) => {
  const selectedGenres = useBrowseStore((state) => state.selectedGenres);
  const addGenre = useBrowseStore((state) => state.addGenre);
  const removeGenre = useBrowseStore((state) => state.removeGenre);
  const clearGenres = useBrowseStore((state) => state.clearGenres);

  const handleGenreClick = (genre: string) => {
    if (selectedGenres.has(genre)) {
      removeGenre(genre);
    } else {
      addGenre(genre);
    }
  };

  const handleReset = () => {
    clearGenres();
  };

  const isAnySelected = selectedGenres.size > 0;

  return (
    <div className="space-y-2">
      {/* Filter Label */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-300">Genres</h3>
        {isAnySelected && (
          <button
            onClick={handleReset}
            className="flex items-center gap-1 px-2 py-1 text-xs rounded bg-gray-700 hover:bg-gray-600 text-gray-300 transition-colors"
            title="Reset all genre filters"
          >
            <RotateCcw size={14} />
            Reset
          </button>
        )}
      </div>

      {/* Genre Buttons */}
      <div className="flex flex-wrap gap-2">
        {isLoading ? (
          <div className="text-gray-500 text-sm">Loading genres...</div>
        ) : availableGenres.length === 0 ? (
          <div className="text-gray-500 text-sm">No genres available</div>
        ) : (
          availableGenres.map((genre) => {
            const isSelected = selectedGenres.has(genre);
            return (
              <button
                key={genre}
                onClick={() => handleGenreClick(genre)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                  isSelected
                    ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/30'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {genre}
              </button>
            );
          })
        )}
      </div>

      {/* Selected Count */}
      {isAnySelected && (
        <div className="text-xs text-gray-400 pt-2 border-t border-gray-700">
          {selectedGenres.size} genre{selectedGenres.size !== 1 ? 's' : ''} selected
        </div>
      )}
    </div>
  );
};

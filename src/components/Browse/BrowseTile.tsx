/**
 * Browse Tile Component
 * Card/tile view - current design
 * Shows album art, artist, title, genre with full card layout
 */

import React from 'react';
import { Play, Download, Heart, Plus, AlertCircle } from 'lucide-react';
import { BrowseTileProps } from '@/types/browse';
import { useVideoBrowse } from '@/hooks/useVideoBrowse';

export const BrowseTile: React.FC<BrowseTileProps> = ({
  onTileClick,
  onTileAction,
}) => {
  // Use shared hook for data fetching
  const { videos, isLoading, isError, error, refetch } = useVideoBrowse();
  // Error state
  if (isError) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-400 text-lg mb-2">Failed to load videos</p>
          <p className="text-gray-500 text-sm mb-4">{error?.message || 'An error occurred'}</p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-md transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
          <p className="text-gray-400 mt-4">Loading videos...</p>
        </div>
      </div>
    );
  }

  // Empty state
  if (videos.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-gray-400 text-lg">No videos found</p>
          <p className="text-gray-500 text-sm mt-2">Try adjusting your filters</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="space-y-4 max-w-4xl">
        {videos.map((video) => (
          <div
            key={video.id}
            onClick={() => onTileClick(video)}
            className="flex gap-4 p-4 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors cursor-pointer group"
          >
            {/* Album Art */}
            <div className="relative w-24 h-24 flex-shrink-0 rounded overflow-hidden bg-gray-900">
              <img
                src={video.coverArt}
                alt={video.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />

              {/* Play Icon Overlay */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onTileAction?.('preview', video);
                  }}
                  className="p-2 bg-cyan-500 hover:bg-cyan-600 rounded-full text-white"
                >
                  <Play size={16} fill="currentColor" />
                </button>
              </div>
            </div>

            {/* Info Section */}
            <div className="flex-1 min-w-0 flex flex-col justify-between">
              {/* Text Content */}
              <div>
                <p className="text-xs text-gray-400">{video.artist}</p>
                <h3 className="text-base font-semibold text-white truncate group-hover:text-cyan-400 transition-colors">
                  {video.title}
                </h3>
                <p className="text-xs text-gray-500 line-clamp-2">{video.label}</p>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 pt-2">
                <span className="px-2 py-1 bg-gray-700 text-xs rounded text-gray-300">
                  {video.genre}
                </span>
                {video.quality && (
                  <span className="px-2 py-1 bg-cyan-900 text-xs rounded text-cyan-300">
                    {video.quality}
                  </span>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-2 justify-center flex-shrink-0">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onTileAction?.('download', video);
                }}
                className="p-2 bg-gray-700 hover:bg-cyan-500 rounded transition-colors text-gray-300 hover:text-white"
                title="Download"
              >
                <Download size={16} />
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onTileAction?.('favorite', video);
                }}
                className={`p-2 rounded transition-colors ${
                  video.isFavorited
                    ? 'bg-pink-500 text-white'
                    : 'bg-gray-700 hover:bg-pink-500 text-gray-300 hover:text-white'
                }`}
                title="Favorite"
              >
                <Heart
                  size={16}
                  fill={video.isFavorited ? 'currentColor' : 'none'}
                />
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onTileAction?.('playlist', video);
                }}
                className="p-2 bg-gray-700 hover:bg-gray-600 rounded transition-colors text-gray-300"
                title="Add to playlist"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Browse Grid Component
 * Grid/card view with responsive columns
 * Shows album art, artist, title with hover interactions
 */

import React from 'react';
import { Play, Download, Heart, Plus } from 'lucide-react';
import { BrowseGridProps } from '@/types/browse';

export const BrowseGrid: React.FC<BrowseGridProps> = ({
  videos,
  isLoading,
  columns = 4,
  onCardClick,
  onCardAction,
}) => {
  const colsClass = {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
  }[columns] || 'grid-cols-4';

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
      <div className={`grid ${colsClass} gap-6 auto-rows-max`}>
        {videos.map((video) => (
          <div
            key={video.id}
            onClick={() => onCardClick(video)}
            className="group cursor-pointer"
          >
            {/* Card Container */}
            <div className="relative rounded-lg overflow-hidden bg-gray-800 hover:shadow-xl hover:shadow-cyan-500/20 transition-all duration-300">
              {/* Image Container */}
              <div className="relative aspect-square overflow-hidden bg-gray-900">
                <img
                  src={video.coverArt}
                  alt={video.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />

                {/* Overlay on Hover */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onCardAction?.('preview', video);
                    }}
                    className="p-3 bg-cyan-500 hover:bg-cyan-600 rounded-full text-white transition-colors"
                    title="Preview"
                  >
                    <Play size={20} fill="currentColor" />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onCardAction?.('download', video);
                    }}
                    className="p-3 bg-gray-700 hover:bg-gray-600 rounded-full text-gray-300 transition-colors"
                    title="Download"
                  >
                    <Download size={20} />
                  </button>
                </div>
              </div>

              {/* Info Section */}
              <div className="p-3 space-y-2">
                {/* Artist */}
                <p className="text-xs text-gray-400 truncate">{video.artist}</p>

                {/* Title */}
                <h3 className="text-sm font-semibold text-white truncate group-hover:text-cyan-400 transition-colors">
                  {video.title}
                </h3>

                {/* Genre & Quality */}
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="bg-gray-700 px-2 py-1 rounded text-gray-300">
                    {video.genre}
                  </span>
                  {video.quality && (
                    <span className="bg-cyan-900 px-2 py-1 rounded text-cyan-300">
                      {video.quality}
                    </span>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 pt-2 border-t border-gray-700">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onCardAction?.('favorite', video);
                    }}
                    className={`p-1.5 rounded transition-colors flex-1 text-center ${
                      video.isFavorited
                        ? 'bg-pink-500 text-white'
                        : 'bg-gray-700 hover:bg-pink-500 text-gray-300 hover:text-white'
                    }`}
                    title="Favorite"
                  >
                    <Heart
                      size={14}
                      fill={video.isFavorited ? 'currentColor' : 'none'}
                      className="mx-auto"
                    />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onCardAction?.('playlist', video);
                    }}
                    className="p-1.5 rounded bg-gray-700 hover:bg-gray-600 text-gray-300 transition-colors flex-1 text-center"
                    title="Add to playlist"
                  >
                    <Plus size={14} className="mx-auto" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

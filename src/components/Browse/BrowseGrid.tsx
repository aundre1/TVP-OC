/**
 * Browse Grid Component
 * Grid/card view with responsive columns
 * Shows album art, artist, title with hover interactions
 */

import React from 'react';
import { Play, Download, Heart, Plus, AlertCircle, ChevronDown } from 'lucide-react';
import { BrowseGridProps } from '@/types/browse';
import { useVideoBrowse } from '@/hooks/useVideoBrowse';
import { useBrowseStore } from '@/stores/browseStore';

export const BrowseGrid: React.FC<BrowseGridProps> = ({
  columns = 4,
  onCardClick,
  onCardAction,
}) => {
  // Use shared hook for data fetching
  const { videos, isLoading, isError, error, refetch } = useVideoBrowse();
  const { hasMore, setPage, page } = useBrowseStore();

  // Pagination: limit rendered items for performance (max 200 before needing load more)
  const MAX_VISIBLE = Math.min(200, videos.length);
  const visibleVideos = videos.slice(0, MAX_VISIBLE);
  const showLoadMore = visibleVideos.length > 0 && hasMore && visibleVideos.length >= MAX_VISIBLE;
  const colsClass = {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
  }[columns] || 'grid-cols-4';

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
    <div className="p-6 space-y-6">
      <div className={`grid ${colsClass} gap-6 auto-rows-max`}>
        {visibleVideos.map((video) => (
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

      {/* Load More Button */}
      {showLoadMore && (
        <div className="flex justify-center pt-4">
          <button
            onClick={() => setPage(page + 1)}
            disabled={isLoading}
            className="flex items-center gap-2 px-6 py-3 bg-cyan-500 hover:bg-cyan-600 disabled:bg-gray-600 text-white rounded-lg transition-colors font-medium"
          >
            <span>Load More Videos</span>
            <ChevronDown size={18} className={isLoading ? 'animate-spin' : ''} />
          </button>
        </div>
      )}

      {/* Pagination Info */}
      {videos.length > 0 && (
        <div className="text-center text-xs text-gray-400 pt-2">
          Showing {visibleVideos.length} of {videos.length} videos
        </div>
      )}
    </div>
  );
};

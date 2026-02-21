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
    <div className="p-4 space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-3 auto-rows-max">
        {visibleVideos.map((video) => (
          <div
            key={video.id}
            onClick={() => onCardClick(video)}
            className="group cursor-pointer"
          >
            {/* Card Container - Target: ~180x240px max */}
            <div className="relative rounded-lg overflow-hidden bg-tvp-bg-secondary border border-tvp-border-subtle hover:border-tvp-border-default hover:shadow-card transition-all duration-200" style={{ maxWidth: '180px' }}>
              {/* Image Container */}
              <div className="relative aspect-video overflow-hidden bg-tvp-bg-tertiary">
                <img
                  src={video.coverArt}
                  alt={video.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />

                {/* Overlay on Hover */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onCardAction?.('preview', video);
                    }}
                    className="p-2 bg-tvp-accent-cyan hover:bg-tvp-accent-cyan-hover rounded-full text-tvp-bg-primary transition-colors"
                    title="Preview"
                  >
                    <Play size={16} fill="currentColor" />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onCardAction?.('download', video);
                    }}
                    className="p-2 bg-tvp-bg-elevated hover:bg-tvp-bg-tertiary rounded-full text-tvp-text-secondary transition-colors"
                    title="Download"
                  >
                    <Download size={16} />
                  </button>
                </div>
              </div>

              {/* Info Section */}
              <div className="p-2 space-y-1">
                {/* Title - 1 line truncate */}
                <h3 className="text-xs font-medium text-tvp-text-primary truncate group-hover:text-tvp-accent-cyan transition-colors">
                  {video.title}
                </h3>

                {/* Artist - 1 line muted */}
                <p className="text-[10px] text-tvp-text-muted truncate">{video.artist}</p>

                {/* Genre + BPM - smallest text */}
                <div className="flex items-center gap-1.5 text-[10px] text-tvp-text-muted">
                  <span>{video.genre}</span>
                  {video.metadata?.bpm && (
                    <>
                      <span className="text-tvp-border-default">&middot;</span>
                      <span>{video.metadata.bpm} BPM</span>
                    </>
                  )}
                </div>

                {/* Action Row */}
                <div className="flex items-center justify-between pt-1 border-t border-tvp-border-subtle">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onCardAction?.('download', video);
                      }}
                      className="p-1 hover:text-tvp-accent-cyan rounded transition-colors text-tvp-text-muted"
                      title="Download"
                    >
                      <Download size={12} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onCardAction?.('favorite', video);
                      }}
                      className={`p-1 rounded transition-colors ${
                        video.isFavorited
                          ? 'text-pink-500'
                          : 'hover:text-pink-500 text-tvp-text-muted'
                      }`}
                      title="Favorite"
                    >
                      <Heart
                        size={12}
                        fill={video.isFavorited ? 'currentColor' : 'none'}
                      />
                    </button>
                  </div>
                  {video.quality && (
                    <span className="text-[9px] font-bold text-tvp-accent-cyan">
                      {video.quality}
                    </span>
                  )}
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

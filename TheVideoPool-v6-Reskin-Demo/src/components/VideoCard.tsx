// ============================================
// THE VIDEO POOL - VIDEO CARD COMPONENT
// ============================================

import { useState } from 'react';
import { Play, Download, Heart, MoreHorizontal, Clock, Music, Lock } from 'lucide-react';
import { useUIStore } from '@/stores/uiStore';
import { useDownloadWithLimitCheck } from '@/hooks/useDownloads';
import { useAddToFavorites, useRemoveFromFavorites } from '@/hooks/useLibrary';
import type { Video } from '@/types';

interface VideoCardProps {
  video: Video;
  showStats?: boolean;
  size?: 'sm' | 'md' | 'lg';
  isFavorite?: boolean;
}

export default function VideoCard({ video, showStats = true, size = 'md', isFavorite = false }: VideoCardProps) {
  const { openPreview } = useUIStore();
  const { checkAndDownload, isAtLimit, isDownloading, openDownloadLimitModal } = useDownloadWithLimitCheck();
  const addToFavorites = useAddToFavorites();
  const removeFromFavorites = useRemoveFromFavorites();

  const [isHovered, setIsHovered] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const sizeClasses = {
    sm: 'w-40',
    md: 'w-48',
    lg: 'w-56',
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isAtLimit) {
      openDownloadLimitModal();
      return;
    }
    checkAndDownload({ video, versionType: 'hd' });
  };

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isFavorite) {
      removeFromFavorites.mutate(video.id);
    } else {
      addToFavorites.mutate(video.id);
    }
  };

  return (
    <div
      className={`${sizeClasses[size]} flex-shrink-0 group cursor-pointer`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => { setIsHovered(false); setShowMenu(false); }}
      onClick={() => openPreview(video)}
    >
      {/* Thumbnail */}
      <div className="relative aspect-video rounded-lg overflow-hidden bg-tvp-bg-tertiary">
        <img
          src={video.thumbnailUrl || '/placeholder-video.jpg'}
          alt={video.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />

        {/* Hover Overlay */}
        <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-opacity duration-200 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
          {/* Play Button */}
          <button className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 bg-tvp-accent-cyan rounded-full flex items-center justify-center transform scale-90 group-hover:scale-100 transition-transform">
              <Play className="w-5 h-5 text-tvp-bg-primary ml-0.5" fill="currentColor" />
            </div>
          </button>

          {/* Action Buttons */}
          <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
            <div className="flex gap-1">
              <button
                onClick={handleDownload}
                disabled={isDownloading}
                className={`p-1.5 bg-black/50 rounded-md transition-colors ${
                  isAtLimit
                    ? 'hover:bg-tvp-status-error/50 text-tvp-status-error'
                    : 'hover:bg-tvp-accent-cyan hover:text-tvp-bg-primary'
                } ${isDownloading ? 'opacity-50' : ''}`}
                title={isAtLimit ? 'Download limit reached' : 'Download'}
              >
                {isAtLimit ? <Lock className="w-4 h-4" /> : <Download className="w-4 h-4" />}
              </button>
              <button
                onClick={handleFavorite}
                className={`p-1.5 bg-black/50 hover:bg-tvp-accent-coral hover:text-white rounded-md transition-colors ${isFavorite ? 'text-tvp-accent-coral' : ''}`}
                title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              >
                <Heart className="w-4 h-4" fill={isFavorite ? 'currentColor' : 'none'} />
              </button>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
              className="p-1.5 bg-black/50 hover:bg-white/20 rounded-md transition-colors"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Badges */}
        <div className="absolute top-2 left-2 flex gap-1.5">
          {video.isNew && (
            <span className="px-1.5 py-0.5 bg-tvp-accent-cyan text-tvp-bg-primary text-[10px] font-bold rounded">NEW</span>
          )}
          {video.isExclusive && (
            <span className="px-1.5 py-0.5 bg-tvp-accent-gold text-tvp-bg-primary text-[10px] font-bold rounded">EXCLUSIVE</span>
          )}
          {video.isTrending && (
            <span className="px-1.5 py-0.5 bg-tvp-accent-coral text-white text-[10px] font-bold rounded">HOT</span>
          )}
        </div>

        {/* Duration */}
        <div className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-black/70 rounded text-[10px] font-medium text-white opacity-0 group-hover:opacity-0 transition-opacity">
          {formatDuration(video.duration)}
        </div>

        {/* Quality Badge */}
        <div className="absolute top-2 right-2 px-1.5 py-0.5 bg-black/70 rounded text-[10px] font-medium text-white">
          {video.quality}
        </div>
      </div>

      {/* Info */}
      <div className="mt-2.5 px-0.5">
        <h3 className="text-sm font-medium text-tvp-text-primary truncate group-hover:text-tvp-accent-cyan transition-colors">
          {video.title}
        </h3>
        <p className="text-xs text-tvp-text-secondary truncate mt-0.5">
          {video.artist}
        </p>

        {showStats && (
          <div className="flex items-center gap-3 mt-1.5 text-[11px] text-tvp-text-muted">
            {video.bpm && (
              <span className="flex items-center gap-1">
                <Music className="w-3 h-3" />
                {video.bpm} BPM
              </span>
            )}
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatDuration(video.duration)}
            </span>
            <span className="flex items-center gap-1">
              <Download className="w-3 h-3" />
              {video.downloadCount.toLocaleString()}
            </span>
          </div>
        )}
      </div>

      {/* Context Menu */}
      {showMenu && (
        <div
          className="absolute z-50 mt-1 w-48 py-2 bg-tvp-bg-elevated border border-tvp-border-default rounded-xl shadow-elevated animate-fade-in"
          onClick={(e) => e.stopPropagation()}
        >
          <button className="w-full px-4 py-2 text-left text-sm text-tvp-text-secondary hover:text-tvp-text-primary hover:bg-tvp-bg-tertiary">
            Add to Crate
          </button>
          <button className="w-full px-4 py-2 text-left text-sm text-tvp-text-secondary hover:text-tvp-text-primary hover:bg-tvp-bg-tertiary">
            View Details
          </button>
          <button className="w-full px-4 py-2 text-left text-sm text-tvp-text-secondary hover:text-tvp-text-primary hover:bg-tvp-bg-tertiary">
            Share
          </button>
        </div>
      )}
    </div>
  );
}

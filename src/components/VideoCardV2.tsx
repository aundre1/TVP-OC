// ============================================
// THE VIDEO POOL - VIDEO CARD v6.0 (Reskinned)
// shadcn/ui patterns + CSS variables
// ============================================

import { useState, useRef, useEffect } from 'react';
import { Play, Plus, Download, Check, Lock, Heart, MoreHorizontal, Share2, FolderPlus, Eye, Flag, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Track, VideoQuality } from '@/types';
import { useAppStore } from '@/stores/appStore';
import { useDownloadWithLimitCheck } from '@/hooks';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Format download count (1.2K, 15K, etc.)
function formatDownloads(count: number): string {
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
  return count.toString();
}

interface VideoCardProps {
  track: Track;
  showCheckbox?: boolean;
}

// Quality badge component with Replit-style colors
function QualityBadge({ quality }: { quality: VideoQuality }) {
  const qualityStyles: Record<VideoQuality, { bg: string; text: string }> = {
    '4K': { bg: 'bg-yellow-400', text: 'text-black' },
    '1080p': { bg: 'bg-cyan-400', text: 'text-black' },
    '720p': { bg: 'bg-white/80', text: 'text-black' },
    '480p': { bg: 'bg-black/60', text: 'text-white' },
    '320p': { bg: 'bg-black/60', text: 'text-white' },
  };

  const style = qualityStyles[quality] || qualityStyles['480p'];

  return (
    <span
      className={cn(
        'absolute bottom-2 left-2 px-1.5 py-0.5 rounded text-[9px] font-bold',
        style.bg,
        style.text
      )}
    >
      {quality}
    </span>
  );
}

export default function VideoCard({ track, showCheckbox = true }: VideoCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isFavorite, setIsFavorite] = useState(track.isFavorite ?? false);

  const {
    selectedTrackIds,
    toggleTrackSelection,
    openPreviewModal,
    addToSet,
    showToast,
    openDownloadQualityModal,
  } = useAppStore();

  const {
    canDownload,
    isAtLimit,
    isNearLimit,
    isDownloading,
    openDownloadLimitModal,
  } = useDownloadWithLimitCheck();

  const isSelected = selectedTrackIds.has(track.id);

  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleTrackSelection(track.id);
  };

  const handleAddToSet = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToSet(track);
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();

    // Check if at download limit
    if (isAtLimit || !canDownload) {
      openDownloadLimitModal();
      return;
    }

    // Open quality selection modal
    openDownloadQualityModal(track.id);
  };

  const handleCardClick = () => {
    openPreviewModal(track.id);
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFavorite(!isFavorite);
    showToast('success', isFavorite ? 'Removed from favorites' : 'Added to favorites');
  };

  const handleAddToCrate = () => {
    showToast('info', 'Add to Crate - Coming soon');
  };

  const handleShare = () => {
    showToast('info', 'Share link copied!');
  };

  const handleViewDetails = () => {
    openPreviewModal(track.id);
  };

  const handleMoreLikeThis = () => {
    showToast('info', `Finding tracks similar to "${track.title}"...`);
  };

  return (
    <div
      onClick={handleCardClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        'group relative rounded-xl overflow-hidden cursor-pointer',
        'hover:-translate-y-1 hover:shadow-[0_4px_20px_rgba(0,0,0,0.4)]',
        'transition-all duration-300',
        isSelected && 'ring-2 ring-cyan-400'
      )}
      style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-subtle)',
      }}
    >
      {/* Selection Checkbox */}
      {showCheckbox && (
        <button
          onClick={handleCheckboxClick}
          className={cn(
            'absolute top-2 right-2 z-10 w-6 h-6 rounded-md',
            'flex items-center justify-center',
            'transition-all opacity-0 group-hover:opacity-100',
            isSelected && 'opacity-100 bg-cyan-400 text-black'
          )}
          style={{
            background: isSelected ? undefined : 'rgba(0,0,0,0.6)',
            border: '2px solid white',
          }}
        >
          {isSelected && <Check size={14} />}
        </button>
      )}

      {/* Thumbnail */}
      <div
        className="relative aspect-video overflow-hidden"
        style={{ background: 'var(--bg-tertiary)' }}
      >
        <img
          src={track.thumbnailUrl || `https://picsum.photos/320/180?random=${track.id}`}
          alt={track.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Overlay with Play Button */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <button className="w-10 h-10 bg-cyan-400 rounded-full flex items-center justify-center text-black transform scale-90 group-hover:scale-100 transition-transform shadow-[0_0_20px_rgba(0,212,255,0.5)]">
            <Play size={20} fill="black" className="ml-1" />
          </button>
        </div>

        {/* Badges - NEW, HOT, EXCLUSIVE */}
        <div className="absolute top-2 left-2 flex gap-1">
          {track.isExclusive && (
            <span className="bg-gradient-to-r from-yellow-500 to-amber-400 text-black text-[9px] font-bold px-1.5 py-0.5 rounded shadow-lg">
              EXCLUSIVE
            </span>
          )}
          {track.isNew && (
            <span className="bg-orange-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-lg">
              NEW
            </span>
          )}
          {track.isHot && (
            <span className="bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-lg">
              HOT
            </span>
          )}
        </div>

        {/* Favorite Heart Button */}
        <button
          onClick={handleFavoriteClick}
          className={cn(
            'absolute top-2 right-10 p-1 rounded transition-colors',
            'opacity-0 group-hover:opacity-100',
            isFavorite ? 'text-pink-500 opacity-100' : 'hover:text-pink-400'
          )}
          style={!isFavorite ? { color: 'var(--text-muted)' } : undefined}
          title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Heart size={14} fill={isFavorite ? 'currentColor' : 'none'} />
        </button>

        {/* Quality Badge */}
        <QualityBadge quality={track.quality} />

        {/* Duration */}
        <span className="absolute bottom-2 right-2 bg-black/80 text-white text-[9px] font-mono px-1.5 py-0.5 rounded">
          {track.duration}
        </span>
      </div>

      {/* Content */}
      <div className="p-3">
        {/* Title and Artist */}
        <div className="mb-1">
          <h3
            className="font-semibold text-xs line-clamp-2 leading-snug group-hover:text-cyan-400 transition-colors"
            title={track.title}
          >
            {track.title}
          </h3>
          <p
            className="text-[11px] line-clamp-1 leading-snug"
            style={{ color: 'var(--text-muted)' }}
            title={track.artist}
          >
            {track.artist}
          </p>
        </div>

        {/* Label */}
        {track.label && (
          <div
            className="flex items-center gap-1.5 mb-2 text-[10px] truncate"
            style={{ color: 'var(--text-muted)' }}
          >
            {track.label}
          </div>
        )}

        {/* BPM and Key */}
        <div
          className="flex items-center gap-2 text-[10px] font-mono mb-2"
          style={{ color: 'var(--text-muted)' }}
        >
          <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
            {track.bpm} BPM
          </span>
          <span
            className="w-0.5 h-3"
            style={{ background: 'var(--border-subtle)' }}
          />
          <span className="text-cyan-400">{track.key}</span>
          {track.downloads !== undefined && track.downloads > 0 && (
            <>
              <span
                className="w-0.5 h-3"
                style={{ background: 'var(--border-subtle)' }}
              />
              <span className="flex items-center gap-0.5">
                <Download className="w-3 h-3" />
                {formatDownloads(track.downloads)}
              </span>
            </>
          )}
        </div>

        {/* Actions Row */}
        <div
          className="flex items-center justify-between pt-2"
          style={{ borderTop: '1px solid var(--border-subtle)' }}
        >
          <button
            onClick={handleAddToSet}
            className="text-[10px] font-medium px-2 py-1 rounded transition-colors hover:text-cyan-400"
            style={{ color: 'var(--text-muted)' }}
          >
            <Plus className="w-3 h-3 inline mr-1" />
            Add to Set
          </button>

          <div className="flex items-center gap-1">
            {/* Download Button */}
            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className={cn(
                'p-1 rounded transition-colors',
                isAtLimit
                  ? 'text-red-400'
                  : isDownloading
                  ? 'opacity-50'
                  : 'hover:text-cyan-400'
              )}
              style={{ color: isAtLimit ? undefined : 'var(--text-muted)' }}
              title={isAtLimit ? 'Download limit reached' : 'Download'}
            >
              {isDownloading ? (
                <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
              ) : isAtLimit ? (
                <Lock size={14} />
              ) : (
                <Download size={14} />
              )}
            </button>

            {/* Context Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  onClick={(e) => e.stopPropagation()}
                  className="p-1 rounded transition-colors hover:text-cyan-400"
                  style={{ color: 'var(--text-muted)' }}
                >
                  <MoreHorizontal size={14} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-44"
                style={{
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-default)',
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <DropdownMenuItem
                  onClick={handleAddToCrate}
                  className="gap-2 cursor-pointer"
                >
                  <FolderPlus size={14} />
                  Add to Crate
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleShare}
                  className="gap-2 cursor-pointer"
                >
                  <Share2 size={14} />
                  Share
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleViewDetails}
                  className="gap-2 cursor-pointer"
                >
                  <Eye size={14} />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleMoreLikeThis}
                  className="gap-2 cursor-pointer text-cyan-400"
                >
                  <Sparkles size={14} />
                  More Like This
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    showToast('info', 'Report submitted');
                  }}
                  className="gap-2 cursor-pointer text-red-400"
                >
                  <Flag size={14} />
                  Report Issue
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// THE VIDEO POOL - VIDEO LIST VIEW v6.0 (Reskinned)
// Spotify/iTunes style list with CSS variables
// Auto-switches to virtualized rendering for large lists
// ============================================

import { useState } from 'react';
import { Play, Plus, Download, Check, MoreHorizontal, Search, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Track, VideoQuality } from '@/types';
import { useAppStore } from '@/stores/appStore';
import VirtualizedVideoList from './VirtualizedVideoList';

// Format download count
function formatDownloads(count: number): string {
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
  return count.toString();
}

interface VideoListProps {
  tracks: Track[];
  showHeader?: boolean;
  height?: number;
  virtualize?: boolean; // Force virtualization regardless of count
}

// Threshold for auto-virtualization (performance critical above this)
const VIRTUALIZATION_THRESHOLD = 100;

// Quality badge for list view
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
        'px-1.5 py-0.5 rounded text-[9px] font-bold text-center',
        style.bg,
        style.text
      )}
    >
      {quality}
    </span>
  );
}

// Responsive grid columns - hide less important columns on smaller screens
// Mobile: #, Preview+Artist, Title, Actions
// Tablet: + Label, BPM, Key, Quality
// Desktop: + Duration
// v5.5 Grid columns - Preview+Artist combined, Label after Title
const GRID_COLUMNS = {
  mobile: '32px 80px 1fr 80px',
  tablet: '36px 90px 2fr 90px 60px 50px 70px 80px', // Preview+Artist, Title, Label, BPM, Key, Quality, Actions
  desktop: '40px 100px 2fr 100px 70px 60px 70px 80px 120px', // + Duration
};

// Single list row
function VideoListItem({ track, index }: { track: Track; index: number }) {
  const [isHovered, setIsHovered] = useState(false);
  const [isFavorite, setIsFavorite] = useState(track.isFavorite ?? false);

  const {
    selectedTrackIds,
    toggleTrackSelection,
    openPreviewModal,
    addToSet,
    showToast,
  } = useAppStore();

  const isSelected = selectedTrackIds.has(track.id);

  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleTrackSelection(track.id);
  };

  const handlePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    openPreviewModal(track.id);
  };

  const handleAddToSet = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToSet(track);
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    showToast('info', `Downloading "${track.title}"...`);
  };

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFavorite(!isFavorite);
    showToast('success', isFavorite ? 'Removed from favorites' : 'Added to favorites');
  };

  const rowBg = index % 2 === 0 ? 'var(--bg-secondary)' : 'var(--bg-tertiary)';

  return (
    <div
      onClick={() => openPreviewModal(track.id)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        'group grid items-center gap-2 md:gap-4 px-2 md:px-4 py-2 cursor-pointer text-xs transition-colors',
        'grid-cols-[30px_50px_80px_1.5fr_1.5fr_1fr_100px_80px_100px]',
        isSelected && 'bg-cyan-400/10'
      )}
      style={{
        background: isSelected ? 'rgba(0,212,255,0.1)' : rowBg,
        borderBottom: '1px solid var(--border-subtle)',
      }}
    >
      {/* Checkbox / Number */}
      <div className="flex items-center justify-center">
        {isHovered || isSelected ? (
          <button
            onClick={handleCheckboxClick}
            className={cn(
              'w-5 h-5 rounded border-2 flex items-center justify-center transition-colors',
              isSelected
                ? 'bg-cyan-400 border-cyan-400'
                : 'border-white/50 hover:border-cyan-400'
            )}
            aria-label={isSelected ? 'Deselect track' : 'Select track'}
          >
            {isSelected && <Check className="w-3 h-3 text-black" />}
          </button>
        ) : (
          <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
            {index + 1}
          </span>
        )}
      </div>

      {/* Thumbnail */}
      <div className="relative flex-shrink-0">
        <img
          src={track.thumbnailUrl || `https://picsum.photos/60/34?random=${track.id}`}
          alt=""
          className="w-[50px] h-[28px] rounded object-cover"
        />
        {isHovered && (
          <button
            onClick={handlePlay}
            className="absolute inset-0 flex items-center justify-center bg-black/60 rounded"
            aria-label={`Play ${track.title}`}
          >
            <Play className="w-4 h-4 text-white" fill="white" />
          </button>
        )}
      </div>

      {/* Artist */}
      <span className="truncate" style={{ color: 'var(--text-muted)' }}>
        {track.artist}
      </span>

      {/* Title + Badges */}
      <div className="min-w-0 flex items-center gap-2">
        <span
          className="font-medium truncate group-hover:text-cyan-400 transition-colors"
          style={{ color: 'var(--text-primary)' }}
        >
          {track.title}
        </span>
        <div className="flex gap-1 flex-shrink-0">
          {track.isNew && (
            <span className="bg-orange-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
              NEW
            </span>
          )}
          {track.isHot && (
            <span className="bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
              HOT
            </span>
          )}
        </div>
      </div>

      {/* Label */}
      <div className="truncate" style={{ color: 'var(--text-muted)' }}>
        {track.label || '—'}
      </div>

      {/* BPM */}
      <div className="font-mono text-center" style={{ color: 'var(--text-primary)' }}>
        {track.bpm}
      </div>

      {/* Key */}
      <div className="font-mono text-center text-cyan-400">
        {track.key}
      </div>

      {/* Quality */}
      <div className="flex justify-center">
        <QualityBadge quality={track.quality} />
      </div>

      {/* Duration */}
      <div className="font-mono text-center" style={{ color: 'var(--text-muted)' }}>
        {track.duration}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-1">
        <button
          onClick={handleDownload}
          className="p-1 rounded transition-colors hover:text-cyan-400"
          style={{ color: 'var(--text-muted)' }}
          title="Download"
        >
          <Download size={14} />
        </button>
        <button
          onClick={handleFavorite}
          className={cn(
            'p-1 rounded transition-colors',
            isFavorite ? 'text-pink-500' : 'hover:text-pink-400'
          )}
          style={!isFavorite ? { color: 'var(--text-muted)' } : undefined}
          title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Heart size={14} fill={isFavorite ? 'currentColor' : 'none'} />
        </button>
        <button
          onClick={handleAddToSet}
          className="p-1 rounded transition-colors hover:text-cyan-400"
          style={{ color: 'var(--text-muted)' }}
          title="Add to Set"
        >
          <Plus size={14} />
        </button>
      </div>
    </div>
  );
}

// Main list component - auto-virtualizes for large lists
export default function VideoList({
  tracks,
  showHeader = true,
  height,
  virtualize,
}: VideoListProps) {
  // Use virtualization for large lists or when forced
  const shouldVirtualize = virtualize || tracks.length > VIRTUALIZATION_THRESHOLD;

  if (shouldVirtualize) {
    return (
      <VirtualizedVideoList
        tracks={tracks}
        showHeader={showHeader}
        height={height}
      />
    );
  }

  // Empty state
  if (tracks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
          style={{ background: 'var(--bg-tertiary)' }}
        >
          <Search className="w-8 h-8" style={{ color: 'var(--text-muted)' }} />
        </div>
        <h3 className="text-lg font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
          No videos found
        </h3>
        <p className="max-w-md" style={{ color: 'var(--text-secondary)' }}>
          Try adjusting your filters or search terms
        </p>
      </div>
    );
  }

  // Standard rendering for small lists
  return (
    <div className="w-full overflow-x-auto">
      {/* Header Row */}
      {showHeader && (
        <div
          className="grid items-center gap-4 px-4 py-2 text-[10px] font-semibold uppercase tracking-wider"
          style={{
            color: 'var(--text-muted)',
            borderBottom: '1px solid var(--border-subtle)',
            gridTemplateColumns: '30px 50px 80px 1.5fr 1.5fr 1fr 100px 80px 100px',
          }}
        >
          <div className="text-center">#</div>
          <div></div>
          <div>Artist</div>
          <div>Title</div>
          <div>Label</div>
          <div className="text-center">BPM</div>
          <div className="text-center">Key</div>
          <div className="text-center">Quality</div>
          <div className="text-center">Duration</div>
        </div>
      )}

      {/* Track Rows */}
      <div>
        {tracks.map((track, index) => (
          <VideoListItem key={track.id} track={track} index={index} />
        ))}
      </div>
    </div>
  );
}

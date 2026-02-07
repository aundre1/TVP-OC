// ============================================
// THE VIDEO POOL - VIRTUALIZED VIDEO LIST v5.5
// Uses react-window v2 List for 30,000+ video performance
// Critical for mobile browsers and large catalogs
// ============================================

import { CSSProperties, useState } from 'react';
import { List, RowComponentProps } from 'react-window';
import { AutoSizer } from 'react-virtualized-auto-sizer';
import { Play, Plus, Download, Check, MoreHorizontal, Heart } from 'lucide-react';
import { clsx } from 'clsx';
import { Track, VideoQuality } from '@/types';
import { useAppStore } from '@/stores/appStore';

interface VirtualizedVideoListProps {
  tracks: Track[];
  showHeader?: boolean;
  height?: number;
}

// Row height for each track
const ROW_HEIGHT = 56;

// Quality badge for list view
function QualityBadge({ quality }: { quality: VideoQuality }) {
  const qualityClasses: Record<VideoQuality, string> = {
    '4K': 'quality-4k',
    '1080p': 'quality-1080p',
    '720p': 'quality-720p',
    '480p': 'quality-480p',
    '320p': 'quality-320p',
  };

  return (
    <span
      className={clsx(
        'px-1.5 py-0.5 rounded text-[10px] font-bold text-center',
        qualityClasses[quality]
      )}
    >
      {quality}
    </span>
  );
}

// Custom props passed to each row via rowProps
interface VideoRowProps {
  tracks: Track[];
  selectedTrackIds: Set<number>;
  toggleTrackSelection: (id: number) => void;
  openPreviewModal: (id: number) => void;
  addToSet: (track: Track) => void;
  showToast: (type: 'success' | 'error' | 'info' | 'warning', message: string) => void;
}

// Single virtualized row component for react-window v2
function VideoRow({
  index,
  style,
  tracks,
  selectedTrackIds,
  toggleTrackSelection,
  openPreviewModal,
  addToSet,
  showToast,
}: RowComponentProps<VideoRowProps>) {
  const track = tracks[index];

  if (!track) return null;

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

  return (
    <div
      onClick={() => openPreviewModal(track.id)}
      className={clsx(
        'cursor-pointer transition-colors duration-fast',
        'hover:bg-tvp-bg-tertiary',
        index % 2 === 0 ? 'bg-tvp-bg-primary' : 'bg-tvp-bg-secondary/50',
        isSelected && 'bg-tvp-accent-cyan-subtle'
      )}
      style={{
        ...style,
        display: 'grid',
        // v5.5: Preview+Artist combined, Label after Title
        gridTemplateColumns: '40px 160px 2fr 100px 70px 60px 70px 80px 120px',
        alignItems: 'center',
        gap: '12px',
        paddingLeft: '16px',
        paddingRight: '16px',
      }}
    >
      {/* Checkbox / Number */}
      <div className="flex items-center justify-center">
        <button
          onClick={handleCheckboxClick}
          className={clsx(
            'w-5 h-5 rounded border-2 flex items-center justify-center',
            'transition-colors',
            isSelected
              ? 'bg-tvp-accent-cyan border-tvp-accent-cyan'
              : 'border-tvp-border-default hover:border-tvp-accent-cyan'
          )}
        >
          {isSelected ? (
            <Check className="w-3 h-3 text-black" />
          ) : (
            <span className="text-xs text-tvp-text-muted font-mono">{index + 1}</span>
          )}
        </button>
      </div>

      {/* Preview + Artist Combined */}
      <div className="flex items-center gap-2 min-w-0">
        <div className="relative group flex-shrink-0">
          <img
            src={track.thumbnailUrl || `https://picsum.photos/60/34?random=${track.id}`}
            alt=""
            className="w-[60px] h-[34px] rounded object-cover"
            loading="lazy"
          />
          <button
            onClick={handlePlay}
            className="absolute inset-0 flex items-center justify-center bg-black/60 rounded opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Play className="w-4 h-4 text-white" fill="white" />
          </button>
        </div>
        <span className="text-sm text-tvp-text-secondary truncate">
          {track.artist}
        </span>
      </div>

      {/* Title + Badges (includes EXCLUSIVE) */}
      <div className="min-w-0 flex items-center gap-2">
        <span className="text-sm font-medium text-tvp-text-primary truncate">
          {track.title}
        </span>
        {track.isExclusive && (
          <span className="px-1.5 py-0.5 text-[9px] font-bold bg-gradient-to-r from-yellow-500 to-amber-400 text-black rounded flex-shrink-0">
            EXCLUSIVE
          </span>
        )}
        {track.isNew && (
          <span className="px-1.5 py-0.5 text-[9px] font-bold bg-tvp-accent-coral text-white rounded flex-shrink-0">
            NEW
          </span>
        )}
        {track.isHot && (
          <span className="px-1.5 py-0.5 text-[9px] font-bold bg-gradient-to-r from-tvp-accent-coral to-tvp-status-warning text-white rounded flex-shrink-0">
            HOT
          </span>
        )}
      </div>

      {/* Label - v5.5: Right after Title */}
      <div className="text-xs text-tvp-text-muted truncate">
        {track.label || '—'}
      </div>

      {/* BPM */}
      <div className="text-sm font-mono text-tvp-text-muted text-center">
        {track.bpm}
      </div>

      {/* Key */}
      <div className="text-sm font-mono text-tvp-accent-cyan text-center">
        {track.key}
      </div>

      {/* Duration */}
      <div className="text-sm font-mono text-tvp-text-muted text-center">
        {track.duration}
      </div>

      {/* Quality */}
      <div className="flex justify-center">
        <QualityBadge quality={track.quality} />
      </div>

      {/* Actions - with Heart/Favorite */}
      <div className="flex items-center justify-end gap-1">
        <button
          onClick={(e) => {
            e.stopPropagation();
            showToast('success', track.isFavorite ? 'Removed from favorites' : 'Added to favorites');
          }}
          className={clsx(
            'p-1.5 rounded-md transition-colors',
            track.isFavorite
              ? 'text-tvp-accent-coral'
              : 'text-tvp-text-muted hover:text-tvp-accent-coral hover:bg-tvp-bg-elevated'
          )}
          title={track.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Heart className="w-4 h-4" fill={track.isFavorite ? 'currentColor' : 'none'} />
        </button>
        <button
          onClick={handleAddToSet}
          className="p-1.5 rounded-md text-tvp-text-muted hover:text-tvp-accent-cyan hover:bg-tvp-bg-elevated transition-colors"
          title="Add to Set"
        >
          <Plus className="w-4 h-4" />
        </button>
        <button
          onClick={handleDownload}
          className="p-1.5 rounded-md text-tvp-text-muted hover:text-tvp-accent-cyan hover:bg-tvp-bg-elevated transition-colors"
          title="Download"
        >
          <Download className="w-4 h-4" />
        </button>
        <button
          onClick={(e) => e.stopPropagation()}
          className="p-1.5 rounded-md text-tvp-text-muted hover:text-tvp-text-primary hover:bg-tvp-bg-elevated transition-colors"
          title="More options"
        >
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// Header row (non-virtualized, sticky)
// v5.5 Header - Preview+Artist combined, Label after Title
function ListHeader() {
  return (
    <div
      className="grid items-center gap-3 px-4 py-3 border-b border-tvp-border-subtle text-xs font-semibold text-tvp-text-muted uppercase tracking-wider bg-tvp-bg-secondary sticky top-0 z-10"
      style={{
        gridTemplateColumns: '40px 160px 2fr 100px 70px 60px 70px 80px 120px',
      }}
    >
      <div className="text-center">#</div>
      <div>Preview / Artist</div>
      <div>Title</div>
      <div>Label</div>
      <div className="text-center">BPM</div>
      <div className="text-center">Key</div>
      <div className="text-center">Duration</div>
      <div className="text-center">Quality</div>
      <div className="text-right">Actions</div>
    </div>
  );
}

// Inner list component that receives dimensions from AutoSizer
function InnerList({
  height,
  width,
  tracks,
  rowProps,
}: {
  height: number | undefined;
  width: number | undefined;
  tracks: Track[];
  rowProps: VideoRowProps;
}) {
  if (!height || !width) return null;

  return (
    <List
      rowComponent={VideoRow}
      rowCount={tracks.length}
      rowHeight={ROW_HEIGHT}
      rowProps={rowProps}
      overscanCount={10}
      style={{ height, width }}
    />
  );
}

// Main virtualized list component using react-window v2 List
export default function VirtualizedVideoList({
  tracks,
  showHeader = true,
  height,
}: VirtualizedVideoListProps) {
  const {
    selectedTrackIds,
    toggleTrackSelection,
    openPreviewModal,
    addToSet,
    showToast,
  } = useAppStore();

  // Row props passed to each row component
  const rowProps: VideoRowProps = {
    tracks,
    selectedTrackIds,
    toggleTrackSelection,
    openPreviewModal,
    addToSet,
    showToast,
  };

  // If height is provided, use it; otherwise use AutoSizer
  if (height) {
    return (
      <div className="w-full flex flex-col">
        {showHeader && <ListHeader />}
        <List
          rowComponent={VideoRow}
          rowCount={tracks.length}
          rowHeight={ROW_HEIGHT}
          rowProps={rowProps}
          overscanCount={10}
          style={{ height, width: '100%' }}
        />
      </div>
    );
  }

  // Use AutoSizer for dynamic height with renderProp API
  return (
    <div className="w-full h-full flex flex-col min-h-[400px]">
      {showHeader && <ListHeader />}
      <div className="flex-1">
        <AutoSizer
          renderProp={({ height: autoHeight, width }) => (
            <InnerList
              height={autoHeight}
              width={width}
              tracks={tracks}
              rowProps={rowProps}
            />
          )}
        />
      </div>
    </div>
  );
}

// ============================================
// THE VIDEO POOL - RECENT DOWNLOADS SECTION v5.5
// Inline section (not the panel) showing recent downloads
// Respects viewMode: grid = cards, list = thin rows
// ============================================

import { Clock, ChevronRight, Play, Download, RotateCcw } from 'lucide-react';
import { clsx } from 'clsx';
import { recentDownloads } from '@/data/tracks';
import { useAppStore } from '@/stores/appStore';

// Grid card for a recent download
function RecentCard({ download, onPreview }: { download: typeof recentDownloads[0]; onPreview: (id: number) => void }) {
  return (
    <div
      onClick={() => onPreview(download.id)}
      className={clsx(
        'group relative rounded-xl overflow-hidden cursor-pointer flex-shrink-0',
        'hover:-translate-y-1 hover:shadow-[0_4px_20px_rgba(0,0,0,0.4)]',
        'transition-all duration-300',
        'w-[200px]'
      )}
      style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-subtle)',
      }}
    >
      {/* Thumbnail */}
      <div
        className="relative aspect-video overflow-hidden"
        style={{ background: 'var(--bg-tertiary)' }}
      >
        <img
          src={`https://picsum.photos/320/180?random=${download.id + 200}`}
          alt=""
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <button className="w-8 h-8 bg-cyan-400 rounded-full flex items-center justify-center text-black">
            <Play size={16} fill="black" className="ml-0.5" />
          </button>
        </div>
        <span className="absolute bottom-1.5 right-1.5 bg-black/80 text-white text-[9px] font-mono px-1.5 py-0.5 rounded">
          {download.date}
        </span>
      </div>

      {/* Content */}
      <div className="p-2.5">
        <h3
          className="font-semibold text-xs line-clamp-1 group-hover:text-cyan-400 transition-colors"
          style={{ color: 'var(--text-primary)' }}
        >
          {download.title}
        </h3>
        <p className="text-[11px] line-clamp-1" style={{ color: 'var(--text-muted)' }}>
          {download.artist}
        </p>
      </div>
    </div>
  );
}

// Thin row for a recent download (tile/list mode)
function RecentRow({ download, index, onPreview }: { download: typeof recentDownloads[0]; index: number; onPreview: (id: number) => void }) {
  const rowBg = index % 2 === 0 ? 'var(--bg-secondary)' : 'var(--bg-tertiary)';

  return (
    <div
      onClick={() => onPreview(download.id)}
      className="flex items-center gap-3 px-3 py-2 cursor-pointer transition-colors hover:bg-cyan-400/5"
      style={{
        background: rowBg,
        borderBottom: '1px solid var(--border-subtle)',
      }}
    >
      {/* Number */}
      <span className="w-6 text-center text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
        {index + 1}
      </span>

      {/* Thumbnail */}
      <div className="w-[50px] h-[28px] rounded overflow-hidden flex-shrink-0">
        <img
          src={`https://picsum.photos/96/54?random=${download.id + 200}`}
          alt=""
          className="w-full h-full object-cover"
        />
      </div>

      {/* Artist */}
      <span className="w-[120px] truncate text-xs" style={{ color: 'var(--text-muted)' }}>
        {download.artist}
      </span>

      {/* Title */}
      <span className="flex-1 truncate text-xs font-medium" style={{ color: 'var(--text-primary)' }}>
        {download.title}
      </span>

      {/* Date */}
      <span className="text-[11px] whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>
        {download.date}
      </span>

      {/* Re-download */}
      <button
        onClick={(e) => {
          e.stopPropagation();
        }}
        className="p-1 rounded transition-colors hover:text-cyan-400"
        style={{ color: 'var(--text-muted)' }}
        title="Re-download"
      >
        <RotateCcw className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

export default function RecentSection() {
  const { openPreviewModal, openRecentPanel, viewMode } = useAppStore();

  // Show only first 5 in the inline section
  const displayedDownloads = recentDownloads.slice(0, 5);

  return (
    <div className="mb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <Clock className="w-5 h-5 text-tvp-accent-purple" />
          <h3 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>Recent Downloads</h3>
          <span className="px-2.5 py-1 bg-tvp-accent-purple text-white text-xs font-semibold rounded-xl">
            {recentDownloads.length}
          </span>
        </div>
        <button
          onClick={openRecentPanel}
          className="flex items-center gap-1 text-sm text-tvp-text-secondary hover:text-tvp-accent-cyan transition-colors"
        >
          View All
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Content — switches based on viewMode */}
      {viewMode === 'grid' ? (
        /* Grid mode: horizontal scrolling cards */
        <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-2">
          {displayedDownloads.map((download) => (
            <RecentCard
              key={download.id}
              download={download}
              onPreview={openPreviewModal}
            />
          ))}
        </div>
      ) : (
        /* List/Tile mode: thin rows with alternating backgrounds */
        <div
          className="rounded-xl overflow-hidden"
          style={{ border: '1px solid var(--border-subtle)' }}
        >
          {displayedDownloads.map((download, index) => (
            <RecentRow
              key={download.id}
              download={download}
              index={index}
              onPreview={openPreviewModal}
            />
          ))}
        </div>
      )}

      {/* Expand Button */}
      <button
        onClick={openRecentPanel}
        className={clsx(
          'w-full mt-3 py-2 rounded-lg',
          'bg-transparent border border-dashed border-tvp-border-default',
          'text-tvp-text-muted text-sm',
          'hover:border-tvp-accent-cyan hover:text-tvp-accent-cyan transition-colors'
        )}
      >
        View full 30-day history
      </button>
    </div>
  );
}

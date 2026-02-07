// ============================================
// THE VIDEO POOL - RECENT DOWNLOADS SECTION v5.5
// Inline section (not the panel) showing recent downloads
// ============================================

import { Clock, ChevronRight, RotateCcw } from 'lucide-react';
import { clsx } from 'clsx';
import { recentDownloads } from '@/data/tracks';
import { useAppStore } from '@/stores/appStore';

export default function RecentSection() {
  const { openPreviewModal, openRecentPanel } = useAppStore();

  // Show only first 5 in the inline section
  const displayedDownloads = recentDownloads.slice(0, 5);

  return (
    <div className="recent-gradient border border-tvp-border-default rounded-2xl p-5 mb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <Clock className="w-5 h-5 text-tvp-accent-purple" />
          <h3 className="text-base font-bold">Recent Downloads</h3>
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

      {/* Recent Items */}
      <div className="space-y-2">
        {displayedDownloads.map((download, index) => (
          <div
            key={`${download.id}-${index}`}
            onClick={() => openPreviewModal(download.id)}
            className={clsx(
              'flex items-center gap-3 p-2.5 rounded-[10px]',
              'bg-tvp-bg-secondary border border-tvp-border-subtle',
              'cursor-pointer transition-all duration-fast',
              'hover:border-tvp-accent-cyan hover:bg-tvp-bg-tertiary'
            )}
          >
            {/* Thumbnail */}
            <div className="w-12 h-7 rounded overflow-hidden flex-shrink-0">
              <img
                src={`https://picsum.photos/96/54?random=${download.id + 200}`}
                alt=""
                className="w-full h-full object-cover"
              />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-semibold text-tvp-text-primary truncate">
                {download.title}
              </div>
              <div className="text-[11px] text-tvp-text-muted">
                {download.artist}
              </div>
            </div>

            {/* Date */}
            <div className="text-[11px] text-tvp-text-muted whitespace-nowrap">
              {download.date}
            </div>

            {/* Re-download button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                // Handle re-download
              }}
              className="p-1.5 rounded-md bg-tvp-accent-cyan text-black hover:bg-tvp-accent-cyan-hover transition-colors"
              title="Re-download"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

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

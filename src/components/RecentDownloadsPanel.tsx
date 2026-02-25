// ============================================
// THE VIDEO POOL - RECENT DOWNLOADS PANEL v5.5
// Left slide-out panel with 30-day download history
// ============================================

import { useEffect, useState } from 'react';
import { X, Clock, Download, AlertTriangle, RefreshCw, Loader2 } from 'lucide-react';
import { clsx } from 'clsx';
import { useAppStore } from '@/stores/appStore';
import { getDownloadHistory, DownloadRecord } from '@/api/downloadsApi';

export default function RecentDownloadsPanel() {
  const {
    isRecentPanelOpen,
    closeRecentPanel,
    openPreviewModal,
  } = useAppStore();

  const [downloads, setDownloads] = useState<DownloadRecord[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isRecentPanelOpen) return;
    let cancelled = false;
    setLoading(true);
    // TODO: Replace '1' with actual userId from auth store
    getDownloadHistory(1, 50)
      .then((data) => { if (!cancelled) setDownloads(data); })
      .catch((err) => console.error('Failed to fetch downloads:', err))
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [isRecentPanelOpen]);

  if (!isRecentPanelOpen) return null;

  const recentDownloads = downloads;

  return (
    <>
      {/* Backdrop */}
      <div
        className="backdrop backdrop--visible"
        onClick={closeRecentPanel}
      />

      {/* Panel */}
      <div
        className={clsx(
          'fixed top-[72px] left-0 bottom-0 w-[400px] max-w-full',
          'bg-tvp-bg-secondary border-r border-tvp-border-subtle',
          'z-400 flex flex-col',
          'transform transition-transform duration-slow',
          isRecentPanelOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-tvp-border-subtle">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Clock className="w-5 h-5 text-tvp-accent-purple" />
                Recent Downloads
              </h2>
              <p className="text-xs text-tvp-text-muted mt-1">Last 30 days</p>
            </div>
            <button
              onClick={closeRecentPanel}
              className="p-2 rounded-lg bg-tvp-bg-tertiary hover:bg-tvp-bg-elevated text-tvp-text-secondary transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Download List */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-tvp-accent-purple" />
            </div>
          ) : recentDownloads.length === 0 ? (
            <div className="py-12 text-center text-tvp-text-muted text-sm">
              No recent downloads
            </div>
          ) : null}
          <div className="space-y-1">
            {recentDownloads.map((download, index) => (
              <div
                key={`${download.id}-${index}`}
                onClick={() => openPreviewModal(download.id)}
                className={clsx(
                  'flex items-center gap-3 p-3 rounded-[10px]',
                  'border border-tvp-border-subtle cursor-pointer',
                  'transition-all duration-fast',
                  'hover:border-tvp-accent-cyan hover:bg-tvp-bg-elevated',
                  index % 2 === 0 ? 'bg-tvp-bg-tertiary' : 'bg-tvp-bg-secondary'
                )}
              >
                {/* Thumbnail */}
                <div className="w-14 h-8 rounded overflow-hidden flex-shrink-0">
                  <img
                    src={download.thumbnail_url || `https://picsum.photos/112/64?random=${download.id + 300}`}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-semibold text-tvp-text-primary truncate">
                    {download.title}
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-tvp-text-muted">
                    <span>{download.artist}</span>
                    <span>•</span>
                    <span className="font-mono">
                      {download.bpm} BPM · {download.key}
                    </span>
                  </div>
                </div>

                {/* Download Count Warning */}
                {download.downloadCount > 1 && (
                  <div
                    className={clsx(
                      'flex items-center gap-1 px-2 py-1',
                      'bg-tvp-status-warning text-black',
                      'text-[10px] font-bold rounded-full whitespace-nowrap'
                    )}
                    title="Downloaded multiple times"
                  >
                    <AlertTriangle className="w-3 h-3" />
                    <span>×{download.downloadCount}</span>
                  </div>
                )}

                {/* Date */}
                <div className="text-[11px] text-tvp-text-muted whitespace-nowrap">
                  {download.date}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-4 border-t border-tvp-border-subtle">
          <p className="text-xs text-tvp-text-muted text-center">
            Downloads within 30 days count toward your monthly limit
          </p>

          <button
            className={clsx(
              'w-full mt-3 flex items-center justify-center gap-2 py-2.5 rounded-lg',
              'bg-tvp-bg-tertiary border border-tvp-border-subtle',
              'text-tvp-text-secondary text-sm',
              'hover:border-tvp-accent-cyan hover:text-tvp-accent-cyan transition-colors'
            )}
          >
            <RefreshCw className="w-4 h-4" />
            Re-download All
          </button>
        </div>
      </div>
    </>
  );
}

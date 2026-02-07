// ============================================
// THE VIDEO POOL - DOWNLOAD FAB COMPONENT
// ============================================

import { Download, X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useUIStore } from '@/stores/uiStore';

export default function DownloadFAB() {
  const { downloadQueue, isDownloadFABOpen, toggleDownloadFAB, removeFromDownloadQueue, clearDownloadQueue } = useUIStore();

  const activeDownloads = downloadQueue.filter(d => d.status === 'downloading').length;
  const completedDownloads = downloadQueue.filter(d => d.status === 'completed').length;
  const totalDownloads = downloadQueue.length;

  if (totalDownloads === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[150]">
      {/* Expanded Panel */}
      {isDownloadFABOpen && (
        <div className="absolute bottom-16 right-0 w-80 max-h-96 bg-tvp-bg-elevated border border-tvp-border-default rounded-2xl shadow-elevated overflow-hidden animate-slide-up">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-tvp-border-subtle">
            <h3 className="text-sm font-medium text-tvp-text-primary">Downloads</h3>
            <div className="flex items-center gap-2">
              <span className="text-xs text-tvp-text-muted">
                {completedDownloads}/{totalDownloads} complete
              </span>
              {completedDownloads > 0 && (
                <button
                  onClick={clearDownloadQueue}
                  className="text-xs text-tvp-text-muted hover:text-tvp-text-primary"
                >
                  Clear all
                </button>
              )}
            </div>
          </div>

          {/* Download List */}
          <div className="max-h-72 overflow-y-auto">
            {downloadQueue.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 px-4 py-3 border-b border-tvp-border-subtle last:border-0 hover:bg-tvp-bg-tertiary"
              >
                {/* Thumbnail */}
                <div className="w-12 h-8 rounded overflow-hidden flex-shrink-0 bg-tvp-bg-tertiary">
                  <img
                    src={item.video.thumbnailUrl}
                    alt={item.video.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-tvp-text-primary truncate">
                    {item.video.title}
                  </p>
                  <p className="text-xs text-tvp-text-muted truncate">
                    {item.video.artist}
                  </p>

                  {/* Progress Bar */}
                  {item.status === 'downloading' && (
                    <div className="mt-1 h-1 bg-tvp-bg-tertiary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-tvp-accent-cyan transition-all duration-300"
                        style={{ width: `${item.progress}%` }}
                      />
                    </div>
                  )}
                </div>

                {/* Status Icon */}
                <div className="flex-shrink-0">
                  {item.status === 'queued' && (
                    <div className="w-6 h-6 flex items-center justify-center text-tvp-text-muted">
                      <Loader2 className="w-4 h-4" />
                    </div>
                  )}
                  {item.status === 'downloading' && (
                    <div className="w-6 h-6 flex items-center justify-center text-tvp-accent-cyan">
                      <Loader2 className="w-4 h-4 animate-spin" />
                    </div>
                  )}
                  {item.status === 'completed' && (
                    <div className="w-6 h-6 flex items-center justify-center text-tvp-success">
                      <CheckCircle className="w-4 h-4" />
                    </div>
                  )}
                  {item.status === 'failed' && (
                    <button
                      onClick={() => removeFromDownloadQueue(item.id)}
                      className="w-6 h-6 flex items-center justify-center text-tvp-accent-coral hover:text-tvp-error"
                    >
                      <AlertCircle className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Remove Button */}
                <button
                  onClick={() => removeFromDownloadQueue(item.id)}
                  className="p-1 text-tvp-text-muted hover:text-tvp-text-primary opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* FAB Button */}
      <button
        onClick={toggleDownloadFAB}
        className="relative w-14 h-14 bg-tvp-accent-cyan hover:bg-tvp-accent-cyan-hover text-tvp-bg-primary rounded-full shadow-elevated flex items-center justify-center transition-all hover:scale-105"
      >
        <Download className="w-6 h-6" />

        {/* Badge */}
        {activeDownloads > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-tvp-accent-coral text-white text-xs font-bold rounded-full flex items-center justify-center">
            {activeDownloads}
          </span>
        )}

        {/* Pulse animation when downloading */}
        {activeDownloads > 0 && (
          <span className="absolute inset-0 bg-tvp-accent-cyan rounded-full animate-ping opacity-30" />
        )}
      </button>
    </div>
  );
}

// ============================================
// THE VIDEO POOL - DOWNLOADS PAGE
// ============================================

import { Download, Calendar, Clock, FileVideo, Search, X } from 'lucide-react';
import { useState, useMemo } from 'react';
import { useDownloadHistory, useDownloadLimits } from '@/hooks/useDownloads';

type TimeFilter = 'all' | 'this-month' | 'last-month' | 'last-3-months';

export default function DownloadsPage() {
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');
  const { data: history, isLoading } = useDownloadHistory(page, 20);
  const { data: limits } = useDownloadLimits();

  // Filter downloads based on search query and time filter
  const filteredDownloads = useMemo(() => {
    if (!history?.downloads) return [];

    let filtered = history.downloads;

    // Search filter - match title or artist
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(
        (download) =>
          download.video.title.toLowerCase().includes(query) ||
          download.video.artist.toLowerCase().includes(query)
      );
    }

    // Time filter
    if (timeFilter !== 'all') {
      const now = new Date();
      const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const startOf3MonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1);

      filtered = filtered.filter((download) => {
        const downloadDate = new Date(download.downloadedAt);
        switch (timeFilter) {
          case 'this-month':
            return downloadDate >= startOfThisMonth;
          case 'last-month':
            return downloadDate >= startOfLastMonth && downloadDate < startOfThisMonth;
          case 'last-3-months':
            return downloadDate >= startOf3MonthsAgo;
          default:
            return true;
        }
      });
    }

    return filtered;
  }, [history?.downloads, searchQuery, timeFilter]);

  const clearSearch = () => {
    setSearchQuery('');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-semibold text-tvp-text-primary">Download History</h1>
          <p className="text-tvp-text-secondary mt-1">View and manage your downloaded videos</p>
        </div>

        {/* Download Stats */}
        {limits && (
          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-sm text-tvp-text-muted">This Month</p>
              <p className="text-2xl font-semibold text-tvp-text-primary">
                {limits.used}
                <span className="text-tvp-text-muted text-base font-normal">
                  /{limits.limit === 'unlimited' ? '∞' : limits.limit}
                </span>
              </p>
            </div>
            <div className="h-12 w-px bg-tvp-border-subtle" />
            <div className="text-right">
              <p className="text-sm text-tvp-text-muted">Resets</p>
              <p className="text-lg font-medium text-tvp-text-primary">
                {new Date(limits.resetsAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Search/Filter */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-tvp-text-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search downloads by title or artist..."
            className="w-full pl-12 pr-10 py-3 bg-tvp-bg-secondary border border-tvp-border-subtle rounded-xl text-tvp-text-primary placeholder:text-tvp-text-muted focus:border-tvp-accent-cyan outline-none"
            aria-label="Search downloads"
          />
          {searchQuery && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-tvp-bg-tertiary text-tvp-text-muted hover:text-tvp-text-primary transition-colors"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <select
          value={timeFilter}
          onChange={(e) => setTimeFilter(e.target.value as TimeFilter)}
          className="px-4 py-3 bg-tvp-bg-secondary border border-tvp-border-subtle rounded-xl text-tvp-text-primary outline-none focus:border-tvp-accent-cyan cursor-pointer"
          aria-label="Filter by time period"
        >
          <option value="all">All Time</option>
          <option value="this-month">This Month</option>
          <option value="last-month">Last Month</option>
          <option value="last-3-months">Last 3 Months</option>
        </select>
      </div>

      {/* Search results count */}
      {(searchQuery || timeFilter !== 'all') && history && (
        <div className="mb-4 text-sm text-tvp-text-secondary">
          Showing {filteredDownloads.length} of {history.downloads.length} downloads
          {searchQuery && <span> matching "{searchQuery}"</span>}
        </div>
      )}

      {/* Downloads Table */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse flex gap-4 p-4 bg-tvp-bg-secondary rounded-xl">
              <div className="w-32 h-20 bg-tvp-bg-tertiary rounded-lg" />
              <div className="flex-1">
                <div className="h-5 w-2/3 bg-tvp-bg-tertiary rounded" />
                <div className="h-4 w-1/3 bg-tvp-bg-tertiary rounded mt-2" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredDownloads.length > 0 ? (
        <>
          <div className="rounded-xl overflow-hidden border border-tvp-border-subtle">
            {filteredDownloads.map((download, idx) => (
              <div
                key={download.id}
                className={`flex items-center gap-4 p-4 hover:bg-tvp-bg-elevated transition-colors ${
                  idx % 2 === 0 ? 'bg-tvp-bg-secondary' : 'bg-tvp-bg-primary'
                } ${idx !== 0 ? 'border-t border-tvp-border-subtle' : ''}`}
              >
                {/* Thumbnail */}
                <div className="w-32 h-20 rounded-lg overflow-hidden bg-tvp-bg-tertiary shrink-0">
                  <img
                    src={download.video.thumbnailUrl}
                    alt={download.video.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-tvp-text-primary truncate">
                    {download.video.title}
                  </h3>
                  <p className="text-sm text-tvp-text-secondary truncate">
                    {download.video.artist}
                  </p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-tvp-text-muted">
                    <span className="flex items-center gap-1">
                      <FileVideo className="w-3.5 h-3.5" />
                      {download.version?.quality || download.video.quality}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {formatDate(download.downloadedAt)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {formatTime(download.downloadedAt)}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <button className="flex items-center gap-2 px-4 py-2 bg-tvp-bg-tertiary hover:bg-tvp-accent-cyan hover:text-tvp-bg-primary text-tvp-text-secondary rounded-lg transition-colors">
                  <Download className="w-4 h-4" />
                  Re-download
                </button>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {history && history.total > 20 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-4 py-2 bg-tvp-bg-secondary border border-tvp-border-subtle rounded-lg text-tvp-text-secondary hover:text-tvp-text-primary disabled:opacity-50"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-tvp-text-secondary">
                Page {page} of {Math.ceil(history.total / 20)}
              </span>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page >= Math.ceil(history.total / 20)}
                className="px-4 py-2 bg-tvp-bg-secondary border border-tvp-border-subtle rounded-lg text-tvp-text-secondary hover:text-tvp-text-primary disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      ) : (searchQuery || timeFilter !== 'all') && history && history.downloads.length > 0 ? (
        // No results from filter, but has downloads
        <div className="text-center py-16">
          <Search className="w-12 h-12 text-tvp-text-muted mx-auto mb-4" />
          <h3 className="text-lg font-medium text-tvp-text-primary mb-2">No matching downloads</h3>
          <p className="text-tvp-text-secondary mb-4">
            No downloads match your search criteria.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setTimeFilter('all');
            }}
            className="px-4 py-2 bg-tvp-bg-tertiary hover:bg-tvp-accent-cyan hover:text-tvp-bg-primary text-tvp-text-secondary rounded-lg transition-colors"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        // No downloads at all
        <div className="text-center py-16">
          <Download className="w-12 h-12 text-tvp-text-muted mx-auto mb-4" />
          <h3 className="text-lg font-medium text-tvp-text-primary mb-2">No downloads yet</h3>
          <p className="text-tvp-text-secondary">
            Videos you download will appear here for easy re-downloading.
          </p>
        </div>
      )}
    </div>
  );
}

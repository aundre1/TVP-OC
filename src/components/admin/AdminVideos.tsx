// ============================================
// THE VIDEO POOL - ADMIN VIDEOS TAB
// Video management with bulk actions
// ============================================

import { useState, useEffect, useCallback } from 'react';
import {
  Search,
  MoreVertical,
  Edit2,
  Trash2,
  Eye,
  Download,
  Clock,
  Play,
  TrendingUp,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { clsx } from 'clsx';
import { get } from '@/api/client';

interface AdminVideo {
  id: number;
  title: string;
  artist: string;
  genre: string;
  bpm: number | null;
  key: string | null;
  duration: number;
  download_count: number;
  is_new: boolean;
  is_hot: boolean;
  created_at: string;
}

interface VideosResponse {
  videos: AdminVideo[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Skeleton row for loading state
function VideoRowSkeleton() {
  return (
    <tr className="animate-pulse">
      <td className="px-4 py-3"><div className="w-4 h-4 bg-tvp-bg-tertiary rounded" /></td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="w-16 h-9 rounded bg-tvp-bg-tertiary" />
          <div className="space-y-1">
            <div className="h-3 bg-tvp-bg-tertiary rounded w-28" />
            <div className="h-3 bg-tvp-bg-tertiary rounded w-20" />
          </div>
        </div>
      </td>
      <td className="px-4 py-3"><div className="h-5 bg-tvp-bg-tertiary rounded w-14" /></td>
      <td className="px-4 py-3"><div className="h-3 bg-tvp-bg-tertiary rounded w-20" /></td>
      <td className="px-4 py-3"><div className="h-3 bg-tvp-bg-tertiary rounded w-14" /></td>
      <td className="px-4 py-3"><div className="h-3 bg-tvp-bg-tertiary rounded w-10" /></td>
      <td className="px-4 py-3"><div className="w-4 h-4 bg-tvp-bg-tertiary rounded" /></td>
    </tr>
  );
}

export default function AdminVideos() {
  const [videos, setVideos] = useState<AdminVideo[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVideos, setSelectedVideos] = useState<Set<number>>(new Set());
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  const LIMIT = 20;

  const fetchVideos = useCallback(async (pageNum: number, search: string) => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, unknown> = { page: pageNum, limit: LIMIT };
      if (search) params.search = search;
      const data = await get<VideosResponse>('/admin/videos', params);
      setVideos(data.videos);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } };
      setError(axiosErr?.response?.data?.error || 'Failed to load videos');
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(searchInput);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    fetchVideos(page, searchQuery);
  }, [page, searchQuery, fetchVideos]);

  const toggleVideoSelection = (id: number) => {
    setSelectedVideos(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedVideos.size === videos.length) {
      setSelectedVideos(new Set());
    } else {
      setSelectedVideos(new Set(videos.map(v => v.id)));
    }
  };

  const formatDuration = (seconds: number): string => {
    if (!seconds) return '—';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-tvp-text-muted" />
          <input
            type="text"
            placeholder="Search videos..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-tvp-bg-tertiary border border-tvp-border-subtle rounded-lg text-tvp-text-primary placeholder:text-tvp-text-muted focus:border-tvp-accent-cyan outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-tvp-text-muted">{total.toLocaleString()} total videos</span>
          {selectedVideos.size > 0 && (
            <button className="px-3 py-2 bg-tvp-status-error/10 text-tvp-status-error text-sm rounded-lg hover:bg-tvp-status-error/20 transition-colors flex items-center gap-2">
              <Trash2 className="w-4 h-4" />
              Delete ({selectedVideos.size})
            </button>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="p-3 bg-tvp-status-error/10 border border-tvp-status-error/30 rounded-lg text-sm text-tvp-status-error">
          {error} — <button onClick={() => fetchVideos(page, searchQuery)} className="underline">Retry</button>
        </div>
      )}

      {/* Videos Table */}
      <div className="bg-tvp-bg-secondary border border-tvp-border-subtle rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-tvp-bg-tertiary/50">
              <tr className="text-left text-tvp-text-muted">
                <th className="px-4 py-3 font-medium w-10">
                  <input
                    type="checkbox"
                    checked={selectedVideos.size === videos.length && videos.length > 0}
                    onChange={toggleAll}
                    className="rounded border-tvp-border-default"
                  />
                </th>
                <th className="px-4 py-3 font-medium">Video</th>
                <th className="px-4 py-3 font-medium">Genre</th>
                <th className="px-4 py-3 font-medium">BPM / Key</th>
                <th className="px-4 py-3 font-medium">Downloads</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium w-12"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-tvp-border-subtle">
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => <VideoRowSkeleton key={i} />)
              ) : videos.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-tvp-text-muted text-sm">
                    {searchQuery ? 'No videos match your search.' : 'No videos found.'}
                  </td>
                </tr>
              ) : (
                videos.map((video) => (
                  <tr key={video.id} className="hover:bg-tvp-bg-tertiary/30">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedVideos.has(video.id)}
                        onChange={() => toggleVideoSelection(video.id)}
                        className="rounded border-tvp-border-default"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-16 h-9 rounded bg-tvp-bg-tertiary flex items-center justify-center">
                          <Play className="w-4 h-4 text-tvp-text-muted" />
                        </div>
                        <div>
                          <div className="font-medium text-tvp-text-primary">{video.title}</div>
                          <div className="flex items-center gap-2 text-xs text-tvp-text-muted">
                            <span>{video.artist}</span>
                            <span>•</span>
                            <span>{formatDuration(video.duration)}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 bg-tvp-bg-tertiary rounded text-xs text-tvp-text-secondary">
                        {video.genre || '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 font-mono text-sm">
                        {video.bpm ? (
                          <>
                            <span className="text-tvp-text-primary">{video.bpm}</span>
                            <span className="text-tvp-text-muted">BPM</span>
                          </>
                        ) : (
                          <span className="text-tvp-text-muted">—</span>
                        )}
                        {video.key && <span className="text-tvp-accent-cyan">{video.key}</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 text-tvp-text-secondary">
                        <Download className="w-3 h-3" />
                        <span>{Number(video.download_count).toLocaleString()}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        {video.is_hot && (
                          <span className="flex items-center gap-1 px-2 py-0.5 bg-tvp-status-success/20 text-tvp-status-success rounded text-[10px]">
                            <TrendingUp className="w-3 h-3" />
                            Hot
                          </span>
                        )}
                        {video.is_new && (
                          <span className="px-2 py-0.5 bg-tvp-accent-purple/20 text-tvp-accent-purple rounded text-[10px]">
                            New
                          </span>
                        )}
                        {!video.is_hot && !video.is_new && (
                          <span className="text-xs text-tvp-text-muted">
                            <Clock className="w-3 h-3 inline mr-1" />
                            {new Date(video.created_at).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="relative">
                        <button
                          onClick={() => setOpenMenuId(openMenuId === video.id ? null : video.id)}
                          className="p-1 hover:bg-tvp-bg-tertiary rounded transition-colors"
                        >
                          <MoreVertical className="w-4 h-4 text-tvp-text-muted" />
                        </button>

                        {openMenuId === video.id && (
                          <div className="absolute right-0 top-full mt-1 w-40 bg-tvp-bg-secondary border border-tvp-border-default rounded-lg shadow-xl z-10 py-1">
                            <button className="w-full px-3 py-2 text-left text-sm text-tvp-text-secondary hover:bg-tvp-accent-cyan/10 hover:text-tvp-accent-cyan flex items-center gap-2">
                              <Eye className="w-3 h-3" />
                              Preview
                            </button>
                            <button className="w-full px-3 py-2 text-left text-sm text-tvp-text-secondary hover:bg-tvp-accent-cyan/10 hover:text-tvp-accent-cyan flex items-center gap-2">
                              <Edit2 className="w-3 h-3" />
                              Edit Metadata
                            </button>
                            <button className="w-full px-3 py-2 text-left text-sm text-tvp-status-error hover:bg-tvp-status-error/10 flex items-center gap-2">
                              <Trash2 className="w-3 h-3" />
                              Delete Video
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer with pagination */}
        <div className="px-4 py-3 border-t border-tvp-border-subtle flex items-center justify-between">
          <span className="text-sm text-tvp-text-muted">
            {loading ? (
              <span className="flex items-center gap-2"><Loader2 className="w-3 h-3 animate-spin" /> Loading...</span>
            ) : (
              `Showing ${videos.length} of ${total.toLocaleString()} videos`
            )}
          </span>
          <div className="flex items-center gap-2">
            {selectedVideos.size > 0 && (
              <span className="text-sm text-tvp-accent-cyan mr-4">
                {selectedVideos.size} selected
              </span>
            )}
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page <= 1 || loading}
              className="p-1.5 rounded hover:bg-tvp-bg-tertiary disabled:opacity-40 transition-colors"
            >
              <ChevronLeft className="w-4 h-4 text-tvp-text-muted" />
            </button>
            <span className="text-sm text-tvp-text-muted">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages || loading}
              className="p-1.5 rounded hover:bg-tvp-bg-tertiary disabled:opacity-40 transition-colors"
            >
              <ChevronRight className="w-4 h-4 text-tvp-text-muted" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

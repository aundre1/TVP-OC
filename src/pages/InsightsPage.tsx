// ============================================
// THE VIDEO POOL - INSIGHTS PAGE (Simplified)
// 4 metric cards, top 5 tracks, genre breakdown
// ============================================

import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import {
  TrendingUp,
  Download,
  Music,
  BarChart3,
  Activity,
  Loader2,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { clsx } from 'clsx';
import apiClient from '@/api/client';

interface AdminStats {
  totalDownloads: number;
  downloadsToday: number;
  totalUsers: number;
  activeSubscribers: number;
}

interface TopVideo {
  id: number;
  title: string;
  artist: string;
  genre: string;
  download_count: number;
}

interface GenreEntry {
  genre: string;
  count: number;
}

interface InsightsData {
  stats: AdminStats | null;
  topVideos: TopVideo[];
  genreBreakdown: GenreEntry[];
}

function MetricCard({ title, value, icon: Icon }: { title: string; value: string | number; icon: React.ElementType }) {
  return (
    <div className="p-5 bg-tvp-bg-secondary border border-tvp-border-subtle rounded-xl">
      <div className="flex items-center gap-2 text-tvp-text-muted text-xs mb-2">
        <Icon className="w-4 h-4" />
        {title}
      </div>
      <p className="text-2xl font-semibold text-tvp-text-primary">{typeof value === 'number' ? value.toLocaleString() : value}</p>
    </div>
  );
}

export default function InsightsPage() {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  const [data, setData] = useState<InsightsData>({ stats: null, topVideos: [], genreBreakdown: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAdmin) return;

    let cancelled = false;
    setLoading(true);

    Promise.all([
      apiClient.get('/admin/stats').then(r => r.data),
      apiClient.get('/admin/analytics?days=30').then(r => r.data),
    ])
      .then(([statsData, analyticsData]) => {
        if (cancelled) return;

        // Derive genre breakdown from membership distribution as a proxy,
        // or use topVideos genre counts if available
        const genreMap: Record<string, number> = {};
        (analyticsData.topVideos as TopVideo[]).forEach((v) => {
          if (v.genre) genreMap[v.genre] = (genreMap[v.genre] ?? 0) + Number(v.download_count);
        });
        const genreBreakdown: GenreEntry[] = Object.entries(genreMap)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 6)
          .map(([genre, count]) => ({ genre, count }));

        setData({
          stats: statsData,
          topVideos: (analyticsData.topVideos as TopVideo[]).slice(0, 5),
          genreBreakdown,
        });
      })
      .catch((err) => {
        if (!cancelled) setError(err?.response?.data?.error || 'Failed to load insights');
      })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [isAdmin]);

  if (!isAdmin) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-16 text-center">
        <BarChart3 className="w-16 h-16 text-tvp-accent-coral mx-auto mb-4" />
        <h1 className="text-2xl font-semibold text-tvp-text-primary mb-2">Access Denied</h1>
        <p className="text-tvp-text-secondary mb-6">Insights are only available to administrators.</p>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-3 bg-tvp-accent-cyan hover:bg-tvp-accent-cyan-hover text-tvp-bg-primary font-medium rounded-xl transition-colors"
        >
          Return to Home
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-tvp-accent-cyan" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-16 text-center">
        <p className="text-tvp-status-error text-sm">{error}</p>
      </div>
    );
  }

  const { stats, topVideos, genreBreakdown } = data;
  const maxGenreCount = genreBreakdown[0]?.count ?? 1;

  // Derive top genre name from breakdown
  const topGenre = genreBreakdown[0]?.genre ?? '—';

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-semibold text-tvp-text-primary">Insights</h1>
        <p className="text-tvp-text-secondary mt-1">Your download analytics at a glance</p>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <MetricCard title="Total Users" value={stats?.totalUsers ?? 0} icon={Download} />
        <MetricCard title="Top Genre" value={topGenre} icon={Music} />
        <MetricCard title="Active Subscribers" value={stats?.activeSubscribers ?? 0} icon={Activity} />
        <MetricCard title="Downloads Today" value={stats?.downloadsToday ?? 0} icon={BarChart3} />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Top 5 Downloaded Tracks */}
        <div className="p-6 bg-tvp-bg-secondary border border-tvp-border-subtle rounded-xl">
          <h3 className="font-semibold text-tvp-text-primary mb-4">Top 5 Downloaded Tracks</h3>
          <div className="space-y-3">
            {topVideos.length === 0 ? (
              <p className="text-sm text-tvp-text-muted text-center py-4">No data yet</p>
            ) : topVideos.map((track, idx) => (
              <div key={track.id} className="flex items-center gap-3 p-3 bg-tvp-bg-tertiary rounded-lg">
                <span className="w-6 h-6 bg-tvp-bg-elevated rounded-full flex items-center justify-center text-xs font-bold text-tvp-text-muted">
                  {idx + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-tvp-text-primary truncate">{track.title}</p>
                  <p className="text-xs text-tvp-text-muted">{track.artist}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm text-tvp-text-primary">{Number(track.download_count).toLocaleString()}</p>
                  <p className="text-xs flex items-center justify-end gap-1 text-tvp-status-success">
                    <TrendingUp className="w-3 h-3" />
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Genre Breakdown */}
        <div className="p-6 bg-tvp-bg-secondary border border-tvp-border-subtle rounded-xl">
          <h3 className="font-semibold text-tvp-text-primary mb-4">Genre Breakdown</h3>
          {genreBreakdown.length === 0 ? (
            <p className="text-sm text-tvp-text-muted text-center py-4">No data yet</p>
          ) : (
            <div className="space-y-4">
              {genreBreakdown.map((g) => (
                <div key={g.genre}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-tvp-text-secondary">{g.genre}</span>
                    <span className="text-tvp-text-primary font-medium">{g.count.toLocaleString()}</span>
                  </div>
                  <div className="h-2 bg-tvp-bg-tertiary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-tvp-accent-cyan rounded-full transition-all"
                      style={{ width: `${(g.count / maxGenreCount) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

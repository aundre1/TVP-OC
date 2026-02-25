// ============================================
// THE VIDEO POOL - INSIGHTS PAGE (Simplified)
// 4 metric cards, top 5 tracks, genre breakdown
// ============================================

import { useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  TrendingDown,
  Download,
  Music,
  BarChart3,
  Activity,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { clsx } from 'clsx';

// Mock data — replace with real API calls
const metrics = {
  totalDownloads: 114300,
  favoriteGenre: 'Pop',
  avgBpm: 118,
  thisMonth: 3420,
};

const topTracks = [
  { title: 'Flowers', artist: 'Miley Cyrus', downloads: 16800, trend: 12 },
  { title: 'Blinding Lights', artist: 'The Weeknd', downloads: 15420, trend: -3 },
  { title: 'Levitating', artist: 'Dua Lipa', downloads: 12800, trend: 5 },
  { title: 'As It Was', artist: 'Harry Styles', downloads: 11200, trend: 8 },
  { title: 'Anti-Hero', artist: 'Taylor Swift', downloads: 10500, trend: -1 },
];

const genreBreakdown = [
  { genre: 'Pop', percentage: 28.4 },
  { genre: 'Hip-Hop', percentage: 24.6 },
  { genre: 'EDM', percentage: 21.6 },
  { genre: 'Latin', percentage: 13.1 },
  { genre: 'R&B', percentage: 7.7 },
  { genre: 'Other', percentage: 4.6 },
];

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

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-semibold text-tvp-text-primary">Insights</h1>
        <p className="text-tvp-text-secondary mt-1">Your download analytics at a glance</p>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <MetricCard title="Total Downloads" value={metrics.totalDownloads} icon={Download} />
        <MetricCard title="Favorite Genre" value={metrics.favoriteGenre} icon={Music} />
        <MetricCard title="Avg BPM" value={metrics.avgBpm} icon={Activity} />
        <MetricCard title="This Month" value={metrics.thisMonth} icon={BarChart3} />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Top 5 Downloaded Tracks */}
        <div className="p-6 bg-tvp-bg-secondary border border-tvp-border-subtle rounded-xl">
          <h3 className="font-semibold text-tvp-text-primary mb-4">Top 5 Downloaded Tracks</h3>
          <div className="space-y-3">
            {topTracks.map((track, idx) => (
              <div key={track.title} className="flex items-center gap-3 p-3 bg-tvp-bg-tertiary rounded-lg">
                <span className="w-6 h-6 bg-tvp-bg-elevated rounded-full flex items-center justify-center text-xs font-bold text-tvp-text-muted">
                  {idx + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-tvp-text-primary truncate">{track.title}</p>
                  <p className="text-xs text-tvp-text-muted">{track.artist}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm text-tvp-text-primary">{track.downloads.toLocaleString()}</p>
                  <p className={clsx(
                    'text-xs flex items-center justify-end gap-1',
                    track.trend >= 0 ? 'text-tvp-status-success' : 'text-tvp-status-error'
                  )}>
                    {track.trend >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {track.trend >= 0 ? '+' : ''}{track.trend}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Genre Breakdown */}
        <div className="p-6 bg-tvp-bg-secondary border border-tvp-border-subtle rounded-xl">
          <h3 className="font-semibold text-tvp-text-primary mb-4">Genre Breakdown</h3>
          <div className="space-y-4">
            {genreBreakdown.map((g) => (
              <div key={g.genre}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-tvp-text-secondary">{g.genre}</span>
                  <span className="text-tvp-text-primary font-medium">{g.percentage}%</span>
                </div>
                <div className="h-2 bg-tvp-bg-tertiary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-tvp-accent-cyan rounded-full transition-all"
                    style={{ width: `${(g.percentage / 30) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// THE VIDEO POOL - ADMIN ANALYTICS TAB
// Charts and metrics visualization — real API data
// ============================================

import { useState, useEffect, useCallback } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Download,
  Users,
  DollarSign,
  BarChart3,
  PieChart,
  Activity,
  Loader2,
} from 'lucide-react';
import { clsx } from 'clsx';
import { get } from '@/api/client';

type TimeRange = '7d' | '30d' | '90d' | '1y';

const TIME_RANGE_DAYS: Record<TimeRange, number> = {
  '7d': 7,
  '30d': 30,
  '90d': 90,
  '1y': 365,
};

interface DayEntry { date: string; downloads?: string; signups?: string; }
interface TopVideo { id: number; title: string; artist: string; genre: string; download_count: string | number; }
interface MembershipEntry { membership_type: string; count: string | number; }
interface AdminStats {
  totalUsers: number;
  activeSubscribers: number;
  totalVideos: number;
  downloadsToday: number;
  revenueThisMonth: number;
  newUsersThisWeek: number;
}
interface AnalyticsData {
  period: string;
  downloadsPerDay: DayEntry[];
  signupsPerDay: DayEntry[];
  topVideos: TopVideo[];
  membershipDistribution: MembershipEntry[];
}
interface CombinedData {
  stats: AdminStats;
  analytics: AnalyticsData;
}

// Simple bar chart renderer
function BarChart({ data, maxHeight = 48, color = 'bg-tvp-accent-cyan' }: { data: number[]; maxHeight?: number; color?: string }) {
  const max = Math.max(...data, 1);
  return (
    <div className="flex items-end gap-0.5 h-16">
      {data.map((value, idx) => (
        <div
          key={idx}
          className={clsx('flex-1 rounded-t transition-colors', color, 'opacity-70 hover:opacity-100')}
          style={{ height: `${(value / max) * maxHeight}px` }}
          title={value.toLocaleString()}
        />
      ))}
    </div>
  );
}

function MetricSkeleton() {
  return (
    <div className="p-4 bg-tvp-bg-secondary border border-tvp-border-subtle rounded-xl animate-pulse">
      <div className="flex justify-between mb-2">
        <div className="h-3 bg-tvp-bg-tertiary rounded w-24" />
        <div className="h-3 bg-tvp-bg-tertiary rounded w-8" />
      </div>
      <div className="h-7 bg-tvp-bg-tertiary rounded w-1/2 mb-3" />
      <div className="h-12 bg-tvp-bg-tertiary rounded" />
    </div>
  );
}

export default function AdminAnalytics() {
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');
  const [data, setData] = useState<CombinedData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async (range: TimeRange) => {
    setLoading(true);
    setError(null);
    try {
      const days = TIME_RANGE_DAYS[range];
      const [stats, analytics] = await Promise.all([
        get<AdminStats>('/admin/stats'),
        get<AnalyticsData>('/admin/analytics', { days }),
      ]);
      setData({ stats, analytics });
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } };
      setError(axiosErr?.response?.data?.error || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(timeRange);
  }, [timeRange, fetchData]);

  // Derive downloads-by-day array (last N days, sorted oldest first)
  const downloadsChart: number[] = data
    ? [...data.analytics.downloadsPerDay]
        .sort((a, b) => a.date.localeCompare(b.date))
        .slice(-14)
        .map(d => Number(d.downloads ?? 0))
    : [];

  const signupsChart: number[] = data
    ? [...data.analytics.signupsPerDay]
        .sort((a, b) => a.date.localeCompare(b.date))
        .slice(-14)
        .map(d => Number(d.signups ?? 0))
    : [];

  const totalDownloads = downloadsChart.reduce((a, b) => a + b, 0);
  const totalSignups = signupsChart.reduce((a, b) => a + b, 0);

  // Membership distribution
  const membershipMap: Record<string, number> = {};
  (data?.analytics.membershipDistribution ?? []).forEach(m => {
    membershipMap[m.membership_type] = Number(m.count);
  });
  const totalMemberships = Object.values(membershipMap).reduce((a, b) => a + b, 0) || 1;

  const membershipColors = ['bg-tvp-accent-cyan', 'bg-tvp-accent-purple', 'bg-amber-500', 'bg-tvp-status-success', 'bg-tvp-text-muted'];

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-tvp-text-primary">Analytics Overview</h2>
        <div className="flex gap-2">
          {(['7d', '30d', '90d', '1y'] as TimeRange[]).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={clsx(
                'px-3 py-1.5 text-sm rounded-lg transition-colors',
                timeRange === range
                  ? 'bg-tvp-accent-cyan text-tvp-bg-primary'
                  : 'bg-tvp-bg-tertiary text-tvp-text-secondary hover:text-tvp-text-primary'
              )}
            >
              {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : range === '90d' ? '90 Days' : '1 Year'}
            </button>
          ))}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="p-3 bg-tvp-status-error/10 border border-tvp-status-error/30 rounded-lg text-sm text-tvp-status-error">
          {error} — <button onClick={() => fetchData(timeRange)} className="underline">Retry</button>
        </div>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <MetricSkeleton key={i} />)
        ) : (
          <>
            {/* Downloads in period */}
            <div className="p-4 bg-tvp-bg-secondary border border-tvp-border-subtle rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-tvp-text-muted text-xs">
                  <Download className="w-4 h-4" />
                  Downloads ({timeRange})
                </div>
                <div className="flex items-center gap-1 text-xs text-tvp-status-success">
                  <TrendingUp className="w-3 h-3" />
                </div>
              </div>
              <p className="text-2xl font-semibold text-tvp-text-primary mb-3">
                {totalDownloads.toLocaleString()}
              </p>
              {downloadsChart.length > 0
                ? <BarChart data={downloadsChart} color="bg-tvp-accent-cyan" />
                : <p className="text-xs text-tvp-text-muted">No downloads yet</p>}
            </div>

            {/* Total Users */}
            <div className="p-4 bg-tvp-bg-secondary border border-tvp-border-subtle rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-tvp-text-muted text-xs">
                  <Users className="w-4 h-4" />
                  Total Users
                </div>
              </div>
              <p className="text-2xl font-semibold text-tvp-text-primary">
                {(data?.stats.totalUsers ?? 0).toLocaleString()}
              </p>
              <div className="mt-2 flex items-center gap-4 text-xs">
                <span className="text-tvp-text-muted">
                  <span className="text-tvp-status-success">+{data?.stats.newUsersThisWeek ?? 0}</span> this week
                </span>
                <span className="text-tvp-text-muted">
                  <span className="text-tvp-accent-cyan">+{totalSignups}</span> this period
                </span>
              </div>
            </div>

            {/* Revenue MTD */}
            <div className="p-4 bg-tvp-bg-secondary border border-tvp-border-subtle rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-tvp-text-muted text-xs">
                  <DollarSign className="w-4 h-4" />
                  Revenue (MTD)
                </div>
              </div>
              <p className="text-2xl font-semibold text-tvp-accent-gold">
                ${(data?.stats.revenueThisMonth ?? 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </p>
              <div className="mt-3 space-y-1">
                {Object.entries(membershipMap)
                  .filter(([type]) => type !== 'free')
                  .slice(0, 3)
                  .map(([type, count]) => (
                    <div key={type} className="flex items-center justify-between text-xs">
                      <span className="text-tvp-text-muted capitalize">{type}</span>
                      <span className="text-tvp-text-secondary">{count} users</span>
                    </div>
                  ))}
              </div>
            </div>

            {/* Active Subscribers */}
            <div className="p-4 bg-tvp-bg-secondary border border-tvp-border-subtle rounded-xl">
              <div className="flex items-center gap-2 text-tvp-text-muted text-xs mb-2">
                <Activity className="w-4 h-4" />
                Active Subscribers
              </div>
              <p className="text-2xl font-semibold text-tvp-text-primary mb-2">
                {(data?.stats.activeSubscribers ?? 0).toLocaleString()}
              </p>
              <p className="text-xs text-tvp-text-muted">
                {data && data.stats.totalUsers > 0
                  ? ((data.stats.activeSubscribers / data.stats.totalUsers) * 100).toFixed(1)
                  : '0.0'}% conversion rate
              </p>
              <div className="mt-2 h-2 bg-tvp-bg-tertiary rounded-full overflow-hidden">
                <div
                  className="h-full bg-tvp-accent-cyan rounded-full"
                  style={{
                    width: data && data.stats.totalUsers > 0
                      ? `${(data.stats.activeSubscribers / data.stats.totalUsers) * 100}%`
                      : '0%'
                  }}
                />
              </div>
            </div>
          </>
        )}
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Membership Distribution */}
        <div className="p-4 bg-tvp-bg-secondary border border-tvp-border-subtle rounded-xl">
          <div className="flex items-center gap-2 text-tvp-text-muted text-xs mb-4">
            <PieChart className="w-4 h-4" />
            <span className="font-medium text-tvp-text-primary text-sm">Membership Distribution</span>
          </div>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="flex justify-between mb-1">
                    <div className="h-3 bg-tvp-bg-tertiary rounded w-16" />
                    <div className="h-3 bg-tvp-bg-tertiary rounded w-8" />
                  </div>
                  <div className="h-2 bg-tvp-bg-tertiary rounded-full" />
                </div>
              ))}
            </div>
          ) : Object.keys(membershipMap).length === 0 ? (
            <p className="text-sm text-tvp-text-muted text-center py-6">No membership data yet</p>
          ) : (
            <div className="space-y-3">
              {Object.entries(membershipMap)
                .sort((a, b) => b[1] - a[1])
                .map(([type, count], idx) => (
                  <div key={type}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-tvp-text-secondary capitalize">{type}</span>
                      <span className="text-tvp-text-muted">{count.toLocaleString()} users</span>
                    </div>
                    <div className="h-2 bg-tvp-bg-tertiary rounded-full overflow-hidden">
                      <div
                        className={clsx('h-full rounded-full transition-all', membershipColors[idx % membershipColors.length])}
                        style={{ width: `${(count / totalMemberships) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* Top Downloaded Videos */}
        <div className="p-4 bg-tvp-bg-secondary border border-tvp-border-subtle rounded-xl">
          <div className="flex items-center gap-2 text-tvp-text-muted text-xs mb-4">
            <BarChart3 className="w-4 h-4" />
            <span className="font-medium text-tvp-text-primary text-sm">Top Downloaded Videos</span>
          </div>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-2 bg-tvp-bg-tertiary/50 rounded-lg animate-pulse">
                  <div className="w-8 h-8 bg-tvp-bg-tertiary rounded-lg" />
                  <div className="flex-1 space-y-1">
                    <div className="h-3 bg-tvp-bg-tertiary rounded w-3/4" />
                    <div className="h-3 bg-tvp-bg-tertiary rounded w-1/2" />
                  </div>
                  <div className="h-3 bg-tvp-bg-tertiary rounded w-10" />
                </div>
              ))}
            </div>
          ) : data?.analytics.topVideos.length === 0 ? (
            <p className="text-sm text-tvp-text-muted text-center py-6">No download data yet</p>
          ) : (
            <div className="space-y-3">
              {(data?.analytics.topVideos ?? []).slice(0, 5).map((video, idx) => (
                <div
                  key={video.id}
                  className="flex items-center gap-3 p-2 bg-tvp-bg-tertiary/50 rounded-lg"
                >
                  <div className="w-8 h-8 flex items-center justify-center bg-tvp-bg-tertiary rounded-lg text-tvp-text-muted font-semibold text-sm">
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-tvp-text-primary truncate">{video.title}</p>
                    <p className="text-xs text-tvp-text-muted truncate">{video.artist}</p>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-tvp-text-secondary">
                    <Download className="w-3 h-3" />
                    {Number(video.download_count).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Signups Trend */}
      {!loading && signupsChart.length > 0 && (
        <div className="p-4 bg-tvp-bg-secondary border border-tvp-border-subtle rounded-xl">
          <div className="flex items-center gap-2 text-tvp-text-muted text-xs mb-4">
            <Users className="w-4 h-4" />
            <span className="font-medium text-tvp-text-primary text-sm">New User Signups (last {Math.min(14, signupsChart.length)} days)</span>
          </div>
          <BarChart data={signupsChart} color="bg-tvp-accent-purple" maxHeight={64} />
        </div>
      )}

      {/* Conversion Funnel using real stats */}
      {!loading && data && (
        <div className="p-4 bg-tvp-bg-secondary border border-tvp-border-subtle rounded-xl">
          <div className="flex items-center gap-2 text-tvp-text-muted text-xs mb-4">
            <TrendingUp className="w-4 h-4" />
            <span className="font-medium text-tvp-text-primary text-sm">Conversion Funnel</span>
          </div>
          <div className="flex items-center gap-4">
            {[
              { label: 'Total Users', value: data.stats.totalUsers, color: 'bg-tvp-text-muted' },
              { label: 'Active Subscribers', value: data.stats.activeSubscribers, color: 'bg-tvp-accent-cyan' },
            ].map((step, idx, arr) => (
              <div key={step.label} className="flex-1">
                <div className="relative">
                  <div className="h-12 rounded-lg bg-tvp-bg-tertiary overflow-hidden">
                    <div
                      className={clsx('h-full', step.color)}
                      style={{ width: `${arr[0].value > 0 ? (step.value / arr[0].value) * 100 : 0}%` }}
                    />
                  </div>
                  {idx < arr.length - 1 && (
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-4 h-4 bg-tvp-bg-primary rounded-full flex items-center justify-center z-10">
                      <span className="text-tvp-text-muted text-xs">→</span>
                    </div>
                  )}
                </div>
                <div className="mt-2 text-center">
                  <p className="text-lg font-semibold text-tvp-text-primary">{step.value.toLocaleString()}</p>
                  <p className="text-xs text-tvp-text-muted">{step.label}</p>
                  {idx > 0 && arr[idx - 1].value > 0 && (
                    <p className="text-[10px] text-tvp-accent-cyan">
                      {((step.value / arr[idx - 1].value) * 100).toFixed(1)}% conv.
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

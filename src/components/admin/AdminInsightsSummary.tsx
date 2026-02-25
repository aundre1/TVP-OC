// ============================================
// THE VIDEO POOL - ADMIN INSIGHTS SUMMARY WIDGET
// Compact BI metrics for admin dashboard overview — real API data
// ============================================

import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  Users,
  DollarSign,
  Activity,
  Download,
  UserPlus,
  ArrowRight,
  Zap,
  Target,
  Loader2,
} from 'lucide-react';
import { clsx } from 'clsx';
import { get } from '@/api/client';

interface AdminStats {
  totalUsers: number;
  activeSubscribers: number;
  totalVideos: number;
  downloadsToday: number;
  revenueThisMonth: number;
  newUsersThisWeek: number;
}

function MetricSkeleton() {
  return (
    <div className="p-3 bg-tvp-bg-tertiary rounded-lg animate-pulse">
      <div className="h-3 bg-tvp-bg-elevated rounded w-16 mb-2" />
      <div className="h-6 bg-tvp-bg-elevated rounded w-24" />
    </div>
  );
}

export default function AdminInsightsSummary() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await get<AdminStats>('/admin/stats');
      setStats(data);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } };
      setError(axiosErr?.response?.data?.error || 'Failed to load insights');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Computed metrics from stats
  const conversionRate = stats && stats.totalUsers > 0
    ? ((stats.activeSubscribers / stats.totalUsers) * 100).toFixed(1)
    : '0.0';

  // Derive alerts from live stats
  const alerts = stats ? [
    stats.newUsersThisWeek > 0
      ? { type: 'info', message: `${stats.newUsersThisWeek} new signups this week`, icon: UserPlus }
      : null,
    Number(conversionRate) > 50
      ? { type: 'success', message: `Strong conversion rate: ${conversionRate}%`, icon: TrendingUp }
      : { type: 'warning', message: `Conversion rate ${conversionRate}% — room to grow`, icon: Target },
    stats.downloadsToday > 0
      ? { type: 'info', message: `${stats.downloadsToday} downloads today`, icon: Download }
      : null,
  ].filter(Boolean) as { type: string; message: string; icon: React.ElementType }[] : [];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-tvp-text-primary">Business Insights</h2>
        <button
          onClick={() => navigate('/insights')}
          className="flex items-center gap-1 text-sm text-tvp-accent-cyan hover:text-tvp-accent-cyan-hover transition-colors"
        >
          Full Dashboard
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Real-time Banner */}
      <div className="p-3 bg-tvp-accent-cyan/10 border border-tvp-accent-cyan/30 rounded-lg">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-tvp-accent-cyan" />
            {loading ? (
              <span className="flex items-center gap-2 text-sm font-medium text-tvp-text-primary">
                <Loader2 className="w-3 h-3 animate-spin" /> Loading...
              </span>
            ) : (
              <span className="text-sm font-medium text-tvp-text-primary">
                {(stats?.totalUsers ?? 0).toLocaleString()} total users
              </span>
            )}
          </div>
          {!loading && stats && (
            <>
              <div className="text-sm text-tvp-text-muted">
                {stats.downloadsToday} downloads today
              </div>
              <div className="text-sm text-tvp-text-muted">
                {stats.activeSubscribers} subscribers
              </div>
            </>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="p-2 bg-tvp-status-error/10 border border-tvp-status-error/30 rounded-lg text-xs text-tvp-status-error">
          {error} — <button onClick={fetchStats} className="underline">Retry</button>
        </div>
      )}

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => <MetricSkeleton key={i} />)
        ) : (
          <>
            {/* Revenue MTD */}
            <div className="p-3 bg-tvp-bg-tertiary rounded-lg">
              <div className="flex items-center gap-2 text-tvp-text-muted text-xs mb-1">
                <DollarSign className="w-3 h-3" />
                Revenue MTD
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xl font-bold text-tvp-text-primary">
                  ${(stats?.revenueThisMonth ?? 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </span>
              </div>
            </div>

            {/* Total Users */}
            <div className="p-3 bg-tvp-bg-tertiary rounded-lg">
              <div className="flex items-center gap-2 text-tvp-text-muted text-xs mb-1">
                <Users className="w-3 h-3" />
                Total Users
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xl font-bold text-tvp-text-primary">
                  {(stats?.totalUsers ?? 0).toLocaleString()}
                </span>
                <span className="flex items-center gap-0.5 text-xs text-tvp-status-success">
                  <TrendingUp className="w-3 h-3" />
                  +{stats?.newUsersThisWeek ?? 0}
                </span>
              </div>
            </div>

            {/* Downloads Today */}
            <div className="p-3 bg-tvp-bg-tertiary rounded-lg">
              <div className="flex items-center gap-2 text-tvp-text-muted text-xs mb-1">
                <Download className="w-3 h-3" />
                Downloads Today
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xl font-bold text-tvp-text-primary">
                  {(stats?.downloadsToday ?? 0).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Conversion Rate */}
            <div className="p-3 bg-tvp-bg-tertiary rounded-lg">
              <div className="flex items-center gap-2 text-tvp-text-muted text-xs mb-1">
                <Activity className="w-3 h-3" />
                Free → Paid
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xl font-bold text-tvp-accent-cyan">
                  {conversionRate}%
                </span>
              </div>
            </div>

            {/* Active Subscribers */}
            <div className="p-3 bg-tvp-bg-tertiary rounded-lg">
              <div className="flex items-center gap-2 text-tvp-text-muted text-xs mb-1">
                <Users className="w-3 h-3" />
                Paid Subscribers
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xl font-bold text-tvp-text-primary">
                  {(stats?.activeSubscribers ?? 0).toLocaleString()}
                </span>
              </div>
            </div>

            {/* New This Week */}
            <div className="p-3 bg-tvp-bg-tertiary rounded-lg">
              <div className="flex items-center gap-2 text-tvp-text-muted text-xs mb-1">
                <Target className="w-3 h-3" />
                New This Week
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xl font-bold text-tvp-accent-purple">
                  +{(stats?.newUsersThisWeek ?? 0).toLocaleString()}
                </span>
                <span className="text-xs text-tvp-text-muted">
                  users
                </span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Alerts derived from real data */}
      {!loading && alerts.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-tvp-text-secondary">Insights & Alerts</h3>
          {alerts.map((alert, idx) => {
            const Icon = alert.icon;
            return (
              <div
                key={idx}
                className={clsx(
                  'flex items-center gap-3 p-2 rounded-lg text-sm',
                  alert.type === 'success' && 'bg-tvp-status-success/10 text-tvp-status-success',
                  alert.type === 'warning' && 'bg-tvp-status-warning/10 text-tvp-status-warning',
                  alert.type === 'info' && 'bg-tvp-accent-cyan/10 text-tvp-accent-cyan'
                )}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span>{alert.message}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

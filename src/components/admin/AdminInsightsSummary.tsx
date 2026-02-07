// ============================================
// THE VIDEO POOL - ADMIN INSIGHTS SUMMARY WIDGET
// Compact BI metrics for admin dashboard overview
// ============================================

import { useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  Activity,
  Download,
  UserPlus,
  ArrowRight,
  Zap,
  Target,
} from 'lucide-react';
import { clsx } from 'clsx';

// Mock data (same source as InsightsPage)
const mockMetrics = {
  mrr: 89420,
  mrrChange: 8.4,
  activeUsers: 1847,
  usersChange: 12.3,
  downloads: 3456,
  downloadsChange: 5.2,
  trialConversion: 34.2,
  conversionChange: 2.1,
  churnRate: 2.8,
  churnChange: -0.4,
  nps: 72,
};

const mockRealtime = {
  activeNow: 247,
  searchesPerMin: 12,
  downloadsInProgress: 18,
};

const mockAlerts = [
  { type: 'success', message: 'MRR up 8.4% this month', icon: TrendingUp },
  { type: 'warning', message: 'Set Builder adoption below target (42%)', icon: Target },
  { type: 'info', message: '312 new signups this week', icon: UserPlus },
];

export default function AdminInsightsSummary() {
  const navigate = useNavigate();

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
            <span className="text-sm font-medium text-tvp-text-primary">
              {mockRealtime.activeNow} online
            </span>
          </div>
          <div className="text-sm text-tvp-text-muted">
            {mockRealtime.searchesPerMin} searches/min
          </div>
          <div className="text-sm text-tvp-text-muted">
            {mockRealtime.downloadsInProgress} downloads active
          </div>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {/* MRR */}
        <div className="p-3 bg-tvp-bg-tertiary rounded-lg">
          <div className="flex items-center gap-2 text-tvp-text-muted text-xs mb-1">
            <DollarSign className="w-3 h-3" />
            MRR
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xl font-bold text-tvp-text-primary">
              ${mockMetrics.mrr.toLocaleString()}
            </span>
            <span className={clsx(
              'flex items-center gap-0.5 text-xs',
              mockMetrics.mrrChange >= 0 ? 'text-tvp-status-success' : 'text-tvp-status-error'
            )}>
              {mockMetrics.mrrChange >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {mockMetrics.mrrChange}%
            </span>
          </div>
        </div>

        {/* DAU */}
        <div className="p-3 bg-tvp-bg-tertiary rounded-lg">
          <div className="flex items-center gap-2 text-tvp-text-muted text-xs mb-1">
            <Users className="w-3 h-3" />
            Daily Active
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xl font-bold text-tvp-text-primary">
              {mockMetrics.activeUsers.toLocaleString()}
            </span>
            <span className={clsx(
              'flex items-center gap-0.5 text-xs',
              mockMetrics.usersChange >= 0 ? 'text-tvp-status-success' : 'text-tvp-status-error'
            )}>
              {mockMetrics.usersChange >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {mockMetrics.usersChange}%
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
              {mockMetrics.downloads.toLocaleString()}
            </span>
            <span className={clsx(
              'flex items-center gap-0.5 text-xs',
              mockMetrics.downloadsChange >= 0 ? 'text-tvp-status-success' : 'text-tvp-status-error'
            )}>
              {mockMetrics.downloadsChange >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {mockMetrics.downloadsChange}%
            </span>
          </div>
        </div>

        {/* Trial Conversion */}
        <div className="p-3 bg-tvp-bg-tertiary rounded-lg">
          <div className="flex items-center gap-2 text-tvp-text-muted text-xs mb-1">
            <Activity className="w-3 h-3" />
            Trial → Paid
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xl font-bold text-tvp-accent-cyan">
              {mockMetrics.trialConversion}%
            </span>
            <span className={clsx(
              'flex items-center gap-0.5 text-xs',
              mockMetrics.conversionChange >= 0 ? 'text-tvp-status-success' : 'text-tvp-status-error'
            )}>
              {mockMetrics.conversionChange >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {mockMetrics.conversionChange}%
            </span>
          </div>
        </div>

        {/* Churn */}
        <div className="p-3 bg-tvp-bg-tertiary rounded-lg">
          <div className="flex items-center gap-2 text-tvp-text-muted text-xs mb-1">
            <Users className="w-3 h-3" />
            Churn Rate
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xl font-bold text-tvp-text-primary">
              {mockMetrics.churnRate}%
            </span>
            <span className={clsx(
              'flex items-center gap-0.5 text-xs',
              mockMetrics.churnChange <= 0 ? 'text-tvp-status-success' : 'text-tvp-status-error'
            )}>
              {mockMetrics.churnChange <= 0 ? <TrendingDown className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
              {Math.abs(mockMetrics.churnChange)}%
            </span>
          </div>
        </div>

        {/* NPS */}
        <div className="p-3 bg-tvp-bg-tertiary rounded-lg">
          <div className="flex items-center gap-2 text-tvp-text-muted text-xs mb-1">
            <Target className="w-3 h-3" />
            NPS Score
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xl font-bold text-tvp-accent-purple">
              {mockMetrics.nps}
            </span>
            <span className="text-xs text-tvp-text-muted">
              Excellent
            </span>
          </div>
        </div>
      </div>

      {/* Alerts */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-tvp-text-secondary">Insights & Alerts</h3>
        {mockAlerts.map((alert, idx) => {
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
    </div>
  );
}

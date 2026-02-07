// ============================================
// THE VIDEO POOL - ADMIN ANALYTICS TAB
// Charts and metrics visualization
// ============================================

import { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Download,
  Users,
  Video,
  DollarSign,
  Calendar,
  BarChart3,
  PieChart,
  Activity,
} from 'lucide-react';
import { clsx } from 'clsx';

type TimeRange = '7d' | '30d' | '90d' | '1y';

// Mock analytics data
const mockData = {
  downloads: {
    total: 128456,
    change: 12.5,
    trend: 'up' as const,
    byDay: [320, 450, 380, 520, 480, 610, 550, 490, 620, 580, 710, 680, 750, 720],
  },
  users: {
    total: 12458,
    newThisMonth: 342,
    change: 8.3,
    trend: 'up' as const,
    activeToday: 1847,
  },
  revenue: {
    total: 124580,
    change: 15.2,
    trend: 'up' as const,
    byPlan: {
      monthly: 45230,
      annual: 62350,
      lifetime: 17000,
    },
  },
  topGenres: [
    { name: 'Pop', downloads: 32450, percentage: 25 },
    { name: 'Hip-Hop', downloads: 28120, percentage: 22 },
    { name: 'EDM', downloads: 24680, percentage: 19 },
    { name: 'Latin', downloads: 18940, percentage: 15 },
    { name: 'Rock', downloads: 12840, percentage: 10 },
    { name: 'Other', downloads: 11426, percentage: 9 },
  ],
  topVideos: [
    { title: 'Flowers', artist: 'Miley Cyrus', downloads: 16800 },
    { title: 'Blinding Lights', artist: 'The Weeknd', downloads: 15420 },
    { title: 'Levitating', artist: 'Dua Lipa', downloads: 12800 },
    { title: 'As It Was', artist: 'Harry Styles', downloads: 11200 },
    { title: 'Anti-Hero', artist: 'Taylor Swift', downloads: 10500 },
  ],
  peakHours: [
    { hour: '6am', downloads: 120 },
    { hour: '9am', downloads: 340 },
    { hour: '12pm', downloads: 580 },
    { hour: '3pm', downloads: 720 },
    { hour: '6pm', downloads: 890 },
    { hour: '9pm', downloads: 1120 },
    { hour: '12am', downloads: 650 },
    { hour: '3am', downloads: 180 },
  ],
};

export default function AdminAnalytics() {
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');

  // Simple bar chart renderer
  const renderBarChart = (data: number[], maxHeight: number = 60) => {
    const max = Math.max(...data);
    return (
      <div className="flex items-end gap-1 h-16">
        {data.map((value, idx) => (
          <div
            key={idx}
            className="flex-1 bg-tvp-accent-cyan/60 hover:bg-tvp-accent-cyan rounded-t transition-colors"
            style={{ height: `${(value / max) * maxHeight}px` }}
            title={value.toLocaleString()}
          />
        ))}
      </div>
    );
  };

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

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Downloads */}
        <div className="p-4 bg-tvp-bg-secondary border border-tvp-border-subtle rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-tvp-text-muted text-xs">
              <Download className="w-4 h-4" />
              Total Downloads
            </div>
            <div className={clsx(
              'flex items-center gap-1 text-xs',
              mockData.downloads.trend === 'up' ? 'text-tvp-status-success' : 'text-tvp-status-error'
            )}>
              {mockData.downloads.trend === 'up' ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              {mockData.downloads.change}%
            </div>
          </div>
          <p className="text-2xl font-semibold text-tvp-text-primary mb-3">
            {mockData.downloads.total.toLocaleString()}
          </p>
          {renderBarChart(mockData.downloads.byDay)}
        </div>

        {/* Users */}
        <div className="p-4 bg-tvp-bg-secondary border border-tvp-border-subtle rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-tvp-text-muted text-xs">
              <Users className="w-4 h-4" />
              Total Users
            </div>
            <div className={clsx(
              'flex items-center gap-1 text-xs',
              mockData.users.trend === 'up' ? 'text-tvp-status-success' : 'text-tvp-status-error'
            )}>
              {mockData.users.trend === 'up' ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              {mockData.users.change}%
            </div>
          </div>
          <p className="text-2xl font-semibold text-tvp-text-primary">
            {mockData.users.total.toLocaleString()}
          </p>
          <div className="mt-2 flex items-center gap-4 text-xs">
            <span className="text-tvp-text-muted">
              <span className="text-tvp-status-success">+{mockData.users.newThisMonth}</span> this month
            </span>
            <span className="text-tvp-text-muted">
              <span className="text-tvp-accent-cyan">{mockData.users.activeToday}</span> active today
            </span>
          </div>
        </div>

        {/* Revenue */}
        <div className="p-4 bg-tvp-bg-secondary border border-tvp-border-subtle rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-tvp-text-muted text-xs">
              <DollarSign className="w-4 h-4" />
              Revenue (MTD)
            </div>
            <div className={clsx(
              'flex items-center gap-1 text-xs',
              mockData.revenue.trend === 'up' ? 'text-tvp-status-success' : 'text-tvp-status-error'
            )}>
              {mockData.revenue.trend === 'up' ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              {mockData.revenue.change}%
            </div>
          </div>
          <p className="text-2xl font-semibold text-tvp-accent-gold">
            ${mockData.revenue.total.toLocaleString()}
          </p>
          <div className="mt-3 space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-tvp-text-muted">Monthly</span>
              <span className="text-tvp-text-secondary">${mockData.revenue.byPlan.monthly.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-tvp-text-muted">Annual</span>
              <span className="text-tvp-text-secondary">${mockData.revenue.byPlan.annual.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-tvp-text-muted">Lifetime</span>
              <span className="text-tvp-text-secondary">${mockData.revenue.byPlan.lifetime.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Peak Activity */}
        <div className="p-4 bg-tvp-bg-secondary border border-tvp-border-subtle rounded-xl">
          <div className="flex items-center gap-2 text-tvp-text-muted text-xs mb-2">
            <Activity className="w-4 h-4" />
            Peak Activity Hours
          </div>
          <div className="flex items-end gap-1 h-16 mb-2">
            {mockData.peakHours.map((item, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full bg-tvp-accent-purple/60 hover:bg-tvp-accent-purple rounded-t transition-colors"
                  style={{ height: `${(item.downloads / 1120) * 48}px` }}
                  title={`${item.downloads} downloads`}
                />
              </div>
            ))}
          </div>
          <div className="flex justify-between text-[10px] text-tvp-text-muted">
            {mockData.peakHours.map((item, idx) => (
              <span key={idx}>{item.hour}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Top Genres */}
        <div className="p-4 bg-tvp-bg-secondary border border-tvp-border-subtle rounded-xl">
          <div className="flex items-center gap-2 text-tvp-text-muted text-xs mb-4">
            <PieChart className="w-4 h-4" />
            <span className="font-medium text-tvp-text-primary text-sm">Downloads by Genre</span>
          </div>
          <div className="space-y-3">
            {mockData.topGenres.map((genre, idx) => (
              <div key={genre.name}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-tvp-text-secondary">{genre.name}</span>
                  <span className="text-tvp-text-muted">{genre.downloads.toLocaleString()}</span>
                </div>
                <div className="h-2 bg-tvp-bg-tertiary rounded-full overflow-hidden">
                  <div
                    className={clsx(
                      'h-full rounded-full transition-all',
                      idx === 0 ? 'bg-tvp-accent-cyan' :
                      idx === 1 ? 'bg-tvp-accent-purple' :
                      idx === 2 ? 'bg-tvp-accent-coral' :
                      idx === 3 ? 'bg-amber-500' :
                      idx === 4 ? 'bg-tvp-status-success' :
                      'bg-tvp-text-muted'
                    )}
                    style={{ width: `${genre.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Videos */}
        <div className="p-4 bg-tvp-bg-secondary border border-tvp-border-subtle rounded-xl">
          <div className="flex items-center gap-2 text-tvp-text-muted text-xs mb-4">
            <BarChart3 className="w-4 h-4" />
            <span className="font-medium text-tvp-text-primary text-sm">Top Downloaded Videos</span>
          </div>
          <div className="space-y-3">
            {mockData.topVideos.map((video, idx) => (
              <div
                key={video.title}
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
                  {video.downloads.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Conversion Funnel */}
      <div className="p-4 bg-tvp-bg-secondary border border-tvp-border-subtle rounded-xl">
        <div className="flex items-center gap-2 text-tvp-text-muted text-xs mb-4">
          <TrendingUp className="w-4 h-4" />
          <span className="font-medium text-tvp-text-primary text-sm">Conversion Funnel</span>
        </div>
        <div className="flex items-center gap-4">
          {[
            { label: 'Visitors', value: 45680, color: 'bg-tvp-text-muted' },
            { label: 'Sign Ups', value: 12458, color: 'bg-tvp-accent-purple' },
            { label: 'Trial Users', value: 4218, color: 'bg-tvp-accent-cyan' },
            { label: 'Subscribers', value: 8234, color: 'bg-tvp-status-success' },
          ].map((step, idx, arr) => (
            <div key={step.label} className="flex-1">
              <div className="relative">
                <div className="h-12 rounded-lg bg-tvp-bg-tertiary overflow-hidden">
                  <div
                    className={clsx('h-full', step.color)}
                    style={{ width: `${(step.value / arr[0].value) * 100}%` }}
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
                {idx > 0 && (
                  <p className="text-[10px] text-tvp-accent-cyan">
                    {((step.value / arr[idx - 1].value) * 100).toFixed(1)}% conv.
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

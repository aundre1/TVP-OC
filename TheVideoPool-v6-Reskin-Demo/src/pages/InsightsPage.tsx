// ============================================
// THE VIDEO POOL - BUSINESS INTELLIGENCE DASHBOARD
// Comprehensive analytics for site viability and DJ adoption
// Integrates: Google Analytics, Mixpanel, Stripe
// ============================================

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  TrendingDown,
  Users,
  Download,
  DollarSign,
  Clock,
  Globe,
  Music,
  BarChart3,
  PieChart,
  Activity,
  Calendar,
  RefreshCw,
  FileDown,
  Mail,
  FileText,
  ChevronDown,
  Zap,
  Target,
  Percent,
  ArrowRight,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  MousePointer,
  Timer,
  Repeat,
  UserPlus,
  UserMinus,
  CreditCard,
  Map,
  Disc3,
  Radio,
  ListMusic,
  Share2,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { clsx } from 'clsx';

// Types
type TimeRange = 'today' | '7d' | '30d' | '90d' | '1y' | 'all';
type ViewMode = 'realtime' | 'historical';

// Mock data - In production, these come from analytics APIs
const mockRealtimeData = {
  activeUsers: 247,
  activeSessionDuration: '4:32',
  downloadsInProgress: 18,
  searchesPerMinute: 12,
  topCurrentPage: '/browse/pop',
  peakToday: 412,
};

const mockExecutiveMetrics = {
  mrr: 89420,
  mrrChange: 8.4,
  arr: 1073040,
  totalUsers: 12458,
  usersChange: 12.3,
  activeSubscribers: 8234,
  subscribersChange: 5.7,
  churnRate: 2.8,
  churnChange: -0.4,
  ltv: 342,
  ltvChange: 15.2,
  arpu: 10.86,
  arpuChange: 3.2,
  nps: 72,
  npsChange: 4,
};

const mockAcquisitionData = {
  signupsToday: 47,
  signupsThisWeek: 312,
  signupsThisMonth: 1248,
  trialConversion: 34.2,
  conversionChange: 2.1,
  sources: [
    { name: 'Organic Search', users: 4820, percentage: 38.7 },
    { name: 'Direct', users: 3112, percentage: 25.0 },
    { name: 'Social Media', users: 2180, percentage: 17.5 },
    { name: 'Referral', users: 1496, percentage: 12.0 },
    { name: 'Paid Ads', users: 850, percentage: 6.8 },
  ],
  topReferrers: [
    { domain: 'reddit.com/r/DJs', visits: 892 },
    { domain: 'facebook.com', visits: 654 },
    { domain: 'instagram.com', visits: 423 },
    { domain: 'twitter.com', visits: 211 },
  ],
};

const mockEngagementData = {
  dau: 1847,
  wau: 5623,
  mau: 9812,
  dauMauRatio: 18.8,
  avgSessionDuration: '8:42',
  sessionsPerUser: 3.4,
  bounceRate: 24.3,
  returnRate: 67.2,
  funnel: [
    { stage: 'Visit', count: 45680, percentage: 100 },
    { stage: 'Search', count: 32140, percentage: 70.4 },
    { stage: 'Preview', count: 18920, percentage: 41.4 },
    { stage: 'Download', count: 8456, percentage: 18.5 },
    { stage: 'Return', count: 5672, percentage: 12.4 },
  ],
  featureAdoption: [
    { feature: 'Set Builder', adoption: 42.3, trend: 'up' },
    { feature: 'BPM Filter', adoption: 68.7, trend: 'up' },
    { feature: 'Key Filter', adoption: 51.2, trend: 'up' },
    { feature: 'Batch Download', adoption: 23.8, trend: 'stable' },
    { feature: 'Share Sets', adoption: 15.4, trend: 'down' },
  ],
};

const mockContentData = {
  totalVideos: 45678,
  videosAddedThisMonth: 342,
  catalogUtilization: 72.4,
  staleContent: 1247,
  topDownloads: [
    { title: 'Flowers', artist: 'Miley Cyrus', downloads: 16800, trend: 12 },
    { title: 'Blinding Lights', artist: 'The Weeknd', downloads: 15420, trend: -3 },
    { title: 'Levitating', artist: 'Dua Lipa', downloads: 12800, trend: 5 },
    { title: 'As It Was', artist: 'Harry Styles', downloads: 11200, trend: 8 },
    { title: 'Anti-Hero', artist: 'Taylor Swift', downloads: 10500, trend: -1 },
  ],
  genreDistribution: [
    { genre: 'Pop', downloads: 32450, percentage: 28.4 },
    { genre: 'Hip-Hop', downloads: 28120, percentage: 24.6 },
    { genre: 'EDM', downloads: 24680, percentage: 21.6 },
    { genre: 'Latin', downloads: 14940, percentage: 13.1 },
    { genre: 'R&B', downloads: 8840, percentage: 7.7 },
    { genre: 'Other', downloads: 5270, percentage: 4.6 },
  ],
  releaseYearBreakdown: [
    { year: '2024+', percentage: 42 },
    { year: '2020-2023', percentage: 35 },
    { year: '2015-2019', percentage: 15 },
    { year: 'Classic', percentage: 8 },
  ],
};

const mockDJBehaviorData = {
  bpmDistribution: [
    { range: '70-90', percentage: 8, label: 'Slow' },
    { range: '90-110', percentage: 22, label: 'Hip-Hop/R&B' },
    { range: '110-125', percentage: 28, label: 'Pop/House' },
    { range: '125-140', percentage: 25, label: 'EDM' },
    { range: '140-160', percentage: 12, label: 'D&B/Fast' },
    { range: '160+', percentage: 5, label: 'Extreme' },
  ],
  topKeys: [
    { key: 'Am', camelot: '8A', downloads: 8420 },
    { key: 'G', camelot: '9B', downloads: 7890 },
    { key: 'C', camelot: '8B', downloads: 7234 },
    { key: 'Em', camelot: '9A', downloads: 6891 },
    { key: 'Dm', camelot: '7A', downloads: 6543 },
  ],
  versionPreferences: [
    { version: 'Clean', percentage: 45.2 },
    { version: 'Explicit', percentage: 28.7 },
    { version: 'Extended', percentage: 15.4 },
    { version: 'Intro/Outro', percentage: 7.8 },
    { version: 'Quick Hit', percentage: 2.9 },
  ],
  qualityUsage: [
    { quality: '1080p', percentage: 52.3, color: 'tvp-accent-cyan' },
    { quality: '720p', percentage: 28.4, color: 'tvp-text-muted' },
    { quality: '4K', percentage: 12.1, color: 'amber-400' },
    { quality: '480p', percentage: 7.2, color: 'tvp-text-muted' },
  ],
  setBuilderStats: {
    totalSets: 3421,
    avgTracksPerSet: 12.4,
    completionRate: 68.2,
    sharesPerSet: 2.3,
  },
  exportFormats: [
    { format: 'M3U', usage: 48.2 },
    { format: 'CSV', usage: 32.5 },
    { format: 'TXT', usage: 19.3 },
  ],
  peakHours: [
    { hour: '6am', users: 120 },
    { hour: '9am', users: 340 },
    { hour: '12pm', users: 580 },
    { hour: '3pm', users: 720 },
    { hour: '6pm', users: 890 },
    { hour: '9pm', users: 1120 },
    { hour: '12am', users: 650 },
    { hour: '3am', users: 180 },
  ],
};

const mockRevenueData = {
  revenueByTier: [
    { tier: 'Monthly', revenue: 45230, subscribers: 4180, color: 'tvp-accent-cyan' },
    { tier: 'Annual', revenue: 62350, subscribers: 3540, color: 'tvp-accent-purple' },
    { tier: 'Lifetime', revenue: 17000, subscribers: 514, color: 'amber-400' },
  ],
  churnByTier: [
    { tier: 'Monthly', rate: 4.2 },
    { tier: 'Annual', rate: 1.8 },
    { tier: 'Lifetime', rate: 0 },
  ],
  upgradeDowngrade: {
    upgrades: 234,
    downgrades: 89,
    netMovement: 145,
  },
  paymentMethods: [
    { method: 'Credit Card', percentage: 72.3 },
    { method: 'PayPal', percentage: 18.4 },
    { method: 'Apple Pay', percentage: 6.2 },
    { method: 'Google Pay', percentage: 3.1 },
  ],
};

const mockGeographicData = {
  topCountries: [
    { country: 'United States', users: 5234, revenue: 52340, flag: '🇺🇸' },
    { country: 'United Kingdom', users: 1892, revenue: 18920, flag: '🇬🇧' },
    { country: 'Germany', users: 1245, revenue: 12450, flag: '🇩🇪' },
    { country: 'Canada', users: 1123, revenue: 11230, flag: '🇨🇦' },
    { country: 'Australia', users: 987, revenue: 9870, flag: '🇦🇺' },
    { country: 'Netherlands', users: 654, revenue: 6540, flag: '🇳🇱' },
    { country: 'France', users: 543, revenue: 5430, flag: '🇫🇷' },
    { country: 'Spain', users: 432, revenue: 4320, flag: '🇪🇸' },
  ],
  regionBreakdown: [
    { region: 'North America', percentage: 52 },
    { region: 'Europe', percentage: 31 },
    { region: 'Asia Pacific', percentage: 10 },
    { region: 'Latin America', percentage: 5 },
    { region: 'Other', percentage: 2 },
  ],
};

// Helper components
function MetricCard({
  title,
  value,
  change,
  changeLabel = 'vs last period',
  icon: Icon,
  format = 'number',
  size = 'normal',
}: {
  title: string;
  value: number | string;
  change?: number;
  changeLabel?: string;
  icon: React.ElementType;
  format?: 'number' | 'currency' | 'percent';
  size?: 'normal' | 'large';
}) {
  const formatValue = (v: number | string) => {
    if (typeof v === 'string') return v;
    switch (format) {
      case 'currency':
        return `$${v.toLocaleString()}`;
      case 'percent':
        return `${v}%`;
      default:
        return v.toLocaleString();
    }
  };

  return (
    <div className={clsx(
      'p-4 bg-tvp-bg-secondary border border-tvp-border-subtle rounded-xl',
      size === 'large' && 'p-6'
    )}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 text-tvp-text-muted text-xs">
          <Icon className="w-4 h-4" />
          {title}
        </div>
        {change !== undefined && (
          <div className={clsx(
            'flex items-center gap-1 text-xs',
            change >= 0 ? 'text-tvp-status-success' : 'text-tvp-status-error'
          )}>
            {change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {change >= 0 ? '+' : ''}{change}%
          </div>
        )}
      </div>
      <p className={clsx(
        'font-semibold text-tvp-text-primary',
        size === 'large' ? 'text-3xl' : 'text-2xl'
      )}>
        {formatValue(value)}
      </p>
      {change !== undefined && (
        <p className="text-xs text-tvp-text-muted mt-1">{changeLabel}</p>
      )}
    </div>
  );
}

function ProgressBar({
  value,
  max = 100,
  color = 'bg-tvp-accent-cyan',
  showLabel = true,
}: {
  value: number;
  max?: number;
  color?: string;
  showLabel?: boolean;
}) {
  const percentage = (value / max) * 100;
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-tvp-bg-tertiary rounded-full overflow-hidden">
        <div
          className={clsx('h-full rounded-full transition-all', color)}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-xs text-tvp-text-muted w-12 text-right">
          {value.toFixed(1)}%
        </span>
      )}
    </div>
  );
}

function MiniChart({ data, height = 40 }: { data: number[]; height?: number }) {
  const max = Math.max(...data);
  return (
    <div className="flex items-end gap-0.5" style={{ height }}>
      {data.map((value, idx) => (
        <div
          key={idx}
          className="flex-1 bg-tvp-accent-cyan/60 hover:bg-tvp-accent-cyan rounded-t transition-colors"
          style={{ height: `${(value / max) * height}px` }}
        />
      ))}
    </div>
  );
}

export default function InsightsPage() {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');
  const [viewMode, setViewMode] = useState<ViewMode>('historical');
  const [activeSection, setActiveSection] = useState<string>('executive');
  const [isExporting, setIsExporting] = useState(false);

  // Redirect non-admins
  if (!isAdmin) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-16 text-center">
        <BarChart3 className="w-16 h-16 text-tvp-accent-coral mx-auto mb-4" />
        <h1 className="text-2xl font-semibold text-tvp-text-primary mb-2">Access Denied</h1>
        <p className="text-tvp-text-secondary mb-6">
          Business Intelligence Dashboard is only available to administrators.
        </p>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-3 bg-tvp-accent-cyan hover:bg-tvp-accent-cyan-hover text-tvp-bg-primary font-medium rounded-xl transition-colors"
        >
          Return to Home
        </button>
      </div>
    );
  }

  const handleExport = (format: 'csv' | 'pdf' | 'email') => {
    setIsExporting(true);
    // Simulate export
    setTimeout(() => {
      setIsExporting(false);
      alert(`Exported as ${format.toUpperCase()}`);
    }, 1500);
  };

  const sections = [
    { id: 'executive', label: 'Executive Summary', icon: BarChart3 },
    { id: 'acquisition', label: 'User Acquisition', icon: UserPlus },
    { id: 'engagement', label: 'Engagement', icon: Activity },
    { id: 'content', label: 'Content Performance', icon: Music },
    { id: 'dj', label: 'DJ Behavior', icon: Disc3 },
    { id: 'revenue', label: 'Revenue', icon: DollarSign },
    { id: 'geographic', label: 'Geographic', icon: Globe },
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-semibold text-tvp-text-primary">Business Intelligence</h1>
          <p className="text-tvp-text-secondary mt-1">
            Site viability, DJ adoption, and performance metrics
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* View Mode Toggle */}
          <div className="flex bg-tvp-bg-tertiary rounded-lg p-1">
            <button
              onClick={() => setViewMode('realtime')}
              className={clsx(
                'px-3 py-1.5 text-sm rounded-md transition-colors flex items-center gap-2',
                viewMode === 'realtime'
                  ? 'bg-tvp-accent-cyan text-tvp-bg-primary'
                  : 'text-tvp-text-secondary hover:text-tvp-text-primary'
              )}
            >
              <Zap className="w-3 h-3" />
              Real-time
            </button>
            <button
              onClick={() => setViewMode('historical')}
              className={clsx(
                'px-3 py-1.5 text-sm rounded-md transition-colors flex items-center gap-2',
                viewMode === 'historical'
                  ? 'bg-tvp-accent-cyan text-tvp-bg-primary'
                  : 'text-tvp-text-secondary hover:text-tvp-text-primary'
              )}
            >
              <Calendar className="w-3 h-3" />
              Historical
            </button>
          </div>

          {/* Time Range (only for historical) */}
          {viewMode === 'historical' && (
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as TimeRange)}
              className="px-3 py-2 bg-tvp-bg-tertiary border border-tvp-border-subtle rounded-lg text-tvp-text-primary text-sm"
            >
              <option value="today">Today</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
              <option value="1y">Last Year</option>
              <option value="all">All Time</option>
            </select>
          )}

          {/* Export Dropdown */}
          <div className="relative group">
            <button className="flex items-center gap-2 px-4 py-2 bg-tvp-bg-tertiary hover:bg-tvp-bg-elevated text-tvp-text-secondary rounded-lg transition-colors">
              <FileDown className="w-4 h-4" />
              Export
              <ChevronDown className="w-3 h-3" />
            </button>
            <div className="absolute right-0 top-full mt-1 w-48 bg-tvp-bg-secondary border border-tvp-border-default rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20">
              <button
                onClick={() => handleExport('csv')}
                className="w-full px-4 py-2 text-left text-sm text-tvp-text-secondary hover:bg-tvp-bg-tertiary flex items-center gap-2"
              >
                <FileText className="w-4 h-4" />
                Export CSV
              </button>
              <button
                onClick={() => handleExport('pdf')}
                className="w-full px-4 py-2 text-left text-sm text-tvp-text-secondary hover:bg-tvp-bg-tertiary flex items-center gap-2"
              >
                <FileDown className="w-4 h-4" />
                Export PDF
              </button>
              <button
                onClick={() => handleExport('email')}
                className="w-full px-4 py-2 text-left text-sm text-tvp-text-secondary hover:bg-tvp-bg-tertiary flex items-center gap-2"
              >
                <Mail className="w-4 h-4" />
                Schedule Email Report
              </button>
            </div>
          </div>

          <button className="p-2 bg-tvp-bg-tertiary hover:bg-tvp-bg-elevated text-tvp-text-muted rounded-lg transition-colors">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Real-time Banner (when in real-time mode) */}
      {viewMode === 'realtime' && (
        <div className="mb-6 p-4 bg-tvp-accent-cyan/10 border border-tvp-accent-cyan/30 rounded-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-tvp-status-success rounded-full animate-pulse" />
                <span className="text-sm font-medium text-tvp-text-primary">
                  {mockRealtimeData.activeUsers} users online now
                </span>
              </div>
              <div className="text-sm text-tvp-text-muted">
                Avg session: {mockRealtimeData.activeSessionDuration}
              </div>
              <div className="text-sm text-tvp-text-muted">
                {mockRealtimeData.downloadsInProgress} downloads in progress
              </div>
              <div className="text-sm text-tvp-text-muted">
                {mockRealtimeData.searchesPerMinute} searches/min
              </div>
            </div>
            <div className="text-sm text-tvp-text-muted">
              Peak today: {mockRealtimeData.peakToday} users
            </div>
          </div>
        </div>
      )}

      {/* Section Navigation */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={clsx(
                'flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors',
                activeSection === section.id
                  ? 'bg-tvp-accent-cyan text-tvp-bg-primary'
                  : 'bg-tvp-bg-tertiary text-tvp-text-secondary hover:text-tvp-text-primary'
              )}
            >
              <Icon className="w-4 h-4" />
              {section.label}
            </button>
          );
        })}
      </div>

      {/* Executive Summary Section */}
      {activeSection === 'executive' && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <MetricCard
              title="MRR"
              value={mockExecutiveMetrics.mrr}
              change={mockExecutiveMetrics.mrrChange}
              icon={DollarSign}
              format="currency"
            />
            <MetricCard
              title="ARR"
              value={mockExecutiveMetrics.arr}
              icon={DollarSign}
              format="currency"
            />
            <MetricCard
              title="Total Users"
              value={mockExecutiveMetrics.totalUsers}
              change={mockExecutiveMetrics.usersChange}
              icon={Users}
            />
            <MetricCard
              title="Subscribers"
              value={mockExecutiveMetrics.activeSubscribers}
              change={mockExecutiveMetrics.subscribersChange}
              icon={CreditCard}
            />
            <MetricCard
              title="Churn Rate"
              value={mockExecutiveMetrics.churnRate}
              change={mockExecutiveMetrics.churnChange}
              icon={UserMinus}
              format="percent"
            />
            <MetricCard
              title="NPS Score"
              value={mockExecutiveMetrics.nps}
              change={mockExecutiveMetrics.npsChange}
              icon={Target}
            />
          </div>

          {/* LTV and ARPU */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-6 bg-tvp-bg-secondary border border-tvp-border-subtle rounded-xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-tvp-text-primary">Customer Lifetime Value</h3>
                <span className={clsx(
                  'flex items-center gap-1 text-sm',
                  mockExecutiveMetrics.ltvChange >= 0 ? 'text-tvp-status-success' : 'text-tvp-status-error'
                )}>
                  <TrendingUp className="w-4 h-4" />
                  +{mockExecutiveMetrics.ltvChange}%
                </span>
              </div>
              <p className="text-4xl font-bold text-tvp-accent-cyan">${mockExecutiveMetrics.ltv}</p>
              <p className="text-sm text-tvp-text-muted mt-2">Average revenue per customer lifetime</p>
            </div>
            <div className="p-6 bg-tvp-bg-secondary border border-tvp-border-subtle rounded-xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-tvp-text-primary">ARPU (Monthly)</h3>
                <span className={clsx(
                  'flex items-center gap-1 text-sm',
                  mockExecutiveMetrics.arpuChange >= 0 ? 'text-tvp-status-success' : 'text-tvp-status-error'
                )}>
                  <TrendingUp className="w-4 h-4" />
                  +{mockExecutiveMetrics.arpuChange}%
                </span>
              </div>
              <p className="text-4xl font-bold text-tvp-accent-purple">${mockExecutiveMetrics.arpu}</p>
              <p className="text-sm text-tvp-text-muted mt-2">Average revenue per user per month</p>
            </div>
          </div>

          {/* Quick Health Indicators */}
          <div className="p-6 bg-tvp-bg-secondary border border-tvp-border-subtle rounded-xl">
            <h3 className="font-semibold text-tvp-text-primary mb-4">Platform Health Indicators</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-tvp-status-success" />
                <div>
                  <p className="text-sm font-medium text-tvp-text-primary">Conversion</p>
                  <p className="text-xs text-tvp-text-muted">34.2% trial → paid</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-tvp-status-success" />
                <div>
                  <p className="text-sm font-medium text-tvp-text-primary">Retention</p>
                  <p className="text-xs text-tvp-text-muted">67.2% return rate</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-6 h-6 text-tvp-status-warning" />
                <div>
                  <p className="text-sm font-medium text-tvp-text-primary">Engagement</p>
                  <p className="text-xs text-tvp-text-muted">18.8% DAU/MAU</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-tvp-status-success" />
                <div>
                  <p className="text-sm font-medium text-tvp-text-primary">Churn</p>
                  <p className="text-xs text-tvp-text-muted">2.8% monthly</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* User Acquisition Section */}
      {activeSection === 'acquisition' && (
        <div className="space-y-6">
          {/* Signup Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MetricCard title="Signups Today" value={mockAcquisitionData.signupsToday} icon={UserPlus} />
            <MetricCard title="Signups This Week" value={mockAcquisitionData.signupsThisWeek} icon={UserPlus} />
            <MetricCard title="Signups This Month" value={mockAcquisitionData.signupsThisMonth} icon={UserPlus} />
            <MetricCard
              title="Trial Conversion"
              value={mockAcquisitionData.trialConversion}
              change={mockAcquisitionData.conversionChange}
              icon={Percent}
              format="percent"
            />
          </div>

          {/* Traffic Sources */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-6 bg-tvp-bg-secondary border border-tvp-border-subtle rounded-xl">
              <h3 className="font-semibold text-tvp-text-primary mb-4">Traffic Sources</h3>
              <div className="space-y-4">
                {mockAcquisitionData.sources.map((source) => (
                  <div key={source.name}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-tvp-text-secondary">{source.name}</span>
                      <span className="text-tvp-text-primary font-medium">{source.users.toLocaleString()}</span>
                    </div>
                    <ProgressBar value={source.percentage} />
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 bg-tvp-bg-secondary border border-tvp-border-subtle rounded-xl">
              <h3 className="font-semibold text-tvp-text-primary mb-4">Top Referrers</h3>
              <div className="space-y-3">
                {mockAcquisitionData.topReferrers.map((referrer, idx) => (
                  <div
                    key={referrer.domain}
                    className="flex items-center justify-between p-3 bg-tvp-bg-tertiary rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 bg-tvp-bg-elevated rounded-full flex items-center justify-center text-xs text-tvp-text-muted">
                        {idx + 1}
                      </span>
                      <span className="text-sm text-tvp-text-primary">{referrer.domain}</span>
                    </div>
                    <span className="text-sm text-tvp-text-secondary">{referrer.visits.toLocaleString()} visits</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Engagement Section */}
      {activeSection === 'engagement' && (
        <div className="space-y-6">
          {/* Active User Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MetricCard title="DAU" value={mockEngagementData.dau} icon={Users} />
            <MetricCard title="WAU" value={mockEngagementData.wau} icon={Users} />
            <MetricCard title="MAU" value={mockEngagementData.mau} icon={Users} />
            <MetricCard title="DAU/MAU Ratio" value={mockEngagementData.dauMauRatio} icon={Percent} format="percent" />
          </div>

          {/* Session Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MetricCard title="Avg Session Duration" value={mockEngagementData.avgSessionDuration} icon={Clock} />
            <MetricCard title="Sessions/User" value={mockEngagementData.sessionsPerUser} icon={Repeat} />
            <MetricCard title="Bounce Rate" value={mockEngagementData.bounceRate} icon={XCircle} format="percent" />
            <MetricCard title="Return Rate" value={mockEngagementData.returnRate} icon={Repeat} format="percent" />
          </div>

          {/* Conversion Funnel */}
          <div className="p-6 bg-tvp-bg-secondary border border-tvp-border-subtle rounded-xl">
            <h3 className="font-semibold text-tvp-text-primary mb-4">Discovery → Download Funnel</h3>
            <div className="flex items-center gap-2">
              {mockEngagementData.funnel.map((stage, idx) => (
                <div key={stage.stage} className="flex-1">
                  <div className="relative">
                    <div
                      className="h-16 rounded-lg bg-tvp-accent-cyan/20 flex items-center justify-center"
                      style={{ opacity: 0.3 + (stage.percentage / 100) * 0.7 }}
                    >
                      <span className="text-lg font-bold text-tvp-accent-cyan">{stage.percentage}%</span>
                    </div>
                    {idx < mockEngagementData.funnel.length - 1 && (
                      <ArrowRight className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-4 h-4 text-tvp-text-muted z-10" />
                    )}
                  </div>
                  <div className="text-center mt-2">
                    <p className="text-sm font-medium text-tvp-text-primary">{stage.stage}</p>
                    <p className="text-xs text-tvp-text-muted">{stage.count.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Feature Adoption */}
          <div className="p-6 bg-tvp-bg-secondary border border-tvp-border-subtle rounded-xl">
            <h3 className="font-semibold text-tvp-text-primary mb-4">Feature Adoption Rates</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {mockEngagementData.featureAdoption.map((feature) => (
                <div key={feature.feature} className="p-4 bg-tvp-bg-tertiary rounded-lg text-center">
                  <p className="text-2xl font-bold text-tvp-text-primary">{feature.adoption}%</p>
                  <p className="text-sm text-tvp-text-secondary mt-1">{feature.feature}</p>
                  <div className={clsx(
                    'text-xs mt-2 flex items-center justify-center gap-1',
                    feature.trend === 'up' ? 'text-tvp-status-success' :
                    feature.trend === 'down' ? 'text-tvp-status-error' :
                    'text-tvp-text-muted'
                  )}>
                    {feature.trend === 'up' && <TrendingUp className="w-3 h-3" />}
                    {feature.trend === 'down' && <TrendingDown className="w-3 h-3" />}
                    {feature.trend}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Content Performance Section */}
      {activeSection === 'content' && (
        <div className="space-y-6">
          {/* Content Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MetricCard title="Total Videos" value={mockContentData.totalVideos} icon={Music} />
            <MetricCard title="Added This Month" value={mockContentData.videosAddedThisMonth} icon={UserPlus} />
            <MetricCard title="Catalog Utilization" value={mockContentData.catalogUtilization} icon={Percent} format="percent" />
            <MetricCard title="Stale Content" value={mockContentData.staleContent} icon={AlertTriangle} />
          </div>

          {/* Top Downloads & Genre Distribution */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-6 bg-tvp-bg-secondary border border-tvp-border-subtle rounded-xl">
              <h3 className="font-semibold text-tvp-text-primary mb-4">Top Downloads</h3>
              <div className="space-y-3">
                {mockContentData.topDownloads.map((video, idx) => (
                  <div
                    key={video.title}
                    className="flex items-center gap-3 p-3 bg-tvp-bg-tertiary rounded-lg"
                  >
                    <span className="w-6 h-6 bg-tvp-bg-elevated rounded-full flex items-center justify-center text-xs font-bold text-tvp-text-muted">
                      {idx + 1}
                    </span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-tvp-text-primary">{video.title}</p>
                      <p className="text-xs text-tvp-text-muted">{video.artist}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-tvp-text-primary">{video.downloads.toLocaleString()}</p>
                      <p className={clsx(
                        'text-xs flex items-center justify-end gap-1',
                        video.trend >= 0 ? 'text-tvp-status-success' : 'text-tvp-status-error'
                      )}>
                        {video.trend >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {video.trend >= 0 ? '+' : ''}{video.trend}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 bg-tvp-bg-secondary border border-tvp-border-subtle rounded-xl">
              <h3 className="font-semibold text-tvp-text-primary mb-4">Downloads by Genre</h3>
              <div className="space-y-3">
                {mockContentData.genreDistribution.map((genre, idx) => (
                  <div key={genre.genre}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-tvp-text-secondary">{genre.genre}</span>
                      <span className="text-tvp-text-muted">{genre.downloads.toLocaleString()}</span>
                    </div>
                    <ProgressBar
                      value={genre.percentage}
                      color={
                        idx === 0 ? 'bg-tvp-accent-cyan' :
                        idx === 1 ? 'bg-tvp-accent-purple' :
                        idx === 2 ? 'bg-amber-400' :
                        'bg-tvp-text-muted'
                      }
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Release Year Breakdown */}
          <div className="p-6 bg-tvp-bg-secondary border border-tvp-border-subtle rounded-xl">
            <h3 className="font-semibold text-tvp-text-primary mb-4">Downloads by Release Era</h3>
            <div className="flex gap-4">
              {mockContentData.releaseYearBreakdown.map((era) => (
                <div key={era.year} className="flex-1 text-center">
                  <div
                    className="h-32 bg-tvp-accent-cyan/20 rounded-lg flex items-end justify-center"
                    style={{ background: `linear-gradient(to top, rgba(0, 212, 255, ${era.percentage / 100}) 0%, transparent 100%)` }}
                  >
                    <span className="text-2xl font-bold text-tvp-accent-cyan pb-4">{era.percentage}%</span>
                  </div>
                  <p className="text-sm text-tvp-text-secondary mt-2">{era.year}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* DJ Behavior Section */}
      {activeSection === 'dj' && (
        <div className="space-y-6">
          {/* BPM Distribution */}
          <div className="p-6 bg-tvp-bg-secondary border border-tvp-border-subtle rounded-xl">
            <h3 className="font-semibold text-tvp-text-primary mb-4">BPM Distribution (Downloads)</h3>
            <div className="flex items-end gap-2 h-40">
              {mockDJBehaviorData.bpmDistribution.map((item) => (
                <div key={item.range} className="flex-1 flex flex-col items-center">
                  <div
                    className="w-full bg-tvp-accent-purple rounded-t transition-all hover:bg-tvp-accent-purple/80"
                    style={{ height: `${item.percentage * 4}px` }}
                  />
                  <p className="text-lg font-bold text-tvp-text-primary mt-2">{item.percentage}%</p>
                  <p className="text-xs text-tvp-text-muted">{item.range}</p>
                  <p className="text-[10px] text-tvp-text-muted">{item.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Key Popularity & Version Preferences */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-6 bg-tvp-bg-secondary border border-tvp-border-subtle rounded-xl">
              <h3 className="font-semibold text-tvp-text-primary mb-4">Top Musical Keys</h3>
              <div className="space-y-3">
                {mockDJBehaviorData.topKeys.map((key) => (
                  <div key={key.key} className="flex items-center justify-between p-3 bg-tvp-bg-tertiary rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="w-10 h-10 bg-tvp-accent-cyan/20 rounded-full flex items-center justify-center text-tvp-accent-cyan font-bold">
                        {key.camelot}
                      </span>
                      <span className="text-sm font-medium text-tvp-text-primary">{key.key}</span>
                    </div>
                    <span className="text-sm text-tvp-text-secondary">{key.downloads.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 bg-tvp-bg-secondary border border-tvp-border-subtle rounded-xl">
              <h3 className="font-semibold text-tvp-text-primary mb-4">Version Preferences</h3>
              <div className="space-y-3">
                {mockDJBehaviorData.versionPreferences.map((version) => (
                  <div key={version.version}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-tvp-text-secondary">{version.version}</span>
                      <span className="text-tvp-text-primary font-medium">{version.percentage}%</span>
                    </div>
                    <ProgressBar value={version.percentage} />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quality Usage & Set Builder Stats */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-6 bg-tvp-bg-secondary border border-tvp-border-subtle rounded-xl">
              <h3 className="font-semibold text-tvp-text-primary mb-4">Quality Tier Usage</h3>
              <div className="grid grid-cols-2 gap-4">
                {mockDJBehaviorData.qualityUsage.map((quality) => (
                  <div key={quality.quality} className="p-4 bg-tvp-bg-tertiary rounded-lg text-center">
                    <p className={clsx(
                      'text-3xl font-bold',
                      quality.quality === '4K' ? 'text-amber-400' :
                      quality.quality === '1080p' ? 'text-tvp-accent-cyan' :
                      'text-tvp-text-secondary'
                    )}>
                      {quality.percentage}%
                    </p>
                    <p className="text-sm text-tvp-text-muted mt-1">{quality.quality}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 bg-tvp-bg-secondary border border-tvp-border-subtle rounded-xl">
              <h3 className="font-semibold text-tvp-text-primary mb-4">Set Builder Analytics</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-tvp-bg-tertiary rounded-lg">
                  <p className="text-2xl font-bold text-tvp-text-primary">{mockDJBehaviorData.setBuilderStats.totalSets.toLocaleString()}</p>
                  <p className="text-xs text-tvp-text-muted">Total Sets Created</p>
                </div>
                <div className="p-4 bg-tvp-bg-tertiary rounded-lg">
                  <p className="text-2xl font-bold text-tvp-text-primary">{mockDJBehaviorData.setBuilderStats.avgTracksPerSet}</p>
                  <p className="text-xs text-tvp-text-muted">Avg Tracks/Set</p>
                </div>
                <div className="p-4 bg-tvp-bg-tertiary rounded-lg">
                  <p className="text-2xl font-bold text-tvp-accent-cyan">{mockDJBehaviorData.setBuilderStats.completionRate}%</p>
                  <p className="text-xs text-tvp-text-muted">Completion Rate</p>
                </div>
                <div className="p-4 bg-tvp-bg-tertiary rounded-lg">
                  <p className="text-2xl font-bold text-tvp-accent-purple">{mockDJBehaviorData.setBuilderStats.sharesPerSet}</p>
                  <p className="text-xs text-tvp-text-muted">Shares/Set</p>
                </div>
              </div>
            </div>
          </div>

          {/* Export Formats & Peak Hours */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-6 bg-tvp-bg-secondary border border-tvp-border-subtle rounded-xl">
              <h3 className="font-semibold text-tvp-text-primary mb-4">Export Format Usage</h3>
              <div className="space-y-3">
                {mockDJBehaviorData.exportFormats.map((format) => (
                  <div key={format.format}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-tvp-text-secondary">{format.format}</span>
                      <span className="text-tvp-text-primary font-medium">{format.usage}%</span>
                    </div>
                    <ProgressBar value={format.usage} />
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 bg-tvp-bg-secondary border border-tvp-border-subtle rounded-xl">
              <h3 className="font-semibold text-tvp-text-primary mb-4">Peak Usage Hours (DJ Prep Time)</h3>
              <div className="flex items-end gap-1 h-24">
                {mockDJBehaviorData.peakHours.map((hour) => (
                  <div key={hour.hour} className="flex-1 flex flex-col items-center">
                    <div
                      className="w-full bg-tvp-accent-cyan rounded-t"
                      style={{ height: `${(hour.users / 1120) * 80}px` }}
                    />
                    <p className="text-[10px] text-tvp-text-muted mt-1">{hour.hour}</p>
                  </div>
                ))}
              </div>
              <p className="text-xs text-tvp-text-muted text-center mt-2">
                Peak: 9pm-12am (gig prep time)
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Revenue Section */}
      {activeSection === 'revenue' && (
        <div className="space-y-6">
          {/* Revenue by Tier */}
          <div className="p-6 bg-tvp-bg-secondary border border-tvp-border-subtle rounded-xl">
            <h3 className="font-semibold text-tvp-text-primary mb-4">Revenue by Membership Tier</h3>
            <div className="grid md:grid-cols-3 gap-4">
              {mockRevenueData.revenueByTier.map((tier) => (
                <div key={tier.tier} className="p-4 bg-tvp-bg-tertiary rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-tvp-text-secondary">{tier.tier}</span>
                    <span className={clsx(
                      'text-xs px-2 py-1 rounded',
                      tier.tier === 'Monthly' ? 'bg-tvp-accent-cyan/20 text-tvp-accent-cyan' :
                      tier.tier === 'Annual' ? 'bg-tvp-accent-purple/20 text-tvp-accent-purple' :
                      'bg-amber-500/20 text-amber-400'
                    )}>
                      {tier.subscribers.toLocaleString()} subscribers
                    </span>
                  </div>
                  <p className="text-3xl font-bold text-tvp-text-primary">${tier.revenue.toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Churn & Upgrade/Downgrade */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-6 bg-tvp-bg-secondary border border-tvp-border-subtle rounded-xl">
              <h3 className="font-semibold text-tvp-text-primary mb-4">Churn Rate by Tier</h3>
              <div className="space-y-4">
                {mockRevenueData.churnByTier.map((tier) => (
                  <div key={tier.tier} className="flex items-center justify-between">
                    <span className="text-tvp-text-secondary">{tier.tier}</span>
                    <span className={clsx(
                      'text-lg font-bold',
                      tier.rate <= 2 ? 'text-tvp-status-success' :
                      tier.rate <= 4 ? 'text-tvp-status-warning' :
                      'text-tvp-status-error'
                    )}>
                      {tier.rate}%
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 bg-tvp-bg-secondary border border-tvp-border-subtle rounded-xl">
              <h3 className="font-semibold text-tvp-text-primary mb-4">Upgrade/Downgrade Flow</h3>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-4 bg-tvp-status-success/10 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-tvp-status-success mx-auto mb-2" />
                  <p className="text-2xl font-bold text-tvp-status-success">{mockRevenueData.upgradeDowngrade.upgrades}</p>
                  <p className="text-xs text-tvp-text-muted">Upgrades</p>
                </div>
                <div className="p-4 bg-tvp-status-error/10 rounded-lg">
                  <TrendingDown className="w-6 h-6 text-tvp-status-error mx-auto mb-2" />
                  <p className="text-2xl font-bold text-tvp-status-error">{mockRevenueData.upgradeDowngrade.downgrades}</p>
                  <p className="text-xs text-tvp-text-muted">Downgrades</p>
                </div>
                <div className="p-4 bg-tvp-accent-cyan/10 rounded-lg">
                  <ArrowRight className="w-6 h-6 text-tvp-accent-cyan mx-auto mb-2" />
                  <p className="text-2xl font-bold text-tvp-accent-cyan">+{mockRevenueData.upgradeDowngrade.netMovement}</p>
                  <p className="text-xs text-tvp-text-muted">Net Movement</p>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="p-6 bg-tvp-bg-secondary border border-tvp-border-subtle rounded-xl">
            <h3 className="font-semibold text-tvp-text-primary mb-4">Payment Methods</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {mockRevenueData.paymentMethods.map((method) => (
                <div key={method.method} className="p-4 bg-tvp-bg-tertiary rounded-lg text-center">
                  <p className="text-2xl font-bold text-tvp-text-primary">{method.percentage}%</p>
                  <p className="text-sm text-tvp-text-muted">{method.method}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Geographic Section */}
      {activeSection === 'geographic' && (
        <div className="space-y-6">
          {/* Region Breakdown */}
          <div className="p-6 bg-tvp-bg-secondary border border-tvp-border-subtle rounded-xl">
            <h3 className="font-semibold text-tvp-text-primary mb-4">Users by Region</h3>
            <div className="flex gap-4">
              {mockGeographicData.regionBreakdown.map((region) => (
                <div key={region.region} className="flex-1 text-center">
                  <div
                    className="h-24 bg-tvp-accent-cyan rounded-lg flex items-center justify-center"
                    style={{ opacity: 0.3 + (region.percentage / 100) * 0.7 }}
                  >
                    <span className="text-2xl font-bold text-tvp-bg-primary">{region.percentage}%</span>
                  </div>
                  <p className="text-sm text-tvp-text-secondary mt-2">{region.region}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Top Countries */}
          <div className="p-6 bg-tvp-bg-secondary border border-tvp-border-subtle rounded-xl">
            <h3 className="font-semibold text-tvp-text-primary mb-4">Top Countries</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {mockGeographicData.topCountries.map((country, idx) => (
                <div
                  key={country.country}
                  className="flex items-center justify-between p-4 bg-tvp-bg-tertiary rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{country.flag}</span>
                    <div>
                      <p className="font-medium text-tvp-text-primary">{country.country}</p>
                      <p className="text-xs text-tvp-text-muted">{country.users.toLocaleString()} users</p>
                    </div>
                  </div>
                  <p className="text-lg font-semibold text-tvp-accent-cyan">${country.revenue.toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Integration Status */}
      <div className="mt-8 p-4 bg-tvp-bg-tertiary rounded-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-sm text-tvp-text-muted">Data Sources:</span>
            <span className="flex items-center gap-2 text-xs px-2 py-1 bg-tvp-status-success/20 text-tvp-status-success rounded">
              <CheckCircle className="w-3 h-3" /> Google Analytics
            </span>
            <span className="flex items-center gap-2 text-xs px-2 py-1 bg-tvp-status-success/20 text-tvp-status-success rounded">
              <CheckCircle className="w-3 h-3" /> Mixpanel
            </span>
            <span className="flex items-center gap-2 text-xs px-2 py-1 bg-tvp-status-success/20 text-tvp-status-success rounded">
              <CheckCircle className="w-3 h-3" /> Stripe
            </span>
          </div>
          <span className="text-xs text-tvp-text-muted">
            Last updated: {new Date().toLocaleTimeString()}
          </span>
        </div>
      </div>
    </div>
  );
}

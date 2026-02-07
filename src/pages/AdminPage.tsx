// ============================================
// THE VIDEO POOL - ADMIN DASHBOARD PAGE
// ============================================

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart3,
  Users,
  Video,
  Download,
  DollarSign,
  TrendingUp,
  Upload,
  Settings,
  Shield,
  AlertTriangle,
  RefreshCw,
  PieChart,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import BulkUploader from '@/components/admin/BulkUploader';
import AdminUsers from '@/components/admin/AdminUsers';
import AdminVideos from '@/components/admin/AdminVideos';
import AdminAnalytics from '@/components/admin/AdminAnalytics';
import AdminInsightsSummary from '@/components/admin/AdminInsightsSummary';

type Tab = 'overview' | 'insights' | 'users' | 'videos' | 'analytics' | 'uploads' | 'system';

// Mock data - in production, these would come from API hooks
const mockStats = {
  totalUsers: 12458,
  activeSubscribers: 8234,
  totalVideos: 45678,
  downloadsToday: 3456,
  revenueThisMonth: 124580,
  newUsersThisWeek: 342,
};

export default function AdminPage() {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  // Redirect non-admins
  if (!isAdmin) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-16 text-center">
        <Shield className="w-16 h-16 text-tvp-accent-coral mx-auto mb-4" />
        <h1 className="text-2xl font-semibold text-tvp-text-primary mb-2">Access Denied</h1>
        <p className="text-tvp-text-secondary mb-6">
          You don't have permission to access the admin dashboard.
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

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'insights', label: 'Business Intel', icon: PieChart },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'videos', label: 'Videos', icon: Video },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
    { id: 'uploads', label: 'Bulk Upload', icon: Upload },
    { id: 'system', label: 'System', icon: Settings },
  ] as const;

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-semibold text-tvp-text-primary">Admin Dashboard</h1>
          <p className="text-tvp-text-secondary mt-1">
            Welcome back, {user?.username}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-tvp-bg-tertiary hover:bg-tvp-bg-elevated text-tvp-text-secondary rounded-lg transition-colors">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 border-b border-tvp-border-subtle overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 -mb-px border-b-2 whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'border-tvp-accent-cyan text-tvp-accent-cyan'
                  : 'border-transparent text-tvp-text-secondary hover:text-tvp-text-primary'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="p-4 bg-tvp-bg-secondary border border-tvp-border-subtle rounded-xl">
              <div className="flex items-center gap-2 text-tvp-text-muted text-xs mb-2">
                <Users className="w-4 h-4" />
                Total Users
              </div>
              <p className="text-2xl font-semibold text-tvp-text-primary">
                {mockStats.totalUsers.toLocaleString()}
              </p>
              <p className="text-xs text-tvp-success mt-1">+{mockStats.newUsersThisWeek} this week</p>
            </div>

            <div className="p-4 bg-tvp-bg-secondary border border-tvp-border-subtle rounded-xl">
              <div className="flex items-center gap-2 text-tvp-text-muted text-xs mb-2">
                <DollarSign className="w-4 h-4" />
                Active Subscribers
              </div>
              <p className="text-2xl font-semibold text-tvp-accent-cyan">
                {mockStats.activeSubscribers.toLocaleString()}
              </p>
              <p className="text-xs text-tvp-text-muted mt-1">
                {((mockStats.activeSubscribers / mockStats.totalUsers) * 100).toFixed(1)}% conversion
              </p>
            </div>

            <div className="p-4 bg-tvp-bg-secondary border border-tvp-border-subtle rounded-xl">
              <div className="flex items-center gap-2 text-tvp-text-muted text-xs mb-2">
                <Video className="w-4 h-4" />
                Total Videos
              </div>
              <p className="text-2xl font-semibold text-tvp-text-primary">
                {mockStats.totalVideos.toLocaleString()}
              </p>
            </div>

            <div className="p-4 bg-tvp-bg-secondary border border-tvp-border-subtle rounded-xl">
              <div className="flex items-center gap-2 text-tvp-text-muted text-xs mb-2">
                <Download className="w-4 h-4" />
                Downloads Today
              </div>
              <p className="text-2xl font-semibold text-tvp-text-primary">
                {mockStats.downloadsToday.toLocaleString()}
              </p>
            </div>

            <div className="p-4 bg-tvp-bg-secondary border border-tvp-border-subtle rounded-xl">
              <div className="flex items-center gap-2 text-tvp-text-muted text-xs mb-2">
                <DollarSign className="w-4 h-4" />
                Revenue (MTD)
              </div>
              <p className="text-2xl font-semibold text-tvp-accent-gold">
                ${mockStats.revenueThisMonth.toLocaleString()}
              </p>
            </div>

            <div className="p-4 bg-tvp-bg-secondary border border-tvp-border-subtle rounded-xl">
              <div className="flex items-center gap-2 text-tvp-text-muted text-xs mb-2">
                <TrendingUp className="w-4 h-4" />
                Growth Rate
              </div>
              <p className="text-2xl font-semibold text-tvp-success">+12.4%</p>
              <p className="text-xs text-tvp-text-muted mt-1">vs last month</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button className="p-4 bg-tvp-bg-secondary border border-tvp-border-subtle hover:border-tvp-accent-cyan rounded-xl text-left transition-colors">
              <Upload className="w-6 h-6 text-tvp-accent-cyan mb-2" />
              <h3 className="font-medium text-tvp-text-primary">Bulk Upload</h3>
              <p className="text-xs text-tvp-text-muted">Upload multiple videos</p>
            </button>

            <button className="p-4 bg-tvp-bg-secondary border border-tvp-border-subtle hover:border-tvp-accent-cyan rounded-xl text-left transition-colors">
              <Users className="w-6 h-6 text-tvp-accent-cyan mb-2" />
              <h3 className="font-medium text-tvp-text-primary">Manage Users</h3>
              <p className="text-xs text-tvp-text-muted">View and edit users</p>
            </button>

            <button className="p-4 bg-tvp-bg-secondary border border-tvp-border-subtle hover:border-tvp-accent-cyan rounded-xl text-left transition-colors">
              <BarChart3 className="w-6 h-6 text-tvp-accent-cyan mb-2" />
              <h3 className="font-medium text-tvp-text-primary">View Analytics</h3>
              <p className="text-xs text-tvp-text-muted">Detailed reports</p>
            </button>

            <button className="p-4 bg-tvp-bg-secondary border border-tvp-border-subtle hover:border-tvp-accent-cyan rounded-xl text-left transition-colors">
              <Settings className="w-6 h-6 text-tvp-accent-cyan mb-2" />
              <h3 className="font-medium text-tvp-text-primary">System Settings</h3>
              <p className="text-xs text-tvp-text-muted">Configure platform</p>
            </button>
          </div>

          {/* Recent Activity */}
          <div className="bg-tvp-bg-secondary border border-tvp-border-subtle rounded-xl p-6">
            <h2 className="text-lg font-semibold text-tvp-text-primary mb-4">Recent Activity</h2>
            <div className="space-y-3">
              {[
                { action: 'New user registered', user: 'djmike23', time: '2 min ago' },
                { action: 'Video uploaded', user: 'Admin', time: '15 min ago' },
                { action: 'Subscription upgraded', user: 'beatmaster', time: '1 hour ago' },
                { action: 'Bulk upload completed', user: 'Admin', time: '2 hours ago' },
                { action: 'New user registered', user: 'clubqueen', time: '3 hours ago' },
              ].map((activity, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between py-2 border-b border-tvp-border-subtle last:border-0"
                >
                  <div>
                    <p className="text-sm text-tvp-text-primary">{activity.action}</p>
                    <p className="text-xs text-tvp-text-muted">by {activity.user}</p>
                  </div>
                  <span className="text-xs text-tvp-text-muted">{activity.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Business Intelligence Tab */}
      {activeTab === 'insights' && (
        <div className="bg-tvp-bg-secondary border border-tvp-border-subtle rounded-xl p-6">
          <AdminInsightsSummary />
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && <AdminUsers />}

      {/* Videos Tab */}
      {activeTab === 'videos' && <AdminVideos />}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && <AdminAnalytics />}

      {/* Bulk Upload Tab */}
      {activeTab === 'uploads' && <BulkUploader />}

      {/* System Tab */}
      {activeTab === 'system' && (
        <div className="space-y-4">
          <div className="bg-tvp-bg-secondary border border-tvp-border-subtle rounded-xl p-6">
            <h2 className="text-lg font-semibold text-tvp-text-primary mb-4">System Health</h2>
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-tvp-bg-tertiary rounded-lg">
                <p className="text-sm text-tvp-text-muted mb-1">API Status</p>
                <p className="text-lg font-medium text-tvp-success">Healthy</p>
              </div>
              <div className="p-4 bg-tvp-bg-tertiary rounded-lg">
                <p className="text-sm text-tvp-text-muted mb-1">Database</p>
                <p className="text-lg font-medium text-tvp-success">Connected</p>
              </div>
              <div className="p-4 bg-tvp-bg-tertiary rounded-lg">
                <p className="text-sm text-tvp-text-muted mb-1">Storage</p>
                <p className="text-lg font-medium text-tvp-success">Online</p>
              </div>
            </div>
          </div>

          <div className="bg-tvp-bg-secondary border border-tvp-border-subtle rounded-xl p-6">
            <h2 className="text-lg font-semibold text-tvp-text-primary mb-4">Admin Actions</h2>
            <div className="space-y-3">
              <button className="w-full flex items-center justify-between p-4 bg-tvp-bg-tertiary hover:bg-tvp-bg-elevated rounded-lg transition-colors">
                <span className="text-tvp-text-primary">Clear Cache</span>
                <RefreshCw className="w-4 h-4 text-tvp-text-muted" />
              </button>
              <button className="w-full flex items-center justify-between p-4 bg-tvp-bg-tertiary hover:bg-tvp-bg-elevated rounded-lg transition-colors">
                <span className="text-tvp-text-primary">Reset Download Counts</span>
                <Download className="w-4 h-4 text-tvp-text-muted" />
              </button>
              <button className="w-full flex items-center justify-between p-4 bg-tvp-bg-tertiary hover:bg-tvp-bg-elevated rounded-lg transition-colors">
                <span className="text-tvp-text-primary">View Audit Logs</span>
                <Shield className="w-4 h-4 text-tvp-text-muted" />
              </button>
              <button className="w-full flex items-center justify-between p-4 bg-tvp-bg-tertiary hover:bg-tvp-bg-elevated rounded-lg transition-colors">
                <span className="text-tvp-text-primary">View Error Logs</span>
                <AlertTriangle className="w-4 h-4 text-tvp-text-muted" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

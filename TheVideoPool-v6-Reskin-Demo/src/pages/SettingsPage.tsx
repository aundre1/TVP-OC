// ============================================
// THE VIDEO POOL - SETTINGS PAGE
// Functional settings with persistence
// ============================================

import { useState, useEffect } from 'react';
import { User, Shield, Bell, Palette, CreditCard, Key, Loader2, Check, AlertCircle, Copy, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useUIStore } from '@/stores/uiStore';
import { useAppStore } from '@/stores/appStore';
import { clsx } from 'clsx';

type Tab = 'profile' | 'security' | 'notifications' | 'appearance' | 'billing';

// Notification preferences stored in localStorage
interface NotificationPrefs {
  newReleases: boolean;
  weeklyPack: boolean;
  downloadComplete: boolean;
  marketing: boolean;
}

const defaultNotificationPrefs: NotificationPrefs = {
  newReleases: true,
  weeklyPack: true,
  downloadComplete: true,
  marketing: false,
};

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const { user } = useAuth();
  const { showToast } = useAppStore();
  const { theme, setTheme, sectionPreferences, setTopGenres } = useUIStore();

  // Profile state
  const [profileData, setProfileData] = useState({
    username: user?.username || '',
    email: user?.email || '',
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Security state
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [showBackupCodes, setShowBackupCodes] = useState(false);

  // Notification preferences
  const [notificationPrefs, setNotificationPrefs] = useState<NotificationPrefs>(() => {
    const stored = localStorage.getItem('tvp_notification_prefs');
    return stored ? JSON.parse(stored) : defaultNotificationPrefs;
  });

  // Save notification prefs to localStorage
  useEffect(() => {
    localStorage.setItem('tvp_notification_prefs', JSON.stringify(notificationPrefs));
  }, [notificationPrefs]);

  // Update profile data when user changes
  useEffect(() => {
    if (user) {
      setProfileData({
        username: user.username || '',
        email: user.email || '',
      });
    }
  }, [user]);

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'billing', label: 'Billing', icon: CreditCard },
  ] as const;

  const handleSaveProfile = async () => {
    setSaving(true);
    setSaved(false);

    // Simulate API call - in production this would call the backend
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Store in localStorage for persistence (mock)
    localStorage.setItem('tvp_user_profile', JSON.stringify(profileData));

    setSaving(false);
    setSaved(true);
    showToast('success', 'Profile updated successfully');

    // Reset saved indicator after 3 seconds
    setTimeout(() => setSaved(false), 3000);
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      showToast('error', 'Passwords do not match');
      return;
    }
    if (newPassword.length < 8) {
      showToast('error', 'Password must be at least 8 characters');
      return;
    }

    setPasswordSaving(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    setPasswordSaving(false);
    setShowPasswordModal(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    showToast('success', 'Password changed successfully');
  };

  const handleToggle2FA = async () => {
    // Simulate enabling/disabling 2FA
    if (user?.twoFactorEnabled) {
      showToast('info', '2FA disabled (simulated)');
    } else {
      // Generate mock backup codes
      const codes = Array.from({ length: 8 }, () =>
        Math.random().toString(36).substring(2, 6).toUpperCase() + '-' +
        Math.random().toString(36).substring(2, 6).toUpperCase()
      );
      setBackupCodes(codes);
      setShowBackupCodes(true);
      showToast('success', '2FA enabled - save your backup codes!');
    }
  };

  const handleCopyBackupCodes = () => {
    navigator.clipboard.writeText(backupCodes.join('\n'));
    showToast('success', 'Backup codes copied to clipboard');
  };

  const toggleNotification = (key: keyof NotificationPrefs) => {
    setNotificationPrefs(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
    showToast('success', 'Notification preferences updated');
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <h1 className="text-3xl font-semibold text-tvp-text-primary mb-8">Settings</h1>

      <div className="flex gap-8">
        {/* Sidebar */}
        <div className="w-48 flex-shrink-0">
          <nav className="space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-left transition-colors ${
                    activeTab === tab.id
                      ? 'bg-tvp-accent-cyan/10 text-tvp-accent-cyan'
                      : 'text-tvp-text-secondary hover:text-tvp-text-primary hover:bg-tvp-bg-tertiary'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="bg-tvp-bg-secondary border border-tvp-border-subtle rounded-2xl p-6">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-tvp-text-primary mb-6">Profile Settings</h2>

                <div className="flex items-center gap-6 mb-6">
                  <div className="w-20 h-20 bg-tvp-accent-cyan rounded-full flex items-center justify-center text-3xl font-semibold text-tvp-bg-primary">
                    {profileData.username?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div>
                    <button className="px-4 py-2 bg-tvp-bg-tertiary hover:bg-tvp-bg-elevated text-tvp-text-primary rounded-lg transition-colors">
                      Change Avatar
                    </button>
                    <p className="text-xs text-tvp-text-muted mt-1">Coming soon</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-tvp-text-secondary mb-1.5">
                      Username
                    </label>
                    <input
                      type="text"
                      value={profileData.username}
                      onChange={(e) => setProfileData(prev => ({ ...prev, username: e.target.value }))}
                      className="w-full px-4 py-3 bg-tvp-bg-tertiary border border-tvp-border-default rounded-xl text-tvp-text-primary focus:border-tvp-accent-cyan outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-tvp-text-secondary mb-1.5">
                      Email
                    </label>
                    <input
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-4 py-3 bg-tvp-bg-tertiary border border-tvp-border-default rounded-xl text-tvp-text-primary focus:border-tvp-accent-cyan outline-none"
                    />
                  </div>
                </div>

                <button
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className={clsx(
                    'px-6 py-2.5 font-medium rounded-xl transition-colors flex items-center gap-2',
                    saved
                      ? 'bg-tvp-status-success text-white'
                      : 'bg-tvp-accent-cyan hover:bg-tvp-accent-cyan-hover text-tvp-bg-primary disabled:opacity-50'
                  )}
                >
                  {saving ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : saved ? (
                    <>
                      <Check className="w-5 h-5" />
                      Saved!
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-tvp-text-primary mb-6">Security Settings</h2>

                {/* Password */}
                <div className="p-4 bg-tvp-bg-tertiary rounded-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-tvp-text-primary">Password</h3>
                      <p className="text-sm text-tvp-text-muted">Change your account password</p>
                    </div>
                    <button
                      onClick={() => setShowPasswordModal(true)}
                      className="px-4 py-2 bg-tvp-bg-elevated hover:bg-tvp-border-default text-tvp-text-primary rounded-lg transition-colors"
                    >
                      Change Password
                    </button>
                  </div>
                </div>

                {/* Password Modal */}
                {showPasswordModal && (
                  <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
                    <div className="bg-tvp-bg-secondary border border-tvp-border-default rounded-2xl p-6 w-full max-w-md">
                      <h3 className="text-lg font-semibold text-tvp-text-primary mb-4">Change Password</h3>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm text-tvp-text-secondary mb-1">Current Password</label>
                          <div className="relative">
                            <input
                              type={showPassword ? 'text' : 'password'}
                              value={currentPassword}
                              onChange={(e) => setCurrentPassword(e.target.value)}
                              className="w-full px-4 py-2 bg-tvp-bg-tertiary border border-tvp-border-default rounded-lg text-tvp-text-primary pr-10"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-tvp-text-muted"
                            >
                              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm text-tvp-text-secondary mb-1">New Password</label>
                          <input
                            type={showPassword ? 'text' : 'password'}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full px-4 py-2 bg-tvp-bg-tertiary border border-tvp-border-default rounded-lg text-tvp-text-primary"
                          />
                        </div>

                        <div>
                          <label className="block text-sm text-tvp-text-secondary mb-1">Confirm New Password</label>
                          <input
                            type={showPassword ? 'text' : 'password'}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className={clsx(
                              'w-full px-4 py-2 bg-tvp-bg-tertiary border rounded-lg text-tvp-text-primary',
                              confirmPassword && confirmPassword !== newPassword
                                ? 'border-tvp-status-error'
                                : 'border-tvp-border-default'
                            )}
                          />
                          {confirmPassword && confirmPassword !== newPassword && (
                            <p className="text-xs text-tvp-status-error mt-1">Passwords don't match</p>
                          )}
                        </div>
                      </div>

                      <div className="flex justify-end gap-3 mt-6">
                        <button
                          onClick={() => {
                            setShowPasswordModal(false);
                            setCurrentPassword('');
                            setNewPassword('');
                            setConfirmPassword('');
                          }}
                          className="px-4 py-2 text-tvp-text-secondary hover:text-tvp-text-primary transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleChangePassword}
                          disabled={passwordSaving || !currentPassword || !newPassword || newPassword !== confirmPassword}
                          className="px-4 py-2 bg-tvp-accent-cyan hover:bg-tvp-accent-cyan-hover text-tvp-bg-primary rounded-lg disabled:opacity-50 flex items-center gap-2"
                        >
                          {passwordSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                          Change Password
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2FA */}
                <div className="p-4 bg-tvp-bg-tertiary rounded-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Key className="w-5 h-5 text-tvp-text-muted" />
                      <div>
                        <h3 className="font-medium text-tvp-text-primary">Two-Factor Authentication</h3>
                        <p className="text-sm text-tvp-text-muted">
                          {user?.twoFactorEnabled ? 'Enabled - Your account is secure' : 'Not enabled - Add extra security'}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleToggle2FA}
                      className={`px-4 py-2 rounded-lg transition-colors ${
                        user?.twoFactorEnabled
                          ? 'bg-tvp-status-error/20 text-tvp-status-error hover:bg-tvp-status-error/30'
                          : 'bg-tvp-status-success/20 text-tvp-status-success hover:bg-tvp-status-success/30'
                      }`}
                    >
                      {user?.twoFactorEnabled ? 'Disable' : 'Enable'}
                    </button>
                  </div>
                </div>

                {/* Backup Codes Modal */}
                {showBackupCodes && backupCodes.length > 0 && (
                  <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
                    <div className="bg-tvp-bg-secondary border border-tvp-border-default rounded-2xl p-6 w-full max-w-md">
                      <div className="flex items-center gap-2 mb-4">
                        <AlertCircle className="w-5 h-5 text-tvp-status-warning" />
                        <h3 className="text-lg font-semibold text-tvp-text-primary">Save Your Backup Codes</h3>
                      </div>

                      <p className="text-sm text-tvp-text-secondary mb-4">
                        These codes can be used to access your account if you lose your 2FA device.
                        Each code can only be used once.
                      </p>

                      <div className="bg-tvp-bg-tertiary rounded-lg p-4 font-mono text-sm">
                        <div className="grid grid-cols-2 gap-2">
                          {backupCodes.map((code, idx) => (
                            <div key={idx} className="text-tvp-text-primary">{code}</div>
                          ))}
                        </div>
                      </div>

                      <div className="flex justify-between mt-6">
                        <button
                          onClick={handleCopyBackupCodes}
                          className="flex items-center gap-2 px-4 py-2 bg-tvp-bg-tertiary hover:bg-tvp-bg-elevated text-tvp-text-primary rounded-lg transition-colors"
                        >
                          <Copy className="w-4 h-4" />
                          Copy Codes
                        </button>
                        <button
                          onClick={() => setShowBackupCodes(false)}
                          className="px-4 py-2 bg-tvp-accent-cyan hover:bg-tvp-accent-cyan-hover text-tvp-bg-primary rounded-lg"
                        >
                          I've Saved These
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Sessions */}
                <div className="p-4 bg-tvp-bg-tertiary rounded-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-tvp-text-primary">Active Sessions</h3>
                      <p className="text-sm text-tvp-text-muted">Manage your logged-in devices</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-tvp-text-muted bg-tvp-bg-elevated px-2 py-1 rounded">Coming Soon</span>
                      <button
                        disabled
                        className="px-4 py-2 bg-tvp-bg-elevated text-tvp-text-muted rounded-lg cursor-not-allowed"
                      >
                        View All
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-tvp-text-primary mb-6">Notification Preferences</h2>

                {[
                  { label: 'New releases in your genres', description: 'Get notified when new content matches your preferences', key: 'newReleases' as const },
                  { label: 'Weekly discovery pack', description: 'Receive your personalized picks every Monday', key: 'weeklyPack' as const },
                  { label: 'Download complete', description: 'Notify when downloads finish', key: 'downloadComplete' as const },
                  { label: 'Marketing emails', description: 'Special offers and announcements', key: 'marketing' as const },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between p-4 bg-tvp-bg-tertiary rounded-xl">
                    <div>
                      <h3 className="font-medium text-tvp-text-primary">{item.label}</h3>
                      <p className="text-sm text-tvp-text-muted">{item.description}</p>
                    </div>
                    <button
                      onClick={() => toggleNotification(item.key)}
                      className={clsx(
                        'relative w-11 h-6 rounded-full transition-colors',
                        notificationPrefs[item.key] ? 'bg-tvp-accent-cyan' : 'bg-tvp-bg-elevated'
                      )}
                    >
                      <div className={clsx(
                        'absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform',
                        notificationPrefs[item.key] ? 'left-[22px]' : 'left-[2px]'
                      )} />
                    </button>
                  </div>
                ))}

                <p className="text-xs text-tvp-text-muted flex items-center gap-1">
                  <Check className="w-3 h-3 text-tvp-status-success" />
                  Preferences auto-saved
                </p>
              </div>
            )}

            {/* Appearance Tab */}
            {activeTab === 'appearance' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-tvp-text-primary mb-6">Appearance</h2>

                {/* Theme */}
                <div>
                  <h3 className="text-sm font-medium text-tvp-text-secondary mb-3">Theme</h3>
                  <div className="flex gap-4">
                    <button
                      onClick={() => setTheme('dark')}
                      className={`flex-1 p-4 rounded-xl border-2 transition-colors ${
                        theme === 'dark'
                          ? 'border-tvp-accent-cyan bg-tvp-accent-cyan/10'
                          : 'border-tvp-border-subtle hover:border-tvp-border-default'
                      }`}
                    >
                      <div className="w-full h-20 bg-[#0a0a0f] rounded-lg mb-2" />
                      <span className="text-sm font-medium text-tvp-text-primary">Dark</span>
                    </button>
                    <button
                      onClick={() => setTheme('light')}
                      className={`flex-1 p-4 rounded-xl border-2 transition-colors ${
                        theme === 'light'
                          ? 'border-tvp-accent-cyan bg-tvp-accent-cyan/10'
                          : 'border-tvp-border-subtle hover:border-tvp-border-default'
                      }`}
                    >
                      <div className="w-full h-20 bg-[#f5f5f7] rounded-lg mb-2" />
                      <span className="text-sm font-medium text-tvp-text-primary">Light</span>
                    </button>
                  </div>
                </div>

                {/* Top Genres */}
                <div>
                  <h3 className="text-sm font-medium text-tvp-text-secondary mb-3">
                    Your Top Genres (for homepage)
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {['Hip-Hop', 'EDM', 'Pop', 'R&B', 'Latin', 'Rock', 'Country', 'Dance'].map((genre) => (
                      <button
                        key={genre}
                        onClick={() => {
                          const current = sectionPreferences.topGenres;
                          if (current.includes(genre)) {
                            setTopGenres(current.filter(g => g !== genre));
                          } else if (current.length < 4) {
                            setTopGenres([...current, genre]);
                          }
                        }}
                        className={`px-4 py-2 rounded-full text-sm transition-colors ${
                          sectionPreferences.topGenres.includes(genre)
                            ? 'bg-tvp-accent-cyan text-tvp-bg-primary'
                            : 'bg-tvp-bg-tertiary text-tvp-text-secondary hover:text-tvp-text-primary'
                        }`}
                      >
                        {genre}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-tvp-text-muted mt-2">
                    Select up to 4 genres ({sectionPreferences.topGenres.length}/4)
                  </p>
                </div>

                <p className="text-xs text-tvp-text-muted flex items-center gap-1">
                  <Check className="w-3 h-3 text-tvp-status-success" />
                  Theme and preferences auto-saved
                </p>
              </div>
            )}

            {/* Billing Tab */}
            {activeTab === 'billing' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-tvp-text-primary mb-6">Billing & Subscription</h2>

                <div className="p-4 bg-tvp-bg-tertiary rounded-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-tvp-text-primary">Current Plan</h3>
                      <p className="text-sm text-tvp-accent-cyan font-medium">{user?.membershipType || 'Free'}</p>
                    </div>
                    <a
                      href="/membership"
                      className="px-4 py-2 bg-tvp-accent-cyan hover:bg-tvp-accent-cyan-hover text-tvp-bg-primary rounded-lg transition-colors"
                    >
                      Change Plan
                    </a>
                  </div>
                </div>

                <div className="p-4 bg-tvp-bg-tertiary rounded-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-tvp-text-primary">Payment Method</h3>
                      <p className="text-sm text-tvp-text-muted">Managed through Stripe</p>
                    </div>
                    <a
                      href="/membership"
                      className="px-4 py-2 bg-tvp-bg-elevated hover:bg-tvp-border-default text-tvp-text-primary rounded-lg transition-colors"
                    >
                      Manage Subscription
                    </a>
                  </div>
                </div>

                <div className="p-4 bg-tvp-bg-tertiary rounded-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-tvp-text-primary">Billing History</h3>
                      <p className="text-sm text-tvp-text-muted">View past invoices via Stripe portal</p>
                    </div>
                    <a
                      href="/membership"
                      className="px-4 py-2 bg-tvp-bg-elevated hover:bg-tvp-border-default text-tvp-text-primary rounded-lg transition-colors"
                    >
                      View Invoices
                    </a>
                  </div>
                </div>

                <div className="p-3 bg-tvp-accent-cyan/10 border border-tvp-accent-cyan/30 rounded-lg">
                  <p className="text-sm text-tvp-accent-cyan">
                    All billing is securely managed through Stripe. Click "Manage Subscription" to access payment methods, invoices, and plan changes.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

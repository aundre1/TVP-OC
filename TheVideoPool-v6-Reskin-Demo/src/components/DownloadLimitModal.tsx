// ============================================
// THE VIDEO POOL - DOWNLOAD LIMIT MODAL
// Shows when user hits download limit
// ============================================

import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { X, Crown, Zap, AlertCircle, Download } from 'lucide-react';
import { clsx } from 'clsx';
import { useAppStore } from '@/stores/appStore';
import { useDownloadLimits, useMemberships } from '@/hooks';

// Membership tier info for upgrade options
const UPGRADE_TIERS = [
  {
    id: 'starter',
    name: 'Starter',
    price: 19.99,
    downloads: 50,
    features: ['50 downloads/month', 'HD quality', 'Email support'],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 39.99,
    downloads: 200,
    features: ['200 downloads/month', '4K quality', 'Priority support'],
    popular: true,
  },
  {
    id: 'elite',
    name: 'Elite',
    price: 79.99,
    downloads: null, // unlimited
    features: ['Unlimited downloads', '4K quality', '24/7 support', 'Early access'],
  },
];

export default function DownloadLimitModal() {
  const navigate = useNavigate();
  const { isDownloadLimitModalOpen, closeDownloadLimitModal } = useAppStore();
  const { data: limits } = useDownloadLimits();
  const { data: memberships } = useMemberships();

  if (!isDownloadLimitModalOpen) return null;

  const currentUsed = limits?.used ?? 0;
  const currentLimit = limits?.limit ?? 0;
  const currentTier = limits?.tier ?? 'free';
  const remaining = typeof currentLimit === 'number' ? currentLimit - currentUsed : 0;

  const handleUpgrade = () => {
    closeDownloadLimitModal();
    navigate('/membership');
  };

  const handleDismiss = () => {
    closeDownloadLimitModal();
  };

  // Calculate next reset date
  const resetsAt = limits?.resetsAt ? new Date(limits.resetsAt) : null;
  const daysUntilReset = resetsAt
    ? Math.ceil((resetsAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-500"
        onClick={handleDismiss}
      />

      {/* Modal */}
      <div
        className={clsx(
          'fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
          'w-[520px] max-w-[95vw]',
          'bg-tvp-bg-secondary border border-tvp-border-default rounded-2xl',
          'shadow-elevated z-500 overflow-hidden',
          'animate-fade-in'
        )}
      >
        {/* Header */}
        <div className="relative px-6 py-5 border-b border-tvp-border-subtle">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-tvp-status-warning/10">
              <AlertCircle className="w-6 h-6 text-tvp-status-warning" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-tvp-text-primary">
                Download Limit Reached
              </h2>
              <p className="text-sm text-tvp-text-secondary">
                Upgrade your plan for more downloads
              </p>
            </div>
          </div>

          {/* Close Button */}
          <button
            onClick={handleDismiss}
            className="absolute top-4 right-4 p-2 rounded-lg text-tvp-text-muted hover:bg-tvp-bg-tertiary hover:text-tvp-text-primary transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Current Usage Display */}
          <div className="mb-6 p-4 rounded-xl bg-tvp-bg-tertiary border border-tvp-border-subtle">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-tvp-text-secondary">
                Current Usage ({currentTier})
              </span>
              <span className="text-sm text-tvp-text-muted">
                {daysUntilReset !== null && `Resets in ${daysUntilReset} days`}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="relative h-3 bg-tvp-bg-primary rounded-full overflow-hidden mb-2">
              <div
                className="absolute inset-y-0 left-0 bg-tvp-status-error rounded-full transition-all"
                style={{
                  width: typeof currentLimit === 'number'
                    ? `${Math.min((currentUsed / currentLimit) * 100, 100)}%`
                    : '100%',
                }}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Download className="w-4 h-4 text-tvp-status-error" />
                <span className="text-2xl font-bold text-tvp-text-primary">
                  {remaining}
                </span>
                <span className="text-sm text-tvp-text-muted">
                  / {typeof currentLimit === 'number' ? currentLimit : 'unlimited'} remaining
                </span>
              </div>
            </div>
          </div>

          {/* Upgrade Options */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-tvp-text-secondary mb-3">
              Upgrade for more downloads
            </h3>

            <div className="grid gap-3">
              {UPGRADE_TIERS.filter(tier => {
                // Only show tiers higher than current
                const tierOrder = { free: 0, starter: 1, pro: 2, elite: 3 };
                return tierOrder[tier.id as keyof typeof tierOrder] > tierOrder[currentTier as keyof typeof tierOrder];
              }).map((tier) => (
                <button
                  key={tier.id}
                  onClick={handleUpgrade}
                  className={clsx(
                    'relative flex items-center justify-between p-4 rounded-xl',
                    'border transition-all duration-fast',
                    tier.popular
                      ? 'bg-tvp-accent-cyan/5 border-tvp-accent-cyan hover:bg-tvp-accent-cyan/10'
                      : 'bg-tvp-bg-tertiary border-tvp-border-subtle hover:border-tvp-accent-cyan'
                  )}
                >
                  <div className="flex items-center gap-3">
                    {tier.popular ? (
                      <Zap className="w-5 h-5 text-tvp-accent-cyan" />
                    ) : (
                      <Crown className="w-5 h-5 text-tvp-text-muted" />
                    )}
                    <div className="text-left">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-tvp-text-primary">
                          {tier.name}
                        </span>
                        {tier.popular && (
                          <span className="px-2 py-0.5 text-[10px] font-bold bg-tvp-accent-cyan text-black rounded-full">
                            POPULAR
                          </span>
                        )}
                      </div>
                      <span className="text-sm text-tvp-text-secondary">
                        {tier.downloads ? `${tier.downloads} downloads/month` : 'Unlimited downloads'}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-lg font-bold text-tvp-text-primary">
                      ${tier.price}
                    </span>
                    <span className="text-sm text-tvp-text-muted">/mo</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleDismiss}
              className={clsx(
                'flex-1 py-3 rounded-lg',
                'bg-tvp-bg-tertiary border border-tvp-border-subtle',
                'text-tvp-text-secondary font-medium',
                'hover:border-tvp-border-default hover:text-tvp-text-primary transition-colors'
              )}
            >
              Maybe Later
            </button>
            <button
              onClick={handleUpgrade}
              className={clsx(
                'flex-1 flex items-center justify-center gap-2 py-3 rounded-lg',
                'bg-tvp-accent-cyan text-black font-semibold',
                'hover:bg-tvp-accent-cyan-hover transition-colors'
              )}
            >
              <Crown className="w-4 h-4" />
              <span>Upgrade Now</span>
            </button>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
}

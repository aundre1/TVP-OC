// ============================================
// THE VIDEO POOL - TRIAL EXPIRED MODAL
// Modal shown when trial has expired, blocks download access
// ============================================

import { AlertCircle, Check, Crown, LogOut, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useFreeTrial } from '@/hooks/useFreeTrial';
import { useAuthStore } from '@/stores/authStore';

const UPGRADE_BENEFITS = [
  'Unlimited downloads per month',
  'Access to exclusive content',
  'HD and 4K video quality',
  'Priority access to new releases',
  'Set Builder for DJ preparation',
  'Personalized recommendations',
];

export default function TrialExpiredModal() {
  const { isTrialExpired } = useFreeTrial();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  // Only show for expired free trial users
  if (!user || user.membershipType !== 'free' || !isTrialExpired) {
    return null;
  }

  // Check if user actually had a trial (has trial dates)
  if (!user.freeTrialStartedAt || !user.freeTrialExpiresAt) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop - darker for blocking modal */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        className="
          relative w-full max-w-md
          bg-tvp-bg-secondary border border-tvp-border-subtle
          rounded-2xl shadow-2xl
          animate-in zoom-in-95 fade-in duration-300
        "
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="trial-expired-title"
        aria-describedby="trial-expired-desc"
      >
        {/* Header */}
        <div className="p-6 pb-4 text-center">
          {/* Icon */}
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-tvp-error/20 flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-tvp-error" />
          </div>

          <h2
            id="trial-expired-title"
            className="text-xl font-semibold text-tvp-text-primary mb-2"
          >
            Your Free Trial Has Ended
          </h2>

          <p
            id="trial-expired-desc"
            className="text-sm text-tvp-text-secondary"
          >
            Upgrade to continue downloading professional DJ videos and unlock all features.
          </p>
        </div>

        {/* Benefits */}
        <div className="px-6 py-4 bg-tvp-bg-tertiary/50 border-y border-tvp-border-subtle">
          <div className="flex items-center gap-2 mb-3">
            <Crown className="w-4 h-4 text-tvp-accent-gold" />
            <span className="text-sm font-medium text-tvp-text-primary">
              What you get with Pro
            </span>
          </div>
          <ul className="space-y-2">
            {UPGRADE_BENEFITS.map((benefit, index) => (
              <li
                key={index}
                className="flex items-start gap-2 text-sm text-tvp-text-secondary"
              >
                <Check className="w-4 h-4 text-tvp-accent-cyan flex-shrink-0 mt-0.5" />
                <span>{benefit}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Actions */}
        <div className="p-6 space-y-3">
          <Link
            to="/membership"
            className="
              flex items-center justify-center gap-2
              w-full py-3 px-4
              bg-tvp-accent-cyan hover:bg-tvp-accent-cyan-hover
              text-tvp-bg-primary font-semibold
              rounded-xl transition-colors
            "
          >
            <Sparkles className="w-4 h-4" />
            Upgrade Now
          </Link>

          <Link
            to="/membership"
            className="
              flex items-center justify-center
              w-full py-3 px-4
              bg-tvp-bg-tertiary hover:bg-tvp-bg-elevated
              text-tvp-text-primary font-medium
              rounded-xl transition-colors
            "
          >
            View All Plans
          </Link>

          <button
            onClick={() => logout()}
            className="
              flex items-center justify-center gap-2
              w-full py-2.5 px-4
              text-tvp-text-muted hover:text-tvp-text-secondary
              font-medium text-sm
              transition-colors
            "
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>

        {/* Footer note */}
        <div className="px-6 pb-6">
          <p className="text-xs text-tvp-text-muted text-center">
            Questions? Contact us at{' '}
            <a
              href="mailto:support@thevideopool.com"
              className="text-tvp-accent-cyan hover:underline"
            >
              support@thevideopool.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

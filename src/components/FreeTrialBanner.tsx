// ============================================
// THE VIDEO POOL - FREE TRIAL BANNER
// Sticky banner showing trial status with upgrade CTA
// ============================================

import { X, Clock, AlertTriangle, AlertCircle, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useFreeTrial } from '@/hooks/useFreeTrial';
import { useTrialStore } from '@/stores/trialStore';
import { useAuthStore } from '@/stores/authStore';

export default function FreeTrialBanner() {
  const user = useAuthStore((state) => state.user);
  const { isOnFreeTrial, daysRemaining, isTrialExpired, isTrialEndingSoon } = useFreeTrial();
  const { isBannerDismissed, dismissBanner } = useTrialStore();

  // Don't show for non-free-tier users
  if (!user || user.membershipType !== 'free') {
    return null;
  }

  // Don't show if no trial or banner is dismissed (unless expired)
  if (!isOnFreeTrial && !isTrialExpired) {
    return null;
  }

  // If dismissed and not expired, don't show
  if (isBannerDismissed && !isTrialExpired) {
    return null;
  }

  // Determine banner style based on state
  const getBannerStyle = () => {
    if (isTrialExpired) {
      return {
        bg: 'bg-gradient-to-r from-tvp-error/20 via-tvp-error/15 to-tvp-error/20',
        border: 'border-tvp-error/40',
        icon: AlertCircle,
        iconColor: 'text-tvp-error',
        textColor: 'text-tvp-error',
      };
    }
    if (isTrialEndingSoon) {
      return {
        bg: 'bg-gradient-to-r from-tvp-warning/20 via-tvp-warning/15 to-tvp-warning/20',
        border: 'border-tvp-warning/40',
        icon: AlertTriangle,
        iconColor: 'text-tvp-warning',
        textColor: 'text-tvp-warning',
      };
    }
    return {
      bg: 'bg-gradient-to-r from-tvp-accent-cyan/10 via-tvp-accent-cyan/5 to-tvp-accent-cyan/10',
      border: 'border-tvp-accent-cyan/30',
      icon: Clock,
      iconColor: 'text-tvp-accent-cyan',
      textColor: 'text-tvp-accent-cyan',
    };
  };

  const style = getBannerStyle();
  const Icon = style.icon;

  // Get message based on state
  const getMessage = () => {
    if (isTrialExpired) {
      return 'Your free trial has expired. Upgrade now to continue accessing downloads.';
    }
    if (daysRemaining === 1) {
      return 'Your free trial ends tomorrow! Upgrade to keep your access.';
    }
    if (isTrialEndingSoon) {
      return `Your free trial ends in ${daysRemaining} days. Upgrade to keep your access.`;
    }
    return `Free trial: ${daysRemaining} days remaining`;
  };

  return (
    <div
      className={`
        sticky top-0 z-40
        ${style.bg} ${style.border}
        border-b backdrop-blur-sm
        animate-in slide-in-from-top duration-300
      `}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-2.5 gap-4">
          {/* Left side - Icon and message */}
          <div className="flex items-center gap-3 min-w-0">
            <Icon className={`w-5 h-5 flex-shrink-0 ${style.iconColor}`} />
            <p className={`text-sm font-medium ${style.textColor} truncate`}>
              {getMessage()}
            </p>
          </div>

          {/* Right side - CTA and dismiss */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <Link
              to="/membership"
              className={`
                inline-flex items-center gap-1.5 px-4 py-1.5
                text-sm font-semibold rounded-full
                transition-all duration-200
                ${isTrialExpired
                  ? 'bg-tvp-error hover:bg-tvp-error/90 text-white'
                  : isTrialEndingSoon
                  ? 'bg-tvp-warning hover:bg-tvp-warning/90 text-tvp-bg-primary'
                  : 'bg-tvp-accent-cyan hover:bg-tvp-accent-cyan-hover text-tvp-bg-primary'
                }
              `}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Upgrade Now
            </Link>

            {/* Dismiss button - only show if not expired */}
            {!isTrialExpired && (
              <button
                onClick={dismissBanner}
                className="p-1.5 rounded-full hover:bg-white/10 transition-colors"
                aria-label="Dismiss banner"
              >
                <X className="w-4 h-4 text-tvp-text-muted hover:text-tvp-text-secondary" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

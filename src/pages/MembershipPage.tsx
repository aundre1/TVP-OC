// ============================================
// THE VIDEO POOL - MEMBERSHIP PAGE
// ============================================

import { Check, Zap, Crown, Star, Loader2 } from 'lucide-react';
import { useMemberships, useMembershipStatus, useCreateCheckout, useCustomerPortal } from '@/hooks/useSubscription';

const TIER_ICONS = {
  free: Star,
  paid: Crown,
};

const TIER_COLORS = {
  free: 'text-tvp-text-muted',
  paid: 'text-tvp-accent-cyan',
};

export default function MembershipPage() {
  const { data: memberships, isLoading: loadingMemberships } = useMemberships();
  const { data: status } = useMembershipStatus();
  const createCheckout = useCreateCheckout();
  const customerPortal = useCustomerPortal();

  const handleSubscribe = (membershipId: number) => {
    createCheckout.mutate({ membershipId, interval: 'month' });
  };

  const handleManageSubscription = () => {
    customerPortal.mutate();
  };

  if (loadingMemberships) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-tvp-accent-cyan animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-3xl font-semibold text-tvp-text-primary mb-2">
          Choose Your Plan
        </h1>
        <p className="text-tvp-text-secondary">
          Get unlimited access to professional video content for your DJ sets
        </p>

        {/* Current Plan Banner */}
        {status && (
          <div className="mt-6 inline-flex items-center gap-3 px-4 py-2 bg-tvp-bg-secondary border border-tvp-border-subtle rounded-full">
            <span className="text-sm text-tvp-text-muted">Current plan:</span>
            <span className={`text-sm font-medium ${TIER_COLORS[status.currentMembership.slug as keyof typeof TIER_COLORS] || 'text-tvp-text-primary'}`}>
              {status.currentMembership.name}
            </span>
            {status.cancelAtPeriodEnd && (
              <span className="px-2 py-0.5 bg-tvp-warning/20 text-tvp-warning text-xs rounded-full">
                Cancels {new Date(status.periodEnd).toLocaleDateString()}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Pricing Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {memberships?.map((membership) => {
          const Icon = TIER_ICONS[membership.slug as keyof typeof TIER_ICONS] || Star;
          const color = TIER_COLORS[membership.slug as keyof typeof TIER_COLORS] || 'text-tvp-text-muted';
          const isCurrentPlan = status?.currentMembership.slug === membership.slug;
          const isPopular = membership.isPopular || membership.slug === 'paid';

          return (
            <div
              key={membership.id}
              className={`relative rounded-2xl border transition-all ${
                isPopular
                  ? 'border-tvp-accent-cyan bg-tvp-accent-cyan/5 scale-105'
                  : isCurrentPlan
                  ? 'border-tvp-accent-cyan/50 bg-tvp-bg-secondary'
                  : 'border-tvp-border-subtle bg-tvp-bg-secondary hover:border-tvp-border-default'
              }`}
            >
              {/* Popular Badge */}
              {isPopular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-tvp-accent-cyan text-tvp-bg-primary text-xs font-bold rounded-full">
                  MOST POPULAR
                </div>
              )}

              <div className="p-6">
                {/* Header */}
                <div className="flex items-center gap-2 mb-4">
                  <Icon className={`w-5 h-5 ${color}`} />
                  <h3 className="text-lg font-semibold text-tvp-text-primary">
                    {membership.name}
                  </h3>
                </div>

                {/* Price */}
                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-tvp-text-primary">
                      ${membership.price}
                    </span>
                    <span className="text-tvp-text-muted">/month</span>
                  </div>
                  {membership.annualPrice > 0 && (
                    <p className="text-sm text-tvp-text-muted mt-1">
                      ${membership.annualPrice}/year (save ${(membership.price * 12 - membership.annualPrice).toFixed(0)})
                    </p>
                  )}
                </div>

                {/* Download Limit */}
                <div className="mb-6 pb-6 border-b border-tvp-border-subtle">
                  <p className="text-sm text-tvp-text-secondary">
                    <span className="text-2xl font-semibold text-tvp-text-primary">
                      {membership.downloadLimit === null ? 'Unlimited' : membership.downloadLimit}
                    </span>
                    {' '}downloads/month
                  </p>
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-6">
                  {membership.features?.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Check className={`w-4 h-4 mt-0.5 flex-shrink-0 ${color}`} />
                      <span className="text-sm text-tvp-text-secondary">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                {isCurrentPlan ? (
                  <button
                    onClick={handleManageSubscription}
                    className="w-full py-3 bg-tvp-bg-tertiary text-tvp-text-primary font-medium rounded-xl hover:bg-tvp-bg-elevated transition-colors"
                  >
                    Manage Subscription
                  </button>
                ) : membership.slug === 'free' ? (
                  <button
                    disabled
                    className="w-full py-3 bg-tvp-bg-tertiary text-tvp-text-muted font-medium rounded-xl cursor-not-allowed"
                  >
                    Free Plan
                  </button>
                ) : (
                  <button
                    onClick={() => handleSubscribe(membership.id)}
                    disabled={createCheckout.isPending}
                    className={`w-full py-3 font-medium rounded-xl transition-colors disabled:opacity-50 ${
                      isPopular
                        ? 'bg-tvp-accent-cyan hover:bg-tvp-accent-cyan-hover text-tvp-bg-primary'
                        : 'bg-tvp-bg-tertiary hover:bg-tvp-bg-elevated text-tvp-text-primary'
                    }`}
                  >
                    {createCheckout.isPending ? (
                      <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                    ) : (
                      `Upgrade to ${membership.name}`
                    )}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* FAQ */}
      <div className="mt-16">
        <h2 className="text-xl font-semibold text-tvp-text-primary text-center mb-8">
          Frequently Asked Questions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <div className="p-6 bg-tvp-bg-secondary border border-tvp-border-subtle rounded-xl">
            <h3 className="font-medium text-tvp-text-primary mb-2">
              Can I change my plan anytime?
            </h3>
            <p className="text-sm text-tvp-text-secondary">
              Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately, and you'll be charged or credited the prorated difference.
            </p>
          </div>
          <div className="p-6 bg-tvp-bg-secondary border border-tvp-border-subtle rounded-xl">
            <h3 className="font-medium text-tvp-text-primary mb-2">
              What payment methods do you accept?
            </h3>
            <p className="text-sm text-tvp-text-secondary">
              We accept all major credit cards (Visa, MasterCard, American Express) through our secure Stripe payment processor.
            </p>
          </div>
          <div className="p-6 bg-tvp-bg-secondary border border-tvp-border-subtle rounded-xl">
            <h3 className="font-medium text-tvp-text-primary mb-2">
              Do downloads roll over?
            </h3>
            <p className="text-sm text-tvp-text-secondary">
              Monthly download limits reset at the beginning of each billing period and don't roll over. Unlimited plans have no restrictions.
            </p>
          </div>
          <div className="p-6 bg-tvp-bg-secondary border border-tvp-border-subtle rounded-xl">
            <h3 className="font-medium text-tvp-text-primary mb-2">
              Can I cancel my subscription?
            </h3>
            <p className="text-sm text-tvp-text-secondary">
              You can cancel anytime from your account settings. You'll keep access until the end of your current billing period.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

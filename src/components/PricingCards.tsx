import { useState } from 'react';
import { Check, Sparkles, Crown } from 'lucide-react';

interface PricingPlan {
  id: string;
  name: string;
  price: string;
  priceNote?: string;
  perMonth?: string;
  interval: string;
  downloads: string;
  quality: string;
  features: string[];
  cta: string;
  popular?: boolean;
  badge?: string;
  trialEligible?: boolean;
}

const plans: PricingPlan[] = [
  {
    id: 'free',
    name: 'Free',
    price: '$0',
    interval: '',
    downloads: '1 download/month',
    quality: '1080p max',
    features: [
      '1 download per month',
      'Browse full catalog',
      'Set Builder access',
      'Up to 1080p quality',
    ],
    cta: 'Get Started',
  },
  {
    id: 'starter',
    name: 'Starter',
    price: '$35',
    interval: '/month',
    downloads: '200 downloads/month',
    quality: 'Full HD, all versions',
    features: [
      '200 downloads per month',
      'Full HD & all versions',
      'All genres access',
      'Set Builder access',
      'Priority support',
    ],
    cta: 'Get Started',
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$100',
    interval: '/quarter',
    perMonth: '$33/mo',
    downloads: '250 downloads/month',
    quality: 'All versions',
    features: [
      '250 downloads per month',
      'All quality versions',
      'Batch downloads',
      'Early access to new releases',
      'Advanced search & filters',
      'Set Builder Pro',
    ],
    cta: 'Start Free Trial',
    popular: true,
    badge: 'Popular',
    trialEligible: true,
  },
  {
    id: 'elite',
    name: 'Elite',
    price: '$360',
    interval: '/year',
    perMonth: '$30/mo',
    downloads: '300 downloads/month',
    quality: 'All versions',
    features: [
      '300 downloads per month',
      'All quality versions',
      'Bulk downloads',
      'Early access + exclusive content',
      'Set Builder Pro with AI',
      '24/7 priority support',
      'Song request priority',
    ],
    cta: 'Start Free Trial',
    trialEligible: true,
  },
];

export default function PricingCards() {
  const [loading, setLoading] = useState<string | null>(null);

  const handleSubscribe = async (planId: string) => {
    if (planId === 'free') {
      window.location.href = '/register';
      return;
    }

    setLoading(planId);

    try {
      const response = await fetch('/api/memberships/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId }),
      });

      if (!response.ok) throw new Error('Failed to create checkout session');

      const { checkoutUrl } = await response.json();
      window.location.href = checkoutUrl;
    } catch (error) {
      console.error('Checkout failed:', error);
      alert('Failed to start checkout. Please try again.');
      setLoading(null);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-16">
      {/* Header */}
      <div className="text-center mb-12">
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
          Choose Your Plan
        </h2>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          Trusted by <span className="text-cyan-400 font-semibold">11,000+ DJs worldwide</span>.
          Start free, upgrade anytime.
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`relative bg-[#111] rounded-2xl p-6 border-2 transition-all hover:scale-[1.02] ${
              plan.popular
                ? 'border-cyan-500 shadow-xl shadow-cyan-500/20'
                : 'border-gray-800 hover:border-gray-700'
            }`}
          >
            {/* Popular Badge */}
            {plan.popular && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full shadow-lg">
                <span className="text-black font-bold text-sm">{plan.badge}</span>
              </div>
            )}

            <div className="mb-6">
              <h3 className="text-xl font-bold text-white mb-1">{plan.name}</h3>
              <p className="text-sm text-gray-500 mb-4">{plan.downloads}</p>

              {/* Price */}
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold text-cyan-400">{plan.price}</span>
                {plan.interval && (
                  <span className="text-gray-400">{plan.interval}</span>
                )}
              </div>

              {/* Per-month breakdown */}
              {plan.perMonth && (
                <p className="text-gray-400 text-sm mt-1">
                  {plan.perMonth}
                </p>
              )}
            </div>

            {/* CTA Button */}
            <button
              onClick={() => handleSubscribe(plan.id)}
              disabled={loading === plan.id}
              className={`w-full py-3 rounded-xl font-bold text-base transition-all mb-6 ${
                plan.popular
                  ? 'bg-cyan-500 hover:bg-cyan-400 text-black shadow-lg shadow-cyan-500/30'
                  : 'bg-gray-800 hover:bg-gray-700 text-white'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {loading === plan.id ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Loading...
                </span>
              ) : (
                plan.cta
              )}
            </button>

            {/* Trial note */}
            {plan.trialEligible && (
              <p className="text-center text-xs text-gray-500 -mt-4 mb-4">
                7-day free trial included
              </p>
            )}

            {/* Features */}
            <ul className="space-y-2">
              {plan.features.map((feature, i) => (
                <li key={i} className="flex items-start gap-2 text-gray-300">
                  <Check className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Trust Signals */}
      <div className="text-center space-y-2">
        <p className="text-gray-400 text-sm">
          Cancel anytime • No long-term contracts • Secure payment by Stripe
        </p>
      </div>
    </div>
  );
}

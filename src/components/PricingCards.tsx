import { useState } from 'react';
import { Check, Sparkles } from 'lucide-react';

interface PricingPlan {
  id: string;
  name: string;
  priceId: string;
  originalPrice: number;
  ogPrice: number;
  interval: string;
  intervalCount: number;
  perMonth: number;
  ogPerMonth: number;
  savings: number;
  savingsPercent: number;
  popular?: boolean;
  badge?: string;
}

const plans: PricingPlan[] = [
  {
    id: 'monthly',
    name: 'Monthly',
    priceId: import.meta.env.VITE_STRIPE_PRICE_MONTHLY || 'price_monthly_xxxxx',
    originalPrice: 34.99,
    ogPrice: 24.50,
    interval: 'month',
    intervalCount: 1,
    perMonth: 34.99,
    ogPerMonth: 24.50,
    savings: 10.49,
    savingsPercent: 30,
  },
  {
    id: 'quarterly',
    name: 'Quarterly',
    priceId: import.meta.env.VITE_STRIPE_PRICE_QUARTERLY || 'price_quarterly_xxxxx',
    originalPrice: 99.99,
    ogPrice: 69.99,
    interval: 'month',
    intervalCount: 3,
    perMonth: 33.33,
    ogPerMonth: 23.33,
    savings: 30.00,
    savingsPercent: 30,
    badge: 'Save 5%',
  },
  {
    id: 'annual',
    name: 'Annual',
    priceId: import.meta.env.VITE_STRIPE_PRICE_ANNUAL || 'price_annual_xxxxx',
    originalPrice: 299.99,
    ogPrice: 209.99,
    interval: 'year',
    intervalCount: 1,
    perMonth: 25.00,
    ogPerMonth: 17.50,
    savings: 90.00,
    savingsPercent: 30,
    popular: true,
    badge: 'Save 29%',
  },
];

const features = [
  'Unlimited access to all videos',
  'New content every week',
  'Community Discord access',
  'Behind-the-scenes content',
  'Early access to new releases',
  'Cancel anytime',
];

export default function PricingCards() {
  const [promoCode, setPromoCode] = useState('OG500');
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'annual'>('annual');
  const [loading, setLoading] = useState<string | null>(null);
  const [spotsRemaining, setSpotsRemaining] = useState(137); // Update dynamically from API

  const handleSubscribe = async (priceId: string, planId: string) => {
    setLoading(planId);
    
    try {
      // Call your backend to create checkout session
      const response = await fetch('/api/checkout/create-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId,
          promoCode: promoCode || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const { url } = await response.json();
      window.location.href = url;
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
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full mb-6 animate-pulse">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span className="text-cyan-400 font-semibold text-sm">
            OG 500 Special — 30% Off For Life
          </span>
        </div>
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
          Choose Your Plan
        </h2>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          Join the first 500 returning members and lock in 30% off forever.
          <br />
          <span className="text-cyan-400 font-semibold">
            {spotsRemaining} spots remaining
          </span>
        </p>
      </div>

      {/* Billing Toggle */}
      <div className="flex justify-center mb-12">
        <div className="inline-flex items-center gap-1 p-1 bg-[#111] rounded-lg border border-gray-800">
          <button
            onClick={() => setBillingInterval('monthly')}
            className={`px-6 py-2 rounded-md font-medium transition-all ${
              billingInterval === 'monthly'
                ? 'bg-cyan-500 text-black'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingInterval('annual')}
            className={`px-6 py-2 rounded-md font-medium transition-all ${
              billingInterval === 'annual'
                ? 'bg-cyan-500 text-black'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Annual
            <span className="ml-2 text-xs bg-cyan-400/20 text-cyan-400 px-2 py-0.5 rounded">
              Best Value
            </span>
          </button>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="grid md:grid-cols-3 gap-8 mb-12">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`relative bg-[#111] rounded-2xl p-8 border-2 transition-all hover:scale-[1.02] ${
              plan.popular
                ? 'border-cyan-500 shadow-xl shadow-cyan-500/20'
                : 'border-gray-800 hover:border-gray-700'
            }`}
          >
            {/* Popular Badge */}
            {plan.popular && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full shadow-lg">
                <span className="text-black font-bold text-sm">MOST POPULAR</span>
              </div>
            )}

            {/* Best Value Badge */}
            {plan.id === 'annual' && (
              <div className="absolute -top-3 -right-3 bg-yellow-500 text-black text-xs font-bold px-3 py-1 rounded-full rotate-12 shadow-lg">
                BEST VALUE
              </div>
            )}

            {/* Savings Badge */}
            {plan.badge && (
              <div className="absolute top-4 right-4 px-3 py-1 bg-cyan-500/10 border border-cyan-500/30 rounded-full">
                <span className="text-cyan-400 font-semibold text-xs">{plan.badge}</span>
              </div>
            )}

            <div className="mb-6">
              <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
              
              {/* Original Price (Crossed Out) */}
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-gray-500 line-through text-lg">
                  ${plan.originalPrice.toFixed(2)}
                </span>
                <span className="text-xs text-gray-500">regular price</span>
              </div>

              {/* OG Price */}
              <div className="flex items-baseline gap-1">
                <span className="text-5xl font-bold text-cyan-400">
                  ${Math.floor(plan.ogPrice)}
                </span>
                <span className="text-2xl text-cyan-400">
                  .{(plan.ogPrice % 1).toFixed(2).slice(2)}
                </span>
                <span className="text-gray-400 ml-1">
                  /{plan.intervalCount > 1 ? `${plan.intervalCount} mo` : plan.interval}
                </span>
              </div>

              {/* Per-Month Breakdown */}
              {plan.intervalCount > 1 && (
                <p className="text-gray-400 text-sm mt-2">
                  ${plan.ogPerMonth.toFixed(2)} per month
                </p>
              )}

              {/* Savings */}
              <div className="mt-3 inline-block px-3 py-1 bg-green-500/10 border border-green-500/30 rounded-full">
                <span className="text-green-400 font-semibold text-sm">
                  Save ${plan.savings.toFixed(2)}/{plan.interval === 'year' ? 'yr' : plan.intervalCount > 1 ? 'qtr' : 'mo'}
                </span>
              </div>
            </div>

            {/* CTA Button */}
            <button
              onClick={() => handleSubscribe(plan.priceId, plan.id)}
              disabled={loading === plan.id}
              className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
                plan.popular
                  ? 'bg-cyan-500 hover:bg-cyan-400 text-black shadow-lg shadow-cyan-500/30'
                  : 'bg-gray-800 hover:bg-gray-700 text-white'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {loading === plan.id ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Loading...
                </span>
              ) : (
                'Subscribe Now'
              )}
            </button>

            {/* Features */}
            <ul className="mt-8 space-y-3">
              {features.map((feature, i) => (
                <li key={i} className="flex items-start gap-3 text-gray-300">
                  <Check className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Promo Code Input */}
      <div className="max-w-md mx-auto">
        <label className="block text-sm font-medium text-gray-400 mb-2">
          Have a promo code?
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
            placeholder="Enter code"
            className="flex-1 px-4 py-3 bg-[#111] border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:border-cyan-500 focus:outline-none transition-colors"
          />
          <button 
            onClick={() => {
              if (promoCode) {
                alert(`Code "${promoCode}" will be applied at checkout`);
              }
            }}
            className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors"
          >
            Apply
          </button>
        </div>
        {promoCode === 'OG500' && (
          <p className="text-cyan-400 text-sm mt-2 flex items-center gap-1">
            <Check className="w-4 h-4" />
            OG500 code ready — 30% off for life!
          </p>
        )}
      </div>

      {/* Trust Signals */}
      <div className="text-center mt-12 space-y-2">
        <p className="text-gray-400 text-sm">
          Cancel anytime • No long-term contracts • Secure payment by Stripe
        </p>
        <p className="text-gray-500 text-xs">
          All subscriptions renew automatically. You can cancel anytime from your account settings.
        </p>
      </div>

      {/* Urgency Banner (when spots < 100) */}
      {spotsRemaining < 100 && (
        <div className="mt-8 max-w-2xl mx-auto bg-gradient-to-r from-orange-500/10 to-red-500/10 border-2 border-orange-500/30 rounded-xl p-6 text-center">
          <p className="text-orange-400 font-bold text-lg mb-2">
            ⚠️ Only {spotsRemaining} OG 500 spots left!
          </p>
          <p className="text-gray-300 text-sm">
            Lock in 30% off for life before all spots are claimed.
          </p>
        </div>
      )}
    </div>
  );
}

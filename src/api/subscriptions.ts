// ============================================
// THE VIDEO POOL - SUBSCRIPTIONS API
// ============================================

import { get, post } from './client';
import { DEV_CONFIG } from '@/config/dev';
import type { Membership, MembershipStatus, CheckoutSession } from '@/types';

// Convert API features object → human-readable string array for the UI
function adaptFeatures(features: Record<string, unknown> | string[] | null, slug: string): string[] {
  if (!features) return [];
  if (Array.isArray(features)) return features;
  if (typeof features !== 'object') return [];

  const lines: string[] = [];
  const f = features as Record<string, unknown>;

  if (typeof f.monthlyDownloads === 'number') {
    lines.push(`${f.monthlyDownloads} download${f.monthlyDownloads === 1 ? '' : 's'}/month`);
  } else if (f.monthlyDownloads === null) {
    lines.push('Unlimited downloads');
  }
  if (f.maxQuality) lines.push(`${String(f.maxQuality).toUpperCase()} quality`);
  if (f.streaming) lines.push('Streaming access');
  if (f.preview) lines.push('Video previews');
  if (typeof f.favorites === 'number') lines.push(`${f.favorites} favorites`);
  if (f.favorites === null) lines.push('Unlimited favorites');
  if (f.historyDays) lines.push(`${f.historyDays}-day history`);
  if (f.earlyAccess) lines.push('Early access to new content');
  if (f.batchDownload || f.bulkDownload) lines.push('Batch downloads');
  if (f.exclusiveContent) lines.push('Exclusive content');
  if (f.prioritySupport) lines.push('Priority support');
  if (f.twentyFourSevenSupport) lines.push('24/7 support');

  return lines;
}

interface BillingHistory {
  invoices: Array<{
    id: string;
    amount: number;
    status: string;
    created: string;
    pdfUrl?: string;
  }>;
}

interface PaymentMethod {
  id: string;
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
  isDefault: boolean;
}

interface UpcomingInvoice {
  amount: number;
  dueDate: string;
  items: Array<{
    description: string;
    amount: number;
  }>;
}

// Mock membership data (matches Membership interface)
// PRD Pricing:
// - Free Trial: $0, 2 downloads/month, 6-month trial
// - Monthly: $34.99, 200 downloads/month
// - Quarterly: $99.99 (~$33.33/mo), 300 downloads/month
// - Annual: $299.99 (~$25/mo), 400 downloads/month
const mockMemberships: Membership[] = [
  {
    id: 1,
    name: 'Free Trial',
    slug: 'free',
    price: 0,
    quarterlyPrice: 0,
    annualPrice: 0,
    downloadLimit: 2,
    features: ['2 downloads/month', 'HD quality', 'Basic search', '6-month trial'],
  },
  {
    id: 2,
    name: 'Video Pool Pro',
    slug: 'pro',  // Updated from 'paid' to actual tier
    price: 34.99,
    quarterlyPrice: 99.99,  // ~$33.33/mo
    annualPrice: 299.99,    // ~$25/mo
    downloadLimit: 200,     // base, increases with longer commitment
    features: [
      '200+ downloads/month',
      '4K quality',
      'Advanced search',
      'Set Builder Pro',
      'Early access',
      'Priority support',
    ],
    isPopular: true,
  },
];

export const subscriptionsApi = {
  // Get available membership tiers
  async getMemberships(): Promise<Membership[]> {
    if (DEV_CONFIG.useMockAuth) {
      return mockMemberships;
    }
    const raw = await get<Array<{
      id: number;
      name: string;
      slug: string;
      priceMonthly: number;
      priceAnnual: number;
      downloadLimit: number | null;
      features: Record<string, unknown> | string[];
      isPopular: boolean;
    }>>('/memberships');

    return raw.map(m => ({
      id: m.id,
      name: m.name,
      slug: m.slug as 'free' | 'starter' | 'pro' | 'elite',
      price: m.priceMonthly || 0,
      quarterlyPrice: m.priceMonthly ? +(m.priceMonthly * 3 * 0.95).toFixed(2) : 0,
      annualPrice: m.priceAnnual || (m.priceMonthly ? +(m.priceMonthly * 12 * 0.8).toFixed(2) : 0),
      downloadLimit: m.downloadLimit,
      features: adaptFeatures(m.features, m.slug),
      isPopular: m.isPopular || m.slug === 'pro',
    }));
  },

  // Get specific membership details
  async getMembership(id: number): Promise<Membership> {
    if (DEV_CONFIG.useMockAuth) {
      return mockMemberships.find(m => m.id === id) || mockMemberships[0];
    }
    return get<Membership>(`/memberships/${id}`);
  },

  // Get current user's membership status
  async getMembershipStatus(): Promise<MembershipStatus> {
    if (DEV_CONFIG.useMockAuth) {
      return {
        currentMembership: mockMemberships[0], // Free trial
        subscriptionStatus: 'trialing',
        periodEnd: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(), // 6 months
        cancelAtPeriodEnd: false,
        downloadsUsed: 0,
        downloadsRemaining: 2,
      };
    }
    // Server returns flat shape: { membershipType, membershipName, downloadLimit, downloadsUsed, ... }
    // Frontend expects: { currentMembership: Membership, subscriptionStatus, ... }
    const raw = await get<{
      membershipType: string;
      membershipName: string;
      membershipStatus: string;
      downloadLimit: number | null;
      downloadsUsed: number;
      downloadsRemaining: number | null;
      features: string[];
      hasActiveSubscription: boolean;
      resetDate: string;
    }>('/memberships/status');

    const currentMembership: Membership = {
      id: 0,
      name: raw.membershipName || raw.membershipType || 'Free',
      slug: ((raw.membershipType || 'free') as 'free' | 'starter' | 'pro' | 'elite'),
      price: 0,
      quarterlyPrice: 0,
      annualPrice: 0,
      downloadLimit: raw.downloadLimit,
      features: raw.features || [],
    };

    return {
      currentMembership,
      subscriptionStatus: raw.hasActiveSubscription ? 'active' : 'trialing',
      periodEnd: raw.resetDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      cancelAtPeriodEnd: false,
      downloadsUsed: raw.downloadsUsed || 0,
      downloadsRemaining: raw.downloadsRemaining ?? 'unlimited',
    };
  },

  // Create checkout session for subscription
  async createCheckoutSession(
    membershipId: number,
    interval: 'month' | 'quarter' | 'year' = 'month',
    successUrl?: string,
    cancelUrl?: string
  ): Promise<CheckoutSession> {
    if (DEV_CONFIG.useMockAuth) {
      return {
        sessionId: 'mock_session_123',
        url: '/membership/success?mock=true',
      };
    }
    return post<CheckoutSession>('/memberships/create-checkout', {
      membershipId,
      interval,
      successUrl: successUrl || `${window.location.origin}/membership/success`,
      cancelUrl: cancelUrl || `${window.location.origin}/membership`,
    });
  },

  // Cancel subscription
  async cancelSubscription(): Promise<{ message: string }> {
    if (DEV_CONFIG.useMockAuth) {
      return { message: 'Subscription cancelled (mock)' };
    }
    return post<{ message: string }>('/memberships/cancel');
  },

  // Resume cancelled subscription
  async resumeSubscription(): Promise<{ message: string }> {
    if (DEV_CONFIG.useMockAuth) {
      return { message: 'Subscription resumed (mock)' };
    }
    return post<{ message: string }>('/billing/subscription/resume');
  },

  // Change subscription plan
  async changeSubscriptionPlan(newMembershipId: number): Promise<{ message: string }> {
    if (DEV_CONFIG.useMockAuth) {
      return { message: 'Plan changed (mock)' };
    }
    return post<{ message: string }>('/billing/subscription/change', {
      membershipId: newMembershipId,
    });
  },

  // Get billing history
  async getBillingHistory(): Promise<BillingHistory> {
    if (DEV_CONFIG.useMockAuth) {
      return {
        invoices: [
          { id: 'inv_1', amount: 34.99, status: 'paid', created: '2026-01-01' },
          { id: 'inv_2', amount: 34.99, status: 'paid', created: '2025-12-01' },
          { id: 'inv_3', amount: 34.99, status: 'paid', created: '2025-11-01' },
        ],
      };
    }
    return get<BillingHistory>('/billing/history');
  },

  // Get upcoming invoice
  async getUpcomingInvoice(): Promise<UpcomingInvoice> {
    if (DEV_CONFIG.useMockAuth) {
      return {
        amount: 34.99,
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        items: [{ description: 'Video Pool Pro membership', amount: 34.99 }],
      };
    }
    return get<UpcomingInvoice>('/billing/upcoming');
  },

  // Get current subscription details
  async getSubscription(): Promise<{
    status: string;
    currentPeriodEnd: string;
    cancelAtPeriodEnd: boolean;
    membership: Membership;
  }> {
    if (DEV_CONFIG.useMockAuth) {
      return {
        status: 'trialing',
        currentPeriodEnd: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(), // 6 months
        cancelAtPeriodEnd: false,
        membership: mockMemberships[0], // Free trial
      };
    }
    return get('/billing/subscription');
  },

  // Create Stripe customer portal session
  async createPortalSession(): Promise<{ url: string }> {
    if (DEV_CONFIG.useMockAuth) {
      return { url: '/settings?tab=billing&mock=true' };
    }
    return post<{ url: string }>('/billing/portal');
  },

  // Get payment methods
  async getPaymentMethods(): Promise<PaymentMethod[]> {
    if (DEV_CONFIG.useMockAuth) {
      return [
        { id: 'pm_1', brand: 'visa', last4: '4242', expMonth: 12, expYear: 2027, isDefault: true },
      ];
    }
    return get<PaymentMethod[]>('/billing/payment-methods');
  },

  // Set default payment method
  async setDefaultPaymentMethod(paymentMethodId: string): Promise<{ message: string }> {
    if (DEV_CONFIG.useMockAuth) {
      return { message: 'Default payment method updated (mock)' };
    }
    return post<{ message: string }>(`/billing/payment-methods/${paymentMethodId}/default`);
  },

  // Delete payment method
  async deletePaymentMethod(paymentMethodId: string): Promise<{ message: string }> {
    if (DEV_CONFIG.useMockAuth) {
      return { message: 'Payment method deleted (mock)' };
    }
    const response = await fetch(`/api/billing/payment-methods/${paymentMethodId}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    return response.json();
  },

  // Retry failed payment
  async retryPayment(): Promise<{ message: string }> {
    if (DEV_CONFIG.useMockAuth) {
      return { message: 'Payment retried (mock)' };
    }
    return post<{ message: string }>('/billing/retry-payment');
  },
};

export default subscriptionsApi;

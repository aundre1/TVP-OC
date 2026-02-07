// ============================================
// THE VIDEO POOL - SUBSCRIPTION HOOKS
// ============================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { subscriptionsApi } from '@/api/subscriptions';

// Get available memberships
export function useMemberships() {
  return useQuery({
    queryKey: ['memberships'],
    queryFn: () => subscriptionsApi.getMemberships(),
    staleTime: 60 * 60 * 1000, // 1 hour
  });
}

// Get current membership status
export function useMembershipStatus() {
  return useQuery({
    queryKey: ['membership-status'],
    queryFn: () => subscriptionsApi.getMembershipStatus(),
    staleTime: 60 * 1000, // 1 minute
  });
}

// Get subscription details
export function useSubscription() {
  return useQuery({
    queryKey: ['subscription'],
    queryFn: () => subscriptionsApi.getSubscription(),
    staleTime: 60 * 1000,
  });
}

// Create checkout session
export function useCreateCheckout() {
  return useMutation({
    mutationFn: ({
      membershipId,
      interval = 'month',
    }: {
      membershipId: number;
      interval?: 'month' | 'year';
    }) => subscriptionsApi.createCheckoutSession(membershipId, interval),
    onSuccess: (data) => {
      // Redirect to Stripe checkout
      window.location.href = data.url;
    },
  });
}

// Cancel subscription
export function useCancelSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => subscriptionsApi.cancelSubscription(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['membership-status'] });
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
    },
  });
}

// Resume subscription
export function useResumeSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => subscriptionsApi.resumeSubscription(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['membership-status'] });
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
    },
  });
}

// Change subscription plan
export function useChangeSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (newMembershipId: number) =>
      subscriptionsApi.changeSubscriptionPlan(newMembershipId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['membership-status'] });
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
    },
  });
}

// Get billing history
export function useBillingHistory() {
  return useQuery({
    queryKey: ['billing-history'],
    queryFn: () => subscriptionsApi.getBillingHistory(),
    staleTime: 5 * 60 * 1000,
  });
}

// Get upcoming invoice
export function useUpcomingInvoice() {
  return useQuery({
    queryKey: ['upcoming-invoice'],
    queryFn: () => subscriptionsApi.getUpcomingInvoice(),
    staleTime: 60 * 1000,
  });
}

// Create customer portal session
export function useCustomerPortal() {
  return useMutation({
    mutationFn: () => subscriptionsApi.createPortalSession(),
    onSuccess: (data) => {
      // Redirect to Stripe customer portal
      window.location.href = data.url;
    },
  });
}

// Get payment methods
export function usePaymentMethods() {
  return useQuery({
    queryKey: ['payment-methods'],
    queryFn: () => subscriptionsApi.getPaymentMethods(),
    staleTime: 5 * 60 * 1000,
  });
}

// Set default payment method
export function useSetDefaultPaymentMethod() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (paymentMethodId: string) =>
      subscriptionsApi.setDefaultPaymentMethod(paymentMethodId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-methods'] });
    },
  });
}

// Delete payment method
export function useDeletePaymentMethod() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (paymentMethodId: string) =>
      subscriptionsApi.deletePaymentMethod(paymentMethodId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-methods'] });
    },
  });
}

// Retry failed payment
export function useRetryPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => subscriptionsApi.retryPayment(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
      queryClient.invalidateQueries({ queryKey: ['membership-status'] });
    },
  });
}

export default {
  useMemberships,
  useMembershipStatus,
  useSubscription,
  useCreateCheckout,
  useCancelSubscription,
  useResumeSubscription,
  useChangeSubscription,
  useBillingHistory,
  useUpcomingInvoice,
  useCustomerPortal,
  usePaymentMethods,
  useSetDefaultPaymentMethod,
  useDeletePaymentMethod,
  useRetryPayment,
};

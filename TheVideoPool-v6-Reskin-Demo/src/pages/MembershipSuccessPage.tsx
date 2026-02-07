// ============================================
// THE VIDEO POOL - MEMBERSHIP SUCCESS PAGE
// ============================================

import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle, Crown, Download, Sparkles, ArrowRight, Loader2 } from 'lucide-react';
import { subscriptionsApi } from '@/api/subscriptions';

export default function MembershipSuccessPage() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');

  const [isLoading, setIsLoading] = useState(true);
  const [membershipName, setMembershipName] = useState('');
  const [downloadLimit, setDownloadLimit] = useState<number | 'unlimited'>('unlimited');

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const status = await subscriptionsApi.getMembershipStatus();
        setMembershipName(status.currentMembership.name);
        setDownloadLimit(status.currentMembership.downloadLimit ?? 'unlimited');
      } catch {
        // Default values if fetch fails
        setMembershipName('Pro');
      } finally {
        setIsLoading(false);
      }
    };

    // Small delay to let Stripe webhook process
    setTimeout(fetchStatus, 1500);
  }, [sessionId]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-tvp-bg-primary">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-tvp-accent-cyan animate-spin" />
          <span className="text-tvp-text-secondary">Setting up your membership...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-tvp-bg-primary p-4">
      <div className="w-full max-w-lg text-center">
        {/* Success animation */}
        <div className="relative mb-8">
          <div className="w-24 h-24 bg-gradient-to-br from-tvp-accent-cyan to-tvp-accent-gold rounded-full flex items-center justify-center mx-auto animate-pulse">
            <CheckCircle className="w-12 h-12 text-tvp-bg-primary" />
          </div>
          <Sparkles className="absolute top-0 right-1/4 w-6 h-6 text-tvp-accent-gold animate-bounce" />
          <Sparkles className="absolute bottom-0 left-1/4 w-5 h-5 text-tvp-accent-cyan animate-bounce delay-150" />
        </div>

        <h1 className="text-3xl font-bold text-tvp-text-primary mb-2">
          Welcome to {membershipName}!
        </h1>
        <p className="text-lg text-tvp-text-secondary mb-8">
          Your subscription is now active. Let's dive into your new benefits.
        </p>

        {/* Benefits summary */}
        <div className="bg-tvp-bg-secondary border border-tvp-border-subtle rounded-2xl p-6 mb-8">
          <h2 className="text-lg font-semibold text-tvp-text-primary mb-4 flex items-center justify-center gap-2">
            <Crown className="w-5 h-5 text-tvp-accent-gold" />
            Your Benefits
          </h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-left">
              <div className="w-10 h-10 bg-tvp-accent-cyan/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <Download className="w-5 h-5 text-tvp-accent-cyan" />
              </div>
              <div>
                <p className="font-medium text-tvp-text-primary">
                  {downloadLimit === 'unlimited' ? 'Unlimited' : downloadLimit} Downloads/Month
                </p>
                <p className="text-sm text-tvp-text-muted">Access our entire catalog</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-left">
              <div className="w-10 h-10 bg-tvp-accent-gold/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-5 h-5 text-tvp-accent-gold" />
              </div>
              <div>
                <p className="font-medium text-tvp-text-primary">Priority Access</p>
                <p className="text-sm text-tvp-text-muted">Get new releases before everyone else</p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA buttons */}
        <div className="space-y-3">
          <Link
            to="/"
            className="flex items-center justify-center gap-2 w-full py-4 bg-tvp-accent-cyan hover:bg-tvp-accent-cyan-hover text-tvp-bg-primary font-semibold rounded-xl transition-colors"
          >
            Start Downloading
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            to="/settings"
            className="block w-full py-3 border border-tvp-border-default hover:border-tvp-accent-cyan text-tvp-text-primary font-medium rounded-xl transition-colors"
          >
            Manage Subscription
          </Link>
        </div>

        {/* Confirmation note */}
        <p className="mt-6 text-sm text-tvp-text-muted">
          A confirmation email has been sent to your inbox with your receipt.
        </p>
      </div>
    </div>
  );
}

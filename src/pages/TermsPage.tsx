// ============================================
// THE VIDEO POOL - TERMS OF SERVICE
// ============================================

import { Link } from 'react-router-dom';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-tvp-bg-primary text-tvp-text-primary px-6 py-12">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <Link to="/" className="inline-flex items-center gap-2 mb-6 text-tvp-text-muted hover:text-tvp-accent-cyan transition-colors text-sm">
            ← Back
          </Link>
          <h1 className="text-3xl font-bold text-tvp-text-primary mb-2">Terms of Service</h1>
          <p className="text-tvp-text-muted text-sm">Last updated: February 2026</p>
        </div>

        <div className="space-y-8 text-tvp-text-secondary leading-relaxed">

          <section>
            <h2 className="text-lg font-semibold text-tvp-text-primary mb-3">1. What We Are</h2>
            <p>The Video Pool is a subscription platform that provides professional DJs with access to a licensed catalog of music videos for live performance use. By creating an account, you agree to these terms.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-tvp-text-primary mb-3">2. Your Account</h2>
            <p>You must be 18 or older to create an account. You are responsible for keeping your login credentials secure. One account per person — sharing accounts is not permitted.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-tvp-text-primary mb-3">3. Subscriptions & Payments</h2>
            <p>Subscriptions are billed in advance on a monthly, quarterly, or annual basis. All payments are processed securely through Stripe. Subscriptions renew automatically until cancelled. Refunds are handled on a case-by-case basis — contact us at <a href="mailto:info@thevideopool.com" className="text-tvp-accent-cyan hover:underline">info@thevideopool.com</a>.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-tvp-text-primary mb-3">4. What You Can Do With Downloads</h2>
            <p>Downloads are licensed for <strong className="text-tvp-text-primary">personal DJ performance use only</strong>. You may not redistribute, re-sell, broadcast, or upload downloaded content to any platform (YouTube, social media, streaming services, etc.). Downloaded files may not be used in commercial productions without separate licensing.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-tvp-text-primary mb-3">5. Download Limits</h2>
            <p>Each subscription tier includes a monthly download allowance. Unused downloads do not roll over. Limits reset on the first of each month. Freemium accounts receive 2 downloads per month.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-tvp-text-primary mb-3">6. Cancellations</h2>
            <p>You can cancel your subscription at any time from your account settings. You retain access until the end of your current billing period. We do not pro-rate partial months.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-tvp-text-primary mb-3">7. Acceptable Use</h2>
            <p>Do not attempt to circumvent download limits, scrape the catalog, reverse-engineer the platform, or use automated tools to interact with the service. Violations result in immediate account termination.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-tvp-text-primary mb-3">8. Termination</h2>
            <p>We reserve the right to terminate accounts that violate these terms. You may delete your account at any time from Settings.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-tvp-text-primary mb-3">9. Disclaimers</h2>
            <p>The platform is provided "as is." We make no guarantees about uptime, catalog completeness, or uninterrupted service. We are not liable for any damages arising from use of the platform beyond the amount paid for your subscription in the preceding month.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-tvp-text-primary mb-3">10. Contact</h2>
            <p>Questions about these terms? Email us at <a href="mailto:info@thevideopool.com" className="text-tvp-accent-cyan hover:underline">info@thevideopool.com</a>.</p>
          </section>

        </div>

        <div className="mt-12 pt-8 border-t border-tvp-border-subtle flex gap-6 text-sm text-tvp-text-muted">
          <Link to="/privacy" className="hover:text-tvp-accent-cyan transition-colors">Privacy Policy</Link>
          <Link to="/contact" className="hover:text-tvp-accent-cyan transition-colors">Contact Us</Link>
          <Link to="/" className="hover:text-tvp-accent-cyan transition-colors">Back to Home</Link>
        </div>
      </div>
    </div>
  );
}

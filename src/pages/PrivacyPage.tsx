// ============================================
// THE VIDEO POOL - PRIVACY POLICY
// ============================================

import { Link } from 'react-router-dom';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-tvp-bg-primary text-tvp-text-primary px-6 py-12">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <Link to="/" className="inline-flex items-center gap-2 mb-6 text-tvp-text-muted hover:text-tvp-accent-cyan transition-colors text-sm">
            ← Back
          </Link>
          <h1 className="text-3xl font-bold text-tvp-text-primary mb-2">Privacy Policy</h1>
          <p className="text-tvp-text-muted text-sm">Last updated: February 2026</p>
        </div>

        <div className="space-y-8 text-tvp-text-secondary leading-relaxed">

          <section>
            <h2 className="text-lg font-semibold text-tvp-text-primary mb-3">What We Collect</h2>
            <ul className="space-y-2 list-none">
              <li><span className="text-tvp-text-primary font-medium">Account info:</span> Your email address, name, and password (hashed — we never see your actual password).</li>
              <li><span className="text-tvp-text-primary font-medium">OAuth info:</span> If you sign in with Google or Facebook, we receive your name, email, and profile photo from that provider.</li>
              <li><span className="text-tvp-text-primary font-medium">Phone number:</span> Optional, only if you add it for two-factor authentication. Stored securely, never shared.</li>
              <li><span className="text-tvp-text-primary font-medium">Usage data:</span> Download history, search queries, playlists you create. Used to improve your experience and our catalog.</li>
              <li><span className="text-tvp-text-primary font-medium">Payment info:</span> Handled entirely by Stripe. We never see or store your card number.</li>
              <li><span className="text-tvp-text-primary font-medium">Technical data:</span> IP address, browser type, session tokens for security purposes.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-tvp-text-primary mb-3">How We Use It</h2>
            <ul className="space-y-2 list-disc list-inside">
              <li>To operate your account and subscription</li>
              <li>To send transactional emails (verification codes, receipts, password resets)</li>
              <li>To personalize recommendations based on your download history</li>
              <li>To enforce download limits and prevent abuse</li>
              <li>To improve the platform and catalog</li>
            </ul>
            <p className="mt-3">We do not sell your data. We do not share it with third parties for marketing purposes.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-tvp-text-primary mb-3">Third-Party Services</h2>
            <ul className="space-y-2 list-disc list-inside">
              <li><strong className="text-tvp-text-primary">Stripe</strong> — payment processing. Subject to Stripe's privacy policy.</li>
              <li><strong className="text-tvp-text-primary">Brevo</strong> — transactional email delivery.</li>
              <li><strong className="text-tvp-text-primary">Google / Facebook</strong> — only if you use OAuth sign-in. We receive only basic profile data.</li>
              <li><strong className="text-tvp-text-primary">Wasabi / AWS S3</strong> — secure video file storage. No personal data is stored there.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-tvp-text-primary mb-3">Cookies & Sessions</h2>
            <p>We use session tokens (JWT) stored in your browser's local storage to keep you logged in. We do not use advertising cookies or tracking pixels.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-tvp-text-primary mb-3">Your Rights</h2>
            <p>You can delete your account at any time from Settings → Delete Account. This permanently removes your personal data from our database. You can also request a copy of your data by emailing <a href="mailto:info@thevideopool.com" className="text-tvp-accent-cyan hover:underline">info@thevideopool.com</a>.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-tvp-text-primary mb-3">Data Retention</h2>
            <p>We retain account data while your account is active. After account deletion, we purge personal data within 30 days. Download history may be retained in anonymized form for catalog analytics.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-tvp-text-primary mb-3">Security</h2>
            <p>All data is transmitted over HTTPS. Passwords are hashed using bcrypt. Access tokens expire and rotate regularly. We use industry-standard security practices throughout the platform.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-tvp-text-primary mb-3">Contact</h2>
            <p>Privacy questions or data requests: <a href="mailto:info@thevideopool.com" className="text-tvp-accent-cyan hover:underline">info@thevideopool.com</a></p>
          </section>

        </div>

        <div className="mt-12 pt-8 border-t border-tvp-border-subtle flex gap-6 text-sm text-tvp-text-muted">
          <Link to="/terms" className="hover:text-tvp-accent-cyan transition-colors">Terms of Service</Link>
          <Link to="/contact" className="hover:text-tvp-accent-cyan transition-colors">Contact Us</Link>
          <Link to="/" className="hover:text-tvp-accent-cyan transition-colors">Back to Home</Link>
        </div>
      </div>
    </div>
  );
}

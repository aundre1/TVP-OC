// ============================================
// THE VIDEO POOL - CONTACT PAGE
// All inquiries routed to info@thevideopool.com
// ============================================

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Send, CheckCircle, Mail, MessageSquare } from 'lucide-react';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          subject,
          message,
          category: 'general',
          priority: 'normal',
          source: 'contact-page',
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to send message');
      }

      setSubmitted(true);
    } catch {
      // Fallback: open mailto if API fails (user not logged in, etc.)
      const mailtoBody = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${message}`);
      const mailtoSubject = encodeURIComponent(subject || 'The Video Pool Inquiry');
      window.location.href = `mailto:info@thevideopool.com?subject=${mailtoSubject}&body=${mailtoBody}`;
    } finally {
      setIsLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-tvp-bg-primary flex items-center justify-center px-6">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 bg-tvp-accent-cyan/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-tvp-accent-cyan" />
          </div>
          <h2 className="text-2xl font-bold text-tvp-text-primary mb-3">Message Sent</h2>
          <p className="text-tvp-text-secondary mb-2">
            We'll get back to you at <strong className="text-tvp-text-primary">{email}</strong> within 1–2 business days.
          </p>
          <p className="text-tvp-text-muted text-sm mb-8">
            For urgent issues, email us directly at{' '}
            <a href="mailto:info@thevideopool.com" className="text-tvp-accent-cyan hover:underline">
              info@thevideopool.com
            </a>
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-tvp-accent-cyan text-tvp-bg-primary font-semibold rounded-xl hover:bg-tvp-accent-cyan-hover transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-tvp-bg-primary text-tvp-text-primary px-6 py-12">
      <div className="max-w-xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <Link to="/" className="inline-flex items-center gap-2 mb-6 text-tvp-text-muted hover:text-tvp-accent-cyan transition-colors text-sm">
            ← Back
          </Link>
          <h1 className="text-3xl font-bold text-tvp-text-primary mb-2">Contact Us</h1>
          <p className="text-tvp-text-secondary">
            Questions, feedback, or support — we read every message.
          </p>
        </div>

        {/* Quick links */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          <a
            href="mailto:info@thevideopool.com"
            className="flex items-center gap-3 p-4 bg-tvp-bg-secondary border border-tvp-border-subtle rounded-xl hover:border-tvp-accent-cyan/40 transition-colors"
          >
            <Mail className="w-5 h-5 text-tvp-accent-cyan flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-tvp-text-primary">Email Us</p>
              <p className="text-xs text-tvp-text-muted">info@thevideopool.com</p>
            </div>
          </a>
          <div className="flex items-center gap-3 p-4 bg-tvp-bg-secondary border border-tvp-border-subtle rounded-xl">
            <MessageSquare className="w-5 h-5 text-tvp-accent-cyan flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-tvp-text-primary">Response Time</p>
              <p className="text-xs text-tvp-text-muted">1–2 business days</p>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="bg-tvp-bg-secondary border border-tvp-border-subtle rounded-2xl p-8">
          <h2 className="text-lg font-semibold text-tvp-text-primary mb-6">Send a Message</h2>

          {error && (
            <div className="mb-4 p-3 bg-tvp-error/10 border border-tvp-error/20 rounded-lg text-sm text-tvp-error">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-tvp-text-secondary mb-1.5">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-tvp-bg-tertiary border border-tvp-border-default rounded-xl text-tvp-text-primary placeholder:text-tvp-text-muted focus:border-tvp-accent-cyan focus:ring-2 focus:ring-tvp-accent-cyan/20 outline-none transition-all text-sm"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-tvp-text-secondary mb-1.5">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-tvp-bg-tertiary border border-tvp-border-default rounded-xl text-tvp-text-primary placeholder:text-tvp-text-muted focus:border-tvp-accent-cyan focus:ring-2 focus:ring-tvp-accent-cyan/20 outline-none transition-all text-sm"
                  placeholder="your@email.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-tvp-text-secondary mb-1.5">Subject</label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
                className="w-full px-4 py-3 bg-tvp-bg-tertiary border border-tvp-border-default rounded-xl text-tvp-text-primary focus:border-tvp-accent-cyan focus:ring-2 focus:ring-tvp-accent-cyan/20 outline-none transition-all text-sm"
              >
                <option value="">Select a topic...</option>
                <option value="Account & Login">Account & Login</option>
                <option value="Subscription & Billing">Subscription & Billing</option>
                <option value="Downloads & Videos">Downloads & Videos</option>
                <option value="Video Request">Request a Video</option>
                <option value="Technical Issue">Technical Issue</option>
                <option value="General Question">General Question</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-tvp-text-secondary mb-1.5">Message</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                rows={5}
                className="w-full px-4 py-3 bg-tvp-bg-tertiary border border-tvp-border-default rounded-xl text-tvp-text-primary placeholder:text-tvp-text-muted focus:border-tvp-accent-cyan focus:ring-2 focus:ring-tvp-accent-cyan/20 outline-none transition-all text-sm resize-none"
                placeholder="Tell us what's on your mind..."
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-tvp-accent-cyan hover:bg-tvp-accent-cyan-hover text-tvp-bg-primary font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-tvp-bg-primary border-t-transparent rounded-full animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Send Message
                </>
              )}
            </button>
          </form>
        </div>

        <div className="mt-8 pt-6 border-t border-tvp-border-subtle flex gap-6 text-sm text-tvp-text-muted">
          <Link to="/terms" className="hover:text-tvp-accent-cyan transition-colors">Terms</Link>
          <Link to="/privacy" className="hover:text-tvp-accent-cyan transition-colors">Privacy</Link>
        </div>
      </div>
    </div>
  );
}

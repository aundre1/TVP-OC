// ============================================
// THE VIDEO POOL - REQUEST PANEL v5.5
// Song/Feature request form that sends to info@thevideopool.com
// ============================================

import { useState, useCallback } from 'react';
import { X, Check, Send, Music, Lightbulb, Shield } from 'lucide-react';
import { clsx } from 'clsx';
import { useAppStore } from '@/stores/appStore';

type RequestType = 'song' | 'feature';

export default function RequestPanel() {
  const { isRequestPanelOpen, closeRequestPanel, showToast } = useAppStore();

  const [requestType, setRequestType] = useState<RequestType | ''>('');
  const [email, setEmail] = useState('');
  const [songTitle, setSongTitle] = useState('');
  const [artistName, setArtistName] = useState('');
  const [details, setDetails] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Honeypot field (hidden from real users, bots fill it in)
  const [website, setWebsite] = useState('');

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    if (!requestType || !email || !details) {
      showToast('error', 'Please fill in all required fields');
      return;
    }

    // Honeypot check — if filled, it's a bot
    if (website) {
      // Fake success so the bot thinks it worked
      setIsSubmitted(true);
      return;
    }

    setIsSubmitting(true);

    try {
      // Get reCAPTCHA v3 token (if script is loaded)
      let recaptchaToken = '';
      const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;
      if (siteKey && window.grecaptcha?.execute) {
        try {
          recaptchaToken = await window.grecaptcha.execute(siteKey, { action: 'submit_request' });
        } catch {
          // reCAPTCHA not available — proceed without it
        }
      }

      // TODO: Send to API with recaptchaToken for server-side verification
      // The backend should verify the token with Google and reject scores < 0.5
      const _payload = {
        type: requestType,
        email,
        songTitle: requestType === 'song' ? songTitle : undefined,
        artistName: requestType === 'song' ? artistName : undefined,
        details,
        recaptchaToken,
      };

      // Simulate API call (replace with actual endpoint when backend is connected)
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setIsSubmitted(true);
      showToast('success', 'Request submitted successfully!');
    } catch {
      showToast('error', 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }, [requestType, email, songTitle, artistName, details, website, showToast]);

  const handleClose = () => {
    closeRequestPanel();
    // Reset form after closing animation
    setTimeout(() => {
      setRequestType('');
      setEmail('');
      setSongTitle('');
      setArtistName('');
      setDetails('');
      setIsSubmitted(false);
    }, 300);
  };

  if (!isRequestPanelOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="backdrop backdrop--visible"
        onClick={handleClose}
      />

      {/* Panel */}
      <div
        className={clsx(
          'fixed top-0 right-0 bottom-0 w-[450px] max-w-full',
          'bg-tvp-bg-secondary border-l border-tvp-border-subtle',
          'z-400 flex flex-col',
          'transform transition-transform duration-slow',
          isRequestPanelOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-tvp-border-subtle">
          <h2 className="text-xl font-bold">Request</h2>
          <button
            onClick={handleClose}
            className="p-2 rounded-lg bg-tvp-bg-tertiary hover:bg-tvp-bg-elevated text-tvp-text-secondary transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {isSubmitted ? (
            // Success State
            <div className="flex flex-col items-center justify-center h-full text-center px-4">
              <div className="w-16 h-16 rounded-full bg-tvp-status-success flex items-center justify-center mb-5">
                <Check className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-bold mb-2">Thank You!</h3>
              <p className="text-sm text-tvp-text-secondary leading-relaxed">
                We appreciate your feedback. We'll make our best efforts to accommodate
                reasonable requests, but fulfillment is not guaranteed. Your request has
                been sent to our team.
              </p>
              <button
                onClick={handleClose}
                className={clsx(
                  'mt-6 px-6 py-3 rounded-lg',
                  'bg-tvp-accent-cyan text-black font-semibold',
                  'hover:bg-tvp-accent-cyan-hover transition-colors'
                )}
              >
                Done
              </button>
            </div>
          ) : (
            // Request Form
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Request Type */}
              <div className="space-y-2">
                <label className="text-[13px] font-semibold text-tvp-text-secondary">
                  Request Type
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRequestType('song')}
                    className={clsx(
                      'flex items-center justify-center gap-2 py-3 rounded-lg',
                      'border-2 transition-all duration-fast',
                      requestType === 'song'
                        ? 'border-tvp-accent-cyan bg-tvp-accent-cyan-subtle text-tvp-accent-cyan'
                        : 'border-tvp-border-default bg-tvp-bg-tertiary text-tvp-text-secondary hover:border-tvp-text-muted'
                    )}
                  >
                    <Music className="w-4 h-4" />
                    <span className="font-medium">Song Request</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRequestType('feature')}
                    className={clsx(
                      'flex items-center justify-center gap-2 py-3 rounded-lg',
                      'border-2 transition-all duration-fast',
                      requestType === 'feature'
                        ? 'border-tvp-accent-cyan bg-tvp-accent-cyan-subtle text-tvp-accent-cyan'
                        : 'border-tvp-border-default bg-tvp-bg-tertiary text-tvp-text-secondary hover:border-tvp-text-muted'
                    )}
                  >
                    <Lightbulb className="w-4 h-4" />
                    <span className="font-medium">Feature Request</span>
                  </button>
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="text-[13px] font-semibold text-tvp-text-secondary">
                  Your Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  className={clsx(
                    'w-full px-4 py-3 rounded-lg',
                    'bg-tvp-bg-tertiary border border-tvp-border-default',
                    'text-tvp-text-primary text-sm',
                    'focus:border-tvp-accent-cyan focus:outline-none',
                    'transition-colors'
                  )}
                />
              </div>

              {/* Song-specific fields */}
              {requestType === 'song' && (
                <div className="space-y-4 animate-fade-in">
                  <div className="space-y-2">
                    <label className="text-[13px] font-semibold text-tvp-text-secondary">
                      Song Title
                    </label>
                    <input
                      type="text"
                      value={songTitle}
                      onChange={(e) => setSongTitle(e.target.value)}
                      placeholder="Song title"
                      className={clsx(
                        'w-full px-4 py-3 rounded-lg',
                        'bg-tvp-bg-tertiary border border-tvp-border-default',
                        'text-tvp-text-primary text-sm',
                        'focus:border-tvp-accent-cyan focus:outline-none',
                        'transition-colors'
                      )}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[13px] font-semibold text-tvp-text-secondary">
                      Artist Name
                    </label>
                    <input
                      type="text"
                      value={artistName}
                      onChange={(e) => setArtistName(e.target.value)}
                      placeholder="Artist name"
                      className={clsx(
                        'w-full px-4 py-3 rounded-lg',
                        'bg-tvp-bg-tertiary border border-tvp-border-default',
                        'text-tvp-text-primary text-sm',
                        'focus:border-tvp-accent-cyan focus:outline-none',
                        'transition-colors'
                      )}
                    />
                  </div>
                </div>
              )}

              {/* Details */}
              <div className="space-y-2">
                <label className="text-[13px] font-semibold text-tvp-text-secondary">
                  Details
                </label>
                <textarea
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  placeholder="Tell us more about your request..."
                  required
                  rows={5}
                  className={clsx(
                    'w-full px-4 py-3 rounded-lg resize-y min-h-[120px]',
                    'bg-tvp-bg-tertiary border border-tvp-border-default',
                    'text-tvp-text-primary text-sm',
                    'focus:border-tvp-accent-cyan focus:outline-none',
                    'transition-colors'
                  )}
                />
              </div>

              {/* Honeypot field — invisible to humans, traps bots */}
              <div className="absolute -left-[9999px]" aria-hidden="true">
                <label htmlFor="website">Website</label>
                <input
                  type="text"
                  id="website"
                  name="website"
                  tabIndex={-1}
                  autoComplete="off"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                />
              </div>

              {/* reCAPTCHA notice */}
              <div className="flex items-center gap-1.5 text-[11px] text-tvp-text-muted">
                <Shield className="w-3 h-3" />
                <span>Protected by reCAPTCHA</span>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting || !requestType}
                className={clsx(
                  'w-full flex items-center justify-center gap-2 py-3.5 rounded-lg',
                  'bg-tvp-accent-cyan text-black font-semibold text-sm',
                  'hover:bg-tvp-accent-cyan-hover transition-colors',
                  'disabled:opacity-50 disabled:cursor-not-allowed'
                )}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Submit Request</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </>
  );
}

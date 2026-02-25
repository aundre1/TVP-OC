// ============================================
// THE VIDEO POOL - SONG REQUEST FORM
// ============================================

import { useState } from 'react';
import { Music, CheckCircle, Loader2 } from 'lucide-react';
import { supportApi } from '@/api/support';

export default function SongRequestForm({ onClose }: { onClose?: () => void }) {
  const [artist, setArtist] = useState('');
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await supportApi.createTicket({
        category: 'song_request',
        subject: `Song Request: ${artist} - ${title}`,
        message: `Artist: ${artist}\nTitle: ${title}${notes ? `\nNotes: ${notes}` : ''}`,
      });
      setSuccess(true);
    } catch (e: any) {
      setError(e.response?.data?.error || 'Failed to submit request');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center py-8">
        <CheckCircle className="w-12 h-12 text-tvp-success mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-tvp-text-primary mb-2">Request Submitted!</h3>
        <p className="text-tvp-text-secondary text-sm">We'll try to add this within 48-72 hours!</p>
        {onClose && (
          <button onClick={onClose} className="mt-4 px-4 py-2 bg-tvp-accent-cyan text-tvp-bg-primary rounded-lg text-sm">Close</button>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="flex items-center gap-2 mb-4">
        <Music className="w-5 h-5 text-tvp-accent-cyan" />
        <h3 className="text-lg font-semibold text-tvp-text-primary">Request a Track</h3>
      </div>

      {error && <div className="mb-4 p-3 bg-tvp-error/10 border border-tvp-error/20 rounded-lg text-sm text-tvp-error">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-tvp-text-secondary mb-1">Artist *</label>
          <input value={artist} onChange={e => setArtist(e.target.value)} required
            className="w-full px-3 py-2 bg-tvp-bg-tertiary border border-tvp-border-default rounded-lg text-tvp-text-primary"
            placeholder="e.g. Drake" />
        </div>
        <div>
          <label className="block text-sm font-medium text-tvp-text-secondary mb-1">Title *</label>
          <input value={title} onChange={e => setTitle(e.target.value)} required
            className="w-full px-3 py-2 bg-tvp-bg-tertiary border border-tvp-border-default rounded-lg text-tvp-text-primary"
            placeholder="e.g. Hotline Bling" />
        </div>
        <div>
          <label className="block text-sm font-medium text-tvp-text-secondary mb-1">Notes (optional)</label>
          <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2}
            className="w-full px-3 py-2 bg-tvp-bg-tertiary border border-tvp-border-default rounded-lg text-tvp-text-primary resize-none"
            placeholder="Any specific version, clean/dirty, etc." />
        </div>
        <button type="submit" disabled={loading}
          className="w-full py-2.5 bg-tvp-accent-cyan text-tvp-bg-primary font-medium rounded-lg hover:bg-tvp-accent-cyan-hover disabled:opacity-50 flex items-center justify-center gap-2">
          {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</> : 'Submit Request'}
        </button>
      </form>
    </div>
  );
}

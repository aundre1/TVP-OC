// ============================================
// THE VIDEO POOL - SHARE SET MODAL
// Modal for sharing setlists with viral features
// ============================================

import { useState, useCallback } from 'react';
import {
  X,
  Link2,
  Copy,
  Check,
  Twitter,
  Facebook,
  MessageCircle,
  Mail,
  QrCode,
  Eye,
  Music,
  Clock,
  Users,
  Sparkles,
} from 'lucide-react';
import { clsx } from 'clsx';
import { SetBuilderTrack } from '@/types';

interface ShareSetModalProps {
  isOpen: boolean;
  onClose: () => void;
  tracks: SetBuilderTrack[];
  setName?: string;
}

// Generate a shareable link (in production, this would call an API)
function generateShareId(tracks: SetBuilderTrack[]): string {
  // In production: POST to /api/shared-sets, returns unique ID
  // For now, create a simple hash from track IDs
  const trackIds = tracks.map((t) => t.id).join('-');
  const hash = btoa(trackIds).replace(/[^a-zA-Z0-9]/g, '').slice(0, 12);
  return hash;
}

export default function ShareSetModal({
  isOpen,
  onClose,
  tracks,
  setName = 'My DJ Set',
}: ShareSetModalProps) {
  const [copied, setCopied] = useState(false);
  const [shareId] = useState(() => generateShareId(tracks));
  const [isPublic, setIsPublic] = useState(true);
  const [showQR, setShowQR] = useState(false);

  // Calculate set stats
  const totalDuration = tracks.reduce((acc, track) => {
    if (typeof track.duration === 'number') return acc + track.duration;
    const parts = track.duration.split(':').map(Number);
    if (parts.length === 2) return acc + parts[0] * 60 + parts[1];
    return acc + (parseInt(track.duration, 10) || 0);
  }, 0);

  const formatDuration = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hrs > 0) return `${hrs}h ${mins}m`;
    return `${mins} min`;
  };

  // Share URL
  const shareUrl = `${window.location.origin}/set/${shareId}`;
  const shareTitle = `Check out my DJ set: ${setName}`;
  const shareText = `${setName} - ${tracks.length} tracks (${formatDuration(totalDuration)}) on The Video Pool`;

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }, [shareUrl]);

  const handleShare = useCallback(
    (platform: string) => {
      const urls: Record<string, string> = {
        twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
        whatsapp: `https://wa.me/?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`,
        email: `mailto:?subject=${encodeURIComponent(shareTitle)}&body=${encodeURIComponent(`${shareText}\n\n${shareUrl}`)}`,
      };

      if (urls[platform]) {
        window.open(urls[platform], '_blank', 'width=600,height=400');
      }
    },
    [shareUrl, shareText, shareTitle]
  );

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-500"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg z-500">
        <div className="bg-tvp-bg-secondary border border-tvp-border-subtle rounded-2xl shadow-elevated overflow-hidden">
          {/* Header */}
          <div className="relative px-6 py-5 border-b border-tvp-border-subtle bg-gradient-to-r from-tvp-accent-cyan/10 to-tvp-accent-coral/10">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-lg hover:bg-tvp-bg-tertiary text-tvp-text-muted hover:text-tvp-text-primary transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-tvp-accent-cyan/20 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-tvp-accent-cyan" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-tvp-text-primary">Share Your Set</h2>
                <p className="text-sm text-tvp-text-muted">Let other DJs discover your curation</p>
              </div>
            </div>
          </div>

          {/* Set Preview */}
          <div className="px-6 py-4 border-b border-tvp-border-subtle bg-tvp-bg-tertiary/50">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-tvp-text-primary">{setName}</h3>
                <div className="flex items-center gap-4 mt-1 text-sm text-tvp-text-muted">
                  <span className="flex items-center gap-1">
                    <Music className="w-3.5 h-3.5" />
                    {tracks.length} tracks
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {formatDuration(totalDuration)}
                  </span>
                </div>
              </div>

              {/* Visibility Toggle */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsPublic(!isPublic)}
                  className={clsx(
                    'flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors',
                    isPublic
                      ? 'bg-tvp-accent-cyan/20 text-tvp-accent-cyan'
                      : 'bg-tvp-bg-tertiary text-tvp-text-muted'
                  )}
                >
                  {isPublic ? <Eye className="w-4 h-4" /> : <Users className="w-4 h-4" />}
                  {isPublic ? 'Public' : 'Private'}
                </button>
              </div>
            </div>

            {/* Track Preview */}
            <div className="mt-3 space-y-1">
              {tracks.slice(0, 3).map((track, i) => (
                <div key={track.id} className="flex items-center gap-2 text-xs">
                  <span className="w-4 text-center text-tvp-text-muted">{i + 1}</span>
                  <span className="text-tvp-text-secondary truncate">{track.artist}</span>
                  <span className="text-tvp-text-muted">-</span>
                  <span className="text-tvp-text-primary truncate">{track.title}</span>
                </div>
              ))}
              {tracks.length > 3 && (
                <div className="text-xs text-tvp-text-muted pl-6">
                  + {tracks.length - 3} more tracks
                </div>
              )}
            </div>
          </div>

          {/* Share Link */}
          <div className="px-6 py-4 border-b border-tvp-border-subtle">
            <label className="block text-sm font-medium text-tvp-text-secondary mb-2">
              Share Link
            </label>
            <div className="flex gap-2">
              <div className="flex-1 flex items-center gap-2 px-4 py-3 bg-tvp-bg-tertiary rounded-xl border border-tvp-border-subtle">
                <Link2 className="w-4 h-4 text-tvp-text-muted flex-shrink-0" />
                <span className="text-sm text-tvp-text-secondary truncate">{shareUrl}</span>
              </div>
              <button
                onClick={handleCopy}
                className={clsx(
                  'flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition-all',
                  copied
                    ? 'bg-tvp-success text-white'
                    : 'bg-tvp-accent-cyan text-black hover:bg-tvp-accent-cyan-hover'
                )}
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Social Share */}
          <div className="px-6 py-4 border-b border-tvp-border-subtle">
            <label className="block text-sm font-medium text-tvp-text-secondary mb-3">
              Share on Social
            </label>
            <div className="flex gap-3">
              <button
                onClick={() => handleShare('twitter')}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-[#1DA1F2] text-white hover:opacity-90 transition-opacity"
              >
                <Twitter className="w-5 h-5" />
                <span className="text-sm font-medium">Twitter</span>
              </button>
              <button
                onClick={() => handleShare('facebook')}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-[#4267B2] text-white hover:opacity-90 transition-opacity"
              >
                <Facebook className="w-5 h-5" />
                <span className="text-sm font-medium">Facebook</span>
              </button>
              <button
                onClick={() => handleShare('whatsapp')}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-[#25D366] text-white hover:opacity-90 transition-opacity"
              >
                <MessageCircle className="w-5 h-5" />
                <span className="text-sm font-medium">WhatsApp</span>
              </button>
              <button
                onClick={() => handleShare('email')}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-tvp-bg-tertiary text-tvp-text-secondary hover:bg-tvp-bg-elevated transition-colors"
              >
                <Mail className="w-5 h-5" />
                <span className="text-sm font-medium">Email</span>
              </button>
            </div>
          </div>

          {/* QR Code Toggle */}
          <div className="px-6 py-4">
            <button
              onClick={() => setShowQR(!showQR)}
              className="flex items-center gap-2 text-sm text-tvp-text-secondary hover:text-tvp-accent-cyan transition-colors"
            >
              <QrCode className="w-4 h-4" />
              {showQR ? 'Hide QR Code' : 'Show QR Code'}
            </button>

            {showQR && (
              <div className="mt-4 flex flex-col items-center">
                <div className="w-40 h-40 bg-white p-3 rounded-xl">
                  {/* Placeholder QR - in production use a QR library */}
                  <div className="w-full h-full bg-tvp-bg-tertiary rounded flex items-center justify-center">
                    <QrCode className="w-16 h-16 text-tvp-text-muted" />
                  </div>
                </div>
                <p className="mt-2 text-xs text-tvp-text-muted">Scan to view set</p>
              </div>
            )}
          </div>

          {/* Viral Features */}
          <div className="px-6 py-4 bg-tvp-bg-tertiary/50 border-t border-tvp-border-subtle">
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2 text-tvp-text-muted">
                <Eye className="w-4 h-4" />
                <span>0 views</span>
              </div>
              <div className="flex items-center gap-2 text-tvp-text-muted">
                <Copy className="w-4 h-4" />
                <span>0 copies</span>
              </div>
              <div className="ml-auto text-xs text-tvp-text-muted">
                Link never expires
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

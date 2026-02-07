// ============================================
// THE VIDEO POOL - SHARED SET PAGE
// Public view of shared setlists (no auth required)
// ============================================

import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Music,
  Clock,
  Play,
  Copy,
  Heart,
  Share2,
  ChevronRight,
  User,
  Calendar,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { clsx } from 'clsx';
import { useAuthStore } from '@/stores/authStore';
import { useAppStore } from '@/stores/appStore';
import { sampleTracks } from '@/data/tracks';
import type { Track } from '@/types';

interface SharedSet {
  id: string;
  name: string;
  description?: string;
  createdBy: { username: string };
  createdAt: string;
  tracks: Track[];
  viewCount: number;
  copyCount: number;
  likeCount: number;
}

// Mock fetch (in production: API call)
async function fetchSharedSet(shareId: string): Promise<SharedSet | null> {
  await new Promise((resolve) => setTimeout(resolve, 500));
  try {
    return {
      id: shareId,
      name: 'Friday Night Club Set',
      description: 'High energy mix for peak hours. Transitions from 120-128 BPM.',
      createdBy: { username: 'DJ_Master' },
      createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      tracks: sampleTracks.slice(0, 8),
      viewCount: 247,
      copyCount: 23,
      likeCount: 89,
    };
  } catch {
    return null;
  }
}

export default function SharedSetPage() {
  const { shareId } = useParams<{ shareId: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const { addToSet, showToast, openPreviewModal } = useAppStore();

  const [set, setSet] = useState<SharedSet | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [isCopying, setIsCopying] = useState(false);

  useEffect(() => {
    if (!shareId) {
      setError('Invalid share link');
      setIsLoading(false);
      return;
    }
    fetchSharedSet(shareId)
      .then((data) => setSet(data))
      .catch(() => setError('Failed to load set'))
      .finally(() => setIsLoading(false));
  }, [shareId]);

  const totalDuration = set?.tracks.reduce((acc, track) => {
    if (typeof track.duration === 'number') return acc + track.duration;
    const parts = track.duration.split(':').map(Number);
    if (parts.length === 2) return acc + parts[0] * 60 + parts[1];
    return acc + (parseInt(track.duration, 10) || 0);
  }, 0) || 0;

  const formatDuration = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return hrs > 0 ? `${hrs}h ${mins}m` : `${mins} min`;
  };

  const handleCopySet = async () => {
    if (!set) return;
    if (!isAuthenticated) {
      showToast('info', 'Sign in to copy this set');
      navigate('/login', { state: { from: `/set/${shareId}` } });
      return;
    }
    setIsCopying(true);
    set.tracks.forEach((track) => addToSet(track));
    showToast('success', `Copied ${set.tracks.length} tracks to Set Builder!`);
    setIsCopying(false);
  };

  const handleShare = async () => {
    await navigator.clipboard.writeText(window.location.href);
    showToast('success', 'Link copied!');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-tvp-accent-cyan animate-spin" />
      </div>
    );
  }

  if (error || !set) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center px-6">
          <AlertCircle className="w-12 h-12 text-tvp-status-error mx-auto mb-4" />
          <h1 className="text-xl font-bold mb-2">Set Not Found</h1>
          <Link to="/" className="text-tvp-accent-cyan hover:underline">Go Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-tvp-bg-primary">
      {/* Hero */}
      <div className="bg-gradient-to-b from-tvp-accent-cyan/10 to-tvp-bg-primary">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <nav className="flex items-center gap-2 text-sm text-tvp-text-muted mb-8">
            <Link to="/" className="hover:text-tvp-accent-cyan">Home</Link>
            <ChevronRight className="w-4 h-4" />
            <span>Shared Set</span>
          </nav>

          <div className="flex gap-8">
            <div className="w-48 h-48 rounded-2xl bg-gradient-to-br from-tvp-accent-cyan/30 to-tvp-accent-coral/30 flex items-center justify-center">
              <Music className="w-20 h-20 text-tvp-accent-cyan" />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">{set.name}</h1>
              {set.description && <p className="text-tvp-text-secondary mb-4">{set.description}</p>}
              <div className="flex items-center gap-3 mb-4 text-sm text-tvp-text-muted">
                <User className="w-4 h-4" />
                <span>{set.createdBy.username}</span>
                <span>•</span>
                <span>{set.tracks.length} tracks</span>
                <span>•</span>
                <Clock className="w-4 h-4" />
                <span>{formatDuration(totalDuration)}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-8">
            <button onClick={handleCopySet} disabled={isCopying} className="flex items-center gap-2 px-6 py-3 bg-tvp-accent-cyan text-black font-semibold rounded-xl hover:bg-tvp-accent-cyan-hover">
              <Copy className="w-5 h-5" />
              Copy to My Set
            </button>
            <button onClick={() => setIsLiked(!isLiked)} className={clsx('flex items-center gap-2 px-4 py-3 rounded-xl border', isLiked ? 'border-tvp-accent-coral text-tvp-accent-coral' : 'border-tvp-border-subtle')}>
              <Heart className={clsx('w-5 h-5', isLiked && 'fill-current')} />
            </button>
            <button onClick={handleShare} className="flex items-center gap-2 px-4 py-3 rounded-xl border border-tvp-border-subtle">
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Track List */}
      <div className="max-w-4xl mx-auto px-6 pb-12">
        <div className="bg-tvp-bg-secondary border border-tvp-border-subtle rounded-xl overflow-hidden">
          <div className="grid grid-cols-[40px_1fr_80px_60px_80px] gap-4 px-4 py-3 border-b border-tvp-border-subtle text-xs font-medium text-tvp-text-muted uppercase">
            <span>#</span><span>Title</span><span className="text-right">BPM</span><span className="text-center">Key</span><span className="text-right">Duration</span>
          </div>
          {set.tracks.map((track, i) => (
            <div key={track.id} className="grid grid-cols-[40px_1fr_80px_60px_80px] gap-4 px-4 py-3 items-center hover:bg-tvp-bg-tertiary/50 group">
              <div className="relative">
                <span className="text-sm text-tvp-text-muted group-hover:opacity-0">{i + 1}</span>
                <button onClick={() => openPreviewModal(track.id)} className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <Play className="w-4 h-4 text-tvp-accent-cyan" />
                </button>
              </div>
              <div className="min-w-0">
                <div className="text-sm font-medium truncate">{track.title}</div>
                <div className="text-xs text-tvp-text-muted truncate">{track.artist}</div>
              </div>
              <div className="text-sm text-right font-mono">{track.bpm}</div>
              <div className="text-sm text-tvp-accent-cyan text-center font-mono">{track.key}</div>
              <div className="text-sm text-tvp-text-muted text-right font-mono">{track.duration}</div>
            </div>
          ))}
        </div>

        {!isAuthenticated && (
          <div className="mt-8 p-6 bg-gradient-to-r from-tvp-accent-cyan/10 to-tvp-accent-coral/10 rounded-xl text-center">
            <h3 className="text-lg font-semibold mb-2">Create your own sets</h3>
            <p className="text-tvp-text-secondary mb-4">Join The Video Pool for 30,000+ music videos</p>
            <Link to="/register" className="px-6 py-3 bg-tvp-accent-cyan text-black font-semibold rounded-xl">Start Free Trial</Link>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================
// THE VIDEO POOL - PREVIEW MODAL v6.0 (Reskinned)
// shadcn/ui Dialog + CSS variables
// ============================================

import { useState } from 'react';
import {
  X,
  Play,
  Pause,
  Download,
  Plus,
  ChevronDown,
  Volume2,
  Maximize2,
  SkipBack,
  SkipForward,
  Lock,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/stores/appStore';
import { getTrackById } from '@/data/tracks';
import { useDownloadWithLimitCheck } from '@/hooks';
import { VersionType, VideoQuality } from '@/types';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

// Version types available
const VERSION_TYPES: VersionType[] = ['Clean', 'Explicit', 'Intro', 'Outro', 'Quick Hit', 'Xtendz'];

// Quality options
const VIDEO_QUALITIES: { value: VideoQuality; label: string; size: string }[] = [
  { value: '4K', label: '4K Ultra HD', size: '~2.5 GB' },
  { value: '1080p', label: '1080p Full HD', size: '~800 MB' },
  { value: '720p', label: '720p HD', size: '~400 MB' },
];

const AUDIO_QUALITIES: { value: string; label: string; size: string }[] = [
  { value: '320', label: '320 kbps', size: '~12 MB' },
  { value: '192', label: '192 kbps', size: '~8 MB' },
];

export default function PreviewModal() {
  const {
    isPreviewModalOpen,
    previewTrackId,
    closePreviewModal,
    addToSet,
    showToast,
    openDownloadQualityModal,
  } = useAppStore();

  const {
    canDownload,
    isAtLimit,
    isNearLimit,
    downloadsRemaining,
    isDownloading,
    openDownloadLimitModal,
  } = useDownloadWithLimitCheck();

  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState<VersionType>('Clean');
  const [videoQuality, setVideoQuality] = useState<VideoQuality>('1080p');
  const [audioQuality, setAudioQuality] = useState('320');
  const [showVersions, setShowVersions] = useState(false);

  const track = previewTrackId ? getTrackById(previewTrackId) : null;

  if (!isPreviewModalOpen || !track) return null;

  const handleDownload = () => {
    // Check if at download limit
    if (isAtLimit || !canDownload) {
      openDownloadLimitModal();
      return;
    }

    // Open quality selection modal (closes preview modal first)
    closePreviewModal();
    openDownloadQualityModal(track.id);
  };

  const handleAddToSet = () => {
    addToSet(track);
  };

  // Simulate available versions (in production, this would come from API)
  const availableVersions = VERSION_TYPES.slice(0, Math.min(track.id % 4 + 2, 6));

  return (
    <Dialog open={isPreviewModalOpen} onOpenChange={(open) => !open && closePreviewModal()}>
      <DialogContent
        className="max-w-[900px] p-0 gap-0 overflow-hidden"
        style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-default)',
        }}
      >
        {/* Video Player Area */}
        <div className="relative bg-black aspect-video">
          {/* Video Thumbnail */}
          <img
            src={`https://picsum.photos/900/506?random=${track.id}`}
            alt={track.title}
            className="w-full h-full object-contain"
          />

          {/* Play Overlay */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-16 h-16 rounded-full bg-cyan-400 hover:bg-cyan-300 flex items-center justify-center transition-transform hover:scale-105 shadow-[0_0_30px_rgba(0,212,255,0.5)]"
            >
              {isPlaying ? (
                <Pause className="w-7 h-7 text-black" fill="black" />
              ) : (
                <Play className="w-7 h-7 text-black ml-1" fill="black" />
              )}
            </button>
          </div>

          {/* Video Controls */}
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 to-transparent">
            {/* Progress Bar */}
            <div className="w-full h-1 bg-white/20 rounded-full mb-3 cursor-pointer">
              <div className="w-1/3 h-full bg-cyan-400 rounded-full" />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button className="text-white/70 hover:text-white transition-colors">
                  <SkipBack className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="text-white hover:text-cyan-400 transition-colors"
                >
                  {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                </button>
                <button className="text-white/70 hover:text-white transition-colors">
                  <SkipForward className="w-5 h-5" />
                </button>
                <span className="text-sm text-white/70 font-mono">
                  1:23 / {track.duration}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <button className="text-white/70 hover:text-white transition-colors">
                  <Volume2 className="w-5 h-5" />
                </button>
                <button className="text-white/70 hover:text-white transition-colors">
                  <Maximize2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Info & Actions */}
        <div className="p-6">
          {/* Track Info */}
          <div className="mb-6">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h2 className="text-xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
                  {track.title}
                </h2>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  {track.artist} {track.label && `• ${track.label}`}
                </p>
              </div>
              <span
                className="px-3 py-1.5 rounded-lg text-sm flex-shrink-0"
                style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}
              >
                {track.subgenre || track.genre}
              </span>
            </div>

            {/* Metadata */}
            <div className="flex items-center gap-3 text-sm font-mono" style={{ color: 'var(--text-muted)' }}>
              <span style={{ color: 'var(--text-primary)' }}>{track.bpm} BPM</span>
              <span className="w-0.5 h-4" style={{ background: 'var(--border-subtle)' }} />
              <span className="text-cyan-400">{track.key}</span>
              <span className="w-0.5 h-4" style={{ background: 'var(--border-subtle)' }} />
              <span>{track.duration}</span>
              <span className="w-0.5 h-4" style={{ background: 'var(--border-subtle)' }} />
              <span>{track.quality}</span>
            </div>
          </div>

          {/* Version Selection */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>
                Available Versions
              </span>
              <button
                onClick={() => setShowVersions(!showVersions)}
                className="text-xs text-cyan-400 hover:underline"
              >
                {showVersions ? 'Show less' : `Show all ${availableVersions.length}`}
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {(showVersions ? availableVersions : availableVersions.slice(0, 2)).map(
                (version) => (
                  <button
                    key={version}
                    onClick={() => setSelectedVersion(version)}
                    className={cn(
                      'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                      selectedVersion === version
                        ? 'bg-cyan-400 text-black'
                        : 'hover:border-cyan-400'
                    )}
                    style={
                      selectedVersion !== version
                        ? {
                            background: 'var(--bg-tertiary)',
                            border: '1px solid var(--border-subtle)',
                            color: 'var(--text-secondary)',
                          }
                        : undefined
                    }
                  >
                    {version}
                  </button>
                )
              )}
            </div>
          </div>

          {/* Quality Selection */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            {/* Video Quality */}
            <div>
              <label
                className="text-sm font-semibold mb-2 block"
                style={{ color: 'var(--text-secondary)' }}
              >
                Video Quality
              </label>
              <div className="relative">
                <select
                  value={videoQuality}
                  onChange={(e) => setVideoQuality(e.target.value as VideoQuality)}
                  className="w-full px-4 py-3 rounded-lg appearance-none text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-cyan-400"
                  style={{
                    background: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-default)',
                    color: 'var(--text-primary)',
                  }}
                >
                  {VIDEO_QUALITIES.map((q) => (
                    <option key={q.value} value={q.value}>
                      {q.label} ({q.size})
                    </option>
                  ))}
                </select>
                <ChevronDown
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                  style={{ color: 'var(--text-muted)' }}
                />
              </div>
            </div>

            {/* Audio Quality */}
            <div>
              <label
                className="text-sm font-semibold mb-2 block"
                style={{ color: 'var(--text-secondary)' }}
              >
                Audio Quality
              </label>
              <div className="relative">
                <select
                  value={audioQuality}
                  onChange={(e) => setAudioQuality(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg appearance-none text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-cyan-400"
                  style={{
                    background: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-default)',
                    color: 'var(--text-primary)',
                  }}
                >
                  {AUDIO_QUALITIES.map((q) => (
                    <option key={q.value} value={q.value}>
                      {q.label} ({q.size})
                    </option>
                  ))}
                </select>
                <ChevronDown
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                  style={{ color: 'var(--text-muted)' }}
                />
              </div>
            </div>
          </div>

          {/* Download Limit Warning */}
          {isNearLimit && !isAtLimit && (
            <div className="mb-4 flex items-center gap-2 px-3 py-2 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
              <AlertCircle className="w-4 h-4 text-yellow-500 flex-shrink-0" />
              <span className="text-sm text-yellow-500">
                {downloadsRemaining === 'unlimited'
                  ? 'Unlimited downloads'
                  : `Only ${downloadsRemaining} downloads remaining this month`}
              </span>
            </div>
          )}

          {isAtLimit && (
            <div className="mb-4 flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/30">
              <Lock className="w-4 h-4 text-red-500 flex-shrink-0" />
              <span className="text-sm text-red-500">
                Download limit reached. Upgrade to continue downloading.
              </span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleAddToSet}
              className="flex-1 py-6"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add to Set
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                closePreviewModal();
                showToast('info', `Finding tracks similar to "${track.title}"...`);
              }}
              className="px-4 py-6"
              title="Find similar tracks"
            >
              <Sparkles className="w-5 h-5" />
            </Button>
            <Button
              onClick={handleDownload}
              disabled={isDownloading}
              className={cn(
                'flex-[2] py-6 font-semibold',
                isAtLimit
                  ? 'bg-red-500/10 border-red-500/30 text-red-500 hover:bg-red-500/20'
                  : isNearLimit
                  ? 'bg-yellow-500 text-black hover:bg-yellow-400'
                  : 'bg-cyan-400 text-black hover:bg-cyan-300',
                isDownloading && 'opacity-50 cursor-wait'
              )}
            >
              {isAtLimit ? (
                <>
                  <Lock className="w-5 h-5 mr-2" />
                  Upgrade to Download
                </>
              ) : (
                <>
                  <Download className="w-5 h-5 mr-2" />
                  Download {selectedVersion}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

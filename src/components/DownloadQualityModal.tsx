// ============================================
// THE VIDEO POOL - DOWNLOAD QUALITY SELECTOR
// Shows quality options before initiating download
// ============================================

import { useState } from 'react';
import { X, Download, Check, HardDrive, Clock } from 'lucide-react';
import { clsx } from 'clsx';
import { Track } from '@/types';
import { useAppStore } from '@/stores/appStore';

interface DownloadQualityModalProps {
  track: Track;
  isOpen: boolean;
  onClose: () => void;
  onDownload: (quality: string, version: string) => void;
}

// Quality options with estimated file sizes
const QUALITY_OPTIONS = [
  {
    id: '4K',
    label: '4K Ultra HD',
    resolution: '3840×2160',
    bitrate: '25-40 Mbps',
    estimatedSize: (duration: number) => Math.round(duration * 4.5), // ~4.5 MB/sec
    color: 'text-amber-400',
    bgColor: 'bg-amber-400/10',
    borderColor: 'border-amber-400/30',
    premium: true,
  },
  {
    id: '1080p',
    label: '1080p Full HD',
    resolution: '1920×1080',
    bitrate: '8-12 Mbps',
    estimatedSize: (duration: number) => Math.round(duration * 1.5), // ~1.5 MB/sec
    color: 'text-tvp-accent-cyan',
    bgColor: 'bg-tvp-accent-cyan/10',
    borderColor: 'border-tvp-accent-cyan/30',
    premium: false,
  },
  {
    id: '720p',
    label: '720p HD',
    resolution: '1280×720',
    bitrate: '4-6 Mbps',
    estimatedSize: (duration: number) => Math.round(duration * 0.75), // ~0.75 MB/sec
    color: 'text-tvp-accent-purple',
    bgColor: 'bg-tvp-accent-purple/10',
    borderColor: 'border-tvp-accent-purple/30',
    premium: false,
  },
  {
    id: '480p',
    label: '480p SD',
    resolution: '854×480',
    bitrate: '2-3 Mbps',
    estimatedSize: (duration: number) => Math.round(duration * 0.35), // ~0.35 MB/sec
    color: 'text-tvp-text-muted',
    bgColor: 'bg-tvp-bg-tertiary',
    borderColor: 'border-tvp-border-subtle',
    premium: false,
  },
];

// Version options
const VERSION_OPTIONS = [
  { id: 'clean', label: 'Clean', description: 'Radio-safe edit' },
  { id: 'explicit', label: 'Explicit', description: 'Original version' },
  { id: 'extended', label: 'Extended', description: 'Full length mix' },
  { id: 'intro', label: 'Intro Edit', description: 'Extended intro for mixing' },
  { id: 'outro', label: 'Outro Edit', description: 'Extended outro for mixing' },
  { id: 'quickhit', label: 'Quick Hit', description: 'Short edit (~60s)' },
];

// Helper to convert duration (string or number) to seconds
const getDurationSeconds = (duration: string | number | undefined): number => {
  if (typeof duration === 'number') return duration;
  if (typeof duration === 'string') {
    // Handle "3:45" format
    const parts = duration.split(':').map(Number);
    if (parts.length === 2) {
      return parts[0] * 60 + parts[1];
    }
    return parseInt(duration, 10) || 180;
  }
  return 180; // Default 3 minutes
};

export default function DownloadQualityModal({
  track,
  isOpen,
  onClose,
  onDownload,
}: DownloadQualityModalProps) {
  const [selectedQuality, setSelectedQuality] = useState('1080p');
  const [selectedVersion, setSelectedVersion] = useState('clean');
  const [isDownloading, setIsDownloading] = useState(false);
  const { showToast } = useAppStore();

  // Get available qualities for this track (normalize to string array for comparison)
  const availableQualitiesRaw = Array.isArray(track.quality) ? track.quality : [track.quality || '1080p'];
  const availableQualities = availableQualitiesRaw.map(q => String(q));
  const availableVersions = track.versions || ['Clean'];

  // Filter quality options to only show available ones
  const qualityOptions = QUALITY_OPTIONS.filter(q => availableQualities.includes(q.id));

  // Filter version options to only show available ones (case-insensitive match)
  const availableVersionsLower = availableVersions.map(v => v.toLowerCase());
  const versionOptions = VERSION_OPTIONS.filter(v => availableVersionsLower.includes(v.id.toLowerCase()));

  // Get duration in seconds
  const durationSeconds = getDurationSeconds(track.duration);

  // Get selected quality info
  const selectedQualityInfo = QUALITY_OPTIONS.find(q => q.id === selectedQuality);
  const estimatedSize = selectedQualityInfo?.estimatedSize(durationSeconds) || 0;

  // Format file size
  const formatSize = (mb: number) => {
    if (mb >= 1000) return `${(mb / 1000).toFixed(1)} GB`;
    return `${mb} MB`;
  };

  // Format duration
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle download
  const handleDownload = async () => {
    setIsDownloading(true);

    // Simulate download initiation
    await new Promise(resolve => setTimeout(resolve, 500));

    onDownload(selectedQuality, selectedVersion);
    showToast('success', `Downloading "${track.title}" in ${selectedQuality}`);

    setIsDownloading(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-300 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-tvp-bg-secondary border border-tvp-border-default rounded-2xl shadow-2xl animate-scale-in overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-tvp-border-subtle">
          <div className="flex items-center gap-3">
            <Download className="w-5 h-5 text-tvp-accent-cyan" />
            <h2 className="text-lg font-semibold text-tvp-text-primary">
              Download Options
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-tvp-bg-tertiary rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-tvp-text-muted" />
          </button>
        </div>

        {/* Track Info */}
        <div className="p-4 bg-tvp-bg-tertiary/50 border-b border-tvp-border-subtle">
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 rounded-lg overflow-hidden bg-tvp-bg-elevated flex-shrink-0">
              <img
                src={track.thumbnailUrl || `https://picsum.photos/128/128?random=${track.id}`}
                alt=""
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-base font-medium text-tvp-text-primary truncate">
                {track.title}
              </div>
              <div className="text-sm text-tvp-text-muted truncate">
                {track.artist}
              </div>
              <div className="flex items-center gap-3 mt-1 text-xs text-tvp-text-muted">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatDuration(durationSeconds)}
                </span>
                <span className="font-mono">{track.bpm} BPM</span>
                <span className="font-mono">{track.camelotKey || track.key}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quality Selection */}
        <div className="p-4 border-b border-tvp-border-subtle">
          <label className="block text-sm font-medium text-tvp-text-primary mb-3">
            Video Quality
          </label>
          <div className="grid grid-cols-2 gap-2">
            {qualityOptions.map(quality => (
              <button
                key={quality.id}
                onClick={() => setSelectedQuality(quality.id)}
                disabled={quality.premium && !availableQualities.includes(quality.id)}
                className={clsx(
                  'relative p-3 rounded-xl border-2 transition-all text-left',
                  selectedQuality === quality.id
                    ? `${quality.bgColor} ${quality.borderColor} ${quality.color}`
                    : 'bg-tvp-bg-tertiary border-tvp-border-subtle hover:border-tvp-border-default',
                  quality.premium && !availableQualities.includes(quality.id) && 'opacity-50 cursor-not-allowed'
                )}
              >
                {selectedQuality === quality.id && (
                  <div className={clsx('absolute top-2 right-2', quality.color)}>
                    <Check className="w-4 h-4" />
                  </div>
                )}
                <div className={clsx(
                  'text-sm font-semibold',
                  selectedQuality === quality.id ? quality.color : 'text-tvp-text-primary'
                )}>
                  {quality.label}
                </div>
                <div className="text-xs text-tvp-text-muted mt-0.5">
                  {quality.resolution}
                </div>
                <div className="flex items-center gap-2 mt-2 text-xs text-tvp-text-muted">
                  <HardDrive className="w-3 h-3" />
                  ~{formatSize(quality.estimatedSize(durationSeconds))}
                </div>
                {quality.premium && !availableQualities.includes(quality.id) && (
                  <div className="absolute inset-0 flex items-center justify-center bg-tvp-bg-secondary/80 rounded-xl">
                    <span className="text-xs font-medium text-tvp-text-muted">Not Available</span>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Version Selection */}
        {versionOptions.length > 1 && (
          <div className="p-4 border-b border-tvp-border-subtle">
            <label className="block text-sm font-medium text-tvp-text-primary mb-3">
              Version
            </label>
            <div className="flex flex-wrap gap-2">
              {versionOptions.map(version => (
                <button
                  key={version.id}
                  onClick={() => setSelectedVersion(version.id)}
                  className={clsx(
                    'px-3 py-2 rounded-lg border transition-all',
                    selectedVersion === version.id
                      ? 'bg-tvp-accent-cyan/10 border-tvp-accent-cyan/30 text-tvp-accent-cyan'
                      : 'bg-tvp-bg-tertiary border-tvp-border-subtle text-tvp-text-secondary hover:border-tvp-border-default'
                  )}
                >
                  <div className="text-sm font-medium">{version.label}</div>
                  <div className="text-xs opacity-70">{version.description}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Download Summary & Button */}
        <div className="p-4 bg-tvp-bg-tertiary/30">
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm text-tvp-text-muted">
              <span className="font-medium text-tvp-text-primary">{selectedQuality}</span>
              {' · '}
              <span className="capitalize">{selectedVersion}</span>
              {' · '}
              <span>~{formatSize(estimatedSize)}</span>
            </div>
          </div>

          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className={clsx(
              'w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl',
              'bg-tvp-accent-cyan text-black font-semibold',
              'hover:bg-tvp-accent-cyan/90 transition-colors',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          >
            {isDownloading ? (
              <>
                <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                Preparing Download...
              </>
            ) : (
              <>
                <Download className="w-5 h-5" />
                Download Now
              </>
            )}
          </button>

          <p className="text-xs text-tvp-text-muted text-center mt-3">
            This will use 1 download from your monthly allowance
          </p>
        </div>
      </div>
    </div>
  );
}

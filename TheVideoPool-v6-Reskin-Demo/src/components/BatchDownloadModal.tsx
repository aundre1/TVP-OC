// ============================================
// THE VIDEO POOL - BATCH DOWNLOAD MODAL
// Multi-select download with quality options
// and export functionality
// ============================================

import { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Download,
  Check,
  HardDrive,
  Clock,
  FileText,
  Music,
  Trash2,
  ChevronDown,
} from 'lucide-react';
import { clsx } from 'clsx';
import { useAppStore } from '@/stores/appStore';
import { getTrackById, getAllTracks } from '@/data/tracks';
import type { Track, VideoQuality } from '@/types';

interface BatchDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  trackIds: number[];
}

// Quality options
const QUALITY_OPTIONS: { id: string; label: string; mbPerMin: number }[] = [
  { id: '4K', label: '4K Ultra HD', mbPerMin: 270 },
  { id: '1080p', label: '1080p Full HD', mbPerMin: 90 },
  { id: '720p', label: '720p HD', mbPerMin: 45 },
  { id: '480p', label: '480p SD', mbPerMin: 20 },
];

// Export format options
const EXPORT_FORMATS = [
  { id: 'm3u', label: 'M3U Playlist', ext: '.m3u' },
  { id: 'csv', label: 'CSV Spreadsheet', ext: '.csv' },
  { id: 'txt', label: 'Text List', ext: '.txt' },
];

// Helper to convert duration to minutes
const getDurationMinutes = (duration: string | number): number => {
  if (typeof duration === 'number') return duration / 60;
  const parts = duration.split(':').map(Number);
  if (parts.length === 2) return parts[0] + parts[1] / 60;
  return 3; // Default 3 minutes
};

// Format file size
const formatSize = (mb: number): string => {
  if (mb >= 1000) return `${(mb / 1000).toFixed(1)} GB`;
  return `${Math.round(mb)} MB`;
};

export default function BatchDownloadModal({
  isOpen,
  onClose,
  trackIds,
}: BatchDownloadModalProps) {
  const { showToast, clearSelection } = useAppStore();
  const [selectedQuality, setSelectedQuality] = useState('1080p');
  const [selectedTracks, setSelectedTracks] = useState<Set<number>>(new Set(trackIds));
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState<Record<number, number>>({});
  const [showExportMenu, setShowExportMenu] = useState(false);

  // Get track data for all selected IDs
  const tracks = useMemo(() => {
    return trackIds
      .map((id) => getTrackById(id))
      .filter((t): t is Track => t !== null);
  }, [trackIds]);

  // Calculate totals
  const selectedTracksList = tracks.filter((t) => selectedTracks.has(t.id));
  const qualityInfo = QUALITY_OPTIONS.find((q) => q.id === selectedQuality);
  const totalDuration = selectedTracksList.reduce(
    (acc, t) => acc + getDurationMinutes(t.duration),
    0
  );
  const estimatedSize = totalDuration * (qualityInfo?.mbPerMin || 90);

  // Toggle track selection
  const toggleTrack = (id: number) => {
    setSelectedTracks((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Select/deselect all
  const toggleAll = () => {
    if (selectedTracks.size === tracks.length) {
      setSelectedTracks(new Set());
    } else {
      setSelectedTracks(new Set(tracks.map((t) => t.id)));
    }
  };

  // Handle batch download
  const handleDownload = async () => {
    if (selectedTracks.size === 0) {
      showToast('warning', 'No tracks selected');
      return;
    }

    setIsDownloading(true);

    // Simulate download progress for each track
    for (const id of selectedTracks) {
      for (let progress = 0; progress <= 100; progress += 20) {
        await new Promise((r) => setTimeout(r, 100));
        setDownloadProgress((prev) => ({ ...prev, [id]: progress }));
      }
    }

    showToast('success', `Downloaded ${selectedTracks.size} tracks`);
    setIsDownloading(false);
    clearSelection();
    onClose();
  };

  // Handle export
  const handleExport = (format: string) => {
    const formatInfo = EXPORT_FORMATS.find((f) => f.id === format);
    if (!formatInfo) return;

    let content = '';
    const filename = `tvp-batch-${Date.now()}${formatInfo.ext}`;

    switch (format) {
      case 'm3u':
        content = '#EXTM3U\n';
        selectedTracksList.forEach((t) => {
          const durSec =
            typeof t.duration === 'number'
              ? t.duration
              : parseInt(t.duration.split(':')[0]) * 60 +
                parseInt(t.duration.split(':')[1] || '0');
          content += `#EXTINF:${durSec},${t.artist} - ${t.title}\n`;
          content += `${t.title}.mp4\n`;
        });
        break;

      case 'csv':
        content = 'Title,Artist,BPM,Key,Duration,Genre\n';
        selectedTracksList.forEach((t) => {
          content += `"${t.title}","${t.artist}",${t.bpm},"${t.key}","${t.duration}","${t.genre}"\n`;
        });
        break;

      case 'txt':
        selectedTracksList.forEach((t) => {
          content += `${t.artist} - ${t.title} (${t.bpm} BPM, ${t.key})\n`;
        });
        break;
    }

    // Create and download file
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);

    showToast('success', `Exported ${selectedTracksList.length} tracks as ${formatInfo.label}`);
    setShowExportMenu(false);
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-500 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl max-h-[85vh] bg-tvp-bg-secondary border border-tvp-border-default rounded-2xl shadow-2xl flex flex-col animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-tvp-border-subtle flex-shrink-0">
          <div className="flex items-center gap-3">
            <Download className="w-5 h-5 text-tvp-accent-cyan" />
            <div>
              <h2 className="text-lg font-semibold text-tvp-text-primary">
                Batch Download
              </h2>
              <p className="text-xs text-tvp-text-muted">
                {tracks.length} tracks selected
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-tvp-bg-tertiary rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-tvp-text-muted" />
          </button>
        </div>

        {/* Quality Selection */}
        <div className="p-4 border-b border-tvp-border-subtle flex-shrink-0">
          <label className="text-sm font-medium text-tvp-text-secondary mb-2 block">
            Download Quality
          </label>
          <div className="grid grid-cols-4 gap-2">
            {QUALITY_OPTIONS.map((q) => (
              <button
                key={q.id}
                onClick={() => setSelectedQuality(q.id)}
                className={clsx(
                  'px-3 py-2 rounded-lg border-2 text-center transition-all',
                  selectedQuality === q.id
                    ? 'bg-tvp-accent-cyan/10 border-tvp-accent-cyan text-tvp-accent-cyan'
                    : 'bg-tvp-bg-tertiary border-tvp-border-subtle text-tvp-text-secondary hover:border-tvp-border-default'
                )}
              >
                <div className="text-sm font-semibold">{q.id}</div>
                <div className="text-[10px] opacity-70">{q.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Track List */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* Select All */}
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={toggleAll}
              className="flex items-center gap-2 text-sm text-tvp-text-secondary hover:text-tvp-accent-cyan"
            >
              <div
                className={clsx(
                  'w-4 h-4 rounded border flex items-center justify-center',
                  selectedTracks.size === tracks.length
                    ? 'bg-tvp-accent-cyan border-tvp-accent-cyan'
                    : 'border-tvp-border-default'
                )}
              >
                {selectedTracks.size === tracks.length && (
                  <Check className="w-3 h-3 text-black" />
                )}
              </div>
              Select All ({selectedTracks.size}/{tracks.length})
            </button>

            {/* Export Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                className={clsx(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm',
                  'bg-tvp-bg-tertiary border border-tvp-border-subtle',
                  'text-tvp-text-secondary hover:border-tvp-accent-cyan transition-colors'
                )}
              >
                <FileText className="w-4 h-4" />
                Export
                <ChevronDown className="w-3 h-3" />
              </button>

              {showExportMenu && (
                <div className="absolute top-full right-0 mt-1 w-48 bg-tvp-bg-secondary border border-tvp-border-default rounded-lg shadow-xl z-10 py-1">
                  {EXPORT_FORMATS.map((format) => (
                    <button
                      key={format.id}
                      onClick={() => handleExport(format.id)}
                      className="w-full px-3 py-2 text-left text-sm text-tvp-text-secondary hover:bg-tvp-accent-cyan/10 hover:text-tvp-accent-cyan"
                    >
                      {format.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Track Items */}
          <div className="space-y-2">
            {tracks.map((track) => {
              const isSelected = selectedTracks.has(track.id);
              const progress = downloadProgress[track.id];

              return (
                <div
                  key={track.id}
                  onClick={() => toggleTrack(track.id)}
                  className={clsx(
                    'flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all',
                    'border',
                    isSelected
                      ? 'bg-tvp-accent-cyan/5 border-tvp-accent-cyan/30'
                      : 'bg-tvp-bg-tertiary/50 border-tvp-border-subtle hover:border-tvp-border-default'
                  )}
                >
                  {/* Checkbox */}
                  <div
                    className={clsx(
                      'w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0',
                      isSelected
                        ? 'bg-tvp-accent-cyan border-tvp-accent-cyan'
                        : 'border-tvp-border-default'
                    )}
                  >
                    {isSelected && <Check className="w-3 h-3 text-black" />}
                  </div>

                  {/* Track Info */}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-tvp-text-primary truncate">
                      {track.title}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-tvp-text-muted">
                      <span className="truncate">{track.artist}</span>
                      <span>•</span>
                      <span className="font-mono">{track.bpm} BPM</span>
                      <span>•</span>
                      <span className="font-mono text-tvp-accent-cyan">
                        {track.key}
                      </span>
                    </div>
                  </div>

                  {/* Duration */}
                  <div className="flex items-center gap-1 text-xs text-tvp-text-muted">
                    <Clock className="w-3 h-3" />
                    {track.duration}
                  </div>

                  {/* Progress */}
                  {progress !== undefined && progress < 100 && (
                    <div className="w-12 h-1 bg-tvp-bg-tertiary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-tvp-accent-cyan transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  )}
                  {progress === 100 && (
                    <Check className="w-4 h-4 text-tvp-status-success" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-tvp-border-subtle flex-shrink-0">
          {/* Summary */}
          <div className="flex items-center justify-between mb-4 text-sm">
            <div className="flex items-center gap-4 text-tvp-text-muted">
              <span className="flex items-center gap-1">
                <Music className="w-4 h-4" />
                {selectedTracks.size} tracks
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {Math.round(totalDuration)} min
              </span>
              <span className="flex items-center gap-1">
                <HardDrive className="w-4 h-4" />
                ~{formatSize(estimatedSize)}
              </span>
            </div>
            <span className="font-medium text-tvp-text-primary">
              {selectedQuality}
            </span>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-tvp-border-subtle text-tvp-text-secondary font-medium hover:border-tvp-border-default transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleDownload}
              disabled={selectedTracks.size === 0 || isDownloading}
              className={clsx(
                'flex-[2] flex items-center justify-center gap-2 py-3 rounded-xl font-semibold transition-colors',
                selectedTracks.size === 0 || isDownloading
                  ? 'bg-tvp-bg-tertiary text-tvp-text-muted cursor-not-allowed'
                  : 'bg-tvp-accent-cyan text-black hover:bg-tvp-accent-cyan-hover'
              )}
            >
              {isDownloading ? (
                <>
                  <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  Downloading...
                </>
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  Download {selectedTracks.size} Tracks
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

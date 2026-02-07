// ============================================
// THE VIDEO POOL - PREVIEW MODAL COMPONENT
// ============================================

import { useEffect, useRef } from 'react';
import { X, Play, Pause, Download, Heart, Share2, Plus, Music, Clock, Disc, Tag, Lock, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { useUIStore } from '@/stores/uiStore';
import { useRelatedVideos } from '@/hooks/useVideos';
import { useDownloadWithLimitCheck } from '@/hooks/useDownloads';
import VideoCard from './VideoCard';

export default function PreviewModal() {
  const { previewVideo, isPreviewOpen, closePreview } = useUIStore();
  const { checkAndDownload, isAtLimit, isNearLimit, downloadsRemaining, isDownloading, openDownloadLimitModal } = useDownloadWithLimitCheck();
  const { data: relatedVideos } = useRelatedVideos(previewVideo?.id);

  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showVersions, setShowVersions] = useState(false);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closePreview();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [closePreview]);

  // Auto-play preview when modal opens
  useEffect(() => {
    if (isPreviewOpen && videoRef.current) {
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  }, [isPreviewOpen]);

  if (!isPreviewOpen || !previewVideo) return null;

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleDownload = (versionType: string) => {
    if (isAtLimit) {
      openDownloadLimitModal();
      setShowVersions(false);
      return;
    }
    checkAndDownload({ video: previewVideo, versionType });
    setShowVersions(false);
  };

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in"
      onClick={closePreview}
    >
      <div
        className="relative w-full max-w-4xl max-h-[90vh] bg-tvp-bg-secondary rounded-2xl overflow-hidden shadow-elevated animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={closePreview}
          className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Video Player */}
        <div className="relative aspect-video bg-black">
          <video
            ref={videoRef}
            src={previewVideo.previewUrl || previewVideo.streamUrl}
            poster={previewVideo.thumbnailUrl}
            className="w-full h-full object-contain"
            onClick={handlePlayPause}
          />

          {/* Play/Pause Overlay */}
          <div
            className={`absolute inset-0 flex items-center justify-center bg-black/30 transition-opacity ${isPlaying ? 'opacity-0 hover:opacity-100' : 'opacity-100'}`}
            onClick={handlePlayPause}
          >
            <button className="w-16 h-16 bg-tvp-accent-cyan rounded-full flex items-center justify-center">
              {isPlaying ? (
                <Pause className="w-7 h-7 text-tvp-bg-primary" fill="currentColor" />
              ) : (
                <Play className="w-7 h-7 text-tvp-bg-primary ml-1" fill="currentColor" />
              )}
            </button>
          </div>

          {/* 60 second preview notice */}
          <div className="absolute bottom-4 left-4 px-3 py-1.5 bg-black/70 rounded-lg text-sm text-white">
            60-second preview
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-semibold text-tvp-text-primary">{previewVideo.title}</h2>
              <p className="text-lg text-tvp-text-secondary mt-1">{previewVideo.artist}</p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <button className="p-2.5 bg-tvp-bg-tertiary hover:bg-tvp-bg-elevated rounded-lg text-tvp-text-secondary hover:text-tvp-accent-coral transition-colors">
                <Heart className="w-5 h-5" />
              </button>
              <button className="p-2.5 bg-tvp-bg-tertiary hover:bg-tvp-bg-elevated rounded-lg text-tvp-text-secondary hover:text-tvp-text-primary transition-colors">
                <Plus className="w-5 h-5" />
              </button>
              <button className="p-2.5 bg-tvp-bg-tertiary hover:bg-tvp-bg-elevated rounded-lg text-tvp-text-secondary hover:text-tvp-text-primary transition-colors">
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            {previewVideo.bpm && (
              <div className="p-3 bg-tvp-bg-tertiary rounded-lg">
                <div className="flex items-center gap-2 text-tvp-text-muted text-xs mb-1">
                  <Music className="w-3.5 h-3.5" />
                  BPM
                </div>
                <p className="text-lg font-semibold text-tvp-text-primary">{previewVideo.bpm}</p>
              </div>
            )}
            {previewVideo.key && (
              <div className="p-3 bg-tvp-bg-tertiary rounded-lg">
                <div className="flex items-center gap-2 text-tvp-text-muted text-xs mb-1">
                  <Disc className="w-3.5 h-3.5" />
                  Key
                </div>
                <p className="text-lg font-semibold text-tvp-text-primary">{previewVideo.key}</p>
              </div>
            )}
            <div className="p-3 bg-tvp-bg-tertiary rounded-lg">
              <div className="flex items-center gap-2 text-tvp-text-muted text-xs mb-1">
                <Clock className="w-3.5 h-3.5" />
                Duration
              </div>
              <p className="text-lg font-semibold text-tvp-text-primary">{formatDuration(previewVideo.duration)}</p>
            </div>
            <div className="p-3 bg-tvp-bg-tertiary rounded-lg">
              <div className="flex items-center gap-2 text-tvp-text-muted text-xs mb-1">
                <Tag className="w-3.5 h-3.5" />
                Genre
              </div>
              <p className="text-lg font-semibold text-tvp-text-primary">{previewVideo.genre}</p>
            </div>
          </div>

          {/* Download Limit Warning */}
          {isNearLimit && !isAtLimit && (
            <div className="mb-4 flex items-center gap-2 px-3 py-2 bg-tvp-status-warning/10 border border-tvp-status-warning/30 rounded-lg">
              <AlertCircle className="w-4 h-4 text-tvp-status-warning flex-shrink-0" />
              <span className="text-sm text-tvp-status-warning">
                {downloadsRemaining === 'unlimited'
                  ? 'Unlimited downloads'
                  : `Only ${downloadsRemaining} downloads remaining this month`}
              </span>
            </div>
          )}

          {isAtLimit && (
            <div className="mb-4 flex items-center gap-2 px-3 py-2 bg-tvp-status-error/10 border border-tvp-status-error/30 rounded-lg">
              <Lock className="w-4 h-4 text-tvp-status-error flex-shrink-0" />
              <span className="text-sm text-tvp-status-error">
                Download limit reached. Upgrade to continue downloading.
              </span>
            </div>
          )}

          {/* Download Section */}
          <div className="relative mb-6">
            <button
              onClick={() => isAtLimit ? openDownloadLimitModal() : setShowVersions(!showVersions)}
              disabled={isDownloading}
              className={`w-full py-3 px-4 font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors ${
                isAtLimit
                  ? 'bg-tvp-status-error/10 border border-tvp-status-error/30 text-tvp-status-error hover:bg-tvp-status-error/20'
                  : isNearLimit
                  ? 'bg-tvp-status-warning hover:bg-tvp-status-warning/80 text-tvp-bg-primary'
                  : 'bg-tvp-accent-cyan hover:bg-tvp-accent-cyan-hover text-tvp-bg-primary'
              } ${isDownloading ? 'opacity-50' : ''}`}
            >
              {isAtLimit ? (
                <>
                  <Lock className="w-5 h-5" />
                  Upgrade to Download
                </>
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  Download
                </>
              )}
            </button>

            {/* Version Dropdown */}
            {showVersions && (
              <div className="absolute top-full left-0 right-0 mt-2 py-2 bg-tvp-bg-elevated border border-tvp-border-default rounded-xl shadow-elevated animate-fade-in z-10">
                {previewVideo.versions?.map((version, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleDownload(version.type)}
                    className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-tvp-bg-tertiary transition-colors"
                  >
                    <div>
                      <span className="text-sm font-medium text-tvp-text-primary capitalize">
                        {version.type} Version
                      </span>
                      <span className="text-xs text-tvp-text-muted ml-2">
                        {version.quality} • {(version.fileSize / 1024 / 1024).toFixed(0)}MB
                      </span>
                    </div>
                    <Download className="w-4 h-4 text-tvp-accent-cyan" />
                  </button>
                )) || (
                  <>
                    <button
                      onClick={() => handleDownload('hd')}
                      className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-tvp-bg-tertiary transition-colors"
                    >
                      <div>
                        <span className="text-sm font-medium text-tvp-text-primary">HD Video</span>
                        <span className="text-xs text-tvp-text-muted ml-2">1080p • MP4</span>
                      </div>
                      <Download className="w-4 h-4 text-tvp-accent-cyan" />
                    </button>
                    <button
                      onClick={() => handleDownload('4k')}
                      className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-tvp-bg-tertiary transition-colors"
                    >
                      <div>
                        <span className="text-sm font-medium text-tvp-text-primary">4K Video</span>
                        <span className="text-xs text-tvp-text-muted ml-2">2160p • MP4</span>
                      </div>
                      <Download className="w-4 h-4 text-tvp-accent-cyan" />
                    </button>
                    <button
                      onClick={() => handleDownload('mp3')}
                      className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-tvp-bg-tertiary transition-colors"
                    >
                      <div>
                        <span className="text-sm font-medium text-tvp-text-primary">Audio Only</span>
                        <span className="text-xs text-tvp-text-muted ml-2">320kbps • MP3</span>
                      </div>
                      <Download className="w-4 h-4 text-tvp-accent-cyan" />
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Related Videos */}
          {relatedVideos && relatedVideos.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-tvp-text-muted mb-3">You May Also Like</h3>
              <div className="flex gap-3 overflow-x-auto hide-scrollbar">
                {relatedVideos.slice(0, 6).map((video) => (
                  <VideoCard key={video.id} video={video} size="sm" showStats={false} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================
// THE VIDEO POOL - VIDEO DETAIL PAGE
// ============================================

import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Download, Heart, Share2, Plus, Music, Clock, Disc, Tag, Calendar, Check, Link2 } from 'lucide-react';
import { useVideo, useRelatedVideos, usePreviewUrl } from '@/hooks/useVideos';
import { useDownload } from '@/hooks/useDownloads';
import { useAppStore } from '@/stores/appStore';
import VideoCard from '@/components/VideoCard';

export default function VideoPage() {
  const { id } = useParams<{ id: string }>();
  const videoId = id ? parseInt(id) : undefined;

  const { data: video, isLoading, error } = useVideo(videoId);
  const { data: relatedVideos } = useRelatedVideos(videoId);
  const { data: previewData } = usePreviewUrl(videoId);
  const downloadMutation = useDownload();
  const { addToSet, showToast } = useAppStore();

  // Local state for favorites (would be persisted via API in production)
  const [isFavorite, setIsFavorite] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);

  const handleFavoriteToggle = () => {
    setIsFavorite(!isFavorite);
    showToast(
      'success',
      isFavorite ? 'Removed from favorites' : 'Added to favorites'
    );
  };

  const handleAddToPlaylist = () => {
    if (video) {
      // Convert VideoResponse to Track-compatible format
      const trackData = {
        id: video.id,
        title: video.title,
        artist: video.artist,
        bpm: video.bpm || 120, // Default BPM if not set
        key: video.key || 'C', // Default key if not set
        duration: video.duration,
        quality: video.quality,
        genre: video.genre,
        subgenre: video.subGenre,
        isNew: video.isNew,
        thumbnailUrl: video.thumbnailUrl,
      };
      addToSet(trackData);
      showToast('success', `Added "${video.title}" to Set Builder`);
    }
  };

  const handleShare = async (method: 'copy' | 'twitter' | 'facebook') => {
    if (!video) return;

    const shareUrl = window.location.href;
    const shareText = `Check out "${video.title}" by ${video.artist} on The Video Pool!`;

    switch (method) {
      case 'copy':
        try {
          await navigator.clipboard.writeText(shareUrl);
          showToast('success', 'Link copied to clipboard!');
        } catch {
          showToast('error', 'Failed to copy link');
        }
        break;
      case 'twitter':
        window.open(
          `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
          '_blank',
          'noopener,noreferrer'
        );
        break;
      case 'facebook':
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
          '_blank',
          'noopener,noreferrer'
        );
        break;
    }
    setShowShareMenu(false);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="animate-pulse">
          <div className="aspect-video bg-tvp-bg-tertiary rounded-2xl mb-6" />
          <div className="h-8 w-2/3 bg-tvp-bg-tertiary rounded mb-2" />
          <div className="h-6 w-1/3 bg-tvp-bg-tertiary rounded" />
        </div>
      </div>
    );
  }

  if (error || !video) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-8 text-center">
        <h1 className="text-2xl font-semibold text-tvp-text-primary mb-2">Video Not Found</h1>
        <p className="text-tvp-text-secondary">The video you're looking for doesn't exist or has been removed.</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      {/* Video Player */}
      <div className="relative aspect-video rounded-2xl overflow-hidden bg-black mb-6">
        <video
          src={previewData?.previewUrl || video.previewUrl || video.streamUrl}
          poster={video.thumbnailUrl}
          controls
          className="w-full h-full object-contain"
        />
      </div>

      {/* Video Info */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-semibold text-tvp-text-primary mb-2">{video.title}</h1>
          <p className="text-xl text-tvp-text-secondary">{video.artist}</p>

          <div className="flex items-center gap-4 mt-4">
            {video.isNew && (
              <span className="px-2 py-1 bg-tvp-accent-cyan text-tvp-bg-primary text-xs font-bold rounded">NEW</span>
            )}
            {video.isExclusive && (
              <span className="px-2 py-1 bg-tvp-accent-gold text-tvp-bg-primary text-xs font-bold rounded">EXCLUSIVE</span>
            )}
            <span className="text-sm text-tvp-text-muted">{video.downloadCount.toLocaleString()} downloads</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          {/* Favorite Button */}
          <button
            onClick={handleFavoriteToggle}
            className={`p-3 rounded-xl transition-colors ${
              isFavorite
                ? 'bg-tvp-accent-coral/20 text-tvp-accent-coral'
                : 'bg-tvp-bg-tertiary hover:bg-tvp-bg-elevated text-tvp-text-secondary hover:text-tvp-accent-coral'
            }`}
            aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            aria-pressed={isFavorite}
          >
            <Heart className="w-6 h-6" fill={isFavorite ? 'currentColor' : 'none'} />
          </button>

          {/* Add to Set Builder */}
          <button
            onClick={handleAddToPlaylist}
            className="p-3 bg-tvp-bg-tertiary hover:bg-tvp-bg-elevated rounded-xl text-tvp-text-secondary hover:text-tvp-accent-cyan transition-colors"
            aria-label="Add to Set Builder"
          >
            <Plus className="w-6 h-6" />
          </button>

          {/* Share Button with Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowShareMenu(!showShareMenu)}
              className="p-3 bg-tvp-bg-tertiary hover:bg-tvp-bg-elevated rounded-xl text-tvp-text-secondary hover:text-tvp-text-primary transition-colors"
              aria-label="Share video"
              aria-expanded={showShareMenu}
            >
              <Share2 className="w-6 h-6" />
            </button>

            {/* Share Dropdown Menu */}
            {showShareMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowShareMenu(false)}
                />
                <div className="absolute right-0 top-full mt-2 w-48 bg-tvp-bg-elevated border border-tvp-border-subtle rounded-xl shadow-lg z-20 py-2 animate-fade-in">
                  <button
                    onClick={() => handleShare('copy')}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-tvp-text-primary hover:bg-tvp-bg-tertiary transition-colors"
                  >
                    <Link2 className="w-4 h-4" />
                    Copy Link
                  </button>
                  <button
                    onClick={() => handleShare('twitter')}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-tvp-text-primary hover:bg-tvp-bg-tertiary transition-colors"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                    Share on X
                  </button>
                  <button
                    onClick={() => handleShare('facebook')}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-tvp-text-primary hover:bg-tvp-bg-tertiary transition-colors"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                    Share on Facebook
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Download Button */}
          <button
            onClick={() => downloadMutation.mutate({ video, versionType: 'hd' })}
            className="flex items-center gap-2 px-6 py-3 bg-tvp-accent-cyan hover:bg-tvp-accent-cyan-hover text-tvp-bg-primary font-semibold rounded-xl transition-colors"
            aria-label="Download HD video"
          >
            <Download className="w-5 h-5" />
            Download
          </button>
        </div>
      </div>

      {/* Metadata Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
        {video.bpm && (
          <div className="p-4 bg-tvp-bg-secondary border border-tvp-border-subtle rounded-xl">
            <div className="flex items-center gap-2 text-tvp-text-muted text-xs mb-1">
              <Music className="w-4 h-4" />
              BPM
            </div>
            <p className="text-xl font-semibold text-tvp-text-primary">{video.bpm}</p>
          </div>
        )}
        {video.key && (
          <div className="p-4 bg-tvp-bg-secondary border border-tvp-border-subtle rounded-xl">
            <div className="flex items-center gap-2 text-tvp-text-muted text-xs mb-1">
              <Disc className="w-4 h-4" />
              Key
            </div>
            <p className="text-xl font-semibold text-tvp-text-primary">{video.key}</p>
          </div>
        )}
        <div className="p-4 bg-tvp-bg-secondary border border-tvp-border-subtle rounded-xl">
          <div className="flex items-center gap-2 text-tvp-text-muted text-xs mb-1">
            <Clock className="w-4 h-4" />
            Duration
          </div>
          <p className="text-xl font-semibold text-tvp-text-primary">{formatDuration(video.duration)}</p>
        </div>
        <div className="p-4 bg-tvp-bg-secondary border border-tvp-border-subtle rounded-xl">
          <div className="flex items-center gap-2 text-tvp-text-muted text-xs mb-1">
            <Tag className="w-4 h-4" />
            Genre
          </div>
          <p className="text-xl font-semibold text-tvp-text-primary">{video.genre}</p>
        </div>
        <div className="p-4 bg-tvp-bg-secondary border border-tvp-border-subtle rounded-xl">
          <div className="flex items-center gap-2 text-tvp-text-muted text-xs mb-1">
            Quality
          </div>
          <p className="text-xl font-semibold text-tvp-text-primary">{video.quality}</p>
        </div>
        <div className="p-4 bg-tvp-bg-secondary border border-tvp-border-subtle rounded-xl">
          <div className="flex items-center gap-2 text-tvp-text-muted text-xs mb-1">
            <Calendar className="w-4 h-4" />
            Released
          </div>
          <p className="text-xl font-semibold text-tvp-text-primary">
            {new Date(video.releaseDate).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Download Versions */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-tvp-text-primary mb-4">Download Options</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => downloadMutation.mutate({ video, versionType: 'hd' })}
            className="flex items-center justify-between p-4 bg-tvp-bg-secondary border border-tvp-border-subtle hover:border-tvp-accent-cyan rounded-xl transition-colors group"
          >
            <div>
              <span className="text-sm font-medium text-tvp-text-primary">HD Video</span>
              <span className="text-xs text-tvp-text-muted block">1080p • MP4</span>
            </div>
            <Download className="w-5 h-5 text-tvp-text-muted group-hover:text-tvp-accent-cyan" />
          </button>
          <button
            onClick={() => downloadMutation.mutate({ video, versionType: '4k' })}
            className="flex items-center justify-between p-4 bg-tvp-bg-secondary border border-tvp-border-subtle hover:border-tvp-accent-cyan rounded-xl transition-colors group"
          >
            <div>
              <span className="text-sm font-medium text-tvp-text-primary">4K Video</span>
              <span className="text-xs text-tvp-text-muted block">2160p • MP4</span>
            </div>
            <Download className="w-5 h-5 text-tvp-text-muted group-hover:text-tvp-accent-cyan" />
          </button>
          <button
            onClick={() => downloadMutation.mutate({ video, versionType: 'audio' })}
            className="flex items-center justify-between p-4 bg-tvp-bg-secondary border border-tvp-border-subtle hover:border-tvp-accent-cyan rounded-xl transition-colors group"
          >
            <div>
              <span className="text-sm font-medium text-tvp-text-primary">Audio Only</span>
              <span className="text-xs text-tvp-text-muted block">320kbps • MP3</span>
            </div>
            <Download className="w-5 h-5 text-tvp-text-muted group-hover:text-tvp-accent-cyan" />
          </button>
        </div>
      </div>

      {/* Related Videos */}
      {relatedVideos && relatedVideos.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-tvp-text-primary mb-4">Related Videos</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {relatedVideos.slice(0, 12).map((relatedVideo) => (
              <VideoCard key={relatedVideo.id} video={relatedVideo} size="sm" />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

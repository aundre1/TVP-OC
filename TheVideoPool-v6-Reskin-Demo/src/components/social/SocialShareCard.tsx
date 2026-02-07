// ============================================
// THE VIDEO POOL - SOCIAL SHARE CARD
// Shareable cards for social media with Quick Wins:
// 1. Video preview grid
// 2. Download count social proof
// 3. Camelot wheel key visualization
// ============================================

import { useState, useRef, forwardRef } from 'react';
import { Play, Download, Music, TrendingUp, Share2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Track } from '@/types';
import CamelotMiniWheel from './CamelotMiniWheel';
import DownloadCounter from './DownloadCounter';

// ============================================
// TYPES
// ============================================

export type CardTemplate = 'set' | 'stats' | 'track';
export type ExportSize = 'instagram' | 'twitter' | 'story';

export interface SetData {
  name: string;
  tracks: Track[];
  totalDuration: string;
  bpmRange: { min: number; max: number };
  keyRange: string[];
}

export interface StatsData {
  totalDownloads: number;
  topGenres: { name: string; count: number }[];
  topArtists: string[];
  memberSince: string;
}

export interface TrackData {
  track: Track;
  badge?: 'now-playing' | 'just-downloaded' | 'favorite';
}

export interface SocialCardProps {
  type: CardTemplate;
  data: SetData | StatsData | TrackData;
  customImage?: string;
  imagePosition?: { x: number; y: number };
  imageOpacity?: number;
  imageBlur?: number;
  accentColor?: string;
  djName?: string;
  showBranding?: boolean;
  exportSize?: ExportSize;
}

// ============================================
// EXPORT SIZE DIMENSIONS
// ============================================

export const EXPORT_DIMENSIONS: Record<ExportSize, { width: number; height: number }> = {
  instagram: { width: 1080, height: 1080 },
  twitter: { width: 1200, height: 630 },
  story: { width: 1080, height: 1920 },
};

// ============================================
// SET CARD TEMPLATE
// ============================================

interface SetCardProps {
  data: SetData;
  djName: string;
  accentColor: string;
  customImage?: string;
  imageOpacity: number;
  imageBlur: number;
  showBranding: boolean;
}

function SetCardTemplate({
  data,
  djName,
  accentColor,
  customImage,
  imageOpacity,
  imageBlur,
  showBranding,
}: SetCardProps) {
  const { name, tracks, totalDuration, bpmRange, keyRange } = data;
  const totalDownloads = tracks.reduce((sum, t) => sum + (t.downloads || 0), 0);

  return (
    <div className="relative w-full h-full overflow-hidden rounded-2xl">
      {/* Background - Custom Image or Gradient */}
      {customImage ? (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${customImage})`,
            opacity: imageOpacity,
            filter: `blur(${imageBlur}px)`,
          }}
        />
      ) : (
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(135deg, ${accentColor}20 0%, #0a0a0f 50%, ${accentColor}10 100%)`,
          }}
        />
      )}

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/60 to-black/80" />

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col p-6">
        {/* Header */}
        <div className="flex items-center gap-2 mb-4">
          <Music className="w-5 h-5" style={{ color: accentColor }} />
          <span className="text-xs uppercase tracking-wider font-semibold" style={{ color: accentColor }}>
            DJ Set
          </span>
        </div>

        {/* Set Name */}
        <h2 className="text-2xl font-bold text-white mb-1 line-clamp-2">
          {name || 'My Set'}
        </h2>
        <p className="text-sm text-white/70 mb-6">by {djName}</p>

        {/* Track Grid (3x2) */}
        <div className="grid grid-cols-3 gap-2 mb-6">
          {tracks.slice(0, 6).map((track, i) => (
            <div key={track.id} className="relative aspect-video rounded-lg overflow-hidden bg-white/10">
              <img
                src={track.thumbnailUrl || `https://picsum.photos/160/90?random=${track.id}`}
                alt={track.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                <Play className="w-6 h-6 text-white" fill="white" />
              </div>
              {i === 5 && tracks.length > 6 && (
                <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                  <span className="text-white font-bold">+{tracks.length - 6}</span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Stats Row */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4" style={{ color: accentColor }} />
              <DownloadCounter count={totalDownloads} />
            </div>
            <div className="text-sm text-white/70">
              {tracks.length} tracks • {totalDuration}
            </div>
          </div>
          <div className="text-sm font-mono" style={{ color: accentColor }}>
            {bpmRange.min}-{bpmRange.max} BPM
          </div>
        </div>

        {/* Camelot Wheel */}
        <div className="flex-1 flex items-end justify-between">
          <div className="flex items-center gap-3">
            <CamelotMiniWheel keys={keyRange} accentColor={accentColor} />
            <div className="text-xs text-white/50">
              Key Range
            </div>
          </div>

          {/* Branding */}
          {showBranding && (
            <div className="flex items-center gap-2">
              <div
                className="w-6 h-6 rounded flex items-center justify-center"
                style={{ background: accentColor }}
              >
                <Play className="w-3 h-3 text-black" fill="black" />
              </div>
              <span className="text-xs text-white/50">thevideopool.com</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================
// STATS CARD TEMPLATE
// ============================================

interface StatsCardProps {
  data: StatsData;
  djName: string;
  accentColor: string;
  customImage?: string;
  imageOpacity: number;
  imageBlur: number;
  showBranding: boolean;
}

function StatsCardTemplate({
  data,
  djName,
  accentColor,
  customImage,
  imageOpacity,
  imageBlur,
  showBranding,
}: StatsCardProps) {
  const { totalDownloads, topGenres, topArtists, memberSince } = data;

  return (
    <div className="relative w-full h-full overflow-hidden rounded-2xl">
      {/* Background */}
      {customImage ? (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${customImage})`,
            opacity: imageOpacity,
            filter: `blur(${imageBlur}px)`,
          }}
        />
      ) : (
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(circle at 30% 30%, ${accentColor}30 0%, transparent 50%),
                        radial-gradient(circle at 70% 70%, #a855f730 0%, transparent 50%),
                        #0a0a0f`,
          }}
        />
      )}

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col p-6 text-center">
        {/* Header */}
        <div className="mb-6">
          <div
            className="w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center text-xl font-bold"
            style={{ background: accentColor, color: 'black' }}
          >
            {djName.slice(0, 2).toUpperCase()}
          </div>
          <h2 className="text-xl font-bold text-white">{djName}</h2>
          <p className="text-xs text-white/50">DJ since {memberSince}</p>
        </div>

        {/* Big Download Number */}
        <div className="mb-6">
          <div className="text-5xl font-bold text-white mb-1">
            <DownloadCounter count={totalDownloads} animated />
          </div>
          <p className="text-sm text-white/70">Total Downloads</p>
        </div>

        {/* Top Genres */}
        <div className="mb-4">
          <p className="text-xs uppercase tracking-wider mb-2" style={{ color: accentColor }}>
            Top Genres
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {topGenres.slice(0, 3).map((genre) => (
              <span
                key={genre.name}
                className="px-3 py-1 rounded-full text-xs font-medium"
                style={{ background: `${accentColor}20`, color: accentColor }}
              >
                {genre.name}
              </span>
            ))}
          </div>
        </div>

        {/* Top Artists */}
        <div className="flex-1 flex flex-col justify-end">
          <p className="text-xs text-white/50 mb-2">
            Favorite: {topArtists.slice(0, 2).join(', ')}
          </p>

          {/* Branding */}
          {showBranding && (
            <div className="flex items-center justify-center gap-2 pt-4 border-t border-white/10">
              <div
                className="w-5 h-5 rounded flex items-center justify-center"
                style={{ background: accentColor }}
              >
                <Play className="w-2.5 h-2.5 text-black" fill="black" />
              </div>
              <span className="text-xs text-white/50">thevideopool.com</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================
// TRACK CARD TEMPLATE
// ============================================

interface TrackCardProps {
  data: TrackData;
  djName: string;
  accentColor: string;
  customImage?: string;
  imageOpacity: number;
  imageBlur: number;
  showBranding: boolean;
}

function TrackCardTemplate({
  data,
  djName,
  accentColor,
  customImage,
  imageOpacity,
  imageBlur,
  showBranding,
}: TrackCardProps) {
  const { track, badge } = data;

  const badgeText = badge === 'now-playing' ? '▶ NOW PLAYING'
    : badge === 'just-downloaded' ? '⬇ JUST DOWNLOADED'
    : badge === 'favorite' ? '❤️ FAVORITE'
    : '';

  return (
    <div className="relative w-full h-full overflow-hidden rounded-2xl">
      {/* Background - Track Thumbnail or Custom */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url(${customImage || track.thumbnailUrl || `https://picsum.photos/400/400?random=${track.id}`})`,
          opacity: imageOpacity,
          filter: `blur(${imageBlur}px)`,
        }}
      />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col p-6">
        {/* Badge */}
        {badge && (
          <div
            className="self-start px-3 py-1 rounded-full text-xs font-bold mb-auto"
            style={{ background: accentColor, color: 'black' }}
          >
            {badgeText}
          </div>
        )}

        {/* Track Info */}
        <div className="mt-auto">
          {/* Waveform Placeholder */}
          <div className="h-12 mb-4 flex items-end gap-0.5">
            {Array.from({ length: 40 }).map((_, i) => (
              <div
                key={i}
                className="flex-1 rounded-t"
                style={{
                  height: `${Math.random() * 100}%`,
                  background: `${accentColor}${Math.random() > 0.5 ? 'cc' : '66'}`,
                }}
              />
            ))}
          </div>

          <h2 className="text-2xl font-bold text-white mb-1 line-clamp-2">
            {track.title}
          </h2>
          <p className="text-lg text-white/70 mb-4">{track.artist}</p>

          {/* Meta Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="font-mono font-bold" style={{ color: accentColor }}>
                {track.bpm} BPM
              </span>
              <span className="font-mono" style={{ color: accentColor }}>
                {track.key}
              </span>
              {track.downloads && (
                <div className="flex items-center gap-1 text-white/50">
                  <Download className="w-3 h-3" />
                  <DownloadCounter count={track.downloads} />
                </div>
              )}
            </div>

            {/* Camelot */}
            <CamelotMiniWheel keys={[track.key]} accentColor={accentColor} size="sm" />
          </div>

          {/* Branding */}
          {showBranding && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
              <span className="text-xs text-white/50">{djName}</span>
              <div className="flex items-center gap-2">
                <div
                  className="w-5 h-5 rounded flex items-center justify-center"
                  style={{ background: accentColor }}
                >
                  <Play className="w-2.5 h-2.5 text-black" fill="black" />
                </div>
                <span className="text-xs text-white/50">thevideopool.com</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================
// MAIN SOCIAL SHARE CARD COMPONENT
// ============================================

const SocialShareCard = forwardRef<HTMLDivElement, SocialCardProps>(({
  type,
  data,
  customImage,
  imagePosition = { x: 50, y: 50 },
  imageOpacity = 0.3,
  imageBlur = 0,
  accentColor = '#00d4ff',
  djName = 'DJ Demo',
  showBranding = true,
  exportSize = 'instagram',
}, ref) => {
  const dimensions = EXPORT_DIMENSIONS[exportSize];
  const aspectRatio = dimensions.width / dimensions.height;

  // Scale for preview (max 400px width)
  const previewWidth = Math.min(400, dimensions.width);
  const previewHeight = previewWidth / aspectRatio;

  const commonProps = {
    djName,
    accentColor,
    customImage,
    imageOpacity,
    imageBlur,
    showBranding,
  };

  return (
    <div
      ref={ref}
      className="relative overflow-hidden bg-[#0a0a0f]"
      style={{
        width: previewWidth,
        height: previewHeight,
      }}
    >
      {type === 'set' && <SetCardTemplate data={data as SetData} {...commonProps} />}
      {type === 'stats' && <StatsCardTemplate data={data as StatsData} {...commonProps} />}
      {type === 'track' && <TrackCardTemplate data={data as TrackData} {...commonProps} />}
    </div>
  );
});

SocialShareCard.displayName = 'SocialShareCard';

export default SocialShareCard;

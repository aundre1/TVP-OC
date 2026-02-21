/**
 * Video Row Component
 * Table row displaying a single video with all columns
 */

import React, { memo } from 'react';
import { Play, Download, Heart, Plus } from 'lucide-react';
import { Video, VideoRowProps } from '@/types/browse';

const VideoRowComponent: React.FC<VideoRowProps> = ({
  video,
  onClick,
  onPreview,
  onDownload,
  onFavorite,
  isSelected = false,
}) => {
  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onPreview(video);
  };

  const handleDownloadClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDownload(video);
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFavorite(video);
  };

  const handlePlaylistClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFavorite(video); // Opens LibraryPanel with video selected for playlist management
  };

  return (
    <tr
      onClick={() => onClick(video)}
      className={`border-b border-tvp-border-subtle hover:bg-tvp-bg-tertiary transition-colors cursor-pointer ${
        isSelected ? 'bg-tvp-bg-tertiary' : ''
      }`}
    >
      {/* Play Button */}
      <td className="px-2 py-1.5 w-10">
        <button
          onClick={handlePlayClick}
          className="p-1 hover:bg-tvp-accent-cyan hover:text-tvp-bg-primary rounded transition-colors text-tvp-text-muted"
          title="Preview"
        >
          <Play size={14} fill="currentColor" />
        </button>
      </td>

      {/* Album Art Thumbnail */}
      <td className="px-2 py-1.5 w-14">
        <img
          src={video.coverArt}
          alt={video.title}
          className="w-[45px] h-[34px] rounded-sm object-cover"
          loading="lazy"
        />
      </td>

      {/* Artist */}
      <td className="px-2 py-1.5 text-xs text-tvp-text-secondary font-medium">{video.artist}</td>

      {/* Title */}
      <td className="px-2 py-1.5 text-xs text-tvp-text-primary font-semibold">{video.title}</td>

      {/* Label */}
      <td className="px-2 py-1.5 text-xs text-tvp-text-muted">{video.label}</td>

      {/* Genre */}
      <td className="px-2 py-1.5">
        <span className="px-1.5 py-0.5 bg-tvp-bg-tertiary text-[10px] rounded text-tvp-text-secondary">
          {video.genre}
        </span>
      </td>

      {/* Bracket/Quality Tier */}
      <td className="px-2 py-1.5 text-xs text-tvp-text-muted">{video.bracket || '-'}</td>

      {/* Quality */}
      <td className="px-2 py-1.5 text-xs">
        {video.quality ? (
          <span className="px-1.5 py-0.5 bg-cyan-900/40 text-tvp-accent-cyan rounded text-[10px] font-bold">
            {video.quality}
          </span>
        ) : (
          <span className="text-tvp-text-muted">-</span>
        )}
      </td>

      {/* Version */}
      <td className="px-2 py-1.5 text-xs text-tvp-text-muted">{video.version || '-'}</td>

      {/* Release Date */}
      <td className="px-2 py-1.5 text-xs text-tvp-text-muted">
        {new Date(video.releaseDate).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: '2-digit',
        })}
      </td>

      {/* Actions */}
      <td className="px-2 py-1.5 flex items-center gap-1">
        <button
          onClick={handleDownloadClick}
          className="p-1 hover:text-tvp-accent-cyan rounded transition-colors text-tvp-text-muted"
          title="Download"
        >
          <Download size={14} />
        </button>

        <button
          onClick={handleFavoriteClick}
          className={`p-1 rounded transition-colors ${
            video.isFavorited
              ? 'text-pink-500'
              : 'hover:text-pink-500 text-tvp-text-muted'
          }`}
          title="Favorite"
        >
          <Heart size={14} fill={video.isFavorited ? 'currentColor' : 'none'} />
        </button>

        <button
          onClick={handlePlaylistClick}
          className="p-1 hover:text-tvp-accent-cyan rounded transition-colors text-tvp-text-muted"
          title="Add to playlist"
        >
          <Plus size={14} />
        </button>
      </td>
    </tr>
  );
};

export const VideoRow = memo(VideoRowComponent);

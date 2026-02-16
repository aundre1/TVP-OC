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

  return (
    <tr
      onClick={() => onClick(video)}
      className={`border-b border-gray-700 hover:bg-gray-800 transition-colors cursor-pointer ${
        isSelected ? 'bg-gray-700' : 'hover:bg-gray-800'
      }`}
    >
      {/* Play Button */}
      <td className="px-4 py-3 w-12">
        <button
          onClick={handlePlayClick}
          className="p-2 hover:bg-cyan-500 hover:text-white rounded transition-colors text-gray-400"
          title="Preview"
        >
          <Play size={16} fill="currentColor" />
        </button>
      </td>

      {/* Album Art Thumbnail */}
      <td className="px-4 py-3 w-16">
        <img
          src={video.coverArt}
          alt={video.title}
          className="w-12 h-12 rounded object-cover"
        />
      </td>

      {/* Artist */}
      <td className="px-4 py-3 text-sm text-gray-300 font-medium">{video.artist}</td>

      {/* Title */}
      <td className="px-4 py-3 text-sm text-gray-200 font-semibold">{video.title}</td>

      {/* Label */}
      <td className="px-4 py-3 text-sm text-gray-400">{video.label}</td>

      {/* Genre */}
      <td className="px-4 py-3">
        <span className="px-2 py-1 bg-gray-700 text-xs rounded text-gray-300">
          {video.genre}
        </span>
      </td>

      {/* Bracket/Quality Tier */}
      <td className="px-4 py-3 text-sm text-gray-400">{video.bracket || '-'}</td>

      {/* Quality */}
      <td className="px-4 py-3 text-sm">
        {video.quality ? (
          <span className="px-2 py-1 bg-cyan-900 text-cyan-300 rounded text-xs">
            {video.quality}
          </span>
        ) : (
          <span className="text-gray-500">-</span>
        )}
      </td>

      {/* Version */}
      <td className="px-4 py-3 text-sm text-gray-400">{video.version || '-'}</td>

      {/* Release Date */}
      <td className="px-4 py-3 text-sm text-gray-400">
        {new Date(video.releaseDate).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: '2-digit',
        })}
      </td>

      {/* Actions */}
      <td className="px-4 py-3 flex items-center gap-2">
        <button
          onClick={handleDownloadClick}
          className="p-1.5 hover:bg-cyan-500 hover:text-white rounded transition-colors text-gray-400"
          title="Download"
        >
          <Download size={16} />
        </button>

        <button
          onClick={handleFavoriteClick}
          className={`p-1.5 rounded transition-colors ${
            video.isFavorited
              ? 'bg-pink-500 text-white'
              : 'hover:bg-pink-500 hover:text-white text-gray-400'
          }`}
          title="Favorite"
        >
          <Heart size={16} fill={video.isFavorited ? 'currentColor' : 'none'} />
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            // TODO: Show add to playlist menu
          }}
          className="p-1.5 hover:bg-gray-700 rounded transition-colors text-gray-400"
          title="Add to playlist"
        >
          <Plus size={16} />
        </button>
      </td>
    </tr>
  );
};

export const VideoRow = memo(VideoRowComponent);

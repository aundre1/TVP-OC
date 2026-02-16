/**
 * Details Panel
 * Full metadata and information
 */

import React from 'react';
import { Calendar, FileAudio, Tag } from 'lucide-react';
import { Video } from '@/types/browse';

interface DetailsPanelProps {
  video: Video;
}

export const DetailsPanel: React.FC<DetailsPanelProps> = ({ video }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-4">
      {/* Album Art */}
      <div className="aspect-square rounded-lg overflow-hidden bg-gray-900">
        <img src={video.coverArt} alt={video.title} className="w-full h-full object-cover" />
      </div>

      {/* Core Info */}
      <div className="space-y-3">
        <div>
          <p className="text-xs text-gray-400 mb-1">Artist</p>
          <p className="text-sm font-semibold text-white">{video.artist}</p>
        </div>

        <div>
          <p className="text-xs text-gray-400 mb-1">Title</p>
          <p className="text-sm font-semibold text-white">{video.title}</p>
        </div>

        <div>
          <p className="text-xs text-gray-400 mb-1">Label</p>
          <p className="text-sm text-gray-300">{video.label}</p>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-2 gap-3 p-3 bg-gray-900 rounded-lg">
        <div className="space-y-1">
          <p className="text-xs text-gray-400 flex items-center gap-1">
            <Calendar size={14} />
            Released
          </p>
          <p className="text-sm text-white">{formatDate(video.releaseDate)}</p>
        </div>

        <div className="space-y-1">
          <p className="text-xs text-gray-400 flex items-center gap-1">
            <FileAudio size={14} />
            Duration
          </p>
          <p className="text-sm text-white">{Math.floor(video.duration / 60)}:{String(video.duration % 60).padStart(2, '0')}</p>
        </div>

        <div className="space-y-1">
          <p className="text-xs text-gray-400 flex items-center gap-1">
            <Tag size={14} />
            Genre
          </p>
          <p className="text-sm text-white">{video.genre}</p>
        </div>

        <div className="space-y-1">
          <p className="text-xs text-gray-400">Quality</p>
          <p className="text-sm text-cyan-400">{video.quality || 'Standard'}</p>
        </div>
      </div>

      {/* Extended Metadata */}
      {video.metadata && (
        <div className="space-y-2 p-3 bg-gray-900 rounded-lg">
          <p className="text-xs font-semibold text-gray-300 uppercase">Metadata</p>
          {video.metadata.bpm && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">BPM</span>
              <span className="text-white">{video.metadata.bpm}</span>
            </div>
          )}
          {video.metadata.key && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Key</span>
              <span className="text-white">{video.metadata.key}</span>
            </div>
          )}
          {video.metadata.mood && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Mood</span>
              <span className="text-white">{video.metadata.mood}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

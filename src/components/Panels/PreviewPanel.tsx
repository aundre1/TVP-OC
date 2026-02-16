/**
 * Preview Panel
 * Audio player with metadata
 */

import React, { useState } from 'react';
import { Play, Pause, Volume2 } from 'lucide-react';
import { Video } from '@/types/browse';

interface PreviewPanelProps {
  video: Video;
}

export const PreviewPanel: React.FC<PreviewPanelProps> = ({ video }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  return (
    <div className="space-y-4">
      {/* Album Art */}
      <div className="aspect-square rounded-lg overflow-hidden bg-gray-900">
        <img src={video.coverArt} alt={video.title} className="w-full h-full object-cover" />
      </div>

      {/* Metadata */}
      <div className="space-y-1">
        <p className="text-xs text-gray-400">{video.artist}</p>
        <h3 className="text-lg font-bold text-white">{video.title}</h3>
        <p className="text-sm text-gray-400">{video.label}</p>
      </div>

      {/* Player Controls */}
      <div className="space-y-3">
        {/* Play Button */}
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="w-full flex items-center justify-center gap-2 py-3 bg-cyan-500 hover:bg-cyan-600 rounded-lg text-white font-semibold transition-colors"
        >
          {isPlaying ? <Pause size={20} /> : <Play size={20} fill="currentColor" />}
          {isPlaying ? 'Pause' : 'Play Preview'}
        </button>

        {/* Progress Bar */}
        <div className="space-y-1">
          <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-cyan-500 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-400">
            <span>0:00</span>
            <span>{video.duration}s</span>
          </div>
        </div>

        {/* Volume Control */}
        <div className="flex items-center gap-2">
          <Volume2 size={16} className="text-gray-400" />
          <input
            type="range"
            min="0"
            max="100"
            defaultValue="70"
            className="flex-1 h-1 bg-gray-700 rounded-full appearance-none cursor-pointer"
          />
        </div>
      </div>

      {/* Info Tags */}
      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-700">
        <div>
          <p className="text-xs text-gray-400">Genre</p>
          <p className="text-sm font-semibold text-white">{video.genre}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400">Quality</p>
          <p className="text-sm font-semibold text-cyan-400">{video.quality || 'Unknown'}</p>
        </div>
      </div>
    </div>
  );
};

/**
 * Preview Panel
 * Audio player with metadata
 * Connects play/pause to an audio element (mock preview URL for now, real streaming in Phase 4)
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { Video } from '@/types/browse';

interface PreviewPanelProps {
  video: Video;
}

export const PreviewPanel: React.FC<PreviewPanelProps> = ({ video }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(70);
  const [isMuted, setIsMuted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Determine audio source: use previewUrl if available, otherwise mock
  const audioSrc = video.previewUrl || null;

  /** Format seconds into m:ss display */
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${String(secs).padStart(2, '0')}`;
  };

  /** Clean up interval timer */
  const clearProgressInterval = useCallback(() => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  }, []);

  /** Handle play/pause toggle */
  const handlePlayPause = useCallback(async () => {
    setError(null);

    if (!audioRef.current) {
      // No audio element - run mock playback simulation
      if (isPlaying) {
        setIsPlaying(false);
        clearProgressInterval();
      } else {
        setIsPlaying(true);
        // Simulate progress over the video duration
        const duration = video.duration || 30;
        const intervalMs = 100;
        const increment = (100 / duration) * (intervalMs / 1000);

        progressIntervalRef.current = setInterval(() => {
          setProgress((prev) => {
            const next = prev + increment;
            if (next >= 100) {
              clearProgressInterval();
              setIsPlaying(false);
              setCurrentTime(0);
              return 0;
            }
            setCurrentTime((next / 100) * duration);
            return next;
          });
        }, intervalMs);
      }
      return;
    }

    // Real audio element
    try {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        await audioRef.current.play();
        setIsPlaying(true);
      }
    } catch (err) {
      console.error('Playback failed:', err);
      setError('Playback failed. Preview may not be available.');
      setIsPlaying(false);
    }
  }, [isPlaying, video.duration, clearProgressInterval]);

  /** Handle volume change */
  const handleVolumeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newVolume = Number(e.target.value);
      setVolume(newVolume);
      setIsMuted(newVolume === 0);

      if (audioRef.current) {
        audioRef.current.volume = newVolume / 100;
        audioRef.current.muted = newVolume === 0;
      }
    },
    []
  );

  /** Toggle mute */
  const handleToggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      if (audioRef.current) {
        audioRef.current.muted = next;
      }
      return next;
    });
  }, []);

  /** Sync audio element time updates with progress bar */
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      if (audio.duration) {
        setProgress((audio.currentTime / audio.duration) * 100);
        setCurrentTime(audio.currentTime);
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setProgress(0);
      setCurrentTime(0);
    };

    const handleError = () => {
      setError('Failed to load audio preview.');
      setIsPlaying(false);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, []);

  /** Clean up on unmount */
  useEffect(() => {
    return () => {
      clearProgressInterval();
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [clearProgressInterval]);

  return (
    <div className="space-y-4">
      {/* Hidden audio element (only rendered when previewUrl exists) */}
      {audioSrc && (
        <audio ref={audioRef} src={audioSrc} preload="metadata" />
      )}

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

      {/* Error Message */}
      {error && (
        <div className="p-2 bg-red-900/50 border border-red-700 rounded-lg">
          <p className="text-xs text-red-200">{error}</p>
        </div>
      )}

      {/* No Preview Notice */}
      {!audioSrc && (
        <div className="p-2 bg-yellow-900/30 border border-yellow-800 rounded-lg">
          <p className="text-xs text-yellow-300">
            No audio preview available. Simulated playback will be used.
          </p>
        </div>
      )}

      {/* Player Controls */}
      <div className="space-y-3">
        {/* Play Button */}
        <button
          onClick={handlePlayPause}
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
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(video.duration)}</span>
          </div>
        </div>

        {/* Volume Control */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleMute}
            className="text-gray-400 hover:text-white transition-colors"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted || volume === 0 ? (
              <VolumeX size={16} />
            ) : (
              <Volume2 size={16} />
            )}
          </button>
          <input
            type="range"
            min="0"
            max="100"
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
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

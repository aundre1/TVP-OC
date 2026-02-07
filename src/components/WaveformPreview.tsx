// ============================================
// THE VIDEO POOL - WAVEFORM PREVIEW v5.5
// Beatport/Serato-inspired waveform visualization
// Shows track energy and structure at a glance
// ============================================

import { useMemo } from 'react';
import { clsx } from 'clsx';

interface WaveformPreviewProps {
  /** Seed for generating consistent waveform per track */
  trackId: number;
  /** Width in pixels */
  width?: number;
  /** Height in pixels */
  height?: number;
  /** Number of bars */
  bars?: number;
  /** Whether to animate */
  animated?: boolean;
  /** Color mode */
  colorMode?: 'cyan' | 'gradient' | 'white';
}

// Generate pseudo-random waveform data based on track ID
function generateWaveformData(trackId: number, bars: number): number[] {
  const data: number[] = [];
  let seed = trackId;

  // Simple seeded random for consistency
  const random = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };

  // Generate bars with some structure (intro/verse/chorus/outro pattern)
  for (let i = 0; i < bars; i++) {
    const position = i / bars;

    // Create natural music structure
    let intensity = 0.3 + random() * 0.4;

    // Intro (first 10%) - building
    if (position < 0.1) {
      intensity *= 0.5 + (position / 0.1) * 0.5;
    }
    // Drop/Chorus zones (around 25%, 50%, 75%)
    else if (Math.abs(position - 0.25) < 0.1 ||
             Math.abs(position - 0.5) < 0.15 ||
             Math.abs(position - 0.75) < 0.1) {
      intensity = 0.7 + random() * 0.3;
    }
    // Outro (last 10%) - fading
    else if (position > 0.9) {
      intensity *= 1 - ((position - 0.9) / 0.1) * 0.6;
    }

    data.push(Math.max(0.1, Math.min(1, intensity)));
  }

  return data;
}

export default function WaveformPreview({
  trackId,
  width = 100,
  height = 32,
  bars = 40,
  animated = false,
  colorMode = 'cyan',
}: WaveformPreviewProps) {
  const waveformData = useMemo(() => generateWaveformData(trackId, bars), [trackId, bars]);

  const barWidth = width / bars - 1;
  const gap = 1;

  const getBarColor = (index: number, intensity: number) => {
    if (colorMode === 'gradient') {
      // Gradient from cyan to coral based on intensity
      return intensity > 0.7
        ? 'bg-gradient-to-t from-tvp-accent-coral to-tvp-accent-cyan'
        : 'bg-tvp-accent-cyan';
    }
    if (colorMode === 'white') {
      return 'bg-white/80';
    }
    return 'bg-tvp-accent-cyan';
  };

  return (
    <div
      className="flex items-end gap-px"
      style={{ width, height }}
      aria-label="Audio waveform visualization"
    >
      {waveformData.map((intensity, index) => (
        <div
          key={index}
          className={clsx(
            'rounded-t-sm transition-all duration-150',
            getBarColor(index, intensity),
            animated && 'animate-pulse'
          )}
          style={{
            width: barWidth,
            height: `${intensity * 100}%`,
            opacity: 0.6 + intensity * 0.4,
            animationDelay: animated ? `${index * 50}ms` : undefined,
          }}
        />
      ))}
    </div>
  );
}

// Compact version for list views
export function WaveformMini({ trackId }: { trackId: number }) {
  return (
    <WaveformPreview
      trackId={trackId}
      width={60}
      height={20}
      bars={20}
      colorMode="cyan"
    />
  );
}

// Animated version for playing state
export function WaveformAnimated({ trackId }: { trackId: number }) {
  return (
    <WaveformPreview
      trackId={trackId}
      width={100}
      height={32}
      bars={40}
      animated
      colorMode="gradient"
    />
  );
}

// ============================================
// THE VIDEO POOL - DOWNLOAD COUNTER
// Animated counter with social proof formatting
// Quick Win #2: Download counts for social proof
// ============================================

import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface DownloadCounterProps {
  count: number;
  animated?: boolean;
  duration?: number;
  className?: string;
  showIcon?: boolean;
}

// Format numbers with K/M suffix
function formatCount(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toLocaleString();
}

export default function DownloadCounter({
  count,
  animated = false,
  duration = 2000,
  className,
  showIcon = false,
}: DownloadCounterProps) {
  const [displayCount, setDisplayCount] = useState(animated ? 0 : count);
  const countRef = useRef(count);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    if (!animated) {
      setDisplayCount(count);
      return;
    }

    // Cancel any existing animation
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    const startTime = performance.now();
    const startCount = 0;
    const endCount = count;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function (ease-out cubic)
      const easeOut = 1 - Math.pow(1 - progress, 3);

      const currentCount = Math.floor(startCount + (endCount - startCount) * easeOut);
      setDisplayCount(currentCount);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setDisplayCount(endCount);
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [count, animated, duration]);

  // Update ref when count changes
  useEffect(() => {
    countRef.current = count;
  }, [count]);

  return (
    <span className={cn('font-semibold tabular-nums', className)}>
      {showIcon && (
        <svg
          className="inline-block w-4 h-4 mr-1 -mt-0.5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
      )}
      {formatCount(displayCount)}
    </span>
  );
}

// ============================================
// STYLED VARIANTS
// ============================================

interface StyledCounterProps extends DownloadCounterProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'badge' | 'hero';
  accentColor?: string;
}

export function StyledDownloadCounter({
  count,
  animated = true,
  size = 'md',
  variant = 'default',
  accentColor = '#00d4ff',
  className,
}: StyledCounterProps) {
  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-2xl',
  };

  if (variant === 'badge') {
    return (
      <div
        className={cn(
          'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full',
          sizeClasses[size],
          className
        )}
        style={{ background: `${accentColor}20` }}
      >
        <svg
          className="w-3.5 h-3.5"
          viewBox="0 0 24 24"
          fill="none"
          stroke={accentColor}
          strokeWidth="2"
        >
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
        <DownloadCounter
          count={count}
          animated={animated}
          className="font-semibold"
          style={{ color: accentColor } as any}
        />
      </div>
    );
  }

  if (variant === 'hero') {
    return (
      <div className={cn('text-center', className)}>
        <div
          className={cn('font-bold', sizeClasses[size])}
          style={{ color: accentColor }}
        >
          <DownloadCounter count={count} animated={animated} />
        </div>
        <div className="text-xs text-white/50 mt-1">downloads</div>
      </div>
    );
  }

  return (
    <DownloadCounter
      count={count}
      animated={animated}
      showIcon
      className={cn(sizeClasses[size], 'text-white/70', className)}
    />
  );
}

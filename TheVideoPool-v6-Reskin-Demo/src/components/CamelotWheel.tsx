// ============================================
// THE VIDEO POOL - CAMELOT KEY WHEEL v5.5
// Mixed In Key / Serato inspired visualization
// Shows harmonic compatibility at a glance
// ============================================

import { useMemo } from 'react';
import { clsx } from 'clsx';

interface CamelotWheelProps {
  /** Current key highlighted (e.g., "8A", "11B") */
  currentKey?: string;
  /** Keys in the current set */
  setKeys?: string[];
  /** Size in pixels */
  size?: number;
  /** Show labels */
  showLabels?: boolean;
  /** Interactive mode */
  interactive?: boolean;
  /** Callback when key is clicked */
  onKeyClick?: (key: string) => void;
}

// Camelot wheel layout - inner ring (A/minor) and outer ring (B/major)
const CAMELOT_KEYS = {
  inner: ['1A', '2A', '3A', '4A', '5A', '6A', '7A', '8A', '9A', '10A', '11A', '12A'],
  outer: ['1B', '2B', '3B', '4B', '5B', '6B', '7B', '8B', '9B', '10B', '11B', '12B'],
};

// Musical key names for display
const KEY_NAMES: Record<string, string> = {
  '1A': 'Abm', '2A': 'Ebm', '3A': 'Bbm', '4A': 'Fm', '5A': 'Cm', '6A': 'Gm',
  '7A': 'Dm', '8A': 'Am', '9A': 'Em', '10A': 'Bm', '11A': 'F#m', '12A': 'Dbm',
  '1B': 'B', '2B': 'F#', '3B': 'Db', '4B': 'Ab', '5B': 'Eb', '6B': 'Bb',
  '7B': 'F', '8B': 'C', '9B': 'G', '10B': 'D', '11B': 'A', '12B': 'E',
};

// Get compatible keys for a given key
function getCompatibleKeys(key: string): string[] {
  const num = parseInt(key);
  const letter = key.slice(-1);

  if (isNaN(num)) return [];

  const compatible: string[] = [key]; // Same key

  // Adjacent numbers (±1, wrapping around)
  const prev = num === 1 ? 12 : num - 1;
  const next = num === 12 ? 1 : num + 1;

  compatible.push(`${prev}${letter}`, `${next}${letter}`);

  // Same number, opposite letter (relative major/minor)
  compatible.push(`${num}${letter === 'A' ? 'B' : 'A'}`);

  return compatible;
}

export default function CamelotWheel({
  currentKey,
  setKeys = [],
  size = 200,
  showLabels = true,
  interactive = false,
  onKeyClick,
}: CamelotWheelProps) {
  const compatibleKeys = useMemo(
    () => (currentKey ? getCompatibleKeys(currentKey) : []),
    [currentKey]
  );

  const center = size / 2;
  const outerRadius = size / 2 - 10;
  const innerRadius = size / 2 - 45;
  const keyRadius = 16;

  // Calculate position on circle
  const getPosition = (index: number, radius: number) => {
    const angle = (index * 30 - 90) * (Math.PI / 180); // Start at top, go clockwise
    return {
      x: center + radius * Math.cos(angle),
      y: center + radius * Math.sin(angle),
    };
  };

  const renderKey = (key: string, index: number, isOuter: boolean) => {
    const radius = isOuter ? outerRadius : innerRadius;
    const pos = getPosition(index, radius);

    const isCurrent = key === currentKey;
    const isCompatible = compatibleKeys.includes(key);
    const isInSet = setKeys.includes(key);

    return (
      <g
        key={key}
        transform={`translate(${pos.x}, ${pos.y})`}
        className={clsx(interactive && 'cursor-pointer')}
        onClick={() => interactive && onKeyClick?.(key)}
      >
        {/* Key circle */}
        <circle
          r={keyRadius}
          className={clsx(
            'transition-all duration-200',
            isCurrent
              ? 'fill-tvp-accent-cyan stroke-tvp-accent-cyan stroke-2'
              : isCompatible
              ? 'fill-tvp-accent-cyan/30 stroke-tvp-accent-cyan stroke-1'
              : isInSet
              ? 'fill-tvp-accent-coral/50 stroke-tvp-accent-coral stroke-1'
              : 'fill-tvp-bg-tertiary stroke-tvp-border-subtle stroke-1',
            interactive && !isCurrent && 'hover:fill-tvp-bg-elevated hover:stroke-tvp-accent-cyan'
          )}
        />

        {/* Key label */}
        {showLabels && (
          <text
            textAnchor="middle"
            dominantBaseline="central"
            className={clsx(
              'text-[10px] font-bold select-none',
              isCurrent
                ? 'fill-black'
                : isCompatible
                ? 'fill-tvp-accent-cyan'
                : 'fill-tvp-text-muted'
            )}
          >
            {key}
          </text>
        )}
      </g>
    );
  };

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="overflow-visible">
        {/* Background circles */}
        <circle
          cx={center}
          cy={center}
          r={outerRadius}
          className="fill-none stroke-tvp-border-subtle stroke-1"
        />
        <circle
          cx={center}
          cy={center}
          r={innerRadius}
          className="fill-none stroke-tvp-border-subtle stroke-1"
        />

        {/* Center decoration */}
        <circle
          cx={center}
          cy={center}
          r={20}
          className="fill-tvp-bg-tertiary stroke-tvp-border-default stroke-1"
        />
        <text
          x={center}
          y={center}
          textAnchor="middle"
          dominantBaseline="central"
          className="fill-tvp-text-muted text-[8px] font-medium"
        >
          KEY
        </text>

        {/* Outer ring (B/Major) */}
        {CAMELOT_KEYS.outer.map((key, i) => renderKey(key, i, true))}

        {/* Inner ring (A/Minor) */}
        {CAMELOT_KEYS.inner.map((key, i) => renderKey(key, i, false))}
      </svg>

      {/* Legend */}
      {currentKey && (
        <div className="absolute -bottom-8 left-0 right-0 flex justify-center gap-4 text-[10px]">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-tvp-accent-cyan" />
            Current
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-tvp-accent-cyan/30 border border-tvp-accent-cyan" />
            Compatible
          </span>
          {setKeys.length > 0 && (
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-tvp-accent-coral/50 border border-tvp-accent-coral" />
              In Set
            </span>
          )}
        </div>
      )}
    </div>
  );
}

// Compact inline version for quick display
export function CamelotKeyBadge({ camelotKey }: { camelotKey: string }) {
  const isMinor = camelotKey.endsWith('A');

  return (
    <span
      className={clsx(
        'inline-flex items-center justify-center',
        'w-8 h-5 rounded text-[10px] font-bold',
        isMinor
          ? 'bg-tvp-bg-tertiary text-tvp-accent-cyan border border-tvp-accent-cyan/30'
          : 'bg-tvp-accent-cyan/20 text-tvp-accent-cyan border border-tvp-accent-cyan/50'
      )}
    >
      {camelotKey}
    </span>
  );
}

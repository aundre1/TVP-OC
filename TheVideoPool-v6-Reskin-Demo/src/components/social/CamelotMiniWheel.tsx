// ============================================
// THE VIDEO POOL - CAMELOT MINI WHEEL
// Compact Camelot wheel for social cards
// Quick Win #3: Key visualization for DJ credibility
// ============================================

import { cn } from '@/lib/utils';

// Camelot wheel positions (12 keys around the circle)
const CAMELOT_POSITIONS: Record<string, { angle: number; color: string }> = {
  // Major keys (outer ring, labeled as B)
  '1B': { angle: 0, color: '#00d4ff' },    // A♭ Major
  '2B': { angle: 30, color: '#00e5cc' },   // E♭ Major
  '3B': { angle: 60, color: '#00e676' },   // B♭ Major
  '4B': { angle: 90, color: '#76ff03' },   // F Major
  '5B': { angle: 120, color: '#c6ff00' },  // C Major
  '6B': { angle: 150, color: '#ffea00' },  // G Major
  '7B': { angle: 180, color: '#ffc400' },  // D Major
  '8B': { angle: 210, color: '#ff9100' },  // A Major
  '9B': { angle: 240, color: '#ff5722' },  // E Major
  '10B': { angle: 270, color: '#f44336' }, // B Major
  '11B': { angle: 300, color: '#e040fb' }, // F♯ Major
  '12B': { angle: 330, color: '#7c4dff' }, // D♭ Major

  // Minor keys (inner ring, labeled as A)
  '1A': { angle: 0, color: '#0091ea' },    // F Minor
  '2A': { angle: 30, color: '#00b8d4' },   // C Minor
  '3A': { angle: 60, color: '#00bfa5' },   // G Minor
  '4A': { angle: 90, color: '#64dd17' },   // D Minor
  '5A': { angle: 120, color: '#aeea00' },  // A Minor
  '6A': { angle: 150, color: '#ffd600' },  // E Minor
  '7A': { angle: 180, color: '#ffab00' },  // B Minor
  '8A': { angle: 210, color: '#ff6d00' },  // F♯ Minor
  '9A': { angle: 240, color: '#dd2c00' },  // C♯ Minor
  '10A': { angle: 270, color: '#d50000' }, // G♯ Minor
  '11A': { angle: 300, color: '#aa00ff' }, // E♭ Minor
  '12A': { angle: 330, color: '#6200ea' }, // B♭ Minor
};

// Map standard key notation to Camelot
const KEY_TO_CAMELOT: Record<string, string> = {
  // Major keys
  'C Major': '5B', 'C': '5B',
  'G Major': '6B', 'G': '6B',
  'D Major': '7B', 'D': '7B',
  'A Major': '8B', 'A': '8B',
  'E Major': '9B', 'E': '9B',
  'B Major': '10B', 'B': '10B',
  'F# Major': '11B', 'F♯ Major': '11B', 'Gb Major': '11B',
  'Db Major': '12B', 'C# Major': '12B', 'D♭ Major': '12B',
  'Ab Major': '1B', 'G# Major': '1B', 'A♭ Major': '1B',
  'Eb Major': '2B', 'D# Major': '2B', 'E♭ Major': '2B',
  'Bb Major': '3B', 'A# Major': '3B', 'B♭ Major': '3B',
  'F Major': '4B', 'F': '4B',

  // Minor keys
  'A Minor': '5A', 'Am': '5A', 'A min': '5A',
  'E Minor': '6A', 'Em': '6A', 'E min': '6A',
  'B Minor': '7A', 'Bm': '7A', 'B min': '7A',
  'F# Minor': '8A', 'F#m': '8A', 'F♯ Minor': '8A', 'Gb Minor': '8A',
  'C# Minor': '9A', 'C#m': '9A', 'C♯ Minor': '9A', 'Db Minor': '9A',
  'G# Minor': '10A', 'G#m': '10A', 'G♯ Minor': '10A', 'Ab Minor': '10A',
  'Eb Minor': '11A', 'D#m': '11A', 'E♭ Minor': '11A', 'D# Minor': '11A',
  'Bb Minor': '12A', 'A#m': '12A', 'B♭ Minor': '12A', 'A# Minor': '12A',
  'F Minor': '1A', 'Fm': '1A', 'F min': '1A',
  'C Minor': '2A', 'Cm': '2A', 'C min': '2A',
  'G Minor': '3A', 'Gm': '3A', 'G min': '3A',
  'D Minor': '4A', 'Dm': '4A', 'D min': '4A',
};

interface CamelotMiniWheelProps {
  keys: string[];
  accentColor?: string;
  size?: 'sm' | 'md' | 'lg';
  showLabels?: boolean;
  className?: string;
}

export default function CamelotMiniWheel({
  keys,
  accentColor = '#00d4ff',
  size = 'md',
  showLabels = false,
  className,
}: CamelotMiniWheelProps) {
  const sizeConfig = {
    sm: { wheel: 40, dot: 6, fontSize: 8 },
    md: { wheel: 60, dot: 8, fontSize: 10 },
    lg: { wheel: 80, dot: 10, fontSize: 12 },
  };

  const { wheel, dot, fontSize } = sizeConfig[size];
  const radius = wheel / 2 - dot;

  // Convert keys to Camelot notation
  const camelotKeys = keys
    .map((key) => KEY_TO_CAMELOT[key] || key)
    .filter((key) => CAMELOT_POSITIONS[key]);

  // Get unique Camelot positions
  const activePositions = [...new Set(camelotKeys)];

  return (
    <div
      className={cn('relative', className)}
      style={{ width: wheel, height: wheel }}
    >
      {/* Wheel background */}
      <svg
        width={wheel}
        height={wheel}
        viewBox={`0 0 ${wheel} ${wheel}`}
        className="absolute inset-0"
      >
        {/* Background circle */}
        <circle
          cx={wheel / 2}
          cy={wheel / 2}
          r={wheel / 2 - 2}
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="1"
        />

        {/* Inner circle for minor keys */}
        <circle
          cx={wheel / 2}
          cy={wheel / 2}
          r={radius * 0.6}
          fill="none"
          stroke="rgba(255,255,255,0.05)"
          strokeWidth="1"
        />

        {/* Key segments */}
        {Object.entries(CAMELOT_POSITIONS).map(([key, { angle, color }]) => {
          const isActive = activePositions.includes(key);
          const isMinor = key.endsWith('A');
          const r = isMinor ? radius * 0.6 : radius;

          // Convert angle to radians and adjust for SVG coordinate system
          const rad = ((angle - 90) * Math.PI) / 180;
          const x = wheel / 2 + r * Math.cos(rad);
          const y = wheel / 2 + r * Math.sin(rad);

          return (
            <g key={key}>
              {/* Dot */}
              <circle
                cx={x}
                cy={y}
                r={isActive ? dot / 2 : dot / 3}
                fill={isActive ? color : 'rgba(255,255,255,0.2)'}
                style={{
                  transition: 'all 0.3s ease',
                  filter: isActive ? `drop-shadow(0 0 4px ${color})` : 'none',
                }}
              />

              {/* Label */}
              {showLabels && isActive && (
                <text
                  x={x}
                  y={y - dot / 2 - 4}
                  textAnchor="middle"
                  fill={color}
                  fontSize={fontSize}
                  fontWeight="bold"
                >
                  {key}
                </text>
              )}
            </g>
          );
        })}

        {/* Center dot */}
        <circle
          cx={wheel / 2}
          cy={wheel / 2}
          r={3}
          fill={accentColor}
        />
      </svg>

      {/* Key count badge */}
      {activePositions.length > 1 && (
        <div
          className="absolute -bottom-1 -right-1 min-w-[16px] h-4 px-1 flex items-center justify-center rounded-full text-[9px] font-bold"
          style={{ background: accentColor, color: 'black' }}
        >
          {activePositions.length}
        </div>
      )}
    </div>
  );
}

// ============================================
// CAMELOT WHEEL WITH LEGEND
// ============================================

interface CamelotWheelWithLegendProps extends CamelotMiniWheelProps {
  title?: string;
}

export function CamelotWheelWithLegend({
  keys,
  accentColor = '#00d4ff',
  size = 'md',
  title = 'Key Range',
  className,
}: CamelotWheelWithLegendProps) {
  const camelotKeys = keys
    .map((key) => KEY_TO_CAMELOT[key] || key)
    .filter((key) => CAMELOT_POSITIONS[key]);

  const uniqueKeys = [...new Set(camelotKeys)];

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <CamelotMiniWheel keys={keys} accentColor={accentColor} size={size} />
      <div>
        <div className="text-xs text-white/50 mb-1">{title}</div>
        <div className="flex flex-wrap gap-1">
          {uniqueKeys.slice(0, 3).map((key) => {
            const position = CAMELOT_POSITIONS[key];
            return (
              <span
                key={key}
                className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold"
                style={{ background: position?.color || accentColor, color: 'black' }}
              >
                {key}
              </span>
            );
          })}
          {uniqueKeys.length > 3 && (
            <span className="text-[10px] text-white/50">
              +{uniqueKeys.length - 3} more
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

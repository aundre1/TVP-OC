// ============================================
// THE VIDEO POOL - SCORING EXPLANATION MODAL
// Explains the recommendation algorithm with
// Camelot wheel visualization
// ============================================

import { createPortal } from 'react-dom';
import { X, Music, Clock, Disc, Tags } from 'lucide-react';
import { clsx } from 'clsx';
import { useAppStore } from '@/stores/appStore';

// Camelot wheel visual - simplified representation
const CAMELOT_KEYS = [
  { key: '1A', position: 'top-0 left-1/2 -translate-x-1/2', color: 'bg-red-500' },
  { key: '2A', position: 'top-[8%] right-[15%]', color: 'bg-orange-500' },
  { key: '3A', position: 'top-[25%] right-[3%]', color: 'bg-yellow-500' },
  { key: '4A', position: 'top-1/2 right-0 -translate-y-1/2', color: 'bg-lime-500' },
  { key: '5A', position: 'bottom-[25%] right-[3%]', color: 'bg-green-500' },
  { key: '6A', position: 'bottom-[8%] right-[15%]', color: 'bg-emerald-500' },
  { key: '7A', position: 'bottom-0 left-1/2 -translate-x-1/2', color: 'bg-teal-500' },
  { key: '8A', position: 'bottom-[8%] left-[15%]', color: 'bg-cyan-500' },
  { key: '9A', position: 'bottom-[25%] left-[3%]', color: 'bg-sky-500' },
  { key: '10A', position: 'top-1/2 left-0 -translate-y-1/2', color: 'bg-blue-500' },
  { key: '11A', position: 'top-[25%] left-[3%]', color: 'bg-indigo-500' },
  { key: '12A', position: 'top-[8%] left-[15%]', color: 'bg-violet-500' },
];

export default function ScoringExplanationModal() {
  const { isScoringModalOpen, closeScoringModal } = useAppStore();

  if (!isScoringModalOpen) return null;

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-500"
        onClick={closeScoringModal}
      />

      {/* Modal */}
      <div
        className={clsx(
          'fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
          'w-[600px] max-w-[95vw] max-h-[90vh]',
          'bg-tvp-bg-secondary border border-tvp-border-default rounded-2xl',
          'shadow-elevated z-500 overflow-hidden',
          'animate-fade-in'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-tvp-border-subtle">
          <h2 className="text-xl font-bold text-tvp-text-primary">
            How Track Recommendations Work
          </h2>
          <button
            onClick={closeScoringModal}
            className="p-2 rounded-lg text-tvp-text-muted hover:text-tvp-text-primary hover:bg-tvp-bg-tertiary transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          {/* Intro */}
          <p className="text-tvp-text-secondary mb-6">
            Our recommendation algorithm scores tracks based on how well they'll mix
            with the last track in your set. Higher scores mean smoother transitions.
          </p>

          {/* Scoring Categories */}
          <div className="space-y-6">
            {/* BPM Compatibility */}
            <div className="p-4 bg-tvp-bg-tertiary rounded-xl">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-tvp-accent-cyan/20 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-tvp-accent-cyan" />
                </div>
                <div>
                  <h3 className="font-semibold text-tvp-text-primary">
                    BPM Compatibility
                  </h3>
                  <p className="text-sm text-tvp-accent-cyan">Up to 40 points</p>
                </div>
              </div>
              <p className="text-sm text-tvp-text-secondary">
                Tracks within <span className="text-tvp-text-primary font-medium">±8 BPM</span> of
                your last track score highest. This range allows smooth beatmatching
                without dramatic tempo changes.
              </p>
              <div className="mt-3 flex gap-2 text-xs">
                <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded">±0-8 BPM = 40-16 pts</span>
                <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded">±9-16 BPM = 20-12 pts</span>
              </div>
            </div>

            {/* Key Compatibility */}
            <div className="p-4 bg-tvp-bg-tertiary rounded-xl">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                  <Music className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-tvp-text-primary">
                    Key Compatibility (Harmonic Mixing)
                  </h3>
                  <p className="text-sm text-purple-400">Up to 35 points</p>
                </div>
              </div>
              <p className="text-sm text-tvp-text-secondary mb-4">
                Uses the <span className="text-tvp-text-primary font-medium">Camelot Wheel</span> to
                find harmonically compatible keys. Adjacent keys on the wheel mix smoothly.
              </p>

              {/* Mini Camelot Wheel */}
              <div className="relative w-40 h-40 mx-auto mb-3">
                <div className="absolute inset-4 rounded-full border-2 border-tvp-border-subtle" />
                {CAMELOT_KEYS.map(({ key, position, color }) => (
                  <div
                    key={key}
                    className={clsx(
                      'absolute w-7 h-7 rounded-full flex items-center justify-center',
                      'text-[10px] font-bold text-white',
                      color,
                      position
                    )}
                  >
                    {key}
                  </div>
                ))}
              </div>
              <p className="text-xs text-center text-tvp-text-muted">
                Compatible keys: same key, ±1 position, or parallel major/minor (A↔B)
              </p>
              <div className="mt-3 flex gap-2 text-xs justify-center">
                <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded">Harmonic = 35 pts</span>
                <span className="px-2 py-1 bg-purple-500/10 text-purple-300 rounded">Same key = 30 pts</span>
              </div>
            </div>

            {/* Subgenre Match */}
            <div className="p-4 bg-tvp-bg-tertiary rounded-xl">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
                  <Tags className="w-5 h-5 text-orange-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-tvp-text-primary">
                    Subgenre Match
                  </h3>
                  <p className="text-sm text-orange-400">Up to 15 points</p>
                </div>
              </div>
              <p className="text-sm text-tvp-text-secondary">
                Tracks in the same subgenre (e.g., both "Deep House" or both "Tech House")
                get bonus points for maintaining stylistic consistency.
              </p>
            </div>

            {/* Genre Match */}
            <div className="p-4 bg-tvp-bg-tertiary rounded-xl">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <Disc className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-tvp-text-primary">
                    Genre Match
                  </h3>
                  <p className="text-sm text-blue-400">Up to 10 points</p>
                </div>
              </div>
              <p className="text-sm text-tvp-text-secondary">
                If subgenres don't match but the main genre does (e.g., both "House"),
                a smaller bonus is awarded.
              </p>
            </div>
          </div>

          {/* Score Legend */}
          <div className="mt-8 p-4 bg-tvp-bg-primary rounded-xl border border-tvp-border-subtle">
            <h4 className="font-semibold text-tvp-text-primary mb-3">Score Legend</h4>
            <div className="grid grid-cols-4 gap-3">
              <div className="text-center">
                <div className="w-10 h-10 mx-auto rounded-full bg-green-500/20 border-2 border-green-500 flex items-center justify-center">
                  <span className="text-xs font-bold text-green-400">75+</span>
                </div>
                <p className="text-xs text-green-400 mt-1 font-medium">Excellent</p>
              </div>
              <div className="text-center">
                <div className="w-10 h-10 mx-auto rounded-full bg-tvp-accent-cyan/20 border-2 border-tvp-accent-cyan flex items-center justify-center">
                  <span className="text-xs font-bold text-tvp-accent-cyan">60-74</span>
                </div>
                <p className="text-xs text-tvp-accent-cyan mt-1 font-medium">Great</p>
              </div>
              <div className="text-center">
                <div className="w-10 h-10 mx-auto rounded-full bg-yellow-500/20 border-2 border-yellow-500 flex items-center justify-center">
                  <span className="text-xs font-bold text-yellow-400">40-59</span>
                </div>
                <p className="text-xs text-yellow-400 mt-1 font-medium">Good</p>
              </div>
              <div className="text-center">
                <div className="w-10 h-10 mx-auto rounded-full bg-tvp-text-muted/20 border-2 border-tvp-text-muted flex items-center justify-center">
                  <span className="text-xs font-bold text-tvp-text-muted">20-39</span>
                </div>
                <p className="text-xs text-tvp-text-muted mt-1 font-medium">Fair</p>
              </div>
            </div>
          </div>

          {/* Pro Tips */}
          <div className="mt-6 text-sm text-tvp-text-muted">
            <p className="font-medium text-tvp-text-secondary mb-2">Pro Tips:</p>
            <ul className="space-y-1 list-disc list-inside">
              <li>Aim for scores of 60+ for smooth, professional transitions</li>
              <li>Energy changes can work even with lower harmonic scores</li>
              <li>Use the Camelot wheel to plan key progressions in advance</li>
            </ul>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
}

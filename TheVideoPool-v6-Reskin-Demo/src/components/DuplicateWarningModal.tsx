// ============================================
// THE VIDEO POOL - DUPLICATE WARNING MODAL
// Warns when adding a similar track to set
// (same artist, similar title)
// ============================================

import { createPortal } from 'react-dom';
import { AlertTriangle, X, Plus, Ban } from 'lucide-react';
import { clsx } from 'clsx';
import { useAppStore } from '@/stores/appStore';

export default function DuplicateWarningModal() {
  const {
    isDuplicateModalOpen,
    pendingDuplicateTrack,
    existingSimilarTrack,
    closeDuplicateModal,
    confirmAddDuplicate,
  } = useAppStore();

  if (!isDuplicateModalOpen || !pendingDuplicateTrack || !existingSimilarTrack) {
    return null;
  }

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-500"
        onClick={closeDuplicateModal}
      />

      {/* Modal */}
      <div
        className={clsx(
          'fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
          'w-[450px] max-w-[95vw]',
          'bg-tvp-bg-secondary border border-tvp-border-default rounded-2xl',
          'shadow-elevated z-500 overflow-hidden',
          'animate-fade-in'
        )}
      >
        {/* Header */}
        <div className="flex items-center gap-3 p-6 border-b border-tvp-border-subtle">
          <div className="w-10 h-10 rounded-full bg-tvp-status-warning/20 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-tvp-status-warning" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-tvp-text-primary">
              Similar Track Detected
            </h2>
            <p className="text-sm text-tvp-text-muted">
              You may already have this track in your set
            </p>
          </div>
          <button
            onClick={closeDuplicateModal}
            className="ml-auto p-2 rounded-lg text-tvp-text-muted hover:text-tvp-text-primary hover:bg-tvp-bg-tertiary transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Existing Track */}
          <div className="mb-4">
            <p className="text-xs font-semibold text-tvp-text-muted uppercase tracking-wide mb-2">
              Already in your set
            </p>
            <div className="p-3 bg-tvp-bg-tertiary rounded-lg border border-tvp-border-subtle">
              <p className="font-medium text-tvp-text-primary">
                {existingSimilarTrack.title}
              </p>
              <p className="text-sm text-tvp-text-secondary">
                {existingSimilarTrack.artist}
              </p>
              <div className="flex items-center gap-2 mt-1 text-xs text-tvp-text-muted font-mono">
                <span>{existingSimilarTrack.bpm} BPM</span>
                <span>•</span>
                <span className="text-tvp-accent-cyan">{existingSimilarTrack.key}</span>
              </div>
            </div>
          </div>

          {/* New Track */}
          <div className="mb-6">
            <p className="text-xs font-semibold text-tvp-text-muted uppercase tracking-wide mb-2">
              Track you're adding
            </p>
            <div className="p-3 bg-tvp-bg-tertiary rounded-lg border border-tvp-accent-cyan/30">
              <p className="font-medium text-tvp-text-primary">
                {pendingDuplicateTrack.title}
              </p>
              <p className="text-sm text-tvp-text-secondary">
                {pendingDuplicateTrack.artist}
              </p>
              <div className="flex items-center gap-2 mt-1 text-xs text-tvp-text-muted font-mono">
                <span>{pendingDuplicateTrack.bpm} BPM</span>
                <span>•</span>
                <span className="text-tvp-accent-cyan">{pendingDuplicateTrack.key}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={closeDuplicateModal}
              className={clsx(
                'flex-1 flex items-center justify-center gap-2 py-3 rounded-lg',
                'bg-tvp-bg-tertiary border border-tvp-border-subtle',
                'text-tvp-text-secondary font-medium',
                'hover:border-tvp-text-muted hover:text-tvp-text-primary transition-colors'
              )}
            >
              <Ban className="w-4 h-4" />
              <span>Cancel</span>
            </button>
            <button
              onClick={confirmAddDuplicate}
              className={clsx(
                'flex-1 flex items-center justify-center gap-2 py-3 rounded-lg',
                'bg-tvp-accent-cyan text-black font-semibold',
                'hover:bg-tvp-accent-cyan-hover transition-colors'
              )}
            >
              <Plus className="w-4 h-4" />
              <span>Add Anyway</span>
            </button>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
}

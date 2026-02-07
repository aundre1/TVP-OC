// ============================================
// THE VIDEO POOL - SHORTCUTS PANEL v5.5
// Full keyboard shortcuts reference panel
// ============================================

import { X } from 'lucide-react';
import { clsx } from 'clsx';
import { useAppStore } from '@/stores/appStore';
import { SHORTCUT_CATEGORIES } from '@/hooks/useKeyboardShortcuts';

export default function ShortcutsPanel() {
  const { isShortcutsPanelOpen, closeShortcutsPanel } = useAppStore();

  if (!isShortcutsPanelOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="backdrop backdrop--visible"
        onClick={closeShortcutsPanel}
      />

      {/* Panel */}
      <div
        className={clsx(
          'fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
          'w-[600px] max-w-[90vw] max-h-[80vh]',
          'bg-tvp-bg-secondary border border-tvp-border-default rounded-2xl',
          'shadow-elevated z-500',
          'flex flex-col',
          'animate-fade-in'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-tvp-border-subtle">
          <h2 className="text-lg font-bold">Keyboard Shortcuts</h2>
          <button
            onClick={closeShortcutsPanel}
            className="p-2 rounded-lg bg-tvp-bg-tertiary hover:bg-tvp-bg-elevated text-tvp-text-secondary transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-2 gap-6">
            {Object.entries(SHORTCUT_CATEGORIES).map(([key, category]) => (
              <div key={key} className="space-y-3">
                {/* Category Title */}
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <span>{category.icon}</span>
                  <span>{category.title}</span>
                </div>

                {/* Shortcuts List */}
                <div className="space-y-2">
                  {category.shortcuts.map((shortcut, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between py-1.5"
                    >
                      <span className="text-sm text-tvp-text-secondary">
                        {shortcut.description}
                      </span>
                      <div className="flex items-center gap-1">
                        {shortcut.key.split(' ').map((k, i) => (
                          <span key={i}>
                            {i > 0 && (
                              <span className="text-tvp-text-muted mx-1">+</span>
                            )}
                            <kbd
                              className={clsx(
                                'inline-flex items-center justify-center',
                                'min-w-[24px] h-6 px-2',
                                'bg-tvp-bg-tertiary border border-tvp-border-default rounded',
                                'text-xs font-mono font-medium',
                                k.length === 1
                                  ? 'text-tvp-accent-cyan'
                                  : 'text-tvp-text-muted'
                              )}
                            >
                              {k}
                            </kbd>
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-tvp-border-subtle">
          <p className="text-sm text-tvp-text-muted text-center">
            Press <kbd className="kbd mx-1">?</kbd> anytime to toggle this panel
          </p>
        </div>
      </div>
    </>
  );
}

// Shortcut Feedback Indicator
export function ShortcutFeedback() {
  const { shortcutFeedback } = useAppStore();

  if (!shortcutFeedback) return null;

  return (
    <div className="shortcut-feedback">
      <div className="shortcut-feedback-key">{shortcutFeedback.key}</div>
      <div className="shortcut-feedback-action">{shortcutFeedback.action}</div>
    </div>
  );
}

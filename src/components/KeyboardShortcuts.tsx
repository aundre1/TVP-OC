// ============================================
// THE VIDEO POOL - KEYBOARD SHORTCUTS
// ============================================

import { useEffect, useState } from 'react';
import { X, Command, Search, Home, Download, Library, Settings, Play } from 'lucide-react';

interface ShortcutGroup {
  title: string;
  shortcuts: {
    keys: string[];
    description: string;
    icon?: React.ReactNode;
  }[];
}

const shortcutGroups: ShortcutGroup[] = [
  {
    title: 'Navigation',
    shortcuts: [
      { keys: ['G', 'H'], description: 'Go to Home', icon: <Home className="w-4 h-4" /> },
      { keys: ['G', 'S'], description: 'Go to Search', icon: <Search className="w-4 h-4" /> },
      { keys: ['G', 'L'], description: 'Go to Library', icon: <Library className="w-4 h-4" /> },
      { keys: ['G', 'D'], description: 'Go to Downloads', icon: <Download className="w-4 h-4" /> },
      { keys: ['G', 'T'], description: 'Go to Settings', icon: <Settings className="w-4 h-4" /> },
    ],
  },
  {
    title: 'Playback',
    shortcuts: [
      { keys: ['Space'], description: 'Play / Pause preview', icon: <Play className="w-4 h-4" /> },
      { keys: ['Esc'], description: 'Close modal / panel' },
      { keys: ['←', '→'], description: 'Seek preview (5 seconds)' },
      { keys: ['M'], description: 'Mute / Unmute' },
    ],
  },
  {
    title: 'Actions',
    shortcuts: [
      { keys: ['/', 'Ctrl', 'K'], description: 'Focus search' },
      { keys: ['D'], description: 'Download selected video' },
      { keys: ['F'], description: 'Add to favorites' },
      { keys: ['A'], description: 'Add to crate' },
      { keys: ['?'], description: 'Show keyboard shortcuts' },
    ],
  },
];

export default function KeyboardShortcuts() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Show shortcuts modal with '?'
      if (e.key === '?' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        setIsOpen(true);
      }
      // Close with Escape
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => setIsOpen(false)}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl bg-tvp-bg-secondary border border-tvp-border-default rounded-2xl shadow-elevated animate-slide-up overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-tvp-border-subtle">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-tvp-accent-cyan/10 rounded-lg">
              <Command className="w-5 h-5 text-tvp-accent-cyan" />
            </div>
            <h2 className="text-lg font-semibold text-tvp-text-primary">Keyboard Shortcuts</h2>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 text-tvp-text-muted hover:text-tvp-text-primary hover:bg-tvp-bg-tertiary rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {shortcutGroups.map((group) => (
              <div key={group.title}>
                <h3 className="text-sm font-semibold text-tvp-accent-cyan mb-3">{group.title}</h3>
                <div className="space-y-2">
                  {group.shortcuts.map((shortcut, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-tvp-bg-tertiary transition-colors"
                    >
                      <div className="flex items-center gap-2 text-tvp-text-secondary text-sm">
                        {shortcut.icon}
                        <span>{shortcut.description}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {shortcut.keys.map((key, keyIdx) => (
                          <span key={keyIdx}>
                            {keyIdx > 0 && <span className="text-tvp-text-muted mx-1">+</span>}
                            <kbd className="kbd">{key}</kbd>
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
        <div className="p-4 border-t border-tvp-border-subtle bg-tvp-bg-tertiary/50">
          <p className="text-xs text-tvp-text-muted text-center">
            Press <kbd className="kbd">?</kbd> anywhere to toggle this dialog
          </p>
        </div>
      </div>
    </div>
  );
}

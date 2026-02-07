// ============================================
// THE VIDEO POOL - QUICK ACTIONS TOOLBAR
// ============================================

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Home,
  Library,
  Download,
  Sparkles,
  Command,
  X,
  ArrowUp,
} from 'lucide-react';
import { useUIStore } from '@/stores/uiStore';

interface QuickAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  shortcut?: string;
  action: () => void;
}

export default function QuickActions() {
  const navigate = useNavigate();
  const { openSidePanel } = useUIStore();
  const [isExpanded, setIsExpanded] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Track scroll position for scroll-to-top button
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const actions: QuickAction[] = [
    {
      id: 'search',
      label: 'Search',
      icon: <Search className="w-5 h-5" />,
      shortcut: '/',
      action: () => {
        navigate('/search');
        setIsExpanded(false);
      },
    },
    {
      id: 'home',
      label: 'Home',
      icon: <Home className="w-5 h-5" />,
      shortcut: 'G H',
      action: () => {
        navigate('/');
        setIsExpanded(false);
      },
    },
    {
      id: 'library',
      label: 'Library',
      icon: <Library className="w-5 h-5" />,
      shortcut: 'G L',
      action: () => {
        navigate('/library');
        setIsExpanded(false);
      },
    },
    {
      id: 'downloads',
      label: 'Downloads',
      icon: <Download className="w-5 h-5" />,
      shortcut: 'G D',
      action: () => {
        navigate('/downloads');
        setIsExpanded(false);
      },
    },
    {
      id: 'weekly-pack',
      label: 'Weekly Pack',
      icon: <Sparkles className="w-5 h-5" />,
      action: () => {
        openSidePanel('weeklyPack', {});
        setIsExpanded(false);
      },
    },
  ];

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + K to open quick actions
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsExpanded((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      {/* Quick Actions Bar */}
      <div
        className={`fixed left-1/2 -translate-x-1/2 z-40 transition-all duration-300 ${
          isExpanded ? 'bottom-6' : 'bottom-4'
        }`}
      >
        {/* Expanded Actions */}
        {isExpanded && (
          <div className="mb-3 flex items-center gap-2 px-2 py-2 quick-action-bar rounded-2xl animate-slide-up">
            {actions.map((action) => (
              <button
                key={action.id}
                onClick={action.action}
                className="flex flex-col items-center gap-1 px-4 py-2 rounded-xl hover:bg-tvp-bg-elevated transition-colors group"
                title={action.shortcut ? `${action.label} (${action.shortcut})` : action.label}
              >
                <span className="text-tvp-text-secondary group-hover:text-tvp-accent-cyan transition-colors">
                  {action.icon}
                </span>
                <span className="text-xs text-tvp-text-muted group-hover:text-tvp-text-secondary">
                  {action.label}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Toggle Button */}
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => setIsExpanded((prev) => !prev)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-full transition-all duration-200 ${
              isExpanded
                ? 'bg-tvp-accent-cyan text-tvp-bg-primary'
                : 'bg-tvp-bg-elevated/90 backdrop-blur-sm text-tvp-text-secondary hover:text-tvp-text-primary border border-tvp-border-default hover:border-tvp-accent-cyan'
            }`}
          >
            {isExpanded ? (
              <>
                <X className="w-4 h-4" />
                <span className="text-sm font-medium">Close</span>
              </>
            ) : (
              <>
                <Command className="w-4 h-4" />
                <span className="text-sm font-medium">Quick Actions</span>
                <kbd className="kbd text-[10px] ml-1">⌘K</kbd>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Scroll to Top Button */}
      {showScrollTop && !isExpanded && (
        <button
          onClick={scrollToTop}
          className="fixed right-6 bottom-24 z-40 p-3 bg-tvp-bg-elevated/90 backdrop-blur-sm border border-tvp-border-default rounded-full text-tvp-text-secondary hover:text-tvp-accent-cyan hover:border-tvp-accent-cyan transition-all duration-200 animate-fade-in"
          title="Scroll to top"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}
    </>
  );
}

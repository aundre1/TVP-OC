// ============================================
// THE VIDEO POOL - SIDE PANEL COMPONENT
// ============================================

import { useEffect } from 'react';
import { X, ChevronLeft } from 'lucide-react';
import { useUIStore } from '@/stores/uiStore';
import VideoCard from './VideoCard';

export default function SidePanel() {
  const { activeSidePanel, sidePanelData, closeSidePanel } = useUIStore();

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeSidePanel();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [closeSidePanel]);

  if (!activeSidePanel) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm animate-fade-in"
        onClick={closeSidePanel}
      />

      {/* Panel */}
      <div className="fixed top-0 right-0 z-[101] w-full max-w-xl h-full bg-tvp-bg-secondary border-l border-tvp-border-subtle shadow-elevated animate-slide-in">
        {/* Header */}
        <div className="flex items-center gap-4 px-6 h-16 border-b border-tvp-border-subtle">
          <button
            onClick={closeSidePanel}
            className="p-2 -ml-2 text-tvp-text-secondary hover:text-tvp-text-primary hover:bg-tvp-bg-tertiary rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h2 className="text-lg font-semibold text-tvp-text-primary flex-1">
            {activeSidePanel === 'seeAll' && sidePanelData?.title}
            {activeSidePanel === 'library' && 'My Library'}
            {activeSidePanel === 'notifications' && 'Notifications'}
            {activeSidePanel === 'settings' && 'Settings'}
          </h2>
          <button
            onClick={closeSidePanel}
            className="p-2 text-tvp-text-secondary hover:text-tvp-text-primary hover:bg-tvp-bg-tertiary rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="h-[calc(100%-4rem)] overflow-y-auto p-6">
          {/* See All Panel */}
          {activeSidePanel === 'seeAll' && sidePanelData?.videos && (
            <div className="grid grid-cols-2 gap-4">
              {sidePanelData.videos.map((video: any) => (
                <VideoCard key={video.id} video={video} size="md" />
              ))}
            </div>
          )}

          {/* Library Panel */}
          {activeSidePanel === 'library' && (
            <div className="text-tvp-text-secondary">
              <p>Library content here...</p>
            </div>
          )}

          {/* Notifications Panel */}
          {activeSidePanel === 'notifications' && (
            <div className="text-tvp-text-secondary">
              <p>Notifications content here...</p>
            </div>
          )}

          {/* Settings Panel */}
          {activeSidePanel === 'settings' && (
            <div className="text-tvp-text-secondary">
              <p>Settings content here...</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

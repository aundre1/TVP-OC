/**
 * Panel Container Component
 * Manages all breakout panels: Preview, Details, Download, Library, Admin
 * Slides in from right side
 * Integrates with panelStore for state management
 */

import React, { useEffect, useCallback } from 'react';
import { X } from 'lucide-react';
import { usePanelStore } from '@/stores/panelStore';
import { PreviewPanel } from './PreviewPanel';
import { DetailsPanel } from './DetailsPanel';
import { DownloadPanel } from './DownloadPanel';
import { LibraryPanel } from './LibraryPanel';
import { AdminPanel } from './AdminPanel';

/** Loading skeleton displayed while panel data is resolving */
const PanelSkeleton: React.FC = () => (
  <div className="space-y-4 animate-pulse">
    {/* Album art skeleton */}
    <div className="aspect-square rounded-lg bg-gray-700" />
    {/* Text lines skeleton */}
    <div className="space-y-2">
      <div className="h-3 bg-gray-700 rounded w-1/3" />
      <div className="h-5 bg-gray-700 rounded w-3/4" />
      <div className="h-3 bg-gray-700 rounded w-1/2" />
    </div>
    {/* Button skeleton */}
    <div className="h-12 bg-gray-700 rounded-lg" />
    {/* Grid skeleton */}
    <div className="grid grid-cols-2 gap-2">
      <div className="h-16 bg-gray-700 rounded" />
      <div className="h-16 bg-gray-700 rounded" />
    </div>
  </div>
);

export const PanelContainer: React.FC = () => {
  // Pull all state from panelStore
  const activePanel = usePanelStore((state) => state.activePanel);
  const panelData = usePanelStore((state) => state.panelData);
  const isAnimating = usePanelStore((state) => state.isAnimating);
  const closePanel = usePanelStore((state) => state.closePanel);

  // Close on Escape key
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closePanel();
      }
    },
    [closePanel]
  );

  useEffect(() => {
    if (activePanel) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [activePanel, handleKeyDown]);

  // Lock body scroll when panel is open
  useEffect(() => {
    if (activePanel) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [activePanel]);

  // Don't render anything when panel is fully closed and not animating
  if (!activePanel && !isAnimating) {
    return null;
  }

  /** Render the appropriate panel based on activePanel type */
  const renderPanel = () => {
    // Show loading skeleton if panel is open but data has not yet resolved
    if (!panelData) {
      return <PanelSkeleton />;
    }

    switch (activePanel) {
      case 'preview':
        return <PreviewPanel video={panelData} />;
      case 'details':
        return <DetailsPanel video={panelData} />;
      case 'download':
        return <DownloadPanel video={panelData} onClose={closePanel} />;
      case 'library':
        return <LibraryPanel video={panelData} />;
      case 'admin':
        return <AdminPanel video={panelData} onClose={closePanel} />;
      default:
        return null;
    }
  };

  /** Panel title derived from activePanel type */
  const panelTitle = () => {
    switch (activePanel) {
      case 'preview':
        return 'Preview';
      case 'details':
        return 'Details';
      case 'download':
        return 'Download';
      case 'library':
        return 'Library';
      case 'admin':
        return 'Admin Edit';
      default:
        return '';
    }
  };

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/40 z-40 transition-opacity duration-300 ${
          activePanel && !isAnimating ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={closePanel}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        className={`fixed right-0 top-0 h-full w-full sm:w-96 bg-gray-800 border-l border-gray-700 z-50 overflow-y-auto transition-transform duration-300 ease-in-out ${
          activePanel && !isAnimating ? 'translate-x-0' : 'translate-x-full'
        }`}
        role="dialog"
        aria-modal="true"
        aria-label={`${panelTitle()} panel`}
      >
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between p-4 border-b border-gray-700 bg-gray-800 z-10">
          <h2 className="text-lg font-bold text-white">{panelTitle()}</h2>
          <button
            onClick={closePanel}
            className="p-1 hover:bg-gray-700 rounded transition-colors text-gray-400 hover:text-white"
            title="Close panel"
            aria-label="Close panel"
          >
            <X size={20} />
          </button>
        </div>

        {/* Panel Content */}
        <div className="p-4">{renderPanel()}</div>
      </div>
    </>
  );
};

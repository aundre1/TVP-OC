/**
 * Panel Container Component
 * Manages all breakout panels: Preview, Details, Download, Library, Admin
 * Slides in from right side
 */

import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { PanelType, Video } from '@/types/browse';
import { PreviewPanel } from './PreviewPanel';
import { DetailsPanel } from './DetailsPanel';
import { DownloadPanel } from './DownloadPanel';
import { LibraryPanel } from './LibraryPanel';
import { AdminPanel } from './AdminPanel';

interface PanelContainerProps {
  activePanel: PanelType;
  panelData: Video | null;
  onClose: () => void;
}

export const PanelContainer: React.FC<PanelContainerProps> = ({
  activePanel,
  panelData,
  onClose,
}) => {
  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (activePanel) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [activePanel, onClose]);

  if (!activePanel || !panelData) {
    return null;
  }

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/40 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={`fixed right-0 top-0 h-full w-full sm:w-96 bg-gray-800 border-l border-gray-700 z-50 overflow-y-auto transition-transform duration-300 ${
          activePanel ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between p-4 border-b border-gray-700 bg-gray-800">
          <h2 className="text-lg font-bold capitalize text-white">{activePanel}</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-700 rounded transition-colors"
            title="Close panel"
          >
            <X size={20} />
          </button>
        </div>

        {/* Panel Content */}
        <div className="p-4">
          {activePanel === 'preview' && <PreviewPanel video={panelData} />}
          {activePanel === 'details' && <DetailsPanel video={panelData} />}
          {activePanel === 'download' && <DownloadPanel video={panelData} onClose={onClose} />}
          {activePanel === 'library' && <LibraryPanel video={panelData} />}
          {activePanel === 'admin' && <AdminPanel video={panelData} />}
        </div>
      </div>
    </>
  );
};

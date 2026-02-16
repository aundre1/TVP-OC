/**
 * View Toggle Component
 * Switch between table, grid, and tile views
 */

import React from 'react';
import { LayoutGrid, LayoutList, Layers } from 'lucide-react';
import { ViewMode } from '@/types/browse';

interface ViewToggleProps {
  currentView: ViewMode;
  onViewChange: (mode: ViewMode) => void;
}

export const ViewToggle: React.FC<ViewToggleProps> = ({ currentView, onViewChange }) => {
  const views: Array<{ mode: ViewMode; label: string; icon: React.ReactNode }> = [
    { mode: 'table', label: 'Table', icon: <LayoutList size={20} /> },
    { mode: 'grid', label: 'Grid', icon: <LayoutGrid size={20} /> },
    { mode: 'tile', label: 'Tile', icon: <Layers size={20} /> },
  ];

  return (
    <div className="flex gap-2">
      {views.map(({ mode, label, icon }) => (
        <button
          key={mode}
          onClick={() => onViewChange(mode)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
            currentView === mode
              ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/50'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
          title={`Switch to ${label} view`}
        >
          {icon}
          <span className="text-sm font-medium">{label}</span>
        </button>
      ))}
    </div>
  );
};

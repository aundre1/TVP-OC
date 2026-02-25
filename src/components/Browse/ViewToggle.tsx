/**
 * View Toggle Component
 * Switch between table, grid, and tile views
 * Used across all discovery pages (Browse, Search, Library, etc.)
 */

import React from 'react';
import { LayoutGrid, LayoutList } from 'lucide-react';
import { ViewMode } from '@/types/browse';

interface ViewToggleProps {
  currentView: ViewMode;
  onViewChange: (mode: ViewMode) => void;
  compact?: boolean;
}

export const ViewToggle: React.FC<ViewToggleProps> = ({ currentView, onViewChange, compact = false }) => {
  const views: Array<{ mode: ViewMode; label: string; icon: React.ReactNode }> = [
    { mode: 'table', label: 'List', icon: <LayoutList size={compact ? 16 : 18} /> },
    { mode: 'grid', label: 'Grid', icon: <LayoutGrid size={compact ? 16 : 18} /> },
  ];

  return (
    <div className="flex gap-1 bg-tvp-bg-tertiary rounded-lg p-1">
      {views.map(({ mode, label, icon }) => (
        <button
          key={mode}
          onClick={() => onViewChange(mode)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all text-xs font-medium ${
            currentView === mode
              ? 'bg-tvp-accent-cyan text-tvp-bg-primary shadow-sm'
              : 'text-tvp-text-muted hover:text-tvp-text-primary hover:bg-tvp-bg-elevated'
          }`}
          title={`Switch to ${label} view`}
        >
          {icon}
          {!compact && <span>{label}</span>}
        </button>
      ))}
    </div>
  );
};

// ============================================
// THE VIDEO POOL - TOOLBAR v5.5
// View toggle, batch actions, recent downloads button, filters
// ============================================

import { LayoutGrid, List, Clock, Download, Trash2, Plus, ChevronDown, Filter } from 'lucide-react';
import { clsx } from 'clsx';
import { useAppStore } from '@/stores/appStore';

export default function Toolbar() {
  const {
    viewMode,
    setViewMode,
    selectedTrackIds,
    clearSelection,
    toggleRecentPanel,
    isRecentPanelOpen,
    addToSet,
    showToast,
    openBatchDownloadModal,
  } = useAppStore();

  const selectedCount = selectedTrackIds.size;
  const hasSelection = selectedCount > 0;

  const handleBatchDownload = () => {
    openBatchDownloadModal();
  };

  const handleBatchAddToSet = () => {
    showToast('success', `Added ${selectedCount} tracks to set`);
    clearSelection();
  };

  return (
    <div className="flex items-center gap-4 px-6 py-3 bg-tvp-bg-primary border-b border-tvp-border-subtle flex-wrap">
      {/* View Toggle */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-tvp-text-muted uppercase tracking-wider">View</span>
        <div className="flex bg-tvp-bg-tertiary rounded-lg p-1">
          <button
            onClick={() => setViewMode('grid')}
            className={clsx(
              'flex items-center justify-center w-9 h-8 rounded-md',
              'transition-all duration-fast',
              viewMode === 'grid'
                ? 'bg-tvp-accent-cyan text-black'
                : 'text-tvp-text-muted hover:text-tvp-text-primary'
            )}
            title="Grid view"
          >
            <LayoutGrid className="w-[18px] h-[18px]" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={clsx(
              'flex items-center justify-center w-9 h-8 rounded-md',
              'transition-all duration-fast',
              viewMode === 'list'
                ? 'bg-tvp-accent-cyan text-black'
                : 'text-tvp-text-muted hover:text-tvp-text-primary'
            )}
            title="Tile view"
          >
            <List className="w-[18px] h-[18px]" />
          </button>
        </div>
      </div>

      {/* Batch Actions Bar (visible when tracks selected) */}
      {hasSelection && (
        <div
          className={clsx(
            'flex items-center gap-3 px-4 py-2.5',
            'bg-tvp-accent-cyan-subtle border border-tvp-accent-cyan rounded-[10px]',
            'animate-slide-up'
          )}
        >
          <span className="text-sm font-semibold text-tvp-accent-cyan">
            {selectedCount} selected
          </span>

          <div className="flex gap-2">
            <button
              onClick={handleBatchDownload}
              className={clsx(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-md',
                'bg-tvp-accent-cyan text-black text-xs font-medium',
                'hover:bg-tvp-accent-cyan-hover transition-colors'
              )}
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </button>

            <button
              onClick={handleBatchAddToSet}
              className={clsx(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-md',
                'bg-tvp-bg-secondary text-tvp-text-primary text-xs font-medium',
                'border border-tvp-border-default',
                'hover:border-tvp-accent-cyan transition-colors'
              )}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add to Set</span>
            </button>

            <button
              onClick={clearSelection}
              className={clsx(
                'flex items-center justify-center w-8 h-8 rounded-md',
                'text-tvp-text-muted hover:text-tvp-status-error',
                'hover:bg-tvp-bg-secondary transition-colors'
              )}
              title="Clear selection"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Recent Downloads Button */}
      <button
        onClick={toggleRecentPanel}
        className={clsx(
          'flex items-center gap-2 px-3.5 py-2 rounded-lg',
          'bg-tvp-bg-tertiary border border-tvp-border-subtle',
          'text-tvp-text-secondary text-[13px]',
          'transition-all duration-fast',
          'hover:border-tvp-accent-cyan hover:text-tvp-text-primary',
          isRecentPanelOpen && 'bg-tvp-accent-cyan-subtle border-tvp-accent-cyan text-tvp-accent-cyan'
        )}
      >
        <Clock className="w-4 h-4" />
        <span>Recent Downloads</span>
        <span className="px-1.5 py-0.5 bg-tvp-accent-purple text-white text-[10px] font-bold rounded-full">
          15
        </span>
      </button>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Filter Dropdowns */}
      <div className="flex items-center gap-2">
        {/* Sort Filter */}
        <div className="relative group">
          <button
            className={clsx(
              'flex items-center gap-1.5 px-3.5 py-2 rounded-lg',
              'bg-tvp-bg-tertiary border border-tvp-border-subtle',
              'text-tvp-text-secondary text-[13px]',
              'transition-all duration-fast',
              'hover:border-tvp-accent-cyan hover:text-tvp-text-primary'
            )}
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Sort: Newest</span>
            <ChevronDown className="w-3.5 h-3.5" />
          </button>

          {/* Dropdown Menu */}
          <div
            className={clsx(
              'absolute top-full left-0 mt-1 min-w-[200px] p-2',
              'bg-tvp-bg-secondary border border-tvp-border-default rounded-[10px]',
              'shadow-elevated z-50',
              'hidden group-hover:block'
            )}
          >
            {['Newest', 'Popular', 'Title A-Z', 'Artist A-Z', 'BPM', 'Duration'].map((option) => (
              <button
                key={option}
                className={clsx(
                  'w-full px-3 py-2 rounded-md text-left text-[13px]',
                  'text-tvp-text-secondary',
                  'hover:bg-tvp-accent-cyan-subtle hover:text-tvp-text-primary',
                  option === 'Newest' && 'bg-tvp-accent-cyan-subtle text-tvp-accent-cyan'
                )}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        {/* Quality Filter */}
        <div className="relative group">
          <button
            className={clsx(
              'flex items-center gap-1.5 px-3.5 py-2 rounded-lg',
              'bg-tvp-bg-tertiary border border-tvp-border-subtle',
              'text-tvp-text-secondary text-[13px]',
              'transition-all duration-fast',
              'hover:border-tvp-accent-cyan hover:text-tvp-text-primary'
            )}
          >
            <span>Quality: All</span>
            <ChevronDown className="w-3.5 h-3.5" />
          </button>

          {/* Dropdown Menu */}
          <div
            className={clsx(
              'absolute top-full right-0 mt-1 min-w-[180px] p-2',
              'bg-tvp-bg-secondary border border-tvp-border-default rounded-[10px]',
              'shadow-elevated z-50',
              'hidden group-hover:block'
            )}
          >
            {[
              { label: 'All Qualities', value: 'all' },
              { label: '4K', value: '4K', className: 'quality-4k' },
              { label: '1080p', value: '1080p', className: 'quality-1080p' },
              { label: '720p', value: '720p', className: 'quality-720p' },
              { label: '480p', value: '480p', className: 'quality-480p' },
            ].map((option) => (
              <button
                key={option.value}
                className={clsx(
                  'w-full flex items-center gap-2 px-3 py-2 rounded-md text-left text-[13px]',
                  'text-tvp-text-secondary',
                  'hover:bg-tvp-accent-cyan-subtle hover:text-tvp-text-primary',
                  option.value === 'all' && 'bg-tvp-accent-cyan-subtle text-tvp-accent-cyan'
                )}
              >
                {option.className && (
                  <span
                    className={clsx(
                      'px-1.5 py-0.5 rounded text-[10px] font-bold',
                      option.className
                    )}
                  >
                    {option.label}
                  </span>
                )}
                {!option.className && option.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

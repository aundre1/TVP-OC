/**
 * Browse Table Component
 * Table view with virtualization for 30,000+ videos
 * Columns: PLAY | PREVIEW | ARTIST | TITLE | LABEL | GENRE | BRACKET | QUALITY | VER | DATE | ACTIONS
 */

import React, { useMemo } from 'react';
import { List } from 'react-window';
import { ArrowUpDown, AlertCircle } from 'lucide-react';
import { VideoRow } from './VideoRow';
import { BrowseTableProps, SortField, Video } from '@/types/browse';
import { useVideoBrowse } from '@/hooks/useVideoBrowse';
import { useBrowseStore } from '@/stores/browseStore';

export const BrowseTable: React.FC<BrowseTableProps> = ({
  onRowClick,
  onPreview,
  onDownload,
  onFavorite,
}) => {
  // Use shared hook for data fetching
  const { videos, isLoading, isError, error, refetch, sortBy, sortOrder } = useVideoBrowse();

  // Get sort action from store
  const setSortBy = useBrowseStore((state) => state.setSortBy);
  // Column definitions
  const columns = [
    { key: 'play', label: '', width: 50, sortable: false },
    { key: 'preview', label: '', width: 65, sortable: false },
    { key: 'artist', label: 'ARTIST', width: 150, sortable: true },
    { key: 'title', label: 'TITLE', width: 200, sortable: true },
    { key: 'label', label: 'LABEL', width: 150, sortable: false },
    { key: 'genre', label: 'GENRE', width: 120, sortable: true },
    { key: 'bracket', label: 'BRACKET', width: 120, sortable: false },
    { key: 'quality', label: 'QUALITY', width: 120, sortable: false },
    { key: 'version', label: 'VER', width: 100, sortable: false },
    { key: 'date', label: 'DATE', width: 120, sortable: true },
    { key: 'actions', label: 'ACTIONS', width: 140, sortable: false },
  ];

  const totalWidth = useMemo(() => columns.reduce((sum, col) => sum + col.width, 0), []);

  const handleColumnSort = (field: SortField) => {
    setSortBy(field);
  };

  // Error state
  if (isError) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-400 text-lg mb-2">Failed to load videos</p>
          <p className="text-gray-500 text-sm mb-4">{error?.message || 'An error occurred'}</p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-md transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
          <p className="text-gray-400 mt-4">Loading videos...</p>
        </div>
      </div>
    );
  }

  // Empty state
  if (videos.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-gray-400 text-lg">No videos found</p>
          <p className="text-gray-500 text-sm mt-2">Try adjusting your filters</p>
        </div>
      </div>
    );
  }

  // Define row props type for react-window v2 (excludes index and style - those are added by List)
  type CustomRowProps = {
    videos: Video[];
    onRowClick: (video: Video) => void;
    onPreview: (video: Video) => void;
    onDownload: (video: Video) => void;
    onFavorite: (video: Video) => void;
  };

  // Virtualized row renderer component
  const RowComponent = ({
    index,
    style,
    videos,
    onRowClick,
    onPreview,
    onDownload,
    onFavorite,
  }: {
    ariaAttributes: {
      'aria-posinset': number;
      'aria-setsize': number;
      role: 'listitem';
    };
    index: number;
    style: React.CSSProperties;
  } & CustomRowProps): React.ReactElement | null => {
    const video = videos[index];
    return (
      <div style={style}>
        <VideoRow
          video={video}
          onClick={onRowClick}
          onPreview={onPreview}
          onDownload={onDownload}
          onFavorite={onFavorite}
        />
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="sticky top-0 bg-tvp-bg-primary border-b border-tvp-border-subtle z-10">
        <table className="w-full" style={{ width: `${totalWidth}px` }}>
          <thead>
            <tr className="text-tvp-text-muted text-[10px] font-semibold uppercase">
              {columns.map((col) => (
                <th
                  key={col.key}
                  style={{ width: `${col.width}px` }}
                  className="px-2 py-2 text-left"
                >
                  {col.label && col.sortable ? (
                    <button
                      onClick={() => handleColumnSort(col.key as SortField)}
                      className="flex items-center gap-1 hover:text-cyan-400 transition-colors"
                    >
                      {col.label}
                      {sortBy === col.key && (
                        <ArrowUpDown
                          size={14}
                          className={sortOrder === 'asc' ? 'rotate-180' : ''}
                        />
                      )}
                    </button>
                  ) : (
                    <span>{col.label}</span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
        </table>
      </div>

      {/* Virtualized Body */}
      <div className="flex-1 overflow-hidden">
        <List<CustomRowProps>
          defaultHeight={window.innerHeight - 300}
          rowComponent={RowComponent}
          rowCount={videos.length}
          rowHeight={42}
          rowProps={{
            videos,
            onRowClick,
            onPreview,
            onDownload,
            onFavorite,
          }}
          overscanCount={10}
        />
      </div>

      {/* Footer Info */}
      <div className="px-4 py-2 border-t border-tvp-border-subtle text-[10px] text-tvp-text-muted bg-tvp-bg-primary">
        Showing {videos.length} video{videos.length !== 1 ? 's' : ''}
      </div>
    </div>
  );
};

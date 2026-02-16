/**
 * Browse Table Component
 * Table view with virtualization for 30,000+ videos
 * Columns: PLAY | PREVIEW | ARTIST | TITLE | LABEL | GENRE | BRACKET | QUALITY | VER | DATE | ACTIONS
 */

import React, { useMemo } from 'react';
import { FixedSizeList as List } from 'react-window';
import { ArrowUpDown } from 'lucide-react';
import { VideoRow } from './VideoRow';
import { BrowseTableProps, SortField } from '@/types/browse';

export const BrowseTable: React.FC<BrowseTableProps> = ({
  videos,
  isLoading,
  sortBy,
  sortOrder,
  onSort,
  onRowClick,
  onPreview,
  onDownload,
  onFavorite,
}) => {
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
    onSort(field);
  };

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

  // Virtualized row renderer
  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
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
      <div className="sticky top-0 bg-gray-900 border-b border-gray-700 z-10">
        <table className="w-full" style={{ width: `${totalWidth}px` }}>
          <thead>
            <tr className="text-gray-400 text-xs font-semibold uppercase">
              {columns.map((col) => (
                <th
                  key={col.key}
                  style={{ width: `${col.width}px` }}
                  className="px-4 py-3 text-left"
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
        <List
          height={window.innerHeight - 300} // Adjust based on header/footer
          itemCount={videos.length}
          itemSize={48} // Row height in pixels
          width="100%"
        >
          {Row}
        </List>
      </div>

      {/* Footer Info */}
      <div className="px-4 py-3 border-t border-gray-700 text-xs text-gray-400 bg-gray-900">
        Showing {videos.length} video{videos.length !== 1 ? 's' : ''}
      </div>
    </div>
  );
};

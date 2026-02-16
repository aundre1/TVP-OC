/**
 * Browse Page
 * Main browsing interface with table/grid/tile views
 * Orchestrates sidebar, genre filters, view toggle, and breakout panels
 */

import React, { useEffect, useState } from 'react';
import { useBrowseStore } from '@/stores/browseStore';
import { useViewStore } from '@/stores/viewStore';
import { usePanelStore } from '@/stores/panelStore';
import { getGenres } from '@/api/videosApi';

// Components (to be created)
// import { Sidebar } from '@/components/Navigation/Sidebar';
// import { GenreFilter } from '@/components/Navigation/GenreFilter';
// import { ViewToggle } from '@/components/Browse/ViewToggle';
// import { BrowseTable } from '@/components/Browse/BrowseTable';
// import { BrowseGrid } from '@/components/Browse/BrowseGrid';
// import { BrowseTile } from '@/components/Browse/BrowseTile';
// import { PanelContainer } from '@/components/Panels/PanelContainer';

export const BrowsePage: React.FC = () => {
  // State management
  const browseState = useBrowseStore();
  const viewMode = useViewStore((state) => state.viewMode);
  const setViewMode = useViewStore((state) => state.setViewMode);
  const panelState = usePanelStore();

  // Local state
  const [availableGenres, setAvailableGenres] = useState<string[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isLoadingGenres, setIsLoadingGenres] = useState(false);

  // Load genres on mount
  useEffect(() => {
    const loadGenres = async () => {
      setIsLoadingGenres(true);
      try {
        const genres = await getGenres();
        setAvailableGenres(genres);
      } catch (error) {
        console.error('Failed to load genres:', error);
      } finally {
        setIsLoadingGenres(false);
      }
    };

    loadGenres();
  }, []);

  // Load initial videos
  useEffect(() => {
    browseState.fetchVideos();
  }, [browseState]);

  // Handle responsive sidebar
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      {/* TODO: Sidebar Component */}
      {/* <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} /> */}

      <main className="flex-1 overflow-hidden flex flex-col">
        {/* Header Section */}
        <div className="border-b border-gray-700 bg-gray-800 p-4 space-y-4">
          {/* TODO: Genre Filter Component */}
          {/* <GenreFilter
            selectedGenres={Array.from(browseState.selectedGenres)}
            availableGenres={availableGenres}
            onGenreChange={(genres) => browseState.setGenres(genres)}
            isLoading={isLoadingGenres}
          /> */}

          {/* View Toggle and Controls */}
          <div className="flex items-center justify-between">
            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="md:hidden p-2 hover:bg-gray-700 rounded"
            >
              ☰ Menu
            </button>

            {/* TODO: View Toggle Component */}
            {/* <ViewToggle currentView={viewMode} onViewChange={setViewMode} /> */}

            {/* Placeholder */}
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('table')}
                className={`px-4 py-2 rounded ${
                  viewMode === 'table' ? 'bg-cyan-500' : 'bg-gray-700'
                }`}
              >
                Table
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`px-4 py-2 rounded ${
                  viewMode === 'grid' ? 'bg-cyan-500' : 'bg-gray-700'
                }`}
              >
                Grid
              </button>
              <button
                onClick={() => setViewMode('tile')}
                className={`px-4 py-2 rounded ${
                  viewMode === 'tile' ? 'bg-cyan-500' : 'bg-gray-700'
                }`}
              >
                Tile
              </button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto">
          {/* TODO: Render based on view mode
          {viewMode === 'table' && (
            <BrowseTable
              videos={browseState.videos}
              isLoading={browseState.isLoading}
              sortBy={browseState.sortBy}
              sortOrder={browseState.sortOrder}
              onSort={(field) => browseState.setSortBy(field)}
              onRowClick={(video) => panelState.openPanel('details', video)}
              onPreview={(video) => panelState.openPanel('preview', video)}
              onDownload={(video) => panelState.openPanel('download', video)}
              onFavorite={(video) => {
                // TODO: Implement favorite toggle
              }}
            />
          )}

          {viewMode === 'grid' && (
            <BrowseGrid
              videos={browseState.videos}
              isLoading={browseState.isLoading}
              onCardClick={(video) => panelState.openPanel('details', video)}
            />
          )}

          {viewMode === 'tile' && (
            <BrowseTile
              videos={browseState.videos}
              isLoading={browseState.isLoading}
              onTileClick={(video) => panelState.openPanel('details', video)}
            />
          )}
          */}

          {/* Placeholder Content */}
          <div className="p-8">
            <h1 className="text-3xl font-bold mb-4">Browse Videos</h1>
            <p className="text-gray-400">
              View Mode: <span className="text-cyan-400">{viewMode}</span>
            </p>
            <p className="text-gray-400 mt-2">
              Videos Loaded: <span className="text-cyan-400">{browseState.videos.length}</span>
            </p>
            {browseState.isLoading && <p className="text-yellow-400 mt-4">Loading...</p>}
            {browseState.error && (
              <p className="text-red-400 mt-4">Error: {browseState.error}</p>
            )}
          </div>
        </div>
      </main>

      {/* TODO: Panel Container Component */}
      {/* <PanelContainer
        activePanel={panelState.activePanel}
        panelData={panelState.panelData}
        onClose={() => panelState.closePanel()}
      /> */}
    </div>
  );
};

export default BrowsePage;

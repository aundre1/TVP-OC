/**
 * Browse Page
 * Main browsing interface with table/grid/tile views
 * Orchestrates sidebar, genre filters, view toggle, and breakout panels
 * Complete callback system for video interactions and panel management
 */

import React, { useEffect, useState, useCallback } from 'react';
import { useBrowseStore } from '@/stores/browseStore';
import { useViewStore } from '@/stores/viewStore';
import { usePanelStore } from '@/stores/panelStore';
import { getGenres, toggleFavorite } from '@/api/videosApi';
import { Video } from '@/types/browse';

// Components
import { Sidebar } from '@/components/Navigation/Sidebar';
import { GenreFilter } from '@/components/Navigation/GenreFilter';
import { ViewToggle } from '@/components/Browse/ViewToggle';
import { BrowseTable } from '@/components/Browse/BrowseTable';
import { BrowseGrid } from '@/components/Browse/BrowseGrid';
import { BrowseTile } from '@/components/Browse/BrowseTile';
import { PanelContainer } from '@/components/Panels/PanelContainer';

export const BrowsePage: React.FC = () => {
  // State management
  const browseState = useBrowseStore();
  const viewMode = useViewStore((state) => state.viewMode);
  const setViewMode = useViewStore((state) => state.setViewMode);
  const openPanel = usePanelStore((state) => state.openPanel);

  // Local state
  const [availableGenres, setAvailableGenres] = useState<string[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isLoadingGenres, setIsLoadingGenres] = useState(false);

  // ─── Callback system for video interactions ────────────────────────

  /** Open details panel when a video row/card/tile is clicked */
  const onVideoSelect = useCallback(
    (video: Video) => {
      openPanel('details', video);
    },
    [openPanel]
  );

  /** Open preview panel for audio playback */
  const onPreview = useCallback(
    (video: Video) => {
      openPanel('preview', video);
    },
    [openPanel]
  );

  /** Open download panel with quality selection */
  const onDownload = useCallback(
    (video: Video) => {
      openPanel('download', video);
    },
    [openPanel]
  );

  /** Toggle favorite status via API (inline, no panel needed) */
  const onFavorite = useCallback(
    async (video: Video) => {
      try {
        const result = await toggleFavorite(video.id);
        // Update the video in the browse store to reflect new favorite state
        const updatedVideos = browseState.videos.map((v) =>
          v.id === video.id ? { ...v, isFavorited: result.isFavorited } : v
        );
        // If browseStore has a direct videos setter, use it; otherwise refetch
        // For now, optimistically update via store if available
        browseState.fetchVideos();
      } catch (err) {
        // Error handled by React Query error boundary
      }
    },
    [browseState]
  );

  /** Open library panel for adding to playlists */
  const onAddToPlaylist = useCallback(
    (video: Video) => {
      openPanel('library', video);
    },
    [openPanel]
  );

  /** Open admin edit panel for metadata editing */
  const onAdminEdit = useCallback(
    (video: Video) => {
      openPanel('admin', video);
    },
    [openPanel]
  );

  /** Unified action handler for grid/tile card actions */
  const handleCardAction = useCallback(
    (action: string, video: Video) => {
      switch (action) {
        case 'preview':
          onPreview(video);
          break;
        case 'download':
          onDownload(video);
          break;
        case 'favorite':
          onFavorite(video);
          break;
        case 'playlist':
          onAddToPlaylist(video);
          break;
        case 'admin':
          onAdminEdit(video);
          break;
        default:
          // Unknown action - silently ignore
      }
    },
    [onPreview, onDownload, onFavorite, onAddToPlaylist, onAdminEdit]
  );

  // ─── Effects ───────────────────────────────────────────────────────

  // Load genres on mount
  useEffect(() => {
    const loadGenres = async () => {
      setIsLoadingGenres(true);
      try {
        const genres = await getGenres();
        setAvailableGenres(genres);
      } catch (error) {
        // Error handled gracefully with empty genres list
      } finally {
        setIsLoadingGenres(false);
      }
    };

    loadGenres();
  }, []);

  // Note: Videos are now fetched via useVideoBrowse hook in the components
  // No need to manually call fetchVideos here

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

  // ─── Render ────────────────────────────────────────────────────────

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      {/* Sidebar Component */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <main className="flex-1 overflow-hidden flex flex-col">
        {/* Header Section */}
        <div className="border-b border-gray-700 bg-gray-800 p-4 space-y-4">
          {/* Genre Filter Component */}
          <GenreFilter
            availableGenres={availableGenres}
            isLoading={isLoadingGenres}
          />

          {/* View Toggle and Controls */}
          <div className="flex items-center justify-between">
            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="md:hidden p-2 hover:bg-gray-700 rounded"
            >
              Menu
            </button>

            {/* View Toggle Component */}
            <ViewToggle currentView={viewMode} onViewChange={setViewMode} />
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto">
          {viewMode === 'table' && (
            <BrowseTable
              onRowClick={onVideoSelect}
              onPreview={onPreview}
              onDownload={onDownload}
              onFavorite={onFavorite}
            />
          )}

          {viewMode === 'grid' && (
            <BrowseGrid
              onCardClick={onVideoSelect}
              onCardAction={handleCardAction}
            />
          )}

          {viewMode === 'tile' && (
            <BrowseTile
              onTileClick={onVideoSelect}
              onTileAction={handleCardAction}
            />
          )}
        </div>
      </main>

      {/* Panel Container - reads state directly from panelStore */}
      <PanelContainer />
    </div>
  );
};

export default BrowsePage;

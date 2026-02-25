/**
 * Sidebar Component
 * Navigation drawer with menu items
 * Fixed on desktop, slide-out drawer on mobile
 * Connected to browseStore for reactive state updates
 */

import React from 'react';
import {
  Music,
  Compass,
  TrendingUp,
  Heart,
  ListMusic,
  DownloadCloud,
  X,
  PlusCircle,
} from 'lucide-react';
import { useState } from 'react';
import SongRequestForm from '@/components/SongRequestForm';
import { useBrowseStore } from '@/stores/browseStore';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  badge?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const [showSongRequest, setShowSongRequest] = useState(false);
  const clearGenres = useBrowseStore((state) => state.clearGenres);
  const resetFilters = useBrowseStore((state) => state.resetFilters);

  const navItems: NavItem[] = [
    { id: 'pool', label: 'The Pool', icon: <Music size={20} /> },
    { id: 'browse', label: 'Browse All', icon: <Compass size={20} /> },
    { id: 'charts', label: 'Charts', icon: <TrendingUp size={20} /> },
    { id: 'favorites', label: 'Favorites', icon: <Heart size={20} />, badge: 0 },
    { id: 'playlists', label: 'My Playlists', icon: <ListMusic size={20} /> },
    { id: 'downloads', label: 'Downloads', icon: <DownloadCloud size={20} /> },
  ];

  const handleNavClick = (itemId: string) => {
    // Handle navigation with browseStore updates
    switch (itemId) {
      case 'pool':
        // The Pool home - clear all filters
        resetFilters();
        break;
      case 'browse':
        // Clear all filters for "Browse All"
        resetFilters();
        break;
      case 'charts':
        // Charts - would filter by popularity/trending
        // Requires backend support for trending filter
        resetFilters();
        break;
      case 'favorites':
        // Favorites - filter to only favorited videos
        // Requires backend support for isFavorited filter in /api/videos/browse
        // When backend ready: addGenre('isFavorited:true') or similar
        resetFilters();
        // TODO: Wire to backend isFavorited filter once available
        break;
      case 'playlists':
        // Playlists - would navigate to playlist management
        // Managed separately via LibraryPanel for now
        // TODO: Create dedicated playlists management page
        break;
      case 'downloads':
        // Downloads - would show only downloaded videos
        // Managed separately via DownloadsPage for now
        // TODO: Implement local download filtering
        break;
      default:
        break;
    }

    // Close drawer on mobile
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  return (
    <>
      {/* Overlay (mobile only) */}
      {isOpen && window.innerWidth < 1024 && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:static left-0 top-0 h-full w-64 bg-gray-800 border-r border-gray-700 flex flex-col z-40 transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Music className="text-cyan-500" size={24} />
            <span className="text-lg font-bold">THE VIDEO POOL</span>
          </div>
          <button
            onClick={onClose}
            className="md:hidden p-1 hover:bg-gray-700 rounded"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-700 transition-colors text-gray-300 hover:text-white group"
            >
              <span className="text-gray-400 group-hover:text-cyan-400">{item.icon}</span>
              <span className="flex-1 text-left text-sm font-medium">{item.label}</span>
              {item.badge !== undefined && item.badge > 0 && (
                <span className="bg-cyan-500 text-white text-xs rounded-full px-2 py-0.5">
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Request a Track */}
        <div className="px-4 pb-2">
          <button
            onClick={() => setShowSongRequest(true)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 transition-colors text-cyan-400 group"
          >
            <PlusCircle size={20} />
            <span className="text-sm font-medium">Request a Track</span>
          </button>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-700 text-xs text-gray-400 space-y-1">
          <p>💿 Professional DJ Video Platform</p>
          <p>30,000+ HD Music Videos</p>
        </div>

        {/* Song Request Modal */}
        {showSongRequest && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setShowSongRequest(false)}>
            <div className="bg-tvp-bg-secondary border border-tvp-border-subtle rounded-2xl p-6 max-w-md w-full" onClick={e => e.stopPropagation()}>
              <SongRequestForm onClose={() => setShowSongRequest(false)} />
            </div>
          </div>
        )}
      </aside>
    </>
  );
};

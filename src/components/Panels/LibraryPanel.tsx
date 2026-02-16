/**
 * Library Panel
 * Add to favorites, playlists
 */

import React, { useState } from 'react';
import { Heart, Plus, ListMusic } from 'lucide-react';
import { Video } from '@/types/browse';

interface LibraryPanelProps {
  video: Video;
}

export const LibraryPanel: React.FC<LibraryPanelProps> = ({ video }) => {
  const [isFavorited, setIsFavorited] = useState(video.isFavorited || false);
  const [playlists] = useState([
    { id: '1', name: 'Favorites', count: 45 },
    { id: '2', name: 'DJ Mixes', count: 12 },
    { id: '3', name: 'Workout', count: 23 },
    { id: '4', name: 'Study', count: 31 },
  ]);

  const handleToggleFavorite = () => {
    setIsFavorited(!isFavorited);
    // TODO: API call to toggle favorite
  };

  const handleAddToPlaylist = (playlistId: string) => {
    // TODO: API call to add to playlist
    console.log(`Added to playlist ${playlistId}`);
  };

  return (
    <div className="space-y-4">
      {/* Favorite Button */}
      <button
        onClick={handleToggleFavorite}
        className={`w-full flex items-center justify-center gap-2 py-3 rounded-lg font-semibold transition-colors ${
          isFavorited
            ? 'bg-pink-500 text-white hover:bg-pink-600'
            : 'bg-gray-700 text-gray-300 hover:bg-pink-500 hover:text-white'
        }`}
      >
        <Heart size={20} fill={isFavorited ? 'currentColor' : 'none'} />
        {isFavorited ? 'Favorited' : 'Add to Favorites'}
      </button>

      {/* Playlists Section */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <ListMusic size={18} className="text-gray-400" />
          <h3 className="font-semibold text-white">Add to Playlist</h3>
        </div>

        <div className="space-y-2">
          {playlists.map((playlist) => (
            <button
              key={playlist.id}
              onClick={() => handleAddToPlaylist(playlist.id)}
              className="w-full p-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors text-left"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-white text-sm">{playlist.name}</p>
                  <p className="text-xs text-gray-400">{playlist.count} videos</p>
                </div>
                <Plus size={18} className="text-gray-400" />
              </div>
            </button>
          ))}
        </div>

        {/* Create New */}
        <button className="w-full p-3 border-2 border-dashed border-gray-600 hover:border-cyan-500 rounded-lg transition-colors">
          <div className="flex items-center justify-center gap-2 text-gray-400 hover:text-cyan-400">
            <Plus size={18} />
            <span className="text-sm font-medium">Create New Playlist</span>
          </div>
        </button>
      </div>

      {/* Download History */}
      <div className="p-3 bg-gray-900 rounded-lg">
        <p className="text-xs text-gray-400 mb-2">Last Added</p>
        <p className="text-sm text-white font-medium">
          {new Date().toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          })}
        </p>
      </div>
    </div>
  );
};

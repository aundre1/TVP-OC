/**
 * Library Panel
 * Add to favorites and playlists with API integration
 */

import React, { useState } from 'react';
import { Heart, Plus, ListMusic, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Video } from '@/types/browse';
import { toggleFavorite, addToPlaylist } from '@/api/videosApi';

interface LibraryPanelProps {
  video: Video;
}

export const LibraryPanel: React.FC<LibraryPanelProps> = ({ video }) => {
  const [isFavorited, setIsFavorited] = useState(video.isFavorited || false);
  const [isFavoriteLoading, setIsFavoriteLoading] = useState(false);
  const [favoriteError, setFavoriteError] = useState<string | null>(null);
  const [playlistMessage, setPlaylistMessage] = useState<string | null>(null);
  const [playlistError, setPlaylistError] = useState<string | null>(null);
  const [loadingPlaylistId, setLoadingPlaylistId] = useState<string | null>(null);

  const [playlists] = useState([
    { id: '1', name: 'Favorites', count: 45 },
    { id: '2', name: 'DJ Mixes', count: 12 },
    { id: '3', name: 'Workout', count: 23 },
    { id: '4', name: 'Study', count: 31 },
  ]);

  const handleToggleFavorite = async () => {
    setIsFavoriteLoading(true);
    setFavoriteError(null);

    try {
      const result = await toggleFavorite(video.id);
      setIsFavorited(result.isFavorited);
    } catch (err) {
      setFavoriteError('Failed to update favorite status. Please try again.');
      // Revert optimistic update is not needed since we didn't change state yet
    } finally {
      setIsFavoriteLoading(false);
    }
  };

  const handleAddToPlaylist = async (playlistId: string, playlistName: string) => {
    setLoadingPlaylistId(playlistId);
    setPlaylistError(null);
    setPlaylistMessage(null);

    try {
      await addToPlaylist(video.id, playlistId);
      setPlaylistMessage(`Added "${video.title}" to ${playlistName}`);

      // Auto-clear success message after a few seconds
      setTimeout(() => setPlaylistMessage(null), 3000);
    } catch (err) {
      setPlaylistError(`Failed to add to "${playlistName}". Please try again.`);

      // Auto-clear error after a few seconds
      setTimeout(() => setPlaylistError(null), 5000);
    } finally {
      setLoadingPlaylistId(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Favorite Error */}
      {favoriteError && (
        <div className="p-2 bg-red-900/50 border border-red-700 rounded-lg flex gap-2">
          <AlertCircle size={14} className="text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-red-200">{favoriteError}</p>
        </div>
      )}

      {/* Favorite Button */}
      <button
        onClick={handleToggleFavorite}
        disabled={isFavoriteLoading}
        className={`w-full flex items-center justify-center gap-2 py-3 rounded-lg font-semibold transition-colors ${
          isFavorited
            ? 'bg-pink-500 text-white hover:bg-pink-600'
            : 'bg-gray-700 text-gray-300 hover:bg-pink-500 hover:text-white'
        } ${isFavoriteLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
      >
        {isFavoriteLoading ? (
          <Loader2 size={20} className="animate-spin" />
        ) : (
          <Heart size={20} fill={isFavorited ? 'currentColor' : 'none'} />
        )}
        {isFavoriteLoading
          ? 'Updating...'
          : isFavorited
            ? 'Favorited'
            : 'Add to Favorites'}
      </button>

      {/* Playlist Messages */}
      {playlistMessage && (
        <div className="p-2 bg-green-900/50 border border-green-700 rounded-lg flex gap-2">
          <CheckCircle size={14} className="text-green-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-green-200">{playlistMessage}</p>
        </div>
      )}

      {playlistError && (
        <div className="p-2 bg-red-900/50 border border-red-700 rounded-lg flex gap-2">
          <AlertCircle size={14} className="text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-red-200">{playlistError}</p>
        </div>
      )}

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
              onClick={() => handleAddToPlaylist(playlist.id, playlist.name)}
              disabled={loadingPlaylistId === playlist.id}
              className={`w-full p-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors text-left ${
                loadingPlaylistId === playlist.id ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-white text-sm">{playlist.name}</p>
                  <p className="text-xs text-gray-400">{playlist.count} videos</p>
                </div>
                {loadingPlaylistId === playlist.id ? (
                  <Loader2 size={18} className="text-cyan-400 animate-spin" />
                ) : (
                  <Plus size={18} className="text-gray-400" />
                )}
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

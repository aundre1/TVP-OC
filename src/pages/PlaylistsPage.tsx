// ============================================
// PLAYLISTS PAGE - User Playlists & Browse
// ============================================

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { get, post } from '@/api/client';
import { toast } from '@/stores/appStore';

interface Playlist {
  id: string;
  name: string;
  description?: string;
  trackCount: number;
  createdAt: string;
  coverUrl?: string;
}

export default function PlaylistsPage() {
  const { user } = useAuth();
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [newPlaylistDesc, setNewPlaylistDesc] = useState('');
  const [creatingPlaylist, setCreatingPlaylist] = useState(false);

  // Fetch user's playlists
  useEffect(() => {
    let cancelled = false;

    async function fetchPlaylists() {
      setLoading(true);
      try {
        if (!user?.id) return;

        // Try the primary endpoint first
        const response = await get<{ playlists?: Playlist[] }>(`/playlists/${user.id}`).catch(() =>
          // Fallback to user sets endpoint if playlists doesn't work
          get<{ sets?: Playlist[] }>('/user/sets')
        );

        if (cancelled) return;

        const data = (response as any)?.playlists || (response as any)?.sets || [];
        setPlaylists(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to fetch playlists:', err);
        setPlaylists([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchPlaylists();
    return () => { cancelled = true; };
  }, [user?.id]);

  // Create new playlist
  const handleCreatePlaylist = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newPlaylistName.trim()) {
      toast?.('Please enter a playlist name', 'error');
      return;
    }

    setCreatingPlaylist(true);
    try {
      const response = await post<Playlist>('/playlists', {
        name: newPlaylistName,
        description: newPlaylistDesc,
      });

      if (response) {
        setPlaylists([...playlists, response]);
        setNewPlaylistName('');
        setNewPlaylistDesc('');
        setShowCreateModal(false);
        toast?.('Playlist created!', 'success');
      }
    } catch (err) {
      console.error('Failed to create playlist:', err);
      toast?.('Failed to create playlist', 'error');
    } finally {
      setCreatingPlaylist(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-tvp-text-primary mb-2">Playlists</h1>
          <p className="text-tvp-text-muted">
            Create and manage your custom playlists
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-tvp-accent-cyan text-black rounded-lg font-semibold hover:opacity-90 transition"
        >
          + New Playlist
        </button>
      </div>

      {/* Playlists Grid */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="animate-pulse space-y-2">
              <div className="aspect-square bg-tvp-bg-tertiary rounded-lg" />
              <div className="h-4 bg-tvp-bg-tertiary rounded w-3/4" />
              <div className="h-3 bg-tvp-bg-tertiary rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : playlists.length === 0 ? (
        <div className="py-20 text-center">
          <div className="text-5xl mb-4">🎵</div>
          <h2 className="text-2xl font-semibold text-tvp-text-primary mb-2">No playlists yet</h2>
          <p className="text-tvp-text-muted mb-6">Create your first playlist to organize your favorite videos</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-tvp-accent-cyan text-black rounded-lg font-semibold hover:opacity-90 transition"
          >
            Create First Playlist
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {playlists.map((playlist) => (
            <div
              key={playlist.id}
              className="rounded-lg overflow-hidden border border-tvp-border hover:border-tvp-accent-cyan transition cursor-pointer group"
            >
              <div className="aspect-square bg-gradient-to-br from-tvp-accent-cyan/20 to-tvp-bg-tertiary flex items-center justify-center">
                <span className="text-4xl">♫</span>
              </div>
              <div className="p-3">
                <h3 className="font-semibold text-tvp-text-primary truncate group-hover:text-tvp-accent-cyan transition">
                  {playlist.name}
                </h3>
                <p className="text-sm text-tvp-text-muted">
                  {playlist.trackCount || 0} tracks
                </p>
                {playlist.description && (
                  <p className="text-xs text-tvp-text-secondary truncate mt-1">
                    {playlist.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Playlist Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-tvp-bg-secondary rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold text-tvp-text-primary mb-4">Create New Playlist</h2>

            <form onSubmit={handleCreatePlaylist} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-tvp-text-primary mb-2">
                  Playlist Name
                </label>
                <input
                  type="text"
                  value={newPlaylistName}
                  onChange={(e) => setNewPlaylistName(e.target.value)}
                  placeholder="e.g. Summer Vibes"
                  className="w-full px-3 py-2 bg-tvp-bg-tertiary border border-tvp-border rounded-lg text-tvp-text-primary placeholder-tvp-text-muted focus:outline-none focus:ring-2 focus:ring-tvp-accent-cyan"
                  disabled={creatingPlaylist}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-tvp-text-primary mb-2">
                  Description (optional)
                </label>
                <textarea
                  value={newPlaylistDesc}
                  onChange={(e) => setNewPlaylistDesc(e.target.value)}
                  placeholder="Add a description..."
                  rows={3}
                  className="w-full px-3 py-2 bg-tvp-bg-tertiary border border-tvp-border rounded-lg text-tvp-text-primary placeholder-tvp-text-muted focus:outline-none focus:ring-2 focus:ring-tvp-accent-cyan resize-none"
                  disabled={creatingPlaylist}
                />
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setNewPlaylistName('');
                    setNewPlaylistDesc('');
                  }}
                  disabled={creatingPlaylist}
                  className="px-4 py-2 text-tvp-text-secondary hover:text-tvp-text-primary transition disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingPlaylist}
                  className="px-4 py-2 bg-tvp-accent-cyan text-black rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-50"
                >
                  {creatingPlaylist ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

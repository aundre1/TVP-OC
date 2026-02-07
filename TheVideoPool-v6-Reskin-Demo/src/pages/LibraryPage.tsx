// ============================================
// THE VIDEO POOL - LIBRARY PAGE
// ============================================

import { useState } from 'react';
import { Plus, Folder, Heart, Clock, Edit2, Trash2, X } from 'lucide-react';
import { useCrates, useFavorites, useWatchHistory, useCreateCrate, useDeleteCrate, useUpdateCrate } from '@/hooks/useLibrary';
import { useAppStore } from '@/stores/appStore';
import VideoCard from '@/components/VideoCard';

type Tab = 'crates' | 'favorites' | 'history';

interface Crate {
  id: number;
  name: string;
  coverImage?: string;
  videoCount: number;
}

export default function LibraryPage() {
  const [activeTab, setActiveTab] = useState<Tab>('crates');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCrate, setEditingCrate] = useState<Crate | null>(null);
  const [newCrateName, setNewCrateName] = useState('');
  const [editCrateName, setEditCrateName] = useState('');

  const { showToast } = useAppStore();

  const { data: crates, isLoading: loadingCrates } = useCrates();
  const { data: favorites, isLoading: loadingFavorites } = useFavorites();
  const { data: watchHistory, isLoading: loadingHistory } = useWatchHistory();
  const createCrate = useCreateCrate();
  const deleteCrate = useDeleteCrate();
  const updateCrate = useUpdateCrate();

  const handleCreateCrate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newCrateName.trim()) {
      await createCrate.mutateAsync({ name: newCrateName.trim() });
      setNewCrateName('');
      setShowCreateModal(false);
      showToast('success', 'Crate created successfully');
    }
  };

  const handleOpenEditModal = (crate: Crate) => {
    setEditingCrate(crate);
    setEditCrateName(crate.name);
    setShowEditModal(true);
  };

  const handleEditCrate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editCrateName.trim() && editingCrate) {
      try {
        await updateCrate.mutateAsync({
          id: editingCrate.id,
          data: { name: editCrateName.trim() },
        });
        setShowEditModal(false);
        setEditingCrate(null);
        setEditCrateName('');
        showToast('success', 'Crate updated successfully');
      } catch {
        showToast('error', 'Failed to update crate');
      }
    }
  };

  const handleDeleteCrate = async (crateId: number, crateName: string) => {
    if (window.confirm(`Are you sure you want to delete "${crateName}"? This cannot be undone.`)) {
      try {
        await deleteCrate.mutateAsync(crateId);
        showToast('success', 'Crate deleted');
      } catch {
        showToast('error', 'Failed to delete crate');
      }
    }
  };

  const tabs = [
    { id: 'crates', label: 'Crates', icon: Folder, count: crates?.length || 0 },
    { id: 'favorites', label: 'Favorites', icon: Heart, count: favorites?.length || 0 },
    { id: 'history', label: 'Watch History', icon: Clock, count: watchHistory?.history.length || 0 },
  ] as const;

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-semibold text-tvp-text-primary">My Library</h1>
          <p className="text-tvp-text-secondary mt-1">Organize and access your video collection</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-tvp-accent-cyan hover:bg-tvp-accent-cyan-hover text-tvp-bg-primary font-medium rounded-xl transition-colors"
        >
          <Plus className="w-5 h-5" />
          New Crate
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 border-b border-tvp-border-subtle">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 -mb-px border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-tvp-accent-cyan text-tvp-accent-cyan'
                  : 'border-transparent text-tvp-text-secondary hover:text-tvp-text-primary'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
              <span className="px-2 py-0.5 bg-tvp-bg-tertiary rounded-full text-xs">
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Crates Tab */}
      {activeTab === 'crates' && (
        <div>
          {loadingCrates ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-square bg-tvp-bg-tertiary rounded-xl" />
                  <div className="h-4 w-2/3 bg-tvp-bg-tertiary rounded mt-2" />
                </div>
              ))}
            </div>
          ) : crates && crates.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {crates.map((crate) => (
                <div
                  key={crate.id}
                  className="group cursor-pointer"
                >
                  <div className="relative aspect-square bg-tvp-bg-tertiary rounded-xl overflow-hidden border border-tvp-border-subtle group-hover:border-tvp-accent-cyan transition-colors">
                    {crate.coverImage ? (
                      <img
                        src={crate.coverImage}
                        alt={crate.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Folder className="w-12 h-12 text-tvp-text-muted" />
                      </div>
                    )}

                    {/* Hover Actions */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenEditModal(crate);
                        }}
                        className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                        aria-label={`Edit ${crate.name}`}
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteCrate(crate.id, crate.name);
                        }}
                        className="p-2 bg-white/20 hover:bg-tvp-error rounded-lg transition-colors"
                        aria-label={`Delete ${crate.name}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <h3 className="text-sm font-medium text-tvp-text-primary mt-2 truncate">
                    {crate.name}
                  </h3>
                  <p className="text-xs text-tvp-text-muted">
                    {crate.videoCount} videos
                  </p>
                </div>
              ))}

              {/* Add New Crate Card */}
              <button
                onClick={() => setShowCreateModal(true)}
                className="aspect-square bg-tvp-bg-tertiary rounded-xl border-2 border-dashed border-tvp-border-default hover:border-tvp-accent-cyan flex flex-col items-center justify-center gap-2 transition-colors"
              >
                <Plus className="w-8 h-8 text-tvp-text-muted" />
                <span className="text-sm text-tvp-text-muted">New Crate</span>
              </button>
            </div>
          ) : (
            <div className="text-center py-16">
              <Folder className="w-12 h-12 text-tvp-text-muted mx-auto mb-4" />
              <h3 className="text-lg font-medium text-tvp-text-primary mb-2">No crates yet</h3>
              <p className="text-tvp-text-secondary mb-4">
                Create a crate to organize your videos.
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-tvp-accent-cyan hover:bg-tvp-accent-cyan-hover text-tvp-bg-primary font-medium rounded-lg transition-colors"
              >
                Create Your First Crate
              </button>
            </div>
          )}
        </div>
      )}

      {/* Favorites Tab */}
      {activeTab === 'favorites' && (
        <div>
          {loadingFavorites ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-video bg-tvp-bg-tertiary rounded-lg" />
                  <div className="h-4 w-full bg-tvp-bg-tertiary rounded mt-2" />
                </div>
              ))}
            </div>
          ) : favorites && favorites.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {favorites.map((video) => (
                <VideoCard key={video.id} video={video} isFavorite />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <Heart className="w-12 h-12 text-tvp-text-muted mx-auto mb-4" />
              <h3 className="text-lg font-medium text-tvp-text-primary mb-2">No favorites yet</h3>
              <p className="text-tvp-text-secondary">
                Click the heart icon on any video to add it to your favorites.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Watch History Tab */}
      {activeTab === 'history' && (
        <div>
          {loadingHistory ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-video bg-tvp-bg-tertiary rounded-lg" />
                  <div className="h-4 w-full bg-tvp-bg-tertiary rounded mt-2" />
                </div>
              ))}
            </div>
          ) : watchHistory && watchHistory.history.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {watchHistory.history.map((entry) => (
                <VideoCard key={entry.videoId} video={entry.video} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <Clock className="w-12 h-12 text-tvp-text-muted mx-auto mb-4" />
              <h3 className="text-lg font-medium text-tvp-text-primary mb-2">No watch history</h3>
              <p className="text-tvp-text-secondary">
                Videos you watch will appear here.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Create Crate Modal */}
      {showCreateModal && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={() => setShowCreateModal(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="create-crate-title"
        >
          <div
            className="w-full max-w-md bg-tvp-bg-secondary rounded-2xl p-6 animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 id="create-crate-title" className="text-xl font-semibold text-tvp-text-primary">
                Create New Crate
              </h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 rounded-lg hover:bg-tvp-bg-tertiary text-tvp-text-muted hover:text-tvp-text-primary transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateCrate}>
              <input
                type="text"
                value={newCrateName}
                onChange={(e) => setNewCrateName(e.target.value)}
                placeholder="Crate name"
                className="w-full px-4 py-3 bg-tvp-bg-tertiary border border-tvp-border-default rounded-xl text-tvp-text-primary placeholder:text-tvp-text-muted focus:border-tvp-accent-cyan outline-none mb-4"
                autoFocus
              />
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-tvp-text-secondary hover:text-tvp-text-primary transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newCrateName.trim() || createCrate.isPending}
                  className="px-4 py-2 bg-tvp-accent-cyan hover:bg-tvp-accent-cyan-hover text-tvp-bg-primary font-medium rounded-lg transition-colors disabled:opacity-50"
                >
                  {createCrate.isPending ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Crate Modal */}
      {showEditModal && editingCrate && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={() => setShowEditModal(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-crate-title"
        >
          <div
            className="w-full max-w-md bg-tvp-bg-secondary rounded-2xl p-6 animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 id="edit-crate-title" className="text-xl font-semibold text-tvp-text-primary">
                Edit Crate
              </h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-1 rounded-lg hover:bg-tvp-bg-tertiary text-tvp-text-muted hover:text-tvp-text-primary transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleEditCrate}>
              <label className="block text-sm text-tvp-text-secondary mb-2">Crate Name</label>
              <input
                type="text"
                value={editCrateName}
                onChange={(e) => setEditCrateName(e.target.value)}
                placeholder="Crate name"
                className="w-full px-4 py-3 bg-tvp-bg-tertiary border border-tvp-border-default rounded-xl text-tvp-text-primary placeholder:text-tvp-text-muted focus:border-tvp-accent-cyan outline-none mb-4"
                autoFocus
              />

              {/* Crate Info */}
              <div className="flex items-center gap-4 p-4 bg-tvp-bg-tertiary rounded-xl mb-4">
                <div className="w-12 h-12 rounded-lg bg-tvp-bg-elevated flex items-center justify-center">
                  <Folder className="w-6 h-6 text-tvp-text-muted" />
                </div>
                <div>
                  <p className="text-sm text-tvp-text-muted">Videos in crate</p>
                  <p className="text-lg font-semibold text-tvp-text-primary">{editingCrate.videoCount}</p>
                </div>
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-tvp-text-secondary hover:text-tvp-text-primary transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!editCrateName.trim() || editCrateName.trim() === editingCrate.name || updateCrate.isPending}
                  className="px-4 py-2 bg-tvp-accent-cyan hover:bg-tvp-accent-cyan-hover text-tvp-bg-primary font-medium rounded-lg transition-colors disabled:opacity-50"
                >
                  {updateCrate.isPending ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

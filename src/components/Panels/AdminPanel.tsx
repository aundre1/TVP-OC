/**
 * Admin Panel
 * Edit metadata and video management with API integration
 */

import React, { useState } from 'react';
import { Save, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { Video } from '@/types/browse';
import { updateVideo } from '@/api/videosApi';

interface AdminPanelProps {
  video: Video;
  onClose: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ video, onClose }) => {
  const [formData, setFormData] = useState({
    title: video.title,
    artist: video.artist,
    label: video.label,
    genre: video.genre,
    quality: video.quality || '',
  });

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear messages when user edits
    setError(null);
    setSuccessMessage(null);
  };

  /** Check if any field has been modified */
  const hasChanges = (): boolean => {
    return (
      formData.title !== video.title ||
      formData.artist !== video.artist ||
      formData.label !== video.label ||
      formData.genre !== video.genre ||
      formData.quality !== (video.quality || '')
    );
  };

  const handleSave = async () => {
    // Validate required fields
    if (!formData.title.trim() || !formData.artist.trim()) {
      setError('Title and Artist are required fields.');
      return;
    }

    if (!hasChanges()) {
      setError('No changes to save.');
      return;
    }

    setIsSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      await updateVideo(video.id, formData);
      setSuccessMessage('Video metadata saved successfully.');

      // Auto-close panel after a brief delay
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      console.error('Save failed:', err);

      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Failed to save changes. Please try again.';

      setError(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Admin Warning */}
      <div className="p-3 bg-yellow-900/50 border border-yellow-700 rounded-lg flex gap-2">
        <AlertCircle size={16} className="text-yellow-400 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-yellow-200">Admin panel - metadata editing</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-900/50 border border-red-700 rounded-lg flex gap-2">
          <AlertCircle size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-red-200">{error}</p>
        </div>
      )}

      {/* Success Message */}
      {successMessage && (
        <div className="p-3 bg-green-900/50 border border-green-700 rounded-lg flex gap-2">
          <CheckCircle size={16} className="text-green-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-green-200">{successMessage}</p>
        </div>
      )}

      {/* Form Fields */}
      <div className="space-y-3">
        <div>
          <label className="text-xs text-gray-400 block mb-1">
            Title <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => handleChange('title', e.target.value)}
            disabled={isSaving}
            className="w-full px-3 py-2 bg-gray-700 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-50"
          />
        </div>

        <div>
          <label className="text-xs text-gray-400 block mb-1">
            Artist <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={formData.artist}
            onChange={(e) => handleChange('artist', e.target.value)}
            disabled={isSaving}
            className="w-full px-3 py-2 bg-gray-700 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-50"
          />
        </div>

        <div>
          <label className="text-xs text-gray-400 block mb-1">Label</label>
          <input
            type="text"
            value={formData.label}
            onChange={(e) => handleChange('label', e.target.value)}
            disabled={isSaving}
            className="w-full px-3 py-2 bg-gray-700 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-50"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs text-gray-400 block mb-1">Genre</label>
            <input
              type="text"
              value={formData.genre}
              onChange={(e) => handleChange('genre', e.target.value)}
              disabled={isSaving}
              className="w-full px-3 py-2 bg-gray-700 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-50"
            />
          </div>

          <div>
            <label className="text-xs text-gray-400 block mb-1">Quality</label>
            <select
              value={formData.quality}
              onChange={(e) => handleChange('quality', e.target.value)}
              disabled={isSaving}
              className="w-full px-3 py-2 bg-gray-700 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-50"
            >
              <option value="720p">720p</option>
              <option value="1080p">1080p</option>
              <option value="4K">4K</option>
            </select>
          </div>
        </div>
      </div>

      {/* Dirty indicator */}
      {hasChanges() && (
        <p className="text-xs text-cyan-400">You have unsaved changes</p>
      )}

      {/* Save Button */}
      <button
        onClick={handleSave}
        disabled={isSaving || !hasChanges()}
        className="w-full flex items-center justify-center gap-2 py-3 bg-cyan-500 hover:bg-cyan-600 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg text-white font-semibold transition-colors"
      >
        {isSaving ? (
          <Loader2 size={20} className="animate-spin" />
        ) : (
          <Save size={20} />
        )}
        {isSaving ? 'Saving...' : 'Save Changes'}
      </button>
    </div>
  );
};

/**
 * Admin Panel
 * Edit metadata and video management
 * (Minimal implementation - scaffold for admin functions)
 */

import React, { useState } from 'react';
import { Save, AlertCircle } from 'lucide-react';
import { Video } from '@/types/browse';

interface AdminPanelProps {
  video: Video;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ video }) => {
  const [formData, setFormData] = useState({
    title: video.title,
    artist: video.artist,
    label: video.label,
    genre: video.genre,
    quality: video.quality || '',
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // TODO: API call to update video
      console.log('Saving metadata:', formData);
      setTimeout(() => setIsSaving(false), 1000);
    } catch (error) {
      console.error('Save failed:', error);
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

      {/* Form Fields */}
      <div className="space-y-3">
        <div>
          <label className="text-xs text-gray-400 block mb-1">Title</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => handleChange('title', e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
        </div>

        <div>
          <label className="text-xs text-gray-400 block mb-1">Artist</label>
          <input
            type="text"
            value={formData.artist}
            onChange={(e) => handleChange('artist', e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
        </div>

        <div>
          <label className="text-xs text-gray-400 block mb-1">Label</label>
          <input
            type="text"
            value={formData.label}
            onChange={(e) => handleChange('label', e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs text-gray-400 block mb-1">Genre</label>
            <input
              type="text"
              value={formData.genre}
              onChange={(e) => handleChange('genre', e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          <div>
            <label className="text-xs text-gray-400 block mb-1">Quality</label>
            <select
              value={formData.quality}
              onChange={(e) => handleChange('quality', e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <option value="720p">720p</option>
              <option value="1080p">1080p</option>
              <option value="4K">4K</option>
            </select>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        disabled={isSaving}
        className="w-full flex items-center justify-center gap-2 py-3 bg-cyan-500 hover:bg-cyan-600 disabled:bg-gray-600 rounded-lg text-white font-semibold transition-colors"
      >
        <Save size={20} />
        {isSaving ? 'Saving...' : 'Save Changes'}
      </button>
    </div>
  );
};

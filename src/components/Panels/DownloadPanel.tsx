/**
 * Download Panel
 * Quality selection and download with API integration
 */

import React, { useState } from 'react';
import { Download, CheckCircle, AlertCircle } from 'lucide-react';
import { Video } from '@/types/browse';
import { initiateDownload } from '@/api/videosApi';
import { downloadFile } from '@/api/client';

interface DownloadPanelProps {
  video: Video;
  onClose: () => void;
}

interface QualityOption {
  quality: string;
  resolution: string;
  size: string;
  price: string;
}

export const DownloadPanel: React.FC<DownloadPanelProps> = ({ video, onClose }) => {
  const [selectedQuality, setSelectedQuality] = useState<string>('1080p');
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const qualities: QualityOption[] = [
    { quality: '720p', resolution: '720p HD', size: '250MB', price: 'Free' },
    { quality: '1080p', resolution: '1080p Full HD', size: '500MB', price: '$0.99' },
    { quality: '4K', resolution: '4K Ultra HD', size: '1.5GB', price: '$2.99' },
  ];

  const handleDownload = async () => {
    setIsDownloading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      // Call API to initiate download and get a signed download URL
      const response = await initiateDownload(video.id, selectedQuality);

      // Trigger the actual file download using the signed URL
      const filename = `${video.artist} - ${video.title} (${selectedQuality}).mp4`;
      await downloadFile(response.downloadUrl, filename);

      setSuccessMessage(`Download started for "${video.title}" in ${selectedQuality}`);
      setIsDownloading(false);

      // Auto-close panel after a brief delay to show success
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      console.error('Download failed:', err);

      // Provide user-friendly error messages
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Download failed. Please try again.';

      setError(errorMessage);
      setIsDownloading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Video Info */}
      <div>
        <h3 className="font-semibold text-white">{video.title}</h3>
        <p className="text-sm text-gray-400">{video.artist}</p>
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

      {/* Quality Selection */}
      <div className="space-y-2">
        <p className="text-sm font-semibold text-white">Select Quality:</p>
        {qualities.map((opt) => (
          <button
            key={opt.quality}
            onClick={() => setSelectedQuality(opt.quality)}
            disabled={isDownloading}
            className={`w-full p-3 rounded-lg transition-all text-left ${
              selectedQuality === opt.quality
                ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/30'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            } ${isDownloading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">{opt.resolution}</p>
                <p className="text-xs opacity-75">{opt.size}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold">{opt.price}</p>
                {selectedQuality === opt.quality && (
                  <CheckCircle size={20} className="mt-1" />
                )}
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Subscription Info */}
      <div className="p-3 bg-blue-900/50 border border-blue-700 rounded-lg">
        <p className="text-xs text-blue-200">
          Premium members get all qualities included in subscription
        </p>
      </div>

      {/* Download Button */}
      <button
        onClick={handleDownload}
        disabled={isDownloading}
        className="w-full flex items-center justify-center gap-2 py-3 bg-cyan-500 hover:bg-cyan-600 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg text-white font-semibold transition-colors"
      >
        <Download size={20} />
        {isDownloading ? 'Downloading...' : 'Download Now'}
      </button>

      {/* Terms */}
      <p className="text-xs text-gray-400 text-center">
        By downloading, you agree to our terms of service
      </p>
    </div>
  );
};

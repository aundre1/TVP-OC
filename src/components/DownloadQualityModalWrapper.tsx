// ============================================
// THE VIDEO POOL - DOWNLOAD QUALITY MODAL WRAPPER
// Connects the modal to the store and track data
// ============================================

import { useAppStore } from '@/stores/appStore';
import { getAllTracks } from '@/data/tracks';
import { downloadsApi } from '@/api/downloads';
import DownloadQualityModal from './DownloadQualityModal';

export default function DownloadQualityModalWrapper() {
  const {
    isDownloadQualityModalOpen,
    downloadQualityTrackId,
    closeDownloadQualityModal,
    showToast,
  } = useAppStore();

  // Get the track from the store
  const allTracks = getAllTracks();
  const track = downloadQualityTrackId
    ? allTracks.find(t => t.id === downloadQualityTrackId)
    : null;

  // Handle download
  const handleDownload = async (quality: string, version: string) => {
    if (!track) return;

    try {
      const response = await downloadsApi.downloadVideo(track.id, version || quality);
      if (response.signedUrl) {
        const link = document.createElement('a');
        link.href = response.signedUrl;
        link.download = `${track.artist} - ${track.title}.mp4`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (err) {
      console.error('Download failed:', err);
    }

    // Close modal - toast is shown by the modal itself
    closeDownloadQualityModal();
  };

  if (!track || !isDownloadQualityModalOpen) {
    return null;
  }

  return (
    <DownloadQualityModal
      track={track}
      isOpen={isDownloadQualityModalOpen}
      onClose={closeDownloadQualityModal}
      onDownload={handleDownload}
    />
  );
}

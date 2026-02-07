// ============================================
// THE VIDEO POOL - DOWNLOAD QUALITY MODAL WRAPPER
// Connects the modal to the store and track data
// ============================================

import { useAppStore } from '@/stores/appStore';
import { getAllTracks } from '@/data/tracks';
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

    // In production, this would call the API
    // For now, we'll simulate the download
    console.log(`Downloading ${track.title} - ${quality} - ${version}`);

    // TODO: Replace with actual API call
    // const response = await downloadVideo(track.id, quality, version);

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

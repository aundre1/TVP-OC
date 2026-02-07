// ============================================
// THE VIDEO POOL - BATCH DOWNLOAD MODAL WRAPPER
// Connects the modal to the store
// ============================================

import { useAppStore } from '@/stores/appStore';
import BatchDownloadModal from './BatchDownloadModal';

export default function BatchDownloadModalWrapper() {
  const {
    isBatchDownloadModalOpen,
    closeBatchDownloadModal,
    selectedTrackIds,
  } = useAppStore();

  // Convert Set to array
  const trackIds = Array.from(selectedTrackIds);

  if (!isBatchDownloadModalOpen || trackIds.length === 0) {
    return null;
  }

  return (
    <BatchDownloadModal
      isOpen={isBatchDownloadModalOpen}
      onClose={closeBatchDownloadModal}
      trackIds={trackIds}
    />
  );
}

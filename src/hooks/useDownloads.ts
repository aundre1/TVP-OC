// ============================================
// THE VIDEO POOL - DOWNLOADS HOOKS
// ============================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';
import { downloadsApi } from '@/api/downloads';
import { useUIStore } from '@/stores/uiStore';
import { useAppStore } from '@/stores/appStore';
import type { Video, VideoVersion, DownloadQueueItem } from '@/types';

// Check if user can download
export function useCanDownload() {
  return useQuery({
    queryKey: ['can-download'],
    queryFn: () => downloadsApi.canDownload(),
    staleTime: 30 * 1000, // 30 seconds
  });
}

// Get download limits
export function useDownloadLimits() {
  return useQuery({
    queryKey: ['download-limits'],
    queryFn: () => downloadsApi.getDownloadLimits(),
    staleTime: 60 * 1000, // 1 minute
  });
}

// Get download history
export function useDownloadHistory(page: number = 1, limit: number = 20) {
  return useQuery({
    queryKey: ['download-history', page, limit],
    queryFn: () => downloadsApi.getDownloadHistory(page, limit),
    staleTime: 2 * 60 * 1000,
  });
}

// Get recent downloads
export function useRecentDownloads(limit: number = 10) {
  return useQuery({
    queryKey: ['recent-downloads', limit],
    queryFn: () => downloadsApi.getRecentDownloads(limit),
    staleTime: 2 * 60 * 1000,
  });
}

// Download mutation
export function useDownload() {
  const queryClient = useQueryClient();
  const { addToDownloadQueue, updateDownloadProgress } = useUIStore();

  return useMutation({
    mutationFn: async ({
      video,
      version,
      versionType = 'hd',
    }: {
      video: Video;
      version?: VideoVersion;
      versionType?: string;
    }) => {
      // Create queue item
      const queueItem: DownloadQueueItem = {
        id: `${video.id}-${Date.now()}`,
        video,
        version: version || video.versions[0],
        progress: 0,
        status: 'queued',
      };

      // Add to queue
      addToDownloadQueue(queueItem);

      try {
        // Update to downloading
        updateDownloadProgress(queueItem.id, 0, 'downloading');

        // Get signed URL
        const response = await downloadsApi.downloadVideo(video.id, versionType);

        // Simulate download progress (in real app, would use fetch with progress)
        for (let progress = 0; progress <= 100; progress += 10) {
          await new Promise(resolve => setTimeout(resolve, 200));
          updateDownloadProgress(queueItem.id, progress, 'downloading');
        }

        // Trigger actual download
        const link = document.createElement('a');
        link.href = response.signedUrl;
        const ext = versionType === 'audio' ? '.mp3' : '.mp4';
        link.download = `${video.artist} - ${video.title}${ext}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Mark as completed
        updateDownloadProgress(queueItem.id, 100, 'completed');

        return response;
      } catch (error) {
        updateDownloadProgress(queueItem.id, 0, 'failed');
        throw error;
      }
    },
    onSuccess: () => {
      // Invalidate download-related queries
      queryClient.invalidateQueries({ queryKey: ['download-limits'] });
      queryClient.invalidateQueries({ queryKey: ['can-download'] });
      queryClient.invalidateQueries({ queryKey: ['download-history'] });
      queryClient.invalidateQueries({ queryKey: ['recent-downloads'] });
    },
  });
}

// Get credit packs
export function useCreditPacks() {
  return useQuery({
    queryKey: ['credit-packs'],
    queryFn: () => downloadsApi.getCreditPacks(),
    staleTime: 60 * 60 * 1000, // 1 hour
  });
}

// Get bonus credits
export function useBonusCredits() {
  return useQuery({
    queryKey: ['bonus-credits'],
    queryFn: () => downloadsApi.getBonusCredits(),
    staleTime: 60 * 1000,
  });
}

// Purchase credit pack
export function usePurchaseCreditPack() {
  return useMutation({
    mutationFn: (packId: string) => downloadsApi.purchaseCreditPack(packId),
    onSuccess: (data) => {
      // Redirect to Stripe checkout
      window.location.href = data.url;
    },
  });
}

// ============================================
// DOWNLOAD WITH LIMIT ENFORCEMENT
// Combines limit checking with download action
// ============================================

export function useDownloadWithLimitCheck() {
  const { data: canDownloadData, isLoading: isCheckingLimit } = useCanDownload();
  const { data: limits, isLoading: isLoadingLimits } = useDownloadLimits();
  const download = useDownload();
  const { openDownloadLimitModal, showToast } = useAppStore();

  // Computed values for UI
  const canDownload = useMemo(() => {
    if (isCheckingLimit || !canDownloadData) return true; // Optimistic default
    return canDownloadData.canDownload;
  }, [canDownloadData, isCheckingLimit]);

  const downloadsRemaining = useMemo(() => {
    if (!limits) return null;
    if (limits.limit === 'unlimited') return 'unlimited';
    return typeof limits.limit === 'number' ? limits.limit - limits.used : 0;
  }, [limits]);

  const isNearLimit = useMemo(() => {
    if (!limits || limits.limit === 'unlimited') return false;
    const remaining = typeof limits.limit === 'number' ? limits.limit - limits.used : 0;
    const percentUsed = typeof limits.limit === 'number' ? (limits.used / limits.limit) * 100 : 0;
    return remaining <= 5 || percentUsed >= 80;
  }, [limits]);

  const isAtLimit = useMemo(() => {
    if (!limits || limits.limit === 'unlimited') return false;
    const remaining = typeof limits.limit === 'number' ? limits.limit - limits.used : 0;
    return remaining <= 0;
  }, [limits]);

  // Check and download function
  const checkAndDownload = useCallback(
    async ({
      video,
      version,
      versionType = 'hd',
    }: {
      video: Video;
      version?: VideoVersion;
      versionType?: string;
    }) => {
      // Check if user can download
      if (!canDownload || isAtLimit) {
        openDownloadLimitModal();
        return { success: false, reason: 'limit_reached' };
      }

      // Proceed with download
      try {
        await download.mutateAsync({ video, version, versionType });
        return { success: true };
      } catch (error) {
        // Check if error is due to limit (in case of race condition)
        const errorMessage = error instanceof Error ? error.message : 'Download failed';
        if (errorMessage.includes('limit') || errorMessage.includes('quota')) {
          openDownloadLimitModal();
          return { success: false, reason: 'limit_reached' };
        }
        showToast('error', `Download failed: ${errorMessage}`);
        return { success: false, reason: 'error', error };
      }
    },
    [canDownload, isAtLimit, download, openDownloadLimitModal, showToast]
  );

  return {
    // Download action
    checkAndDownload,
    download: download.mutate,
    downloadAsync: download.mutateAsync,
    isDownloading: download.isPending,

    // Limit info
    canDownload,
    downloadsRemaining,
    isNearLimit,
    isAtLimit,
    limits,

    // Loading states
    isCheckingLimit,
    isLoadingLimits,
    isLoading: isCheckingLimit || isLoadingLimits,

    // Modal trigger
    openDownloadLimitModal,
  };
}

export default {
  useCanDownload,
  useDownloadLimits,
  useDownloadHistory,
  useRecentDownloads,
  useDownload,
  useCreditPacks,
  useBonusCredits,
  usePurchaseCreditPack,
  useDownloadWithLimitCheck,
};

// ============================================
// THE VIDEO POOL - DOWNLOADS API
// ============================================

import { get, post } from './client';
import type { Download, DownloadLimits, DownloadResponse } from '@/types';

interface CanDownloadResponse {
  canDownload: boolean;
  reason?: string;
  downloadsRemaining: number | 'unlimited';
  upgradeRequired?: boolean;
}

interface DownloadHistoryResponse {
  downloads: Download[];
  total: number;
  page: number;
  pageSize: number;
}

export const downloadsApi = {
  // Check if user can download
  async canDownload(): Promise<CanDownloadResponse> {
    return get<CanDownloadResponse>('/memberships/can-download');
  },

  // Get download limits for current user
  async getDownloadLimits(): Promise<DownloadLimits> {
    const status = await get<{
      downloadsUsed: number;
      downloadsRemaining: number | 'unlimited';
      currentMembership: { slug: string; downloadLimit: number | null };
      periodEnd: string;
    }>('/memberships/status');

    return {
      tier: status.currentMembership.slug,
      used: status.downloadsUsed,
      limit: status.currentMembership.downloadLimit ?? 'unlimited',
      resetsAt: status.periodEnd,
      bonusCredits: 0,
    };
  },

  // Initiate download for a video version
  async downloadVideo(videoId: number, versionType: string = 'hd'): Promise<DownloadResponse> {
    // Map frontend version types to server's version/quality schema
    const versionMap: Record<string, { version: string; quality: string }> = {
      hd:       { version: 'clean',    quality: '1080p' },
      '4k':     { version: 'clean',    quality: '4k' },
      audio:    { version: 'audio',    quality: '720p' },
      clean:    { version: 'clean',    quality: '1080p' },
      explicit: { version: 'explicit', quality: '1080p' },
      extended: { version: 'extended', quality: '1080p' },
      intro:    { version: 'intro',    quality: '1080p' },
      outro:    { version: 'outro',    quality: '1080p' },
      quickhit: { version: 'quickhit', quality: '1080p' },
    };
    const mapped = versionMap[versionType] ?? { version: 'clean', quality: '1080p' };
    const raw = await post<Record<string, unknown>>(`/videos/${videoId}/download`, mapped);
    // Server returns downloadUrl; DownloadResponse expects signedUrl — normalise both
    return {
      signedUrl: (raw.signedUrl ?? raw.downloadUrl ?? '') as string,
      expiresIn: (raw.expiresIn ?? 3600) as number,
      remainingDownloads: (raw.remainingDownloads ?? 0) as number,
      downloadId: (raw.downloadId ?? 0) as number,
    };
  },

  // Get download URL (signed URL)
  async getDownloadUrl(videoId: number): Promise<{ signedUrl: string; expiresIn: number }> {
    return get<{ signedUrl: string; expiresIn: number }>(`/videos/${videoId}/download`);
  },

  // Get user's download history
  async getDownloadHistory(page: number = 1, limit: number = 20): Promise<DownloadHistoryResponse> {
    return get<DownloadHistoryResponse>('/user/downloads', { page, limit });
  },

  // Get recent downloads
  async getRecentDownloads(limit: number = 10): Promise<Download[]> {
    return get<Download[]>('/user/downloads/recent', { limit });
  },

  // Get credit packs available for purchase
  async getCreditPacks(): Promise<Array<{
    id: string;
    name: string;
    credits: number;
    price: number;
    popular?: boolean;
  }>> {
    return get<Array<{
      id: string;
      name: string;
      credits: number;
      price: number;
      popular?: boolean;
    }>>('/credits/packs');
  },

  // Get user's bonus credits
  async getBonusCredits(): Promise<{ bonusCredits: number }> {
    return get<{ bonusCredits: number }>('/credits/balance');
  },

  // Purchase credit pack
  async purchaseCreditPack(packId: string, successUrl?: string, cancelUrl?: string): Promise<{ url: string }> {
    return post<{ url: string }>('/credits/purchase', {
      packId,
      successUrl: successUrl || `${window.location.origin}/credits/success`,
      cancelUrl: cancelUrl || `${window.location.origin}/credits`,
    });
  },
};

export default downloadsApi;

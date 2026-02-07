// ============================================
// THE VIDEO POOL - API EXPORTS
// ============================================

export { default as apiClient, get, post, put, del, setAuthToken, getAuthToken, downloadFile } from './client';
export { authApi } from './auth';
export { videosApi } from './videos';
export { downloadsApi } from './downloads';
export { libraryApi } from './library';
export { subscriptionsApi } from './subscriptions';
export { recommendationsApi } from './recommendations';

// Convenience re-export of all APIs
export const api = {
  auth: () => import('./auth').then(m => m.authApi),
  videos: () => import('./videos').then(m => m.videosApi),
  downloads: () => import('./downloads').then(m => m.downloadsApi),
  library: () => import('./library').then(m => m.libraryApi),
  subscriptions: () => import('./subscriptions').then(m => m.subscriptionsApi),
  recommendations: () => import('./recommendations').then(m => m.recommendationsApi),
};

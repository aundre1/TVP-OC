// ============================================
// THE VIDEO POOL - API CLIENT
// ============================================

import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import type { ApiError } from '@/types';

// API Base URL - uses Railway backend in production
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://tvp-oc-production.up.railway.app/api';

// Create axios instance with default config
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 second timeout for production backend
  withCredentials: true, // Include HttpOnly cookies automatically
  headers: {
    'Content-Type': 'application/json',
  },
});

// DEPRECATED: Token storage functions removed
// Tokens are now stored in HttpOnly cookies only (set by backend)
// Browser automatically includes cookies in requests via withCredentials: true
// No Authorization header needed — security improved via XSS prevention

export const setAuthToken = (token: string | null) => {
  // No-op for backwards compatibility during migration
  // Tokens are now managed exclusively via HttpOnly cookies
};

export const getAuthToken = (): string | null => {
  // No-op for backwards compatibility during migration
  // Return null — tokens are in cookies, not accessible to JavaScript
  return null;
};

export const setRefreshToken = (token: string | null) => {
  // No-op for backwards compatibility during migration
  // Tokens are now managed exclusively via HttpOnly cookies
};

export const getRefreshToken = (): string | null => {
  // No-op for backwards compatibility during migration
  // Return null — tokens are in cookies, not accessible to JavaScript
  return null;
};

// ===========================================
// TOKEN AUTO-REFRESH LOGIC
// ===========================================

let isRefreshing = false;
let failedQueue: Array<{
  resolve: () => void;
  reject: (error: unknown) => void;
}> = [];

const processQueue = (error: unknown) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });
  failedQueue = [];
};

// Response interceptor - handle errors globally + token auto-refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiError>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Handle 401 Unauthorized with token refresh (using HttpOnly cookies)
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      // Don't try to refresh for auth endpoints themselves
      const isAuthRequest = originalRequest.url?.includes('/auth/');

      if (!isAuthRequest) {
        if (isRefreshing) {
          // Queue this request until the refresh completes
          return new Promise((resolve, reject) => {
            failedQueue.push({
              resolve: () => resolve(apiClient(originalRequest)),
              reject,
            });
          });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          // Call refresh endpoint (backend reads tvp_refresh_token from cookies)
          // No need to send refreshToken in body — it's in the HttpOnly cookie
          await axios.post(
            `${API_BASE_URL}/auth/refresh`,
            {},
            { withCredentials: true }
          );

          // New access token is automatically set in tvp_token cookie by backend
          processQueue(null);

          // Retry the original request with new cookie
          return apiClient(originalRequest);
        } catch (refreshError) {
          // Refresh failed — redirect to login
          processQueue(refreshError);

          const path = window.location.pathname;
          const isAuthPage = path.includes('/login') ||
                            path.includes('/register') ||
                            path.includes('/welcome') ||
                            path === '/';
          if (!isAuthPage) {
            window.location.href = '/login';
          }
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }

      // Auth endpoint returning 401 — redirect to login
      const path = window.location.pathname;
      const isAuthPage = path.includes('/login') ||
                        path.includes('/register') ||
                        path.includes('/welcome') ||
                        path.includes('/forgot-password') ||
                        path.includes('/reset-password') ||
                        path.includes('/verify-email') ||
                        path === '/';

      if (!isAuthPage) {
        window.location.href = '/login';
      }
    }

    // Handle 403 Forbidden (subscription required)
    if (error.response?.status === 403) {
      const errorData = error.response.data;
      if (errorData?.code === 'SUBSCRIPTION_REQUIRED') {
        // Could trigger upgrade modal here
      }
    }

    // Handle rate limiting
    if (error.response?.status === 429) {
      // Rate limited - handled by retry logic or UI notification
    }

    return Promise.reject(error);
  }
);

// Generic request helpers
export async function get<T>(url: string, params?: Record<string, unknown>): Promise<T> {
  const response = await apiClient.get<T>(url, { params });
  return response.data;
}

export async function post<T>(url: string, data?: unknown): Promise<T> {
  const response = await apiClient.post<T>(url, data);
  return response.data;
}

export async function put<T>(url: string, data?: unknown): Promise<T> {
  const response = await apiClient.put<T>(url, data);
  return response.data;
}

export async function del<T>(url: string): Promise<T> {
  const response = await apiClient.delete<T>(url);
  return response.data;
}

// File download helper
export async function downloadFile(url: string, filename: string): Promise<void> {
  const response = await apiClient.get(url, {
    responseType: 'blob',
  });

  const blob = new Blob([response.data]);
  const downloadUrl = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(downloadUrl);
}

// Export the axios instance for advanced use cases
export default apiClient;

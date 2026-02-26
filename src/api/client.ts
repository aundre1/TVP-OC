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
  withCredentials: true, // Include cookies for session auth
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token storage (for JWT auth)
let authToken: string | null = null;

export const setAuthToken = (token: string | null) => {
  authToken = token;
  if (token) {
    localStorage.setItem('tvp_token', token);
  } else {
    localStorage.removeItem('tvp_token');
  }
};

export const getAuthToken = (): string | null => {
  if (!authToken) {
    authToken = localStorage.getItem('tvp_token');
  }
  return authToken;
};

// Refresh token storage
export const setRefreshToken = (token: string | null) => {
  if (token) {
    localStorage.setItem('tvp_refresh_token', token);
  } else {
    localStorage.removeItem('tvp_refresh_token');
  }
};

export const getRefreshToken = (): string | null => {
  return localStorage.getItem('tvp_refresh_token');
};

// Request interceptor - add auth token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAuthToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ===========================================
// TOKEN AUTO-REFRESH LOGIC
// ===========================================

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  });
  failedQueue = [];
};

// Response interceptor - handle errors globally + token auto-refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiError>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Handle 401 Unauthorized with token refresh
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      // Don't try to refresh for auth endpoints themselves
      const isAuthRequest = originalRequest.url?.includes('/auth/');
      const refreshToken = getRefreshToken();

      if (!isAuthRequest && refreshToken) {
        if (isRefreshing) {
          // Queue this request until the refresh completes
          return new Promise((resolve, reject) => {
            failedQueue.push({
              resolve: (token: string) => {
                if (originalRequest.headers) {
                  originalRequest.headers.Authorization = `Bearer ${token}`;
                }
                resolve(apiClient(originalRequest));
              },
              reject,
            });
          });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          // Call refresh endpoint
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refreshToken,
          });

          const newAccessToken = response.data.accessToken;
          setAuthToken(newAccessToken);

          // Process queued requests with new token
          processQueue(null, newAccessToken);

          // Retry the original request
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          }
          return apiClient(originalRequest);
        } catch (refreshError) {
          // Refresh failed — clear everything and redirect to login
          processQueue(refreshError, null);
          setAuthToken(null);
          setRefreshToken(null);

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

      // No refresh token available — clear auth and redirect
      setAuthToken(null);

      const path = window.location.pathname;
      const isAuthPage = path.includes('/login') ||
                        path.includes('/register') ||
                        path.includes('/welcome') ||
                        path.includes('/forgot-password') ||
                        path.includes('/reset-password') ||
                        path.includes('/verify-email') ||
                        path === '/';
      const isAuthRequestFallback = error.config?.url?.includes('/auth/');

      if (!isAuthPage && !isAuthRequestFallback) {
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

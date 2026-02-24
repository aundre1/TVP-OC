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

// Response interceptor - handle errors globally
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiError>) => {
    // originalRequest available for retry logic if needed: error.config

    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      // Clear token and redirect to login
      setAuthToken(null);

      // Don't redirect if already on auth pages
      if (!window.location.pathname.includes('/login') &&
          !window.location.pathname.includes('/register')) {
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

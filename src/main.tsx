// ============================================
// THE VIDEO POOL - MAIN ENTRY POINT
// ============================================

import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import App from './App';
import { OAUTH_CONFIG } from './config/oauth';
import './index.css';

// Create React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 2 * 60 * 1000, // 2 minutes default
    },
    mutations: {
      retry: 0,
    },
  },
});

// Conditionally wrap with GoogleOAuthProvider only if valid client ID exists
const hasValidGoogleClientId =
  OAUTH_CONFIG.google.clientId &&
  OAUTH_CONFIG.google.clientId !== 'your-client-id-here';

const AppContent = (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </QueryClientProvider>
);

const WrappedApp = hasValidGoogleClientId ? (
  <GoogleOAuthProvider clientId={OAUTH_CONFIG.google.clientId}>
    {AppContent}
  </GoogleOAuthProvider>
) : (
  AppContent
);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {WrappedApp}
  </React.StrictMode>
);

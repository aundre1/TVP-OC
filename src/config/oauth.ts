// ============================================
// THE VIDEO POOL - OAUTH CONFIGURATION
// ============================================

export const OAUTH_CONFIG = {
  google: {
    clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || 'your-client-id-here',
  },
  facebook: {
    appId: import.meta.env.VITE_FACEBOOK_APP_ID || 'your-facebook-app-id-here',
  },
};

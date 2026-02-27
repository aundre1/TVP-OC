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
  apple: {
    teamId: import.meta.env.VITE_APPLE_TEAM_ID || 'your-team-id-here',
    bundleId: import.meta.env.VITE_APPLE_BUNDLE_ID || 'your-bundle-id-here',
    keyId: import.meta.env.VITE_APPLE_KEY_ID || 'your-key-id-here',
  },
  spotify: {
    clientId: import.meta.env.VITE_SPOTIFY_CLIENT_ID || 'your-client-id-here',
  },
};

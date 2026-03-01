// ============================================
// THE VIDEO POOL - DEVELOPMENT CONFIGURATION
// ============================================

import type { User } from '@/types';

// Enable mock mode when no backend is available
// Set to false when backend server is running
export const DEV_CONFIG = {
  // Use mock data instead of real API calls
  useMockAuth: true,  // DEMO MODE: Show dashboard for Steve

  // Skip auto-login to test landing page (set to true to see landing page)
  // When true: shows landing page, user must click "login" to authenticate
  // When false: auto-logs in with mock user for testing authenticated views
  skipAutoLogin: false,  // DEMO MODE: Show dashboard for Steve

  // Mock user for development (matches User interface)
  mockUser: {
    id: 1,
    email: 'dev@thevideopool.com',
    username: 'DevUser',
    membershipId: 1,
    membershipType: 'pro',
    isAdmin: true,
    emailVerified: true,
    twoFactorEnabled: false,
    profileImage: undefined,
    createdAt: new Date().toISOString(),
    downloadsThisMonth: 5,
    downloadLimit: 100,
    bonusCredits: 10,
  } satisfies User,
};

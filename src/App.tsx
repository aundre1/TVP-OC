// ============================================
// THE VIDEO POOL - MAIN APP COMPONENT
// ============================================

import { useEffect, lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useUIStore } from '@/stores/uiStore';
import { ErrorBoundary } from '@/components/ErrorBoundary';

// Layout - Using v5.5 layout with all panels and modals
import Layout from '@/components/LayoutV2';

// Pages - Critical path (loaded immediately)
import LandingPage from '@/pages/LandingPage';
import HomePage from '@/pages/HomePageV2';

// Pages - Lazy loaded (code splitting for better performance)
const LoginPage = lazy(() => import('@/pages/LoginPage'));
const RegisterPage = lazy(() => import('@/pages/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('@/pages/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('@/pages/ResetPasswordPage'));
const EmailVerificationPage = lazy(() => import('@/pages/EmailVerificationPage'));
const VideoPage = lazy(() => import('@/pages/VideoPage'));
const SearchPage = lazy(() => import('@/pages/SearchPage'));
const LibraryPage = lazy(() => import('@/pages/LibraryPage'));
const DownloadsPage = lazy(() => import('@/pages/DownloadsPage'));
const MembershipPage = lazy(() => import('@/pages/MembershipPage'));
const MembershipSuccessPage = lazy(() => import('@/pages/MembershipSuccessPage'));
const SettingsPage = lazy(() => import('@/pages/SettingsPage'));
const AdminPage = lazy(() => import('@/pages/AdminPage'));
const InsightsPage = lazy(() => import('@/pages/InsightsPage'));
const SharedSetPage = lazy(() => import('@/pages/SharedSetPage'));

// Loading spinner
function LoadingScreen() {
  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: 'var(--bg-primary)' }}
    >
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin" />
        <span style={{ color: 'var(--text-secondary)' }}>Loading...</span>
      </div>
    </div>
  );
}

// Protected route wrapper - redirects to landing page if not authenticated
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/welcome" replace />;
  }

  return <>{children}</>;
}

// Public route wrapper - shows landing page for non-authenticated users
function PublicLandingRoute() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  // If already authenticated, redirect to dashboard
  if (isAuthenticated) {
    return <Navigate to="/home" replace />;
  }

  return <LandingPage />;
}

// Root redirect - sends to /home if authenticated, /welcome if not
function RootRedirect() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return <Navigate to={isAuthenticated ? '/home' : '/welcome'} replace />;
}

// Auth route wrapper (redirect if already logged in)
function AuthRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (isAuthenticated) {
    return <Navigate to="/home" replace />;
  }

  return <>{children}</>;
}

export default function App() {
  const { isLoading } = useAuth();
  const { theme } = useUIStore();

  // Apply theme class to document
  useEffect(() => {
    document.documentElement.classList.toggle('light', theme === 'light');
  }, [theme]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          {/* Public landing page - shown to non-authenticated visitors */}
          <Route path="/welcome" element={<PublicLandingRoute />} />

          {/* Root redirects based on auth status */}
          <Route path="/" element={<RootRedirect />} />

          {/* Auth routes */}
          <Route
            path="/login"
            element={
              <AuthRoute>
                <LoginPage />
              </AuthRoute>
            }
          />
          <Route
            path="/register"
            element={
              <AuthRoute>
                <RegisterPage />
              </AuthRoute>
            }
          />
          <Route
            path="/forgot-password"
            element={
              <AuthRoute>
                <ForgotPasswordPage />
              </AuthRoute>
            }
          />
          <Route
            path="/reset-password"
            element={
              <AuthRoute>
                <ResetPasswordPage />
              </AuthRoute>
            }
          />
          <Route
            path="/verify-email"
            element={<EmailVerificationPage />}
          />

          {/* Public shared set page (no auth required) */}
          <Route path="/set/:shareId" element={<SharedSetPage />} />

          {/* Main app routes (protected) */}
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<HomePage />} />
          </Route>

          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="video/:id" element={<VideoPage />} />
            <Route path="search" element={<SearchPage />} />
            <Route path="library" element={<LibraryPage />} />
            <Route path="downloads" element={<DownloadsPage />} />
            <Route path="membership" element={<MembershipPage />} />
            <Route path="membership/success" element={<MembershipSuccessPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="admin" element={<AdminPage />} />
            <Route path="insights" element={<InsightsPage />} />
          </Route>

          {/* Catch all - redirect to welcome/landing page */}
          <Route path="*" element={<Navigate to="/welcome" replace />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}

// ============================================
// THE VIDEO POOL - MAIN LAYOUT v6.0 (Reskinned)
// With sidebar, panels, modals, and keyboard shortcuts
// ============================================

import { Outlet } from 'react-router-dom';

// Layout components
import HeaderV2 from './HeaderV2';
import GenreNav from './GenreNav';
import SidebarNav from './SidebarNav';
import Toolbar from './Toolbar';

// Panels
import SetBuilder from './SetBuilder';
import RecentDownloadsPanel from './RecentDownloadsPanel';
import RequestPanel from './RequestPanel';
import ShortcutsPanel, { ShortcutFeedback } from './ShortcutsPanel';

// Modals
import PreviewModalV2 from './PreviewModalV2';
import ToastContainer from './Toast';
import DownloadLimitModal from './DownloadLimitModal';
import DownloadQualityModalWrapper from './DownloadQualityModalWrapper';
import BatchDownloadModalWrapper from './BatchDownloadModalWrapper';
import ScoringExplanationModal from './ScoringExplanationModal';
import DuplicateWarningModal from './DuplicateWarningModal';

// Trial components
import FreeTrialBanner from './FreeTrialBanner';
import TrialExpiredModal from './TrialExpiredModal';

// Hooks
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';

export default function Layout() {
  // Initialize keyboard shortcuts
  useKeyboardShortcuts();

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg-primary)' }}>
      {/* Header */}
      <HeaderV2 />

      {/* Free Trial Banner */}
      <FreeTrialBanner />

      {/* Genre Navigation */}
      <GenreNav />

      {/* Main Content Area with Sidebar */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Navigation */}
        <SidebarNav />

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto pb-32" style={{ background: 'var(--bg-primary)' }}>
          {/* Toolbar */}
          <Toolbar />

          {/* Page Content */}
          <Outlet />
        </main>
      </div>

      {/* Panels */}
      <SetBuilder />
      <RecentDownloadsPanel />
      <RequestPanel />
      <ShortcutsPanel />

      {/* Modals */}
      <PreviewModalV2 />
      <TrialExpiredModal />
      <DownloadLimitModal />
      <DownloadQualityModalWrapper />
      <BatchDownloadModalWrapper />
      <ScoringExplanationModal />
      <DuplicateWarningModal />

      {/* Toast Notifications */}
      <ToastContainer />

      {/* Keyboard Shortcut Feedback */}
      <ShortcutFeedback />
    </div>
  );
}

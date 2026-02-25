// ============================================
// THE VIDEO POOL - MAIN LAYOUT v6.0 (Reskinned)
// With sidebar, panels, and modals
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

// Modals
import PreviewModalV2 from './PreviewModalV2';
import ToastContainer from './Toast';
import DownloadLimitModal from './DownloadLimitModal';
import DownloadQualityModalWrapper from './DownloadQualityModalWrapper';
import BatchDownloadModalWrapper from './BatchDownloadModalWrapper';
import DuplicateWarningModal from './DuplicateWarningModal';

// Trial components
import FreeTrialBanner from './FreeTrialBanner';
import TrialExpiredModal from './TrialExpiredModal';

export default function Layout() {
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

      {/* Modals */}
      <PreviewModalV2 />
      <TrialExpiredModal />
      <DownloadLimitModal />
      <DownloadQualityModalWrapper />
      <BatchDownloadModalWrapper />
      <DuplicateWarningModal />

      {/* Toast Notifications */}
      <ToastContainer />
    </div>
  );
}

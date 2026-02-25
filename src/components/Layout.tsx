// ============================================
// THE VIDEO POOL - MAIN LAYOUT
// ============================================

import { Outlet } from 'react-router-dom';
import Header from './Header';
import DownloadFAB from './DownloadFAB';
import PreviewModal from './PreviewModal';
import SidePanel from './SidePanel';
// (removed unused imports)

export default function Layout() {
  return (
    <div className="min-h-screen bg-tvp-bg-primary">
      <Header />
      <main className="pt-4 pb-32">
        <Outlet />
      </main>
      <DownloadFAB />
      <PreviewModal />
      <SidePanel />
      {/* removed unused components */}
    </div>
  );
}

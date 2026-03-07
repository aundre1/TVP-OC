// ============================================
// THE VIDEO POOL - SIDEBAR NAVIGATION v6.0 (Reskinned)
// Fixed left sidebar with navigation and downloads widget
// ============================================

import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  Search,
  BarChart3,
  Sparkles,
  ListMusic,
  Heart,
  LayoutGrid,
  Download,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/stores/appStore';
import { useAuth } from '@/hooks/useAuth';
import { useFavorites } from '@/hooks/useLibrary';

// Navigation item component
function NavItem({
  icon,
  label,
  active = false,
  badge,
  onClick,
  to,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  badge?: string;
  onClick?: () => void;
  to?: string;
}) {
  const content = (
    <>
      <div className="flex items-center gap-3">
        <span className="group-hover:text-[var(--accent-cyan)] transition-colors">{icon}</span>
        <span>{label}</span>
      </div>
      {badge && (
        <span
          className="text-[10px] font-bold px-1.5 py-0.5 rounded"
          style={{
            background: 'var(--bg-tertiary)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          {badge}
        </span>
      )}
    </>
  );

  const className = cn(
    'flex items-center justify-between px-3 py-2 mx-2 rounded-lg text-sm font-medium transition-colors group',
    active && 'bg-[var(--accent-cyan-subtle)] text-[var(--accent-cyan)]'
  );

  const style = !active ? { color: 'var(--text-secondary)' } : undefined;

  if (to) {
    return (
      <Link to={to} className={className} style={style} onClick={onClick}>
        {content}
      </Link>
    );
  }

  return (
    <button className={cn(className, 'w-full text-left')} style={style} onClick={onClick}>
      {content}
    </button>
  );
}

// Downloads widget component
function DownloadsWidget({
  downloadsRemaining = 150,
  downloadsTotal = 200,
  plan = 'Pro',
  onClick,
}: {
  downloadsRemaining?: number;
  downloadsTotal?: number;
  plan?: string;
  onClick?: () => void;
}) {
  const percentRemaining = (downloadsRemaining / downloadsTotal) * 100;

  return (
    <button
      onClick={onClick}
      className="w-full rounded-xl p-4 transition-colors hover:ring-1 hover:ring-cyan-400/30"
      style={{
        background: 'linear-gradient(135deg, rgba(139,92,246,0.15), rgba(0,212,255,0.15))',
        border: '1px solid var(--border-subtle)',
      }}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Download size={16} className="text-cyan-400" />
          <span className="text-sm font-bold">Downloads</span>
        </div>
        <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-400/20 text-cyan-400">
          {plan}
        </span>
      </div>
      <div
        className="flex items-center justify-between text-xs mb-2"
        style={{ color: 'var(--text-muted)' }}
      >
        <span>{downloadsRemaining} remaining</span>
        <span>{downloadsTotal} total</span>
      </div>
      <div
        className="h-1.5 rounded-full overflow-hidden"
        style={{ background: 'var(--bg-tertiary)' }}
      >
        <div
          className="h-full bg-gradient-to-r from-purple-500 to-cyan-400 transition-all duration-500"
          style={{ width: `${percentRemaining}%` }}
        />
      </div>
    </button>
  );
}

// Main Sidebar Navigation Component
export default function SidebarNav() {
  const location = useLocation();
  const { toggleSetBuilder, setBuilderTracks, openRecentPanel } = useAppStore();
  const { user } = useAuth();
  const { data: favorites = [] } = useFavorites();

  // Determine active section based on current route/state
  const isHome = location.pathname === '/';
  const activeSection = location.pathname.split('/')[1] || 'browse';

  // Get download quota from user object or API
  const downloadsRemaining = user?.downloadsRemaining ?? 150;
  const downloadsTotal = user?.downloadLimit ?? 200;
  const membershipPlan = user?.membershipTier?.name ?? 'Pro';

  return (
    <aside
      className="w-[240px] flex flex-col py-6 overflow-y-auto shrink-0 z-30 hidden md:flex"
      style={{
        background: 'var(--bg-secondary)',
        borderRight: '1px solid var(--border-subtle)',
      }}
    >
      {/* Navigate Section */}
      <div className="px-4 mb-6">
        <div
          className="text-xs font-bold uppercase tracking-wider mb-3 px-2"
          style={{ color: 'var(--text-muted)' }}
        >
          Navigate
        </div>
        <nav className="space-y-1">
          <NavItem
            icon={<Home size={18} />}
            label="The Pool"
            to="/"
            active={isHome && activeSection === 'browse'}
          />
          <NavItem
            icon={<Search size={18} />}
            label="Browse All"
            to="/browse"
            active={activeSection === 'browse' && !isHome}
          />
        </nav>
      </div>

      {/* Discover Section */}
      <div className="px-4 mb-6">
        <div
          className="text-xs font-bold uppercase tracking-wider mb-3 px-2"
          style={{ color: 'var(--text-muted)' }}
        >
          Discover
        </div>
        <nav className="space-y-1">
          <NavItem
            icon={<BarChart3 size={18} />}
            label="Charts"
            to="/charts"
            badge="12"
            active={activeSection === 'charts'}
          />
          <NavItem
            icon={<Sparkles size={18} />}
            label="For You"
            to="/for-you"
            badge="AI"
            active={activeSection === 'for-you'}
          />
          <NavItem
            icon={<ListMusic size={18} />}
            label="Playlists"
            to="/playlists"
            badge="8"
            active={activeSection === 'playlists'}
          />
        </nav>
      </div>

      {/* Library Section */}
      <div className="px-4 mb-6">
        <div
          className="text-xs font-bold uppercase tracking-wider mb-3 px-2"
          style={{ color: 'var(--text-muted)' }}
        >
          Library
        </div>
        <nav className="space-y-1">
          <NavItem
            icon={<Heart size={18} />}
            label="Favorites"
            to="/favorites"
            badge={favorites.length > 0 ? favorites.length.toString() : undefined}
            active={activeSection === 'favorites'}
          />
          <NavItem
            icon={<LayoutGrid size={18} />}
            label="My Sets"
            badge={setBuilderTracks.length > 0 ? setBuilderTracks.length.toString() : undefined}
            onClick={toggleSetBuilder}
          />
        </nav>
      </div>

      {/* Downloads Widget - Pushed to bottom */}
      <div className="mt-auto px-4">
        <DownloadsWidget
          downloadsRemaining={downloadsRemaining}
          downloadsTotal={downloadsTotal}
          plan={membershipPlan}
          onClick={openRecentPanel}
        />
      </div>
    </aside>
  );
}

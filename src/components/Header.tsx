// ============================================
// THE VIDEO POOL - HEADER COMPONENT
// ============================================

import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Bell, ChevronDown, Settings, LogOut, Download, Library, CreditCard, Keyboard, Menu, X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useUIStore } from '@/stores/uiStore';
import { useDownloadLimits } from '@/hooks/useDownloads';

export default function Header() {
  const navigate = useNavigate();
  const { user, logout, membershipType, downloadsRemaining } = useAuth();
  const { searchQuery, setSearchQuery, unreadCount, isMobileMenuOpen, toggleMobileMenu, closeMobileMenu } = useUIStore();
  const { data: limits } = useDownloadLimits();

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isBrowseOpen, setIsBrowseOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const browseRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
      if (browseRef.current && !browseRef.current.contains(event.target as Node)) {
        setIsBrowseOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <>
    <header className="sticky top-0 z-50 flex items-center gap-4 lg:gap-6 h-[64px] lg:h-[72px] px-4 lg:px-6 bg-tvp-bg-secondary border-b border-tvp-border-subtle">
      {/* Mobile Menu Button */}
      <button
        onClick={toggleMobileMenu}
        className="lg:hidden p-2 text-tvp-text-secondary hover:text-tvp-text-primary hover:bg-tvp-bg-tertiary rounded-lg transition-colors"
      >
        {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Logo */}
      <Link to="/" className="flex items-center flex-shrink-0 group">
        <img
          src="/logo.png"
          alt="The Video Pool"
          className="h-10 lg:h-12 w-auto object-contain group-hover:drop-shadow-[0_0_12px_rgba(0,212,255,0.4)] transition-all"
        />
      </Link>

      {/* Navigation - Hidden on mobile */}
      <nav className="hidden lg:flex items-center gap-1">
        <div ref={browseRef} className="relative">
          <button
            onClick={() => setIsBrowseOpen(!isBrowseOpen)}
            className="flex items-center gap-1 px-3.5 py-2 text-sm font-medium text-tvp-text-secondary hover:text-tvp-text-primary hover:bg-tvp-bg-tertiary rounded-lg transition-colors"
          >
            Browse <ChevronDown className={`w-4 h-4 transition-transform ${isBrowseOpen ? 'rotate-180' : ''}`} />
          </button>
          {isBrowseOpen && (
            <div className="absolute top-full left-0 mt-2 w-48 py-2 bg-tvp-bg-elevated border border-tvp-border-default rounded-xl shadow-elevated animate-fade-in">
              <Link to="/?section=trending" className="block px-4 py-2 text-sm text-tvp-text-secondary hover:text-tvp-text-primary hover:bg-tvp-bg-tertiary">
                Trending
              </Link>
              <Link to="/?section=new" className="block px-4 py-2 text-sm text-tvp-text-secondary hover:text-tvp-text-primary hover:bg-tvp-bg-tertiary">
                New Releases
              </Link>
              <Link to="/?section=hip-hop" className="block px-4 py-2 text-sm text-tvp-text-secondary hover:text-tvp-text-primary hover:bg-tvp-bg-tertiary">
                Hip-Hop
              </Link>
              <Link to="/?section=edm" className="block px-4 py-2 text-sm text-tvp-text-secondary hover:text-tvp-text-primary hover:bg-tvp-bg-tertiary">
                EDM
              </Link>
              <Link to="/?section=latin" className="block px-4 py-2 text-sm text-tvp-text-secondary hover:text-tvp-text-primary hover:bg-tvp-bg-tertiary">
                Latin
              </Link>
              <Link to="/?section=pop" className="block px-4 py-2 text-sm text-tvp-text-secondary hover:text-tvp-text-primary hover:bg-tvp-bg-tertiary">
                Pop
              </Link>
            </div>
          )}
        </div>

        <Link to="/?section=new" className="px-3.5 py-2 text-sm font-medium text-tvp-text-secondary hover:text-tvp-text-primary hover:bg-tvp-bg-tertiary rounded-lg transition-colors">
          New Releases
        </Link>
        <Link to="/?section=charts" className="px-3.5 py-2 text-sm font-medium text-tvp-text-secondary hover:text-tvp-text-primary hover:bg-tvp-bg-tertiary rounded-lg transition-colors">
          Charts
        </Link>
        <Link to="/library" className="px-3.5 py-2 text-sm font-medium text-tvp-text-secondary hover:text-tvp-text-primary hover:bg-tvp-bg-tertiary rounded-lg transition-colors">
          Playlists
        </Link>
      </nav>

      {/* Search Bar - Hidden on mobile */}
      <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-[550px] mx-auto">
        <div className="flex items-center gap-3 px-4 py-2.5 bg-tvp-bg-tertiary border-2 border-tvp-border-subtle rounded-xl focus-within:border-tvp-accent-cyan focus-within:shadow-[0_0_0_4px_rgba(0,212,255,0.1)] transition-all w-full">
          <Search className="w-5 h-5 text-tvp-text-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search videos, artists, genres..."
            className="flex-1 bg-transparent border-none text-sm text-tvp-text-primary placeholder:text-tvp-text-muted outline-none"
          />
          <kbd className="hidden lg:block px-2 py-0.5 bg-tvp-bg-primary rounded text-xs font-mono text-tvp-text-muted">⌘K</kbd>
        </div>
      </form>

      {/* Mobile Search Button */}
      <button
        onClick={() => navigate('/search')}
        className="md:hidden p-2 text-tvp-text-secondary hover:text-tvp-text-primary hover:bg-tvp-bg-tertiary rounded-lg transition-colors ml-auto"
      >
        <Search className="w-5 h-5" />
      </button>

      {/* Right Section */}
      <div className="flex items-center gap-2 lg:gap-4">
        {/* Download Status - Hidden on mobile */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-tvp-bg-tertiary rounded-lg">
          <Download className="w-4 h-4 text-tvp-accent-cyan" />
          <span className="text-sm font-medium text-tvp-text-primary">
            {typeof downloadsRemaining === 'number' ? downloadsRemaining : '∞'}
          </span>
          <span className="text-xs text-tvp-text-muted">left</span>
        </div>

        {/* Notifications */}
        <button className="relative p-2 text-tvp-text-secondary hover:text-tvp-text-primary hover:bg-tvp-bg-tertiary rounded-lg transition-colors">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 bg-tvp-accent-cyan rounded-full" />
          )}
        </button>

        {/* Profile Dropdown */}
        <div ref={profileRef} className="relative">
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2 p-1.5 hover:bg-tvp-bg-tertiary rounded-lg transition-colors"
          >
            <div className="w-[38px] h-[38px] bg-tvp-accent-cyan rounded-full flex items-center justify-center text-tvp-bg-primary font-semibold">
              {user?.username?.charAt(0).toUpperCase() || 'U'}
            </div>
            <ChevronDown className={`w-4 h-4 text-tvp-text-muted transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
          </button>

          {isProfileOpen && (
            <div className="absolute top-full right-0 mt-2 w-64 py-2 bg-tvp-bg-elevated border border-tvp-border-default rounded-xl shadow-elevated animate-fade-in">
              {/* User Info */}
              <div className="px-4 py-3 border-b border-tvp-border-subtle">
                <p className="text-sm font-medium text-tvp-text-primary">{user?.username}</p>
                <p className="text-xs text-tvp-text-muted">{user?.email}</p>
                <div className="mt-2 flex items-center gap-2">
                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                    membershipType === 'elite' ? 'bg-tvp-accent-gold/20 text-tvp-accent-gold' :
                    membershipType === 'pro' ? 'bg-tvp-accent-cyan/20 text-tvp-accent-cyan' :
                    membershipType === 'starter' ? 'bg-purple-500/20 text-purple-400' :
                    'bg-tvp-bg-tertiary text-tvp-text-muted'
                  }`}>
                    {membershipType.charAt(0).toUpperCase() + membershipType.slice(1)}
                  </span>
                </div>
              </div>

              {/* Menu Items */}
              <div className="py-1">
                <Link to="/library" className="flex items-center gap-3 px-4 py-2 text-sm text-tvp-text-secondary hover:text-tvp-text-primary hover:bg-tvp-bg-tertiary">
                  <Library className="w-4 h-4" />
                  My Library
                </Link>
                <Link to="/downloads" className="flex items-center gap-3 px-4 py-2 text-sm text-tvp-text-secondary hover:text-tvp-text-primary hover:bg-tvp-bg-tertiary">
                  <Download className="w-4 h-4" />
                  Download History
                </Link>
                <Link to="/membership" className="flex items-center gap-3 px-4 py-2 text-sm text-tvp-text-secondary hover:text-tvp-text-primary hover:bg-tvp-bg-tertiary">
                  <CreditCard className="w-4 h-4" />
                  Subscription
                </Link>
                <Link to="/settings" className="flex items-center gap-3 px-4 py-2 text-sm text-tvp-text-secondary hover:text-tvp-text-primary hover:bg-tvp-bg-tertiary">
                  <Settings className="w-4 h-4" />
                  Settings
                </Link>
                <button
                  onClick={() => {
                    setIsProfileOpen(false);
                    window.dispatchEvent(new KeyboardEvent('keydown', { key: '?' }));
                  }}
                  className="flex items-center justify-between w-full px-4 py-2 text-sm text-tvp-text-muted hover:text-tvp-text-secondary hover:bg-tvp-bg-tertiary"
                >
                  <span className="flex items-center gap-3">
                    <Keyboard className="w-4 h-4" />
                    Keyboard Shortcuts
                  </span>
                  <kbd className="px-1.5 py-0.5 bg-tvp-bg-primary rounded text-[10px] font-mono">?</kbd>
                </button>
              </div>

              <div className="border-t border-tvp-border-subtle pt-1">
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 w-full px-4 py-2 text-sm text-tvp-accent-coral hover:bg-tvp-bg-tertiary"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>

    {/* Mobile Menu Overlay */}
    {isMobileMenuOpen && (
      <div className="lg:hidden fixed inset-0 z-40 bg-tvp-bg-primary pt-[64px]">
        <nav className="p-4 space-y-2">
          <Link
            to="/"
            onClick={closeMobileMenu}
            className="block px-4 py-3 text-lg font-medium text-tvp-text-primary hover:bg-tvp-bg-secondary rounded-xl"
          >
            Home
          </Link>
          <Link
            to="/?section=trending"
            onClick={closeMobileMenu}
            className="block px-4 py-3 text-lg font-medium text-tvp-text-secondary hover:bg-tvp-bg-secondary rounded-xl"
          >
            Trending
          </Link>
          <Link
            to="/?section=new"
            onClick={closeMobileMenu}
            className="block px-4 py-3 text-lg font-medium text-tvp-text-secondary hover:bg-tvp-bg-secondary rounded-xl"
          >
            New Releases
          </Link>
          <Link
            to="/library"
            onClick={closeMobileMenu}
            className="block px-4 py-3 text-lg font-medium text-tvp-text-secondary hover:bg-tvp-bg-secondary rounded-xl"
          >
            My Library
          </Link>
          <Link
            to="/downloads"
            onClick={closeMobileMenu}
            className="block px-4 py-3 text-lg font-medium text-tvp-text-secondary hover:bg-tvp-bg-secondary rounded-xl"
          >
            Downloads
          </Link>
          <Link
            to="/membership"
            onClick={closeMobileMenu}
            className="block px-4 py-3 text-lg font-medium text-tvp-text-secondary hover:bg-tvp-bg-secondary rounded-xl"
          >
            Membership
          </Link>
          <Link
            to="/settings"
            onClick={closeMobileMenu}
            className="block px-4 py-3 text-lg font-medium text-tvp-text-secondary hover:bg-tvp-bg-secondary rounded-xl"
          >
            Settings
          </Link>

          <div className="pt-4 border-t border-tvp-border-subtle mt-4">
            <button
              onClick={() => {
                closeMobileMenu();
                handleLogout();
              }}
              className="block w-full px-4 py-3 text-lg font-medium text-tvp-accent-coral hover:bg-tvp-bg-secondary rounded-xl text-left"
            >
              Sign Out
            </button>
          </div>
        </nav>
      </div>
    )}
    </>
  );
}

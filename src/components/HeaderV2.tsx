// ============================================
// THE VIDEO POOL - HEADER v6.0 (Reskinned)
// shadcn/ui + next-themes + Replit design system
// ============================================

import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Bell,
  Settings,
  Menu,
  Music,
  Sun,
  Moon,
  Mail,
  Save,
  Layout,
  Monitor,
  Laptop,
  Smartphone,
  ChevronDown,
  CheckCircle,
  LogOut,
  CreditCard,
  User,
  Image,
  Palette,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from 'next-themes';
import SearchAutocomplete from './SearchAutocomplete';
import DownloadCounter from './DownloadCounter';
import { useAppStore } from '@/stores/appStore';
import { useUIStore } from '@/stores/uiStore';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export default function Header() {
  const {
    toggleSetBuilder,
    toggleRequestPanel,
    isSetBuilderOpen,
    setBuilderTracks,
  } = useAppStore();

  const { unreadCount } = useUIStore();
  const { setTheme, resolvedTheme } = useTheme();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const setTrackCount = setBuilderTracks.length;

  const handleThemeToggle = () => {
    const newTheme = resolvedTheme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    document.documentElement.classList.toggle('light', newTheme === 'light');
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  return (
    <TooltipProvider delayDuration={300}>
      <header className="sticky top-0 z-[100] flex items-center gap-6 h-[72px] px-6"
        style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-subtle)' }}>
        {/* Logo */}
        <Link to="/" className="flex items-center flex-shrink-0 group">
          <img
            src="/The Video Pool Logo 2.0.png"
            alt="The Video Pool"
            className="h-10 w-auto object-contain animate-logo-glow group-hover:animate-none group-hover:drop-shadow-[0_0_15px_var(--accent-cyan-glow)] transition-all"
          />
        </Link>

        {/* Search - Centered */}
        <div className="flex-1 flex justify-center max-w-2xl mx-auto">
          <SearchAutocomplete />
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {/* Theme Toggle */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={handleThemeToggle}
                className="w-9 h-9 flex items-center justify-center rounded-lg transition-colors hover:bg-[var(--accent-cyan-subtle)]"
                style={{ border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}
              >
                {resolvedTheme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{resolvedTheme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}</p>
            </TooltipContent>
          </Tooltip>

          {/* Email */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                className="w-9 h-9 flex items-center justify-center rounded-lg transition-colors hover:bg-[var(--accent-cyan-subtle)]"
                style={{ border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}
              >
                <Mail size={18} />
              </button>
            </TooltipTrigger>
            <TooltipContent><p>Email Us</p></TooltipContent>
          </Tooltip>

          {/* Save Profile */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                className="w-9 h-9 flex items-center justify-center rounded-lg transition-colors hover:bg-[var(--accent-cyan-subtle)]"
                style={{ border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}
              >
                <Save size={18} />
              </button>
            </TooltipTrigger>
            <TooltipContent><p>Save Profile</p></TooltipContent>
          </Tooltip>

          {/* Layout Preset Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="hidden lg:flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors"
                style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
                <Layout size={16} />
                <span className="font-medium">Club Mode</span>
                <ChevronDown size={14} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-default)' }}>
              <DropdownMenuLabel>Layout Presets</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="flex items-center gap-3 py-3 cursor-pointer">
                <Monitor size={18} className="text-cyan-400" />
                <div className="flex-1">
                  <div className="font-medium flex items-center gap-2">Club Mode <CheckCircle size={12} className="text-cyan-400" /></div>
                  <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Large artwork, minimal info, quick access</div>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex items-center gap-3 py-3 cursor-pointer">
                <Laptop size={18} style={{ color: 'var(--text-muted)' }} />
                <div className="flex-1">
                  <div className="font-medium">Prep Mode</div>
                  <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Detailed info, list view, BPM sorting</div>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex items-center gap-3 py-3 cursor-pointer">
                <Smartphone size={18} style={{ color: 'var(--text-muted)' }} />
                <div className="flex-1">
                  <div className="font-medium">Mobile Mode</div>
                  <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Touch optimized, swipe navigation</div>
                </div>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="flex items-center gap-3 py-3 cursor-pointer">
                <Palette size={18} style={{ color: 'var(--text-muted)' }} />
                <div className="flex-1">
                  <div className="font-medium">Custom</div>
                  <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Configure your own layout</div>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Notifications */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                className="relative w-9 h-9 flex items-center justify-center rounded-lg transition-colors hover:bg-[var(--accent-cyan-subtle)]"
                style={{ border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}
                aria-label={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : 'Notifications'}
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[16px] h-[16px] px-1 flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full">
                    {unreadCount}
                  </span>
                )}
              </button>
            </TooltipTrigger>
            <TooltipContent><p>Notifications</p></TooltipContent>
          </Tooltip>

          {/* Set Builder Toggle */}
          <button
            onClick={toggleSetBuilder}
            className={cn(
              'relative flex items-center gap-2 px-3 py-2',
              'border rounded-lg text-sm font-medium',
              'transition-all',
              isSetBuilderOpen
                ? 'bg-[var(--accent-cyan-subtle)] border-[var(--accent-cyan)] text-[var(--accent-cyan)]'
                : 'bg-transparent border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-[var(--accent-cyan)] hover:text-[var(--accent-cyan)]'
            )}
          >
            <Music className="w-4 h-4" />
            <span className="hidden sm:inline">Set Builder</span>
            {setTrackCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 flex items-center justify-center text-white text-[10px] font-bold rounded-full"
                style={{ background: 'var(--accent-coral)' }}>
                {setTrackCount}
              </span>
            )}
          </button>

          {/* User Avatar Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="w-9 h-9 flex items-center justify-center rounded-full text-black font-semibold text-[13px] transition-shadow hover:shadow-[0_0_15px_var(--accent-cyan-glow)]"
                style={{ background: 'var(--accent-cyan)' }}
              >
                DJ
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end"
              style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-default)' }}>
              <DropdownMenuLabel className="flex items-center gap-3 py-3">
                <div className="w-9 h-9 flex items-center justify-center rounded-full text-black font-semibold text-[13px]"
                  style={{ background: 'var(--accent-cyan)' }}>
                  DJ
                </div>
                <div>
                  <div className="font-medium">DJ Demo</div>
                  <div className="text-xs" style={{ color: 'var(--text-muted)' }}>demo@thevideopool.com</div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer gap-2">
                <User size={16} /> Edit Profile
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer gap-2">
                <Image size={16} /> Change Avatar
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer gap-2" asChild>
                <Link to="/settings"><Settings size={16} /> Account Settings</Link>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer gap-2" asChild>
                <Link to="/membership"><CreditCard size={16} /> Billing & Plan</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer gap-2 text-red-400">
                <LogOut size={16} /> Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg transition-colors hover:bg-[var(--accent-cyan-subtle)]"
            style={{ border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}
            aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMobileMenuOpen}
          >
            <Menu size={18} />
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="absolute top-full left-0 right-0 p-4 md:hidden animate-fade-in"
            style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-subtle)' }}>
            <nav className="flex flex-col gap-2">
              <Link
                to="/"
                className="px-4 py-3 rounded-lg hover:bg-[var(--bg-tertiary)] transition-colors"
                style={{ color: 'var(--text-secondary)' }}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Browse
              </Link>
              <Link
                to="/library"
                className="px-4 py-3 rounded-lg hover:bg-[var(--bg-tertiary)] transition-colors"
                style={{ color: 'var(--text-secondary)' }}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Library
              </Link>
              <button
                onClick={() => { toggleRequestPanel(); setIsMobileMenuOpen(false); }}
                className="px-4 py-3 rounded-lg hover:bg-[var(--bg-tertiary)] text-left transition-colors"
                style={{ color: 'var(--text-secondary)' }}
              >
                Request
              </button>
            </nav>
          </div>
        )}
      </header>
    </TooltipProvider>
  );
}

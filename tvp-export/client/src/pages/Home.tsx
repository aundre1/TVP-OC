import React, { useState, useMemo, useEffect, useRef } from 'react';
import type { Video } from '@shared/schema';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchVideos, fetchUserProfile, updateUserProfile, addFavorite, removeFavorite, addDownload } from '../lib/api';
import { 
  Search, Bell, Grid, List, Download, Clock, Disc, 
  Music2, Calendar, Filter, ChevronDown, Play, Heart,
  MoreVertical, Home as HomeIcon, TrendingUp, Sparkles,
  LayoutGrid, Settings, User, Layout, ChevronRight, X,
  GripVertical, Sun, Moon, Mail, ListMusic, BarChart3,
  Save, Plus, Check, Volume2, VolumeX, Pause, ExternalLink,
  CheckCircle, AlertCircle, Image, LogOut, CreditCard, 
  Monitor, Laptop, Smartphone, Palette
} from 'lucide-react';
import { format } from 'date-fns';
import { useTheme } from 'next-themes';
import { Reorder, useDragControls, AnimatePresence, motion } from 'framer-motion';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useToast } from "@/hooks/use-toast";

const DEMO_USER_ID = "demo-user";

// Complete 30 genre list with subgenres (only genres with actual subgenres have arrays)
// Removed Afro-House and Grime to keep exactly 30 genres
const GENRE_DATA: Record<string, string[]> = {
  "Pop": ["Synth Pop", "Dance Pop", "Indie Pop", "Art Pop", "Bubblegum Pop"],
  "Hip-Hop / Rap": ["Trap", "Drill", "Old School", "Boom Bap", "Conscious", "Mumble Rap", "G-Funk"],
  "R&B": ["Contemporary R&B", "Neo Soul", "Slow Jams", "New Jack Swing", "Alternative R&B"],
  "Rock": ["Alternative", "Indie Rock", "Classic Rock", "Hard Rock", "Soft Rock"],
  "Latin": ["Reggaeton", "Latin Pop", "Latin Trap", "Bachata", "Salsa", "Cumbia", "Dembow"],
  "Electronic / Dance": ["EDM", "Electro", "Big Room", "Future Bass", "Dubstep", "Drum & Bass"],
  "Afrobeats": ["Afro-Fusion", "Afro-Pop", "Naija Beats"],
  "Country": ["Country Pop", "Country Rock", "Americana", "Outlaw Country"],
  "K-Pop": [],
  "Indie / Alternative": ["Dream Pop", "Shoegaze", "Lo-Fi Indie", "Art Rock"],
  "Jazz": ["Smooth Jazz", "Bebop", "Jazz Fusion", "Acid Jazz"],
  "Metal": ["Heavy Metal", "Death Metal", "Nu Metal", "Metalcore", "Thrash"],
  "Punk": ["Pop Punk", "Hardcore", "Post-Punk", "Skate Punk"],
  "Classical": ["Orchestral", "Chamber", "Contemporary Classical"],
  "Reggae / Dancehall": ["Dancehall", "Dub", "Roots Reggae", "Lovers Rock"],
  "Blues": ["Delta Blues", "Chicago Blues", "Electric Blues"],
  "Folk / Americana": ["Acoustic Folk", "Folk Rock", "Traditional"],
  "House": ["Deep House", "Tech House", "Progressive House", "Future House", "Afro House", "Bass House"],
  "Drill": ["UK Drill", "Brooklyn Drill", "Chicago Drill"],
  "Gospel / CCM": ["Contemporary Christian", "Worship", "Traditional Gospel"],
  "Techno": ["Detroit Techno", "Minimal Techno", "Industrial Techno"],
  "Trance": ["Progressive Trance", "Uplifting Trance", "Psytrance", "Vocal Trance"],
  "Funk": ["P-Funk", "Electro Funk", "Disco Funk"],
  "Soul": ["Classic Soul", "Northern Soul", "Psychedelic Soul"],
  "Ska": [],
  "Lo-Fi / Chillhop": ["Study Beats", "Chill Beats", "Jazzhop"],
  "Ambient": ["Dark Ambient", "Space Ambient", "Drone"],
  "Throwbacks": ["90s Hits", "2000s Hits", "80s Classics", "Retro Mix"],
  "Remixes": ["Club Remixes", "Extended Mixes", "Mashups", "Bootlegs"],
  "World / Global Fusion": ["Afro-Cuban", "Brazilian", "Middle Eastern"],
};

// All available genres (30 total) in order of popularity
const ALL_GENRES = [
  "Pop", "Hip-Hop / Rap", "R&B", "Rock", "Latin", "Electronic / Dance", "Afrobeats",
  "Country", "K-Pop", "Indie / Alternative", "Jazz", "Metal", "Punk", "Classical",
  "Reggae / Dancehall", "Blues", "Folk / Americana", "House", "Drill", "Gospel / CCM",
  "Techno", "Trance", "Funk", "Soul", "Ska", "Lo-Fi / Chillhop", "Ambient", 
  "Throwbacks", "Remixes", "World / Global Fusion"
];

// Default 12 genres (including Afrobeats, Throwbacks, Remixes, and Funk as the 4th popular one)
// Note: "All Genres" is always first and cannot be removed
const DEFAULT_GENRES = [
  "All Genres", "Pop", "Hip-Hop / Rap", "R&B", "Latin", "Electronic / Dance", 
  "Afrobeats", "House", "Throwbacks", "Remixes", "Funk", "Rock"
];

const MAX_GENRES = 20;
const MIN_GENRES = 1;

const Home = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const { setTheme, theme, resolvedTheme } = useTheme();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Modal states
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [recentDownloadsOpen, setRecentDownloadsOpen] = useState(false);
  const [genreCustomizeOpen, setGenreCustomizeOpen] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState<{videoId: string, progress: number} | null>(null);
  const [selectedGenre, setSelectedGenre] = useState("All Genres");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);
  const [sortBy, setSortBy] = useState<'date' | 'title' | 'artist' | 'bpm' | 'key' | 'quality' | 'genre'>('date');
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  // Batch Selection
  const [selectedVideos, setSelectedVideos] = useState<Set<string>>(new Set());
  
  // Set Builder
  const [setBuilderOpen, setSetBuilderOpen] = useState(false);
  const [setBuilderTracks, setSetBuilderTracks] = useState<Video[]>([]);
  
  // Sidebar Active Section
  const [activeSection, setActiveSection] = useState('browse');
  
  // User Menu State
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  
  // Favorites (dummy data)
  const [favorites, setFavorites] = useState<string[]>([]);
  
  // Icon Customization
  const [profileIcon, setProfileIcon] = useState<string | null>(null);
  const [iconModalOpen, setIconModalOpen] = useState(false);
  const [iconModalTarget, setIconModalTarget] = useState<'profile' | 'playlist' | null>(null);
  const [selectedPlaylistIndex, setSelectedPlaylistIndex] = useState<number | null>(null);
  const [isDraggingIcon, setIsDraggingIcon] = useState(false);
  const iconInputRef = useRef<HTMLInputElement>(null);
  
  // Dummy data for Charts/Playlists with custom icons
  const dummyCharts = useMemo(() => [
    { name: 'Top 50 Club Hits', count: 50 },
    { name: 'Dance Floor Essentials', count: 35 },
    { name: 'Late Night Vibes', count: 28 },
  ], []);
  
  const [playlistIcons, setPlaylistIcons] = useState<Record<number, string | null>>({});
  const dummyPlaylists = useMemo(() => [
    { name: 'Weekend Bangers', count: 42, user: 'You' },
    { name: 'Warm Up Set', count: 18, user: 'You' },
    { name: 'Peak Hour Energy', count: 31, user: 'Staff Pick' },
  ], []);
  
  // Fetch videos with filters
  const { data: videos = [], isLoading } = useQuery({
    queryKey: ['videos', selectedGenre, searchQuery],
    queryFn: () => fetchVideos({ 
      genre: selectedGenre !== "All Genres" ? selectedGenre : undefined,
      search: searchQuery || undefined
    }),
  });

  // Fetch user profile
  const { data: userProfile } = useQuery({
    queryKey: ['userProfile', DEMO_USER_ID],
    queryFn: () => fetchUserProfile(DEMO_USER_ID),
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: (updates: any) => updateUserProfile(DEMO_USER_ID, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfile', DEMO_USER_ID] });
      toast({
        title: "Profile Saved",
        description: "Your layout preferences have been saved.",
      });
    },
  });

  // Compute sections from actual data
  const trendingVideos = useMemo(() => videos.filter(v => v.isHot).slice(0, 15), [videos]);
  const newReleases = useMemo(() => 
    [...videos].sort((a, b) => new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime()).slice(0, 15), 
    [videos]
  );
  const forYouVideos = useMemo(() => 
    videos.filter(v => v.genre === 'House' || v.genre === 'Progressive House').slice(0, 15),
    [videos]
  );

  // Duplicate videos for demo scrolling
  const allVideos = useMemo(() => [
    ...videos, ...videos, ...videos, ...videos
  ], [videos]);
  
  // Quality order for sorting
  const qualityOrder: Record<string, number> = { '4K': 4, '1080p': 3, '720p': 2, '480p': 1 };
  
  // Sort function based on sortBy state
  const sortVideos = (videoList: Video[]) => {
    return [...videoList].sort((a, b) => {
      switch (sortBy) {
        case 'date': return new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime();
        case 'title': return a.title.localeCompare(b.title);
        case 'artist': return a.artist.localeCompare(b.artist);
        case 'bpm': return (b.bpm || 0) - (a.bpm || 0);
        case 'key': return (a.key || '').localeCompare(b.key || '');
        case 'quality': return (qualityOrder[b.quality] || 0) - (qualityOrder[a.quality] || 0);
        case 'genre': return a.genre.localeCompare(b.genre);
        default: return 0;
      }
    });
  };

  // Draggable Sections State - includes browse-all as draggable
  const [sectionOrder, setSectionOrder] = useState(['new-releases', 'trending', 'for-you', 'browse-all']);
  
  // Compute sections based on order (browse-all shows all videos) - apply sorting
  const sectionDataMap: Record<string, { id: string; title: string; videos: Video[] }> = useMemo(() => ({
    'new-releases': { id: 'new-releases', title: 'New Releases', videos: sortVideos(newReleases) },
    'trending': { id: 'trending', title: 'Trending Now', videos: sortVideos(trendingVideos) },
    'for-you': { id: 'for-you', title: 'For You', videos: sortVideos(forYouVideos) },
    'browse-all': { id: 'browse-all', title: 'Browse All', videos: sortVideos(allVideos) },
  }), [newReleases, trendingVideos, forYouVideos, allVideos, sortBy]);
  
  const sections = useMemo(() => 
    sectionOrder.map(id => sectionDataMap[id]).filter(Boolean),
    [sectionOrder, sectionDataMap]
  );
  
  // Toggle favorite
  const toggleFavorite = (videoId: string) => {
    setFavorites(prev => 
      prev.includes(videoId) 
        ? prev.filter(id => id !== videoId)
        : [...prev, videoId]
    );
    toast({
      title: favorites.includes(videoId) ? "Removed from Favorites" : "Added to Favorites",
      description: favorites.includes(videoId) ? "Video removed from your favorites" : "Video added to your favorites",
    });
  };
  
  // Scroll to browse section
  const scrollToBrowse = () => {
    const browseSection = document.getElementById('browse-section');
    if (browseSection) {
      browseSection.scrollIntoView({ behavior: 'smooth' });
    }
    setActiveSection('browse');
  };
  
  // Scroll to top
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setActiveSection('browse');
  };

  // Draggable Genres State (default 12 genres)
  const [genres, setGenres] = useState(
    userProfile?.genreOrder || DEFAULT_GENRES
  );
  
  
  // Update genres when profile loads - ensure "All Genres" is always first
  useEffect(() => {
    if (userProfile?.genreOrder && userProfile.genreOrder.length > 0) {
      // Normalize: ensure "All Genres" is always first
      const filtered = userProfile.genreOrder.filter((g: string) => g !== "All Genres");
      const normalized = ["All Genres", ...filtered];
      setGenres(normalized);
    }
  }, [userProfile]);

  const handleSaveProfile = () => {
    // Ensure "All Genres" is always first before saving
    const hasAllGenres = genres.includes("All Genres");
    const normalizedGenres = hasAllGenres 
      ? ["All Genres", ...genres.filter(g => g !== "All Genres")]
      : ["All Genres", ...genres];
    
    updateProfileMutation.mutate({
      sectionOrder,
      genreOrder: normalizedGenres,
      viewMode,
    });
  };

  const handlePreview = (video: Video) => {
    setSelectedVideo(video);
    setPreviewModalOpen(true);
  };
  
  // Icon customization handlers
  const handleIconFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        if (iconModalTarget === 'profile') {
          setProfileIcon(dataUrl);
        } else if (iconModalTarget === 'playlist' && selectedPlaylistIndex !== null) {
          setPlaylistIcons(prev => ({ ...prev, [selectedPlaylistIndex]: dataUrl }));
        }
        setIconModalOpen(false);
        toast({ title: "Icon Updated", description: "Your custom icon has been applied." });
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleIconDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingIcon(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        if (iconModalTarget === 'profile') {
          setProfileIcon(dataUrl);
        } else if (iconModalTarget === 'playlist' && selectedPlaylistIndex !== null) {
          setPlaylistIcons(prev => ({ ...prev, [selectedPlaylistIndex]: dataUrl }));
        }
        setIconModalOpen(false);
        toast({ title: "Icon Updated", description: "Your custom icon has been applied." });
      };
      reader.readAsDataURL(file);
    }
  };
  
  const openIconModal = (target: 'profile' | 'playlist', playlistIndex?: number) => {
    setIconModalTarget(target);
    setSelectedPlaylistIndex(playlistIndex ?? null);
    setIconModalOpen(true);
  };

  const handleDownload = async (video: Video) => {
    setDownloadProgress({ videoId: video.id, progress: 0 });
    
    // Simulate download progress
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(r => setTimeout(r, 200));
      setDownloadProgress({ videoId: video.id, progress: i });
    }
    
    try {
      await addDownload(DEMO_USER_ID, video.id);
      toast({
        title: "Download Complete",
        description: `${video.title} has been downloaded.`,
      });
    } catch (e) {
      toast({
        title: "Download Started",
        description: `${video.title} is ready for download.`,
      });
    }
    
    setDownloadProgress(null);
  };

  const handleThemeToggle = () => {
    const newTheme = resolvedTheme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    document.documentElement.classList.toggle('light', newTheme === 'light');
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  // Batch Selection Handlers
  const handleVideoSelect = (videoId: string) => {
    setSelectedVideos(prev => {
      const next = new Set(prev);
      if (next.has(videoId)) {
        next.delete(videoId);
      } else {
        next.add(videoId);
      }
      return next;
    });
  };

  const handleBatchDownload = async () => {
    toast({
      title: "Batch Download Started",
      description: `Adding ${selectedVideos.size} tracks to download queue...`,
    });
    setSelectedVideos(new Set());
  };

  const handleAddToSet = () => {
    const tracksToAdd = videos.filter(v => selectedVideos.has(v.id));
    setSetBuilderTracks(prev => {
      const existingIds = new Set(prev.map(t => t.id));
      const newTracks = tracksToAdd.filter(t => !existingIds.has(t.id));
      return [...prev, ...newTracks];
    });
    toast({
      title: "Added to Set",
      description: `${tracksToAdd.length} tracks added to Set Builder`,
    });
    setSelectedVideos(new Set());
    setSetBuilderOpen(true);
  };

  const removeFromSet = (index: number) => {
    setSetBuilderTracks(prev => prev.filter((_, i) => i !== index));
  };

  // Set Builder Stats
  const setDuration = useMemo(() => {
    const totalSeconds = setBuilderTracks.reduce((acc, t) => {
      const parts = t.duration.split(':').map(Number);
      return acc + (parts[0] || 0) * 60 + (parts[1] || 0);
    }, 0);
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, [setBuilderTracks]);

  const setBpmRange = useMemo(() => {
    if (setBuilderTracks.length === 0) return '--';
    const bpms = setBuilderTracks.map(t => t.bpm);
    return `${Math.min(...bpms)}-${Math.max(...bpms)}`;
  }, [setBuilderTracks]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p style={{ color: 'var(--text-secondary)' }}>Loading videos...</p>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider delayDuration={300}>
      <div className="min-h-screen flex flex-col font-sans overflow-hidden" style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
        {/* Header */}
        <header className="flex items-center justify-between px-6 h-[72px] shrink-0 z-50 relative" style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-subtle)' }}>
          <div className="flex items-center gap-12 w-full">
            {/* LOGO */}
            <div className="logo flex items-center shrink-0">
              <img src="/logo.png" alt="The Video Pool" className="h-10 w-auto object-contain" />
            </div>
            
            {/* SEARCH with Auto-populate */}
            <div className="flex-1 flex justify-center max-w-2xl mx-auto">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2" size={18} style={{ color: 'var(--text-muted)' }} />
                <input 
                  ref={searchInputRef}
                  type="text" 
                  placeholder="Search artist, title, label, BPM, quality, genre..." 
                  value={searchQuery}
                  onChange={(e) => {
                    const query = e.target.value;
                    setSearchQuery(query);
                    if (query.length >= 2) {
                      const lowQuery = query.toLowerCase();
                      const suggestions: string[] = [];
                      videos.forEach(v => {
                        if (v.artist.toLowerCase().includes(lowQuery) && !suggestions.includes(`Artist: ${v.artist}`)) suggestions.push(`Artist: ${v.artist}`);
                        if (v.title.toLowerCase().includes(lowQuery) && !suggestions.includes(`Title: ${v.title}`)) suggestions.push(`Title: ${v.title}`);
                        if (v.label?.toLowerCase().includes(lowQuery) && !suggestions.includes(`Label: ${v.label}`)) suggestions.push(`Label: ${v.label}`);
                        if (v.genre.toLowerCase().includes(lowQuery) && !suggestions.includes(`Genre: ${v.genre}`)) suggestions.push(`Genre: ${v.genre}`);
                        if (v.quality.toLowerCase().includes(lowQuery) && !suggestions.includes(`Quality: ${v.quality}`)) suggestions.push(`Quality: ${v.quality}`);
                        if (v.bpm?.toString().includes(query)) suggestions.push(`BPM: ${v.bpm}`);
                      });
                      setSearchSuggestions(suggestions.slice(0, 8));
                      setShowSearchSuggestions(suggestions.length > 0);
                    } else {
                      setShowSearchSuggestions(false);
                    }
                  }}
                  onFocus={() => searchQuery.length >= 2 && searchSuggestions.length > 0 && setShowSearchSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSearchSuggestions(false), 150)}
                  className="w-full rounded-lg py-2.5 pl-10 pr-4 text-sm focus:outline-none transition-colors"
                  style={{ 
                    background: 'var(--bg-tertiary)', 
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-primary)'
                  }}
                  data-testid="input-search"
                />
                {searchQuery && (
                  <button 
                    onClick={() => { setSearchQuery(''); setShowSearchSuggestions(false); }}
                    className="absolute right-16 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded"
                  >
                    <X size={14} style={{ color: 'var(--text-muted)' }} />
                  </button>
                )}
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  <span className="text-[10px] px-1.5 py-0.5 rounded font-mono" style={{ background: 'var(--bg-primary)', color: 'var(--text-muted)', border: '1px solid var(--border-subtle)' }}>CMD+K</span>
                </div>
                {showSearchSuggestions && (
                  <div 
                    className="absolute top-full left-0 right-0 mt-1 rounded-lg shadow-xl overflow-hidden z-50"
                    style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)' }}
                  >
                    {searchSuggestions.map((suggestion, i) => (
                      <button
                        key={i}
                        className="w-full px-4 py-2.5 text-left text-sm hover:bg-cyan-400/10 flex items-center gap-2 transition-colors"
                        style={{ color: 'var(--text-primary)', borderBottom: i < searchSuggestions.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}
                        onMouseDown={() => {
                          const value = suggestion.split(': ')[1];
                          setSearchQuery(value);
                          setShowSearchSuggestions(false);
                        }}
                        data-testid={`search-suggestion-${i}`}
                      >
                        <Search size={14} className="text-cyan-400" />
                        <span className="text-cyan-400 font-medium">{suggestion.split(': ')[0]}:</span>
                        <span>{suggestion.split(': ')[1]}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              {/* THEME TOGGLE */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <button 
                    onClick={handleThemeToggle}
                    className="w-9 h-9 flex items-center justify-center rounded-lg transition-colors"
                    style={{ border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}
                  >
                    {resolvedTheme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{resolvedTheme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}</p>
                </TooltipContent>
              </Tooltip>

              {/* EMAIL */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="w-9 h-9 flex items-center justify-center rounded-lg transition-colors" style={{ border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
                    <Mail size={18} />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Email Us</p>
                </TooltipContent>
              </Tooltip>

              {/* SAVE PROFILE */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <button 
                    onClick={handleSaveProfile}
                    disabled={updateProfileMutation.isPending}
                    className="w-9 h-9 flex items-center justify-center rounded-lg transition-colors disabled:opacity-50"
                    style={{ border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}
                  >
                    <Save size={18} />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Save Profile</p>
                </TooltipContent>
              </Tooltip>

              {/* Layout Preset Selector */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="hidden lg:flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
                    <Layout size={16} />
                    <span className="font-medium">Club Mode</span>
                    <ChevronDown size={14} />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-64" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-default)' }}>
                  <DropdownMenuLabel>Layout Presets</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="flex items-center gap-3 py-3">
                    <Monitor size={18} className="text-cyan-400" />
                    <div className="flex-1">
                      <div className="font-medium flex items-center gap-2">Club Mode <CheckCircle size={12} className="text-cyan-400" /></div>
                      <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Large artwork, minimal info, quick access</div>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex items-center gap-3 py-3">
                    <Laptop size={18} />
                    <div className="flex-1">
                      <div className="font-medium">Prep Mode</div>
                      <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Full details, BPM/key visible, sort options</div>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex items-center gap-3 py-3">
                    <Smartphone size={18} />
                    <div className="flex-1">
                      <div className="font-medium">Mobile Mode</div>
                      <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Touch optimized, swipe gestures</div>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="flex items-center gap-3 py-3">
                    <Palette size={18} />
                    <div className="flex-1">
                      <div className="font-medium">Custom Layout</div>
                      <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Create your own layout preset</div>
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Notifications */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="w-9 h-9 flex items-center justify-center rounded-lg transition-colors relative" style={{ border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
                    <Bell size={18} />
                    <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full" style={{ border: '2px solid var(--bg-secondary)' }}></span>
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Notifications</p>
                </TooltipContent>
              </Tooltip>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div className="flex items-center gap-3 pl-4 cursor-pointer group" style={{ borderLeft: '1px solid var(--border-subtle)' }}>
                    <div className="text-right hidden md:block">
                      <div className="text-xs font-bold group-hover:text-cyan-400 transition-colors">{userProfile?.name || 'John Doe'}</div>
                      <div className="text-[10px] text-cyan-400">{userProfile?.plan === 'elite' ? 'Elite Plan' : 'Pro Plan'}</div>
                    </div>
                    {profileIcon ? (
                      <img src={profileIcon} alt="Profile" className="w-9 h-9 rounded-full object-cover hover:shadow-[0_0_15px_rgba(0,212,255,0.4)] transition-shadow" />
                    ) : (
                      <div className="w-9 h-9 bg-cyan-400 rounded-full flex items-center justify-center text-black font-bold text-sm hover:shadow-[0_0_15px_rgba(0,212,255,0.4)] transition-shadow">
                        {userProfile?.name?.split(' ').map(n => n[0]).join('') || 'JD'}
                      </div>
                    )}
                    <ChevronDown size={14} style={{ color: 'var(--text-muted)' }} />
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-default)' }}>
                  <DropdownMenuLabel>
                    <div className="flex items-center gap-3">
                      {profileIcon ? (
                        <img src={profileIcon} alt="Profile" className="w-10 h-10 rounded-full object-cover" />
                      ) : (
                        <div className="w-10 h-10 bg-cyan-400 rounded-full flex items-center justify-center text-black font-bold">
                          {userProfile?.name?.split(' ').map(n => n[0]).join('') || 'JD'}
                        </div>
                      )}
                      <div>
                        <div className="font-bold">{userProfile?.name || 'John Doe'}</div>
                        <div className="text-xs font-normal" style={{ color: 'var(--text-muted)' }}>{userProfile?.email || 'john@thevideopool.com'}</div>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="flex items-center gap-2">
                    <User size={14} /> Edit Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex items-center gap-2" onClick={() => openIconModal('profile')}>
                    <Image size={14} /> Change Avatar
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex items-center gap-2">
                    <Settings size={14} /> Account Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="flex items-center gap-2">
                    <CreditCard size={14} /> Billing & Plan
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex items-center gap-2">
                    <Download size={14} /> Download History
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="flex items-center gap-2 text-red-400">
                    <LogOut size={14} /> Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Genre Nav with Sub-menus */}
        <div className="shrink-0 h-[60px] flex items-center z-40 relative" style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-subtle)' }}>
          <div className="w-full flex items-center gap-2 overflow-x-auto no-scrollbar px-6">
            <Reorder.Group axis="x" values={genres} onReorder={setGenres} className="flex items-center gap-2">
              {genres.map((genre) => {
                const hasSubgenres = GENRE_DATA[genre] && GENRE_DATA[genre].length > 0;
                
                return (
                  <Reorder.Item key={genre} value={genre} className="flex-shrink-0">
                    {genre === "All Genres" ? (
                      <button 
                        onClick={() => setSelectedGenre("All Genres")}
                        className={`px-4 py-2 rounded-full text-xs font-medium transition-colors ${
                          selectedGenre === "All Genres" 
                          ? "bg-cyan-400 text-black" 
                          : ""
                        }`}
                        style={selectedGenre !== "All Genres" ? { background: 'var(--bg-tertiary)', color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)' } : undefined}
                      >
                        All Genres
                      </button>
                    ) : hasSubgenres ? (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button 
                            className={`flex items-center px-4 py-2 rounded-full text-xs font-medium transition-colors ${
                              selectedGenre === genre 
                              ? "bg-cyan-400 text-black" 
                              : ""
                            }`}
                            style={selectedGenre !== genre ? { background: 'var(--bg-tertiary)', color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)' } : undefined}
                          >
                            {genre} <ChevronDown size={10} className="ml-1" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent 
                          className="min-w-[200px] p-2" 
                          style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-default)' }}
                        >
                          <DropdownMenuItem 
                            onClick={() => setSelectedGenre(genre)} 
                            className="rounded-lg px-3 py-2.5 mb-1"
                            style={{ background: 'var(--bg-tertiary)' }}
                          >
                            <div className="flex items-center gap-2 w-full">
                              <Music2 size={14} className="text-cyan-400" />
                              <span className="font-semibold">All {genre}</span>
                              {selectedGenre === genre && <Check size={14} className="ml-auto text-cyan-400" />}
                            </div>
                          </DropdownMenuItem>
                          <div className="text-[10px] uppercase font-bold tracking-wider px-3 py-2" style={{ color: 'var(--text-muted)' }}>
                            Sub-genres
                          </div>
                          <div className="space-y-0.5">
                            {GENRE_DATA[genre]?.map((sub) => (
                              <DropdownMenuItem 
                                key={sub} 
                                onClick={() => {
                                  setSelectedGenre(genre);
                                  toast({ title: `Filtering by ${sub}`, description: `Showing ${sub} tracks` });
                                }}
                                className="rounded-lg px-3 py-2"
                              >
                                <span className="text-sm">{sub}</span>
                              </DropdownMenuItem>
                            ))}
                          </div>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    ) : (
                      <button 
                        onClick={() => setSelectedGenre(genre)}
                        className={`px-4 py-2 rounded-full text-xs font-medium transition-colors ${
                          selectedGenre === genre 
                          ? "bg-cyan-400 text-black" 
                          : ""
                        }`}
                        style={selectedGenre !== genre ? { background: 'var(--bg-tertiary)', color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)' } : undefined}
                      >
                        {genre}
                      </button>
                    )}
                  </Reorder.Item>
                );
              })}
            </Reorder.Group>
            <button 
              onClick={() => setGenreCustomizeOpen(true)}
              className="ml-auto flex items-center gap-1 px-3 py-1.5 rounded-full text-xs flex-shrink-0 transition-colors"
              style={{ border: '1px dashed var(--border-subtle)', color: 'var(--text-muted)' }}
            >
              <Settings size={12} /> Customize
            </button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <aside className="w-[240px] flex flex-col py-6 overflow-y-auto shrink-0 z-30 hidden md:flex" style={{ background: 'var(--bg-secondary)', borderRight: '1px solid var(--border-subtle)' }}>
            <div className="px-4 mb-6">
              <div className="text-xs font-bold uppercase tracking-wider mb-3 px-2" style={{ color: 'var(--text-muted)' }}>Navigate</div>
              <nav className="space-y-1">
                <NavItem icon={<HomeIcon size={18} />} label="The Pool" active={activeSection === 'browse'} onClick={scrollToTop} />
                <NavItem icon={<Search size={18} />} label="Browse All" onClick={scrollToBrowse} />
              </nav>
            </div>

            <div className="px-4 mb-6">
              <div className="text-xs font-bold uppercase tracking-wider mb-3 px-2" style={{ color: 'var(--text-muted)' }}>Discover</div>
              <nav className="space-y-1">
                <NavItem icon={<BarChart3 size={18} />} label="Charts" badge={dummyCharts.length.toString()} onClick={() => setActiveSection('charts')} active={activeSection === 'charts'} />
                <NavItem icon={<Sparkles size={18} />} label="For You" badge="AI" onClick={() => setActiveSection('for-you')} active={activeSection === 'for-you'} />
                <NavItem icon={<ListMusic size={18} />} label="Playlists" badge={dummyPlaylists.length.toString()} onClick={() => setActiveSection('playlists')} active={activeSection === 'playlists'} />
              </nav>
            </div>

            <div className="px-4 mb-6">
              <div className="text-xs font-bold uppercase tracking-wider mb-3 px-2" style={{ color: 'var(--text-muted)' }}>Library</div>
              <nav className="space-y-1">
                <NavItem icon={<Heart size={18} />} label="Favorites" badge={favorites.length > 0 ? favorites.length.toString() : undefined} onClick={() => setActiveSection('favorites')} active={activeSection === 'favorites'} />
                <NavItem icon={<LayoutGrid size={18} />} label="My Sets" badge={setBuilderTracks.length > 0 ? setBuilderTracks.length.toString() : undefined} onClick={() => setSetBuilderOpen(true)} />
              </nav>
            </div>
            
            {/* Downloads with Plan Info */}
            <div className="mt-auto px-4">
              <button 
                onClick={() => setRecentDownloadsOpen(true)}
                className="w-full rounded-xl p-4 transition-colors hover:ring-1 hover:ring-cyan-400/30"
                style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.15), rgba(0,212,255,0.15))', border: '1px solid var(--border-subtle)' }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Download size={16} className="text-cyan-400" />
                    <span className="text-sm font-bold">Downloads</span>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-400/20 text-cyan-400">{userProfile?.plan === 'elite' ? 'Elite' : 'Pro'}</span>
                </div>
                <div className="flex items-center justify-between text-xs mb-2" style={{ color: 'var(--text-muted)' }}>
                  <span>{userProfile?.downloadsRemaining || 0} remaining</span>
                  <span>200 total</span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-tertiary)' }}>
                  <div className="h-full bg-gradient-to-r from-purple-500 to-cyan-400" style={{ width: `${((userProfile?.downloadsRemaining || 0) / 200) * 100}%` }}></div>
                </div>
              </button>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 overflow-y-auto relative" style={{ background: 'var(--bg-primary)' }}>
            {/* Toolbar */}
            <div className="sticky top-0 z-30 backdrop-blur flex items-center justify-between px-6 py-3" style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-subtle)' }}>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>View:</span>
                  <div className="flex rounded-lg p-1" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)' }}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button 
                          onClick={() => setViewMode('grid')}
                          className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-cyan-400 text-black shadow-sm' : ''}`}
                          style={viewMode !== 'grid' ? { color: 'var(--text-muted)' } : undefined}
                        >
                          <Grid size={16} />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent><p>Tile View</p></TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button 
                          onClick={() => setViewMode('list')}
                          className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-cyan-400 text-black shadow-sm' : ''}`}
                          style={viewMode !== 'list' ? { color: 'var(--text-muted)' } : undefined}
                        >
                          <List size={16} />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent><p>List View</p></TooltipContent>
                    </Tooltip>
                  </div>
                </div>

                <div className="h-6 w-px" style={{ background: 'var(--border-subtle)' }}></div>

                {/* BPM & Sort Dropdowns */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
                      <Filter size={14} /> BPM Range <ChevronDown size={14} />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuLabel>Select Range</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>All BPM</DropdownMenuItem>
                    <DropdownMenuItem>70 - 100 BPM</DropdownMenuItem>
                    <DropdownMenuItem>100 - 120 BPM</DropdownMenuItem>
                    <DropdownMenuItem>120 - 130 BPM</DropdownMenuItem>
                    <DropdownMenuItem>130+ BPM</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }} data-testid="button-sort">
                      Sort By: {sortBy === 'date' ? 'Date Added' : sortBy.charAt(0).toUpperCase() + sortBy.slice(1)} <ChevronDown size={14} />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuLabel>Sort Options</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setSortBy('date')} data-testid="sort-date">{sortBy === 'date' && <Check size={14} className="mr-2 text-cyan-400" />} Date Added</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortBy('title')} data-testid="sort-title">{sortBy === 'title' && <Check size={14} className="mr-2 text-cyan-400" />} Title</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortBy('artist')} data-testid="sort-artist">{sortBy === 'artist' && <Check size={14} className="mr-2 text-cyan-400" />} Artist</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortBy('bpm')} data-testid="sort-bpm">{sortBy === 'bpm' && <Check size={14} className="mr-2 text-cyan-400" />} BPM</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortBy('key')} data-testid="sort-key">{sortBy === 'key' && <Check size={14} className="mr-2 text-cyan-400" />} Key</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setSortBy('quality')} data-testid="sort-quality">{sortBy === 'quality' && <Check size={14} className="mr-2 text-cyan-400" />} Quality</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortBy('genre')} data-testid="sort-genre">{sortBy === 'genre' && <Check size={14} className="mr-2 text-cyan-400" />} Genre</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setRecentDownloadsOpen(true)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                  style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}
                >
                  <Clock size={14} /> Recent Downloads <span className="bg-purple-600 text-white text-[10px] px-1.5 rounded-full ml-1">3</span>
                </button>
              </div>
            </div>

            <div className="p-8 pb-32 space-y-4">
              
              {/* Section-based content rendering */}
              {activeSection === 'charts' && (
                <div className="mb-8">
                  <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <BarChart3 size={24} className="text-cyan-400" />
                    Charts
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {dummyCharts.map((chart, i) => (
                      <div key={i} className="p-4 rounded-xl transition-colors hover:ring-1 hover:ring-cyan-400/30 cursor-pointer" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)' }}>
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center text-black font-bold text-xl">
                            #{i + 1}
                          </div>
                          <div>
                            <h3 className="font-bold">{chart.name}</h3>
                            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{chart.count} tracks</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeSection === 'for-you' && (
                <div className="mb-8">
                  <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <Sparkles size={24} className="text-cyan-400" />
                    For You (AI Recommendations)
                  </h2>
                  <div className="p-6 rounded-xl mb-6" style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.2), rgba(0,212,255,0.2))', border: '1px solid var(--border-subtle)' }}>
                    <p className="text-sm mb-2" style={{ color: 'var(--text-muted)' }}>Based on your listening history</p>
                    <p className="font-medium">We've curated these tracks just for you based on your preferences for House, Progressive, and Deep House.</p>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {forYouVideos.slice(0, 10).map((video, i) => (
                      <VideoCard 
                        key={`for-you-${video.id}-${i}`} 
                        video={video} 
                        onPreview={handlePreview}
                        onDownload={handleDownload}
                        downloadProgress={downloadProgress}
                        isSelected={selectedVideos.has(video.id)}
                        onSelect={handleVideoSelect}
                        onFavorite={toggleFavorite}
                        isFavorite={favorites.includes(video.id)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {activeSection === 'playlists' && (
                <div className="mb-8">
                  <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <ListMusic size={24} className="text-cyan-400" />
                    Playlists
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {dummyPlaylists.map((playlist, i) => (
                      <div key={i} className="p-4 rounded-xl transition-colors hover:ring-1 hover:ring-cyan-400/30 cursor-pointer group" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)' }}>
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            {playlistIcons[i] ? (
                              <img src={playlistIcons[i]!} alt={playlist.name} className="w-16 h-16 rounded-lg object-cover" />
                            ) : (
                              <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                                <ListMusic size={24} className="text-white" />
                              </div>
                            )}
                            <button 
                              onClick={(e) => { e.stopPropagation(); openIconModal('playlist', i); }}
                              className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                              data-testid={`button-change-playlist-icon-${i}`}
                            >
                              <Image size={20} className="text-white" />
                            </button>
                          </div>
                          <div className="flex-1">
                            <h3 className="font-bold">{playlist.name}</h3>
                            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{playlist.count} tracks · {playlist.user}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                    <button className="p-4 rounded-xl transition-colors hover:ring-1 hover:ring-cyan-400/30 flex items-center justify-center gap-2" style={{ background: 'var(--bg-tertiary)', border: '1px dashed var(--border-subtle)' }}>
                      <Plus size={20} className="text-cyan-400" />
                      <span>Create Playlist</span>
                    </button>
                  </div>
                </div>
              )}

              {activeSection === 'favorites' && (
                <div className="mb-8">
                  <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <Heart size={24} className="text-pink-500" />
                    Favorites
                    <span className="text-sm font-normal" style={{ color: 'var(--text-muted)' }}>({favorites.length} tracks)</span>
                  </h2>
                  {favorites.length === 0 ? (
                    <div className="text-center py-16 rounded-xl" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)' }}>
                      <Heart size={48} className="mx-auto mb-4 text-pink-500/30" />
                      <h3 className="font-bold mb-2">No favorites yet</h3>
                      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Click the heart icon on any track to add it to your favorites</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                      {videos.filter(v => favorites.includes(v.id)).map((video, i) => (
                        <VideoCard 
                          key={`fav-${video.id}-${i}`} 
                          video={video} 
                          onPreview={handlePreview}
                          onDownload={handleDownload}
                          downloadProgress={downloadProgress}
                          isSelected={selectedVideos.has(video.id)}
                          onSelect={handleVideoSelect}
                          onFavorite={toggleFavorite}
                          isFavorite={true}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Draggable/Customizable Sections - Show when on browse */}
              {(activeSection === 'browse') && (
                <Reorder.Group axis="y" values={sections} onReorder={(newOrder) => setSectionOrder(newOrder.map(s => s.id))} className="space-y-4">
                  {sections.map((section) => (
                    <SortableSectionItem 
                      key={section.id} 
                      section={section} 
                      viewMode={viewMode}
                      onPreview={handlePreview}
                      onDownload={handleDownload}
                      downloadProgress={downloadProgress}
                      selectedVideos={selectedVideos}
                      onSelect={handleVideoSelect}
                      onFavorite={toggleFavorite}
                      favorites={favorites}
                    />
                  ))}
                </Reorder.Group>
              )}

              {/* Browse Section ID for scroll targeting */}
              <div id="browse-section"></div>
            </div>
          </main>
        </div>

        {/* Preview Modal - Fixed scrollable */}
        <Dialog open={previewModalOpen} onOpenChange={setPreviewModalOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-default)' }}>
            {selectedVideo && (
              <div className="flex flex-col md:flex-row max-h-[90vh]">
                {/* Video Preview */}
                <div className="relative aspect-video md:w-1/2 shrink-0" style={{ background: 'var(--bg-primary)' }}>
                  <img src={selectedVideo.thumbnail} alt={selectedVideo.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                    <button className="w-16 h-16 bg-cyan-400 rounded-full flex items-center justify-center text-black hover:scale-110 transition-transform shadow-[0_0_30px_rgba(0,212,255,0.5)]">
                      <Play size={28} fill="black" className="ml-1" />
                    </button>
                  </div>
                  <div className="absolute top-4 left-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      selectedVideo.quality === '4K' ? 'bg-yellow-400 text-black' : 'bg-cyan-400 text-black'
                    }`}>
                      {selectedVideo.quality}
                    </span>
                  </div>
                </div>
                
                {/* Info Panel - Scrollable */}
                <div className="md:w-1/2 p-6 flex flex-col overflow-y-auto max-h-[60vh] md:max-h-[90vh]">
                  <DialogHeader className="shrink-0">
                    <DialogTitle className="text-xl leading-tight line-clamp-2">{selectedVideo.title}</DialogTitle>
                    <DialogDescription className="text-base leading-tight line-clamp-2" style={{ color: 'var(--text-secondary)' }}>{selectedVideo.artist}</DialogDescription>
                  </DialogHeader>
                  
                  {/* Metadata */}
                  <div className="grid grid-cols-4 gap-2 my-4 py-4" style={{ borderTop: '1px solid var(--border-subtle)', borderBottom: '1px solid var(--border-subtle)' }}>
                    <div className="text-center">
                      <div className="text-[10px] uppercase mb-1" style={{ color: 'var(--text-muted)' }}>BPM</div>
                      <div className="text-base font-bold text-cyan-400">{selectedVideo.bpm}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-[10px] uppercase mb-1" style={{ color: 'var(--text-muted)' }}>Key</div>
                      <div className="text-base font-bold text-cyan-400">{selectedVideo.key}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-[10px] uppercase mb-1" style={{ color: 'var(--text-muted)' }}>Duration</div>
                      <div className="text-base font-bold text-cyan-400">{selectedVideo.duration}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-[10px] uppercase mb-1" style={{ color: 'var(--text-muted)' }}>Genre</div>
                      <div className="text-base font-bold text-cyan-400 truncate">{selectedVideo.genre}</div>
                    </div>
                  </div>

                  {/* Version Selection with Collapsible */}
                  <Collapsible defaultOpen className="mb-3">
                    <CollapsibleTrigger className="flex items-center justify-between w-full py-2">
                      <span className="text-xs uppercase font-bold" style={{ color: 'var(--text-muted)' }}>Available Versions</span>
                      <ChevronDown size={14} style={{ color: 'var(--text-muted)' }} />
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="space-y-1.5 mt-2">
                        {['Clean Edit', 'Dirty', 'Extended Mix', 'Intro Edit', 'Quick Edit', 'Acapella'].map((version) => (
                          <label key={version} className="flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors hover:ring-1 hover:ring-cyan-400/30" style={{ background: 'var(--bg-tertiary)' }}>
                            <input type="radio" name="version" className="accent-cyan-400" defaultChecked={version === 'Clean Edit'} />
                            <span className="text-sm">{version}</span>
                            <span className="ml-auto text-xs" style={{ color: 'var(--text-muted)' }}>
                              {version === 'Extended Mix' ? '06:45' : version === 'Intro Edit' ? '04:30' : '03:45'}
                            </span>
                          </label>
                        ))}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>

                  {/* Download Options with Collapsible */}
                  <Collapsible defaultOpen className="mb-3">
                    <CollapsibleTrigger className="flex items-center justify-between w-full py-2">
                      <span className="text-xs uppercase font-bold" style={{ color: 'var(--text-muted)' }}>Download Options</span>
                      <ChevronDown size={14} style={{ color: 'var(--text-muted)' }} />
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="space-y-2 mt-2">
                        <div>
                          <label className="text-xs mb-1 block" style={{ color: 'var(--text-muted)' }}>Video Quality</label>
                          <select className="w-full p-2.5 rounded-lg text-sm" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}>
                            <option>4K UHD (2160p) - ~185 MB</option>
                            <option>1080p Full HD - ~95 MB</option>
                            <option>720p HD - ~45 MB</option>
                            <option>Audio Only</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-xs mb-1 block" style={{ color: 'var(--text-muted)' }}>Audio Quality</label>
                          <select className="w-full p-2.5 rounded-lg text-sm" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}>
                            <option>WAV Lossless - ~42 MB</option>
                            <option>320 kbps MP3 - ~8 MB</option>
                            <option>256 kbps MP3 - ~6 MB</option>
                            <option>Video Only</option>
                          </select>
                        </div>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>

                  <div className="flex gap-3 mt-auto pt-4 shrink-0">
                    <button 
                      onClick={() => {
                        handleDownload(selectedVideo);
                        setPreviewModalOpen(false);
                      }}
                      className="flex-1 py-3 bg-cyan-400 text-black font-bold rounded-lg hover:bg-cyan-300 transition-colors flex items-center justify-center gap-2"
                    >
                      <Download size={18} /> Download
                    </button>
                    <button 
                      onClick={() => toggleFavorite(selectedVideo.id)}
                      className={`py-3 px-4 rounded-lg transition-colors ${favorites.includes(selectedVideo.id) ? 'bg-pink-500/20 text-pink-500' : ''}`}
                      style={!favorites.includes(selectedVideo.id) ? { background: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)' } : { border: '1px solid rgba(236,72,153,0.3)' }}
                    >
                      <Heart size={18} fill={favorites.includes(selectedVideo.id) ? 'currentColor' : 'none'} />
                    </button>
                    <button 
                      onClick={() => {
                        setSetBuilderTracks(prev => [...prev, selectedVideo]);
                        toast({ title: "Added to Set", description: `${selectedVideo.title} added to Set Builder` });
                      }}
                      className="py-3 px-4 rounded-lg transition-colors" 
                      style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)' }}
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Recent Downloads Modal */}
        <Dialog open={recentDownloadsOpen} onOpenChange={setRecentDownloadsOpen}>
          <DialogContent className="max-w-lg" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-default)' }}>
            <DialogHeader>
              <DialogTitle>Recent Downloads</DialogTitle>
              <DialogDescription>Your download history from this session</DialogDescription>
            </DialogHeader>
            <div className="space-y-3 mt-4">
              {videos.slice(0, 5).map((video, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg" style={{ background: 'var(--bg-tertiary)' }}>
                  <img src={video.thumbnail} alt="" className="w-12 h-8 rounded object-cover" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{video.title}</div>
                    <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{video.artist}</div>
                  </div>
                  <CheckCircle size={16} className="text-green-500" />
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>

        {/* Icon Customization Modal */}
        <Dialog open={iconModalOpen} onOpenChange={setIconModalOpen}>
          <DialogContent className="max-w-md" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-default)' }}>
            <DialogHeader>
              <DialogTitle>
                {iconModalTarget === 'profile' ? 'Change Profile Picture' : 'Change Playlist Icon'}
              </DialogTitle>
              <DialogDescription>
                Drag and drop an image or browse your files to select a custom icon.
              </DialogDescription>
            </DialogHeader>
            
            <div 
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${isDraggingIcon ? 'border-cyan-400 bg-cyan-400/10' : 'border-gray-600'}`}
              onDragOver={(e) => { e.preventDefault(); setIsDraggingIcon(true); }}
              onDragLeave={() => setIsDraggingIcon(false)}
              onDrop={handleIconDrop}
            >
              <div className="mb-4">
                {iconModalTarget === 'profile' && profileIcon ? (
                  <img src={profileIcon} alt="Current" className="w-20 h-20 rounded-full object-cover mx-auto" />
                ) : iconModalTarget === 'playlist' && selectedPlaylistIndex !== null && playlistIcons[selectedPlaylistIndex] ? (
                  <img src={playlistIcons[selectedPlaylistIndex]!} alt="Current" className="w-20 h-20 rounded-xl object-cover mx-auto" />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-cyan-400/20 flex items-center justify-center mx-auto">
                    <Image size={32} className="text-cyan-400" />
                  </div>
                )}
              </div>
              <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
                {isDraggingIcon ? 'Drop your image here!' : 'Drag and drop an image here'}
              </p>
              <button
                onClick={() => iconInputRef.current?.click()}
                className="px-4 py-2 bg-cyan-400 text-black font-bold rounded-lg hover:bg-cyan-300 transition-colors"
                data-testid="button-browse-icon"
              >
                Browse Files
              </button>
              <input
                ref={iconInputRef}
                type="file"
                accept="image/*"
                onChange={handleIconFileSelect}
                className="hidden"
              />
            </div>
            
            {((iconModalTarget === 'profile' && profileIcon) || 
              (iconModalTarget === 'playlist' && selectedPlaylistIndex !== null && playlistIcons[selectedPlaylistIndex])) && (
              <button
                onClick={() => {
                  if (iconModalTarget === 'profile') {
                    setProfileIcon(null);
                  } else if (selectedPlaylistIndex !== null) {
                    setPlaylistIcons(prev => ({ ...prev, [selectedPlaylistIndex]: null }));
                  }
                  setIconModalOpen(false);
                  toast({ title: "Icon Removed", description: "Default icon restored." });
                }}
                className="w-full py-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors text-sm"
              >
                Remove Custom Icon
              </button>
            )}
          </DialogContent>
        </Dialog>

        {/* Genre Customization Modal */}
        <Dialog open={genreCustomizeOpen} onOpenChange={setGenreCustomizeOpen}>
          <DialogContent className="max-w-lg max-h-[85vh] overflow-hidden flex flex-col" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-default)' }}>
            <DialogHeader>
              <DialogTitle>Customize Genres</DialogTitle>
              <DialogDescription>
                Select up to {MAX_GENRES} genres. Currently showing {genres.length - 1} of {MAX_GENRES} max.
              </DialogDescription>
            </DialogHeader>
            
            {/* Current Genres - Draggable */}
            <div className="flex-1 overflow-y-auto">
              <div className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>
                Your Genres (drag to reorder)
              </div>
              <Reorder.Group axis="y" values={genres} onReorder={setGenres} className="space-y-1.5 mb-4">
                {genres.map((genre) => (
                  <Reorder.Item key={genre} value={genre} className="flex items-center gap-2 p-2.5 rounded-lg cursor-grab" style={{ background: 'var(--bg-tertiary)' }}>
                    <GripVertical size={14} style={{ color: 'var(--text-muted)' }} />
                    <span className="flex-1 text-sm">{genre}</span>
                    {GENRE_DATA[genre] && GENRE_DATA[genre].length > 0 && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: 'var(--bg-primary)', color: 'var(--text-muted)' }}>
                        {GENRE_DATA[genre].length} subs
                      </span>
                    )}
                    {genre !== "All Genres" && (
                      <button 
                        onClick={() => {
                          // Enforce minimum: "All Genres" + at least MIN_GENRES other genres
                          const nonAllGenresCount = genres.filter(g => g !== "All Genres").length;
                          if (nonAllGenresCount > MIN_GENRES) {
                            setGenres(genres.filter(g => g !== genre));
                          } else {
                            toast({ title: "Minimum reached", description: `You must keep at least ${MIN_GENRES} genre(s) besides "All Genres"` });
                          }
                        }}
                        className="p-1 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded transition-colors"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </Reorder.Item>
                ))}
              </Reorder.Group>

              {/* Available Genres to Add */}
              <div className="text-xs font-bold uppercase tracking-wider mb-2 mt-4" style={{ color: 'var(--text-muted)' }}>
                Available Genres (click to add) - {ALL_GENRES.filter(g => !genres.includes(g)).length} remaining
              </div>
              <div className="flex flex-wrap gap-1.5">
                {ALL_GENRES.filter(g => !genres.includes(g)).map((genre) => (
                  <button
                    key={genre}
                    onClick={() => {
                      // Ensure we always have "All Genres" first
                      const hasAllGenres = genres.includes("All Genres");
                      const baseGenres = hasAllGenres ? genres : ["All Genres", ...genres];
                      
                      if (baseGenres.length < MAX_GENRES + 1) {
                        setGenres([...baseGenres, genre]);
                      } else {
                        toast({ title: "Maximum reached", description: `You can only have ${MAX_GENRES} genres (plus "All Genres")` });
                      }
                    }}
                    disabled={genres.length >= MAX_GENRES + 1}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:ring-1 hover:ring-cyan-400/50"
                    style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)' }}
                  >
                    <Plus size={10} className="text-cyan-400" />
                    {genre}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3 mt-4 pt-4" style={{ borderTop: '1px solid var(--border-subtle)' }}>
              <button 
                onClick={() => {
                  setGenres(DEFAULT_GENRES);
                  toast({ title: "Reset to defaults", description: "Genre selection restored to 12 defaults" });
                }}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)' }}
              >
                Reset to Default
              </button>
              <button 
                onClick={() => {
                  setGenreCustomizeOpen(false);
                  handleSaveProfile();
                }}
                className="flex-1 py-2 bg-cyan-400 text-black font-bold rounded-lg"
              >
                Save Changes
              </button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Batch Selection Bar */}
        <AnimatePresence>
          {selectedVideos.size > 0 && (
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 px-6 py-3 rounded-xl shadow-xl"
              style={{ background: 'var(--bg-secondary)', border: '1px solid var(--accent-cyan)' }}
            >
              <span className="text-sm font-medium">
                <span className="text-cyan-400 font-bold">{selectedVideos.size}</span> tracks selected
              </span>
              <div className="h-6 w-px" style={{ background: 'var(--border-subtle)' }}></div>
              <button 
                onClick={handleBatchDownload}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-400 text-black font-medium text-sm hover:bg-cyan-300 transition-colors"
              >
                <Download size={16} /> Download All
              </button>
              <button 
                onClick={handleAddToSet}
                className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors"
                style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)' }}
              >
                <Plus size={16} /> Add to Set
              </button>
              <button 
                onClick={() => setSelectedVideos(new Set())}
                className="p-2 rounded-lg transition-colors hover:bg-red-500/20"
                style={{ color: 'var(--text-muted)' }}
              >
                <X size={16} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Set Builder Panel */}
        <AnimatePresence>
          {setBuilderOpen && (
            <motion.div
              initial={{ x: 400 }}
              animate={{ x: 0 }}
              exit={{ x: 400 }}
              className="fixed right-0 top-0 h-full w-[360px] z-50 flex flex-col shadow-2xl"
              style={{ background: 'var(--bg-secondary)', borderLeft: '1px solid var(--border-subtle)' }}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-4" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <div className="flex items-center gap-3">
                  <ListMusic size={20} className="text-cyan-400" />
                  <h3 className="font-bold">Set Builder</h3>
                  <span className="px-2 py-0.5 rounded-full text-xs bg-cyan-400 text-black font-bold">{setBuilderTracks.length}</span>
                </div>
                <button onClick={() => setSetBuilderOpen(false)} className="p-2 rounded-lg transition-colors" style={{ color: 'var(--text-muted)' }}>
                  <X size={18} />
                </button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 p-4" style={{ background: 'var(--bg-tertiary)', borderBottom: '1px solid var(--border-subtle)' }}>
                <div className="text-center">
                  <div className="text-xl font-bold text-cyan-400">{setBuilderTracks.length}</div>
                  <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Tracks</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-cyan-400">{setDuration}</div>
                  <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Duration</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-cyan-400">{setBpmRange}</div>
                  <div className="text-xs" style={{ color: 'var(--text-muted)' }}>BPM Range</div>
                </div>
              </div>

              {/* Tracks List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {setBuilderTracks.length === 0 ? (
                  <div className="text-center py-12" style={{ color: 'var(--text-muted)' }}>
                    <Disc size={48} className="mx-auto mb-4 opacity-50" />
                    <p className="font-medium">No tracks in your set</p>
                    <p className="text-xs mt-2">Select tracks and click "Add to Set"</p>
                  </div>
                ) : (
                  setBuilderTracks.map((track, index) => (
                    <div 
                      key={track.id}
                      className="flex items-center gap-3 p-2 rounded-lg transition-colors"
                      style={{ background: 'var(--bg-tertiary)' }}
                    >
                      <div className="w-6 h-6 rounded-full bg-cyan-400/20 text-cyan-400 text-xs font-bold flex items-center justify-center">
                        {index + 1}
                      </div>
                      <img src={track.thumbnail} alt="" className="w-12 h-7 rounded object-cover" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{track.title}</div>
                        <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                          {track.bpm} BPM · {track.key}
                        </div>
                      </div>
                      <button 
                        onClick={() => removeFromSet(index)}
                        className="p-1.5 rounded transition-colors hover:bg-red-500/20 text-red-400"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Footer */}
              {setBuilderTracks.length > 0 && (
                <div className="p-4" style={{ borderTop: '1px solid var(--border-subtle)' }}>
                  <button className="w-full py-3 bg-cyan-400 text-black font-bold rounded-lg hover:bg-cyan-300 transition-colors flex items-center justify-center gap-2">
                    <Download size={18} /> Download Set
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Set Builder Toggle Button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => setSetBuilderOpen(!setBuilderOpen)}
              className="fixed right-6 bottom-6 z-40 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110"
              style={{ 
                background: setBuilderTracks.length > 0 ? 'var(--accent-cyan)' : 'var(--bg-secondary)', 
                color: setBuilderTracks.length > 0 ? '#000' : 'var(--text-secondary)',
                border: '1px solid var(--border-subtle)'
              }}
            >
              <ListMusic size={24} />
              {setBuilderTracks.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {setBuilderTracks.length}
                </span>
              )}
            </button>
          </TooltipTrigger>
          <TooltipContent side="left">
            <p>Set Builder</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
};

const NavItem = ({ icon, label, active = false, badge, onClick }: { icon: React.ReactNode, label: string, active?: boolean, badge?: string, onClick?: () => void }) => (
  <a 
    href="#" 
    onClick={(e) => { e.preventDefault(); onClick?.(); }}
    className={`flex items-center justify-between px-3 py-2 mx-2 rounded-lg text-sm font-medium transition-colors group ${active ? 'bg-cyan-400/10 text-cyan-400' : ''}`}
    style={!active ? { color: 'var(--text-secondary)' } : undefined}
  >
    <div className="flex items-center gap-3">
      <span className="group-hover:text-cyan-400 transition-colors">{icon}</span>
      <span>{label}</span>
    </div>
    {badge && (
      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)' }}>{badge}</span>
    )}
  </a>
);

const SortableSectionItem = ({ section, viewMode, onPreview, onDownload, downloadProgress, selectedVideos, onSelect, onFavorite, favorites }: any) => {
  const controls = useDragControls();

  return (
    <Reorder.Item value={section} dragListener={false} dragControls={controls}>
      <CollapsibleSection 
        sectionId={section.id}
        title={section.title} 
        videos={section.videos} 
        viewMode={viewMode}
        dragControls={controls}
        onPreview={onPreview}
        onDownload={onDownload}
        downloadProgress={downloadProgress}
        selectedVideos={selectedVideos}
        onSelect={onSelect}
        onFavorite={onFavorite}
        favorites={favorites}
      />
    </Reorder.Item>
  );
};

const CollapsibleSection = ({ sectionId, title, videos, viewMode, dragControls, onPreview, onDownload, downloadProgress, selectedVideos, onSelect, onFavorite, favorites }: any) => {
  const [isOpen, setIsOpen] = useState(sectionId === 'browse-all');
  const isBrowseAll = sectionId === 'browse-all';

  return (
    <Collapsible 
      open={isOpen} 
      onOpenChange={setIsOpen} 
      className="rounded-xl overflow-hidden"
      style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)' }}
    >
      <div className="flex items-center px-4 py-3 transition-colors" style={{ background: isBrowseAll ? 'linear-gradient(90deg, var(--bg-tertiary), rgba(0,212,255,0.1))' : 'var(--bg-tertiary)' }}>
        <div onPointerDown={(e) => dragControls.start(e)} className="cursor-grab mr-3 touch-none hover:text-cyan-400" style={{ color: 'var(--text-muted)' }}>
          <GripVertical size={16} />
        </div>
        
        <CollapsibleTrigger asChild>
          <button className="flex-1 flex items-center justify-between group">
            <h2 className={`text-sm font-bold uppercase tracking-wide group-hover:text-cyan-400 transition-colors ${isBrowseAll ? 'text-cyan-400' : ''}`} style={!isBrowseAll ? { color: 'var(--text-muted)' } : undefined}>
              {title}
              {isBrowseAll && <span className="ml-2 text-xs font-normal" style={{ color: 'var(--text-muted)' }}>({videos.length} videos)</span>}
            </h2>
            <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-muted)' }}>
              <span>{isOpen ? 'Collapse' : 'Expand'}</span>
              <ChevronRight size={16} className={`transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`} />
            </div>
          </button>
        </CollapsibleTrigger>
      </div>

      <CollapsibleContent>
        <div 
          className="p-4" 
          style={{ 
            background: isBrowseAll ? 'linear-gradient(to bottom, var(--bg-secondary), var(--bg-primary))' : 'var(--bg-primary)', 
            borderTop: '1px solid var(--border-subtle)' 
          }}
        >
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
              {videos.map((video: Video, i: number) => (
                <VideoCard 
                  key={`${video.id}-sec-${i}`} 
                  video={video} 
                  onPreview={onPreview} 
                  onDownload={onDownload} 
                  downloadProgress={downloadProgress}
                  isSelected={selectedVideos?.has(video.id)}
                  onSelect={onSelect}
                  onFavorite={onFavorite}
                  isFavorite={favorites?.includes(video.id)}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col rounded-lg overflow-hidden" style={{ border: '1px solid var(--border-subtle)' }}>
              <div className="grid grid-cols-[30px_50px_80px_1.5fr_1.5fr_1.5fr_1fr_100px_80px_80px_100px_100px] gap-4 px-4 py-2 text-[10px] font-bold uppercase tracking-wider" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-muted)' }}>
                <div></div>
                <div className="text-center">Play</div>
                <div>Preview</div>
                <div>Artist</div>
                <div>Title</div>
                <div>Label</div>
                <div>Genre</div>
                <div>BPM/Key</div>
                <div>Quality</div>
                <div>Ver</div>
                <div>Date</div>
                <div>Actions</div>
              </div>
              {videos.map((video: Video, i: number) => (
                <VideoListItem 
                  key={`${video.id}-list-${i}`} 
                  video={video} 
                  index={i} 
                  onPreview={onPreview} 
                  onDownload={onDownload} 
                  downloadProgress={downloadProgress}
                  isSelected={selectedVideos?.has(video.id)}
                  onSelect={onSelect}
                  onFavorite={onFavorite}
                  isFavorite={favorites?.includes(video.id)}
                />
              ))}
            </div>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

const VideoCard = ({ video, onPreview, onDownload, downloadProgress, isSelected, onSelect, onFavorite, isFavorite }: { 
  video: Video, 
  onPreview: (v: Video) => void, 
  onDownload: (v: Video) => void, 
  downloadProgress: any,
  isSelected?: boolean,
  onSelect?: (id: string) => void,
  onFavorite?: (id: string) => void,
  isFavorite?: boolean
}) => {
  const isDownloading = downloadProgress?.videoId === video.id;

  return (
    <div 
      className={`group rounded-xl overflow-hidden hover:-translate-y-1 hover:shadow-[0_4px_20px_rgba(0,0,0,0.4)] transition-all duration-300 w-full cursor-pointer ${isSelected ? 'ring-2 ring-cyan-400' : ''}`}
      style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)' }}
      onClick={() => onPreview(video)}
    >
      <div className="relative aspect-video overflow-hidden" style={{ background: 'var(--bg-tertiary)' }}>
        <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <button className="w-10 h-10 bg-cyan-400 rounded-full flex items-center justify-center text-black transform scale-90 group-hover:scale-100 transition-transform shadow-[0_0_20px_rgba(0,212,255,0.5)]">
            <Play size={20} fill="black" className="ml-1" />
          </button>
        </div>
        {/* Selection Checkbox */}
        {onSelect && (
          <button
            onClick={(e) => { e.stopPropagation(); onSelect(video.id); }}
            className={`absolute top-2 right-2 w-6 h-6 rounded-md flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 ${isSelected ? 'opacity-100 bg-cyan-400 text-black' : ''}`}
            style={{ background: isSelected ? undefined : 'rgba(0,0,0,0.6)', border: '2px solid white' }}
          >
            {isSelected && <Check size={14} />}
          </button>
        )}
        <div className="absolute top-2 left-2 flex gap-1">
          {video.isNew && <span className="bg-orange-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-lg">NEW</span>}
          {video.isHot && <span className="bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-lg">HOT</span>}
        </div>
        <div className={`absolute bottom-2 left-2 px-1.5 py-0.5 rounded text-[9px] font-bold ${
          video.quality === '4K' ? 'bg-yellow-400 text-black' : 
          video.quality === '1080p' ? 'bg-cyan-400 text-black' : 'bg-black/60 text-white'
        }`}>
          {video.quality}
        </div>
        <div className="absolute bottom-2 right-2 bg-black/80 text-white text-[9px] font-mono px-1.5 py-0.5 rounded">
          {video.duration}
        </div>
      </div>
      
      <div className="p-3">
        <div className="mb-1">
          <h3 className="font-semibold text-xs line-clamp-2 leading-snug group-hover:text-cyan-400 transition-colors" title={video.title}>
            {video.title}
          </h3>
          <p className="text-[11px] line-clamp-2 leading-snug" style={{ color: 'var(--text-muted)' }} title={video.artist}>{video.artist}</p>
        </div>
        
        <div className="flex items-center gap-1.5 mb-2">
          <Disc size={10} style={{ color: 'var(--text-muted)' }} />
          <span className="text-[10px] truncate" style={{ color: 'var(--text-muted)' }}>{video.label}</span>
        </div>
        
        <div className="flex items-center gap-2 text-[10px] font-mono mb-2" style={{ color: 'var(--text-muted)' }}>
          <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{video.bpm}</span>
          <span className="w-0.5 h-3" style={{ background: 'var(--border-subtle)' }}></span>
          <span className="text-cyan-400">{video.key}</span>
        </div>

        <div className="flex items-center justify-between pt-2" style={{ borderTop: '1px solid var(--border-subtle)' }}>
          <span className="text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>{format(new Date(video.uploadDate), 'MMM d')}</span>
          <div className="flex items-center gap-1">
            <button 
              onClick={(e) => { e.stopPropagation(); onDownload(video); }}
              className="p-1 rounded transition-colors hover:text-cyan-400"
              style={{ color: 'var(--text-muted)' }}
            >
              {isDownloading ? <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" /> : <Download size={14} />}
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); onFavorite?.(video.id); }}
              className={`p-1 rounded transition-colors ${isFavorite ? 'text-pink-500' : 'hover:text-pink-400'}`}
              style={!isFavorite ? { color: 'var(--text-muted)' } : undefined}
            >
              <Heart size={14} fill={isFavorite ? 'currentColor' : 'none'} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const VideoListItem = ({ video, index, onPreview, onDownload, downloadProgress, isSelected, onSelect, onFavorite, isFavorite }: { 
  video: Video, 
  index: number, 
  onPreview: (v: Video) => void, 
  onDownload: (v: Video) => void, 
  downloadProgress: any,
  isSelected?: boolean,
  onSelect?: (id: string) => void,
  onFavorite?: (id: string) => void,
  isFavorite?: boolean
}) => {
  const displayDate = video.dateCreated || video.dateModified || video.uploadDate;
  const rowBg = index % 2 === 0 ? 'var(--bg-secondary)' : 'var(--bg-tertiary)';
  const isDownloading = downloadProgress?.videoId === video.id;

  return (
    <div 
      className={`group grid grid-cols-[30px_50px_80px_1.5fr_1.5fr_1.5fr_1fr_100px_80px_80px_100px_100px] gap-4 px-4 py-2 items-center cursor-pointer text-xs transition-colors ${isSelected ? 'bg-cyan-400/10' : ''}`}
      style={{ background: isSelected ? 'rgba(0,212,255,0.1)' : rowBg, borderBottom: '1px solid var(--border-subtle)' }}
      onClick={() => onPreview(video)}
    >
      {/* Selection Checkbox */}
      <div className="flex items-center justify-center">
        {onSelect && (
          <button
            onClick={(e) => { e.stopPropagation(); onSelect(video.id); }}
            className={`w-5 h-5 rounded flex items-center justify-center transition-all ${isSelected ? 'bg-cyan-400 text-black' : ''}`}
            style={!isSelected ? { border: '2px solid var(--border-default)', background: 'transparent' } : undefined}
          >
            {isSelected && <Check size={12} />}
          </button>
        )}
      </div>
      
      <div className="flex items-center justify-center">
        <button className="w-8 h-8 flex items-center justify-center rounded-full text-cyan-400 hover:bg-cyan-400 hover:text-black transition-all" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)' }}>
          <Play size={14} fill="currentColor" />
        </button>
      </div>
      
      <div className="relative w-[80px] h-[45px] rounded-lg overflow-hidden group-hover:ring-1 ring-cyan-400/50 transition-all" style={{ border: '1px solid var(--border-subtle)' }}>
        <img src={video.thumbnail} alt="" className="w-full h-full object-cover" />
      </div>

      <div className="min-w-0 font-medium line-clamp-2 leading-tight hover:text-cyan-400 transition-colors" title={video.artist}>{video.artist}</div>
      <div className="min-w-0 line-clamp-2 leading-tight group-hover:text-foreground transition-colors" style={{ color: 'var(--text-muted)' }} title={video.title}>{video.title}</div>
      
      <div className="min-w-0 line-clamp-2 leading-tight flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }} title={video.label}>
        <Disc size={12} className="opacity-50 shrink-0" />
        <span className="line-clamp-2">{video.label}</span>
      </div>

      <div className="line-clamp-2 leading-tight" style={{ color: 'var(--text-muted)' }} title={video.genre}>{video.genre}</div>

      <div className="font-mono flex items-center gap-2">
        <span className="font-medium">{video.bpm}</span>
        <span className="text-[10px] px-1.5 py-0.5 rounded text-cyan-400" style={{ background: 'var(--bg-tertiary)' }}>{video.key}</span>
      </div>

      <div>
        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
          video.quality === '4K' ? 'bg-cyan-400 text-black' : ''
        }`} style={video.quality !== '4K' ? { background: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)' } : undefined}>
          {video.quality}
        </span>
      </div>

      <div style={{ color: 'var(--text-muted)' }}>Clean</div>

      <div className="font-mono" style={{ color: 'var(--text-muted)' }}>
        {format(new Date(displayDate), 'MM/dd/yy')}
      </div>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button 
          onClick={(e) => { e.stopPropagation(); onDownload(video); }}
          className="p-1.5 rounded transition-colors hover:text-foreground"
          style={{ color: 'var(--text-muted)' }}
        >
          {isDownloading ? <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" /> : <Download size={14} />}
        </button>
        <button 
          onClick={(e) => { e.stopPropagation(); onFavorite?.(video.id); }}
          className={`p-1.5 rounded transition-colors ${isFavorite ? 'text-pink-500' : 'hover:text-pink-400'}`}
          style={!isFavorite ? { color: 'var(--text-muted)' } : undefined}
        >
          <Heart size={14} fill={isFavorite ? 'currentColor' : 'none'} />
        </button>
        <button className="p-1.5 rounded transition-colors hover:text-foreground" style={{ color: 'var(--text-muted)' }}>
          <MoreVertical size={14} />
        </button>
      </div>
    </div>
  );
};

export default Home;

// ============================================
// THE VIDEO POOL - GENRE NAVIGATION v6.0 (Reskinned)
// Draggable pills with customization modal
// ============================================

import { useState, useRef } from 'react';
import {
  useFloating,
  autoUpdate,
  offset,
  flip,
  shift,
  useClick,
  useDismiss,
  useInteractions,
  FloatingPortal,
} from '@floating-ui/react';
import { ChevronDown, Settings, GripVertical, X, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Reorder, useDragControls } from 'framer-motion';
import { genres } from '@/data/genres';
import { useAppStore } from '@/stores/appStore';
import { Genre, Subgenre } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

// Complete genre data with subgenres (from Replit)
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

const ALL_GENRES = Object.keys(GENRE_DATA);
const DEFAULT_GENRES = [
  "All Genres", "Pop", "Hip-Hop / Rap", "R&B", "Latin", "Electronic / Dance",
  "Afrobeats", "House", "Throwbacks", "Remixes", "Funk", "Rock"
];
const MAX_GENRES = 20;

// Single Genre Chip with optional drag handle
function DraggableGenreChip({
  genre,
  isActive,
  onClick,
  onRemove,
  showDragHandle = false,
  subgenres = [],
}: {
  genre: string;
  isActive: boolean;
  onClick: () => void;
  onRemove?: () => void;
  showDragHandle?: boolean;
  subgenres?: string[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dragControls = useDragControls();

  const { refs, floatingStyles, context } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    middleware: [offset(8), flip(), shift({ padding: 8 })],
    whileElementsMounted: autoUpdate,
    placement: 'bottom-start',
  });

  const click = useClick(context);
  const dismiss = useDismiss(context);
  const { getReferenceProps, getFloatingProps } = useInteractions([click, dismiss]);

  const hasSubgenres = subgenres.length > 0;

  return (
    <Reorder.Item
      value={genre}
      dragListener={false}
      dragControls={dragControls}
      className="flex-shrink-0"
    >
      <div className="flex items-center gap-0.5">
        {showDragHandle && (
          <div
            onPointerDown={(e) => dragControls.start(e)}
            className="cursor-grab active:cursor-grabbing p-1 touch-none"
            style={{ color: 'var(--text-muted)' }}
          >
            <GripVertical size={14} />
          </div>
        )}

        <button
          ref={refs.setReference}
          {...getReferenceProps()}
          onClick={hasSubgenres ? undefined : onClick}
          className={cn(
            'flex items-center gap-1.5 px-4 py-2',
            'rounded-full text-[13px] font-medium whitespace-nowrap',
            'transition-all duration-200',
            isActive
              ? 'bg-[var(--accent-cyan)] text-black'
              : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--accent-cyan)]'
          )}
          style={!isActive ? { border: '1px solid var(--border-subtle)' } : { border: '1px solid var(--accent-cyan)' }}
        >
          <span>{genre}</span>
          {hasSubgenres && (
            <ChevronDown
              size={14}
              className={cn('transition-transform', isOpen && 'rotate-180')}
            />
          )}
        </button>

        {onRemove && (
          <button
            onClick={onRemove}
            className="p-1 rounded-full hover:bg-red-500/20 transition-colors"
            style={{ color: 'var(--text-muted)' }}
          >
            <X size={14} />
          </button>
        )}

        {/* Subgenre Dropdown */}
        {isOpen && hasSubgenres && (
          <FloatingPortal>
            <div
              ref={refs.setFloating}
              {...getFloatingProps()}
              className="p-3 rounded-xl shadow-xl z-[1000] animate-fade-in max-h-[300px] overflow-auto"
              style={{ ...floatingStyles, background: 'var(--bg-secondary)', border: '1px solid var(--border-default)' }}
            >
              <button
                onClick={() => { onClick(); setIsOpen(false); }}
                className="w-full px-3 py-2 text-left text-sm font-medium rounded-lg hover:bg-[var(--accent-cyan-subtle)] hover:text-[var(--accent-cyan)] transition-colors"
              >
                All {genre}
              </button>
              <div className="h-px my-2" style={{ background: 'var(--border-subtle)' }} />
              <div className="flex flex-wrap gap-1.5">
                {subgenres.map((sub) => (
                  <button
                    key={sub}
                    onClick={() => { onClick(); setIsOpen(false); }}
                    className="px-3 py-1.5 text-xs rounded-md transition-colors"
                    style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}
                  >
                    {sub}
                  </button>
                ))}
              </div>
            </div>
          </FloatingPortal>
        )}
      </div>
    </Reorder.Item>
  );
}

// Main Genre Navigation Component
export default function GenreNav() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { activeGenre, clearGenreFilter, setActiveGenre } = useAppStore();
  const [selectedGenres, setSelectedGenres] = useState<string[]>(DEFAULT_GENRES);
  const [customizeOpen, setCustomizeOpen] = useState(false);

  const handleGenreClick = (genre: string) => {
    if (genre === 'All Genres') {
      clearGenreFilter();
    } else {
      setActiveGenre(genre);
    }
  };

  const handleRemoveGenre = (genre: string) => {
    if (genre === 'All Genres') return; // Can't remove All Genres
    setSelectedGenres(prev => prev.filter(g => g !== genre));
  };

  const handleAddGenre = (genre: string) => {
    if (selectedGenres.length >= MAX_GENRES) return;
    if (!selectedGenres.includes(genre)) {
      setSelectedGenres(prev => [...prev, genre]);
    }
  };

  const availableGenres = ALL_GENRES.filter(g => !selectedGenres.includes(g));

  return (
    <>
      <nav
        className="sticky top-[72px] z-[90] px-6 py-2.5"
        style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-subtle)' }}
      >
        <div
          ref={scrollRef}
          className="flex items-center gap-2 overflow-x-auto overflow-y-visible hide-scrollbar"
        >
          <Reorder.Group
            axis="x"
            values={selectedGenres}
            onReorder={setSelectedGenres}
            className="flex items-center gap-2"
          >
            {selectedGenres.map((genre) => (
              <DraggableGenreChip
                key={genre}
                genre={genre}
                isActive={genre === 'All Genres' ? !activeGenre : activeGenre === genre}
                onClick={() => handleGenreClick(genre)}
                subgenres={GENRE_DATA[genre] || []}
              />
            ))}
          </Reorder.Group>

          {/* Customize Button */}
          <button
            onClick={() => setCustomizeOpen(true)}
            className="flex items-center gap-1 px-3 py-2 rounded-full text-xs transition-colors flex-shrink-0"
            style={{
              border: '1px dashed var(--border-default)',
              color: 'var(--text-muted)',
            }}
          >
            <Settings size={12} />
            <span>Customize</span>
          </button>
        </div>
      </nav>

      {/* Genre Customization Modal */}
      <Dialog open={customizeOpen} onOpenChange={setCustomizeOpen}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-auto"
          style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-default)' }}>
          <DialogHeader>
            <DialogTitle>Customize Genres</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Current Genres */}
            <div>
              <div className="text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                Your Genres ({selectedGenres.length}/{MAX_GENRES})
              </div>
              <Reorder.Group
                axis="y"
                values={selectedGenres}
                onReorder={setSelectedGenres}
                className="space-y-1"
              >
                {selectedGenres.map((genre) => (
                  <Reorder.Item
                    key={genre}
                    value={genre}
                    className="flex items-center gap-2 p-2 rounded-lg cursor-grab active:cursor-grabbing"
                    style={{ background: 'var(--bg-tertiary)' }}
                  >
                    <GripVertical size={14} style={{ color: 'var(--text-muted)' }} />
                    <span className="flex-1 text-sm">{genre}</span>
                    {GENRE_DATA[genre]?.length > 0 && (
                      <span className="text-xs px-1.5 py-0.5 rounded"
                        style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)' }}>
                        {GENRE_DATA[genre].length} subgenres
                      </span>
                    )}
                    {genre !== 'All Genres' && (
                      <button
                        onClick={() => handleRemoveGenre(genre)}
                        className="p-1 rounded hover:bg-red-500/20 transition-colors"
                      >
                        <X size={14} className="text-red-400" />
                      </button>
                    )}
                  </Reorder.Item>
                ))}
              </Reorder.Group>
            </div>

            {/* Available Genres */}
            {availableGenres.length > 0 && (
              <div>
                <div className="text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                  Available Genres
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {availableGenres.map((genre) => (
                    <button
                      key={genre}
                      onClick={() => handleAddGenre(genre)}
                      disabled={selectedGenres.length >= MAX_GENRES}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-full transition-colors disabled:opacity-50"
                      style={{
                        background: 'var(--bg-tertiary)',
                        color: 'var(--text-secondary)',
                        border: '1px solid var(--border-subtle)',
                      }}
                    >
                      <Plus size={12} />
                      {genre}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-between pt-4" style={{ borderTop: '1px solid var(--border-subtle)' }}>
              <Button
                variant="ghost"
                onClick={() => setSelectedGenres(DEFAULT_GENRES)}
                style={{ color: 'var(--text-muted)' }}
              >
                Reset to Default
              </Button>
              <Button onClick={() => setCustomizeOpen(false)}>
                Done
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

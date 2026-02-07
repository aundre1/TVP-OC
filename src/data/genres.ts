// ============================================
// THE VIDEO POOL - GENRE DATA v5.5
// Top 8 genres ordered by popularity (not alphabetically)
// ============================================

import { Genre } from '@/types';

// Top 8 genres with comprehensive subgenres (Council Approved)
export const genres: Genre[] = [
  {
    id: 'pop',
    name: 'Pop',
    icon: '🎵',
    subgenres: [
      { id: 'dance-pop', name: 'Dance Pop', count: 1247 },
      { id: 'synth-pop', name: 'Synth Pop', count: 892 },
      { id: 'indie-pop', name: 'Indie Pop', count: 756 },
      { id: 'alternative-pop', name: 'Alternative Pop', count: 623 },
      { id: 'k-pop', name: 'K-Pop', count: 534 },
      { id: 'hyperpop', name: 'Hyperpop', count: 312 },
      { id: 'folk-pop', name: 'Folk Pop', count: 289 },
      { id: 'rb-pop', name: 'R&B Pop', count: 445 },
      { id: 'ballad', name: 'Ballad', count: 378 },
    ],
  },
  {
    id: 'hip-hop',
    name: 'Hip-Hop',
    icon: '🎤',
    subgenres: [
      { id: 'trap', name: 'Trap', count: 1823 },
      { id: 'west-coast', name: 'West Coast', count: 945 },
      { id: 'east-coast', name: 'East Coast', count: 734 },
      { id: 'drill', name: 'Drill', count: 567 },
      { id: 'southern', name: 'Southern', count: 812 },
      { id: 'conscious', name: 'Conscious', count: 423 },
      { id: 'rap', name: 'Rap', count: 1567 },
      { id: 'old-school', name: 'Old School', count: 345 },
    ],
  },
  {
    id: 'rb',
    name: 'R&B',
    icon: '💜',
    subgenres: [
      { id: 'soul', name: 'Soul', count: 678 },
      { id: 'contemporary-rb', name: 'Contemporary R&B', count: 923 },
      { id: 'alternative-rb', name: 'Alternative R&B', count: 534 },
      { id: 'neo-soul', name: 'Neo-Soul', count: 312 },
      { id: 'afrobeats', name: 'Afrobeats', count: 456 },
      { id: 'pop-rb', name: 'Pop R&B', count: 567 },
    ],
  },
  {
    id: 'latin',
    name: 'Latin',
    icon: '🌴',
    subgenres: [
      { id: 'reggaeton', name: 'Reggaeton', count: 1456 },
      { id: 'regional-mexican', name: 'Regional Mexican', count: 892 },
      { id: 'latin-pop', name: 'Latin Pop', count: 723 },
      { id: 'bachata', name: 'Bachata', count: 345 },
      { id: 'salsa', name: 'Salsa', count: 289 },
      { id: 'cumbia', name: 'Cumbia', count: 234 },
      { id: 'dembow', name: 'Dembow', count: 178 },
    ],
  },
  {
    id: 'edm',
    name: 'EDM',
    icon: '🎧',
    subgenres: [
      { id: 'house', name: 'House', count: 1234 },
      { id: 'techno', name: 'Techno', count: 876 },
      { id: 'dubstep', name: 'Dubstep', count: 567 },
      { id: 'trance', name: 'Trance', count: 445 },
      { id: 'drum-bass', name: 'Drum & Bass', count: 389 },
      { id: 'future-bass', name: 'Future Bass', count: 312 },
      { id: 'hardstyle', name: 'Hardstyle', count: 234 },
      { id: 'big-room', name: 'Big Room', count: 423 },
    ],
  },
  {
    id: 'country',
    name: 'Country',
    icon: '🤠',
    subgenres: [
      { id: 'country-pop', name: 'Country Pop', count: 789 },
      { id: 'americana', name: 'Americana', count: 456 },
      { id: 'traditional', name: 'Traditional', count: 345 },
      { id: 'country-rock', name: 'Country Rock', count: 312 },
      { id: 'outlaw', name: 'Outlaw Country', count: 234 },
      { id: 'bluegrass', name: 'Bluegrass', count: 178 },
    ],
  },
  {
    id: 'rock',
    name: 'Rock',
    icon: '🎸',
    subgenres: [
      { id: 'alternative', name: 'Alternative', count: 923 },
      { id: 'indie-rock', name: 'Indie Rock', count: 678 },
      { id: 'classic-rock', name: 'Classic Rock', count: 567 },
      { id: 'punk', name: 'Punk', count: 345 },
      { id: 'metal', name: 'Metal', count: 456 },
      { id: 'hard-rock', name: 'Hard Rock', count: 389 },
      { id: 'grunge', name: 'Grunge', count: 234 },
    ],
  },
  {
    id: 'throwbacks',
    name: 'Throwbacks',
    icon: '📼',
    subgenres: [
      { id: '80s-classics', name: '80s Classics', count: 567 },
      { id: '90s-hits', name: '90s Hits', count: 678 },
      { id: '2000s-bangers', name: '2000s Bangers', count: 789 },
      { id: '2010s-anthems', name: '2010s Anthems', count: 534 },
    ],
  },
];

// Additional genres for filtering (not in top nav)
export const additionalGenres: Genre[] = [
  {
    id: 'remixes',
    name: 'Remixes',
    icon: '🔄',
    subgenres: [
      { id: 'club-remixes', name: 'Club Remixes', count: 456 },
      { id: 'extended-mixes', name: 'Extended Mixes', count: 345 },
      { id: 'mashups', name: 'Mashups', count: 234 },
      { id: 'radio-edits', name: 'Radio Edits', count: 312 },
    ],
  },
  {
    id: 'dance',
    name: 'Dance',
    icon: '💃',
    subgenres: [
      { id: 'disco', name: 'Disco', count: 345 },
      { id: 'funk', name: 'Funk', count: 289 },
      { id: 'electro', name: 'Electro', count: 234 },
    ],
  },
];

// Get all genres including additional
export const getAllGenres = (): Genre[] => {
  return [...genres, ...additionalGenres];
};

// Get genre by ID
export const getGenreById = (id: string): Genre | undefined => {
  return getAllGenres().find(genre => genre.id === id);
};

// Get subgenre counts for a track list
export const getSubgenreCounts = (tracks: { subgenre?: string }[]): Map<string, number> => {
  const counts = new Map<string, number>();
  tracks.forEach(track => {
    if (track.subgenre) {
      counts.set(track.subgenre, (counts.get(track.subgenre) || 0) + 1);
    }
  });
  return counts;
};

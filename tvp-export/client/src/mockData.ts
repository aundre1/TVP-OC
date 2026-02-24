export interface Video {
  id: string;
  title: string;
  artist: string;
  label: string;
  bpm: number;
  key: string;
  genre: string;
  subgenres: string[];
  quality: '4K' | '1080p' | '720p' | '480p';
  duration: string;
  dateCreated: string;
  dateModified: string;
  uploadDate: string;
  thumbnail: string;
  isNew?: boolean;
  isHot?: boolean;
}

const daysAgo = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
};

const BASE_VIDEOS: Video[] = [
  {
    id: '1',
    title: 'Midnight City (Extended Mix)',
    artist: 'M83',
    label: 'Naïve Records',
    bpm: 105,
    key: '6A',
    genre: 'Indie Dance',
    subgenres: ['Synthpop', 'Nu Disco'],
    quality: '4K',
    duration: '05:45',
    dateCreated: daysAgo(2),
    dateModified: daysAgo(2),
    uploadDate: daysAgo(2),
    thumbnail: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=1000&auto=format&fit=crop',
    isHot: true
  },
  {
    id: '2',
    title: 'One Kiss (Club Edit)',
    artist: 'Calvin Harris, Dua Lipa',
    label: 'Columbia',
    bpm: 124,
    key: '8A',
    genre: 'House',
    subgenres: ['Dance Pop', 'Deep House'],
    quality: '1080p',
    duration: '04:12',
    dateCreated: daysAgo(5),
    dateModified: daysAgo(6),
    uploadDate: daysAgo(5),
    thumbnail: 'https://images.unsplash.com/photo-1493225255756-d9584f8606e9?q=80&w=1000&auto=format&fit=crop',
    isNew: true
  },
  {
    id: '3',
    title: 'Lose Control',
    artist: 'Meduza, Becky Hill',
    label: 'Virgin',
    bpm: 124,
    key: '4A',
    genre: 'Deep House',
    subgenres: ['Tech House'],
    quality: '4K',
    duration: '03:58',
    dateCreated: daysAgo(12),
    dateModified: daysAgo(12),
    uploadDate: daysAgo(12),
    thumbnail: 'https://images.unsplash.com/photo-1514525253440-b393452e3383?q=80&w=1000&auto=format&fit=crop'
  },
  {
    id: '4',
    title: 'Starlight (Keep Me Afloat)',
    artist: 'Martin Garrix',
    label: 'STMPD RCRDS',
    bpm: 128,
    key: '2A',
    genre: 'Progressive',
    subgenres: ['Big Room', 'Festival'],
    quality: '720p',
    duration: '04:22',
    dateCreated: daysAgo(45),
    dateModified: daysAgo(46),
    uploadDate: daysAgo(45),
    thumbnail: 'https://images.unsplash.com/photo-1574169208507-84376144848b?q=80&w=1000&auto=format&fit=crop'
  },
  {
    id: '5',
    title: 'Levels (Original Mix)',
    artist: 'Avicii',
    label: 'Universal Music',
    bpm: 126,
    key: '12B',
    genre: 'Progressive House',
    subgenres: ['Anthem'],
    quality: '1080p',
    duration: '05:38',
    dateCreated: daysAgo(1),
    dateModified: daysAgo(1),
    uploadDate: daysAgo(1),
    thumbnail: 'https://images.unsplash.com/photo-1598387993441-a364f854c3e1?q=80&w=1000&auto=format&fit=crop',
    isNew: true,
    isHot: true
  },
  {
    id: '6',
    title: 'Titanium (feat. Sia)',
    artist: 'David Guetta',
    label: 'Parlophone',
    bpm: 126,
    key: '8B',
    genre: 'Dance',
    subgenres: ['Electro Pop'],
    quality: '1080p',
    duration: '04:05',
    dateCreated: daysAgo(35),
    dateModified: daysAgo(35),
    uploadDate: daysAgo(35),
    thumbnail: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=1000&auto=format&fit=crop'
  },
  {
    id: '7',
    title: 'Don\'t You Worry Child',
    artist: 'Swedish House Mafia',
    label: 'EMI',
    bpm: 129,
    key: '10B',
    genre: 'Progressive House',
    subgenres: ['Anthem'],
    quality: '4K',
    duration: '06:35',
    dateCreated: daysAgo(3),
    dateModified: daysAgo(3),
    uploadDate: daysAgo(3),
    thumbnail: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?q=80&w=1000&auto=format&fit=crop'
  }
];

// Generate a larger dataset
export const MOCK_VIDEOS: Video[] = [
  ...BASE_VIDEOS,
  ...BASE_VIDEOS.map(v => ({ ...v, id: v.id + '_2' })),
  ...BASE_VIDEOS.map(v => ({ ...v, id: v.id + '_3' })),
  ...BASE_VIDEOS.map(v => ({ ...v, id: v.id + '_4' }))
];

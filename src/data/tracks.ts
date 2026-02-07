// ============================================
// THE VIDEO POOL - SAMPLE TRACK DATA v5.5
// Quality levels: 320p, 480p, 720p, 1080p, 4K
// Aspect ratios: 16:9 (standard), 4:3 (legacy)
// All tracks include genre, subgenre, and label
// ============================================

import { Track, RecentDownload } from '@/types';

// Sample library tracks
export const sampleTracks: Track[] = [
  { id: 1, title: 'Espresso', artist: 'Sabrina Carpenter', bpm: 126, key: '5A', duration: '3:42', quality: '1080p', aspect: '16:9', genre: 'Pop', subgenre: 'Dance Pop', label: 'Island Records', isNew: true },
  { id: 2, title: 'Not Like Us', artist: 'Kendrick Lamar', bpm: 100, key: '8A', duration: '4:34', quality: '1080p', aspect: '16:9', genre: 'Hip-Hop', subgenre: 'West Coast', label: 'pgLang/Interscope', isHot: true },
  { id: 3, title: 'Beautiful Things', artist: 'Benson Boone', bpm: 110, key: '3B', duration: '3:00', quality: '720p', aspect: '16:9', genre: 'Pop', subgenre: 'Indie Pop', label: 'Night Street/Warner', isNew: true },
  { id: 4, title: 'Lovin On Me', artist: 'Jack Harlow', bpm: 116, key: '11B', duration: '2:18', quality: '1080p', aspect: '16:9', genre: 'Hip-Hop', subgenre: 'Trap', label: 'Generation Now/Atlantic' },
  { id: 5, title: 'Too Sweet', artist: 'Hozier', bpm: 62, key: '9B', duration: '4:12', quality: '4K', aspect: '16:9', genre: 'Pop', subgenre: 'Indie Pop', label: 'Island Records/Columbia' },
  { id: 6, title: "We Can't Be Friends", artist: 'Ariana Grande', bpm: 118, key: '1A', duration: '4:16', quality: '1080p', aspect: '16:9', genre: 'Pop', subgenre: 'Dance Pop', label: 'Republic Records', isNew: true },
  { id: 7, title: 'I Had Some Help', artist: 'Post Malone ft. Morgan Wallen', bpm: 108, key: '6B', duration: '3:02', quality: '720p', aspect: '16:9', genre: 'Country', subgenre: 'Country Pop', label: 'Mercury/Republic', isHot: true },
  { id: 8, title: 'Million Dollar Baby', artist: 'Tommy Richman', bpm: 104, key: '2B', duration: '2:31', quality: '1080p', aspect: '16:9', genre: 'Pop', subgenre: 'R&B Pop', label: 'ISO Supremacy/PULSE' },
  { id: 9, title: 'Birds of a Feather', artist: 'Billie Eilish', bpm: 105, key: '8B', duration: '3:30', quality: '4K', aspect: '16:9', genre: 'Pop', subgenre: 'Alternative Pop', label: 'Darkroom/Interscope' },
  { id: 10, title: 'Bonita', artist: 'Daddy Yankee', bpm: 96, key: '4A', duration: '3:25', quality: '1080p', aspect: '16:9', genre: 'Latin', subgenre: 'Reggaeton', label: 'El Cartel Records', isNew: true },
  { id: 11, title: 'La Bebe', artist: 'Yng Lvcas & Peso Pluma', bpm: 92, key: '1B', duration: '3:45', quality: '1080p', aspect: '16:9', genre: 'Latin', subgenre: 'Regional Mexican', label: 'Double P Records', isHot: true },
  { id: 12, title: 'Bellakeo', artist: 'Peso Pluma & Anitta', bpm: 100, key: '6A', duration: '2:55', quality: '720p', aspect: '16:9', genre: 'Latin', subgenre: 'Reggaeton', label: 'Double P Records' },
  { id: 13, title: 'Good Luck, Babe!', artist: 'Chappell Roan', bpm: 110, key: '7A', duration: '3:38', quality: '1080p', aspect: '16:9', genre: 'Pop', subgenre: 'Synth Pop', label: 'Island Records', isNew: true },
  { id: 14, title: 'Lose Control', artist: 'Teddy Swims', bpm: 97, key: '10B', duration: '3:28', quality: '1080p', aspect: '16:9', genre: 'R&B', subgenre: 'Soul', label: 'Warner Records' },
  { id: 15, title: 'Water', artist: 'Tyla', bpm: 114, key: '12A', duration: '3:20', quality: '4K', aspect: '16:9', genre: 'R&B', subgenre: 'Afrobeats', label: 'Epic/Fax Records', isHot: true },
  { id: 16, title: 'Houdini', artist: 'Eminem', bpm: 140, key: '5B', duration: '4:22', quality: '1080p', aspect: '16:9', genre: 'Hip-Hop', subgenre: 'Rap', label: 'Shady/Aftermath/Interscope', isNew: true },
  { id: 17, title: 'Pink Skies', artist: 'Zach Bryan', bpm: 86, key: '3A', duration: '4:05', quality: '720p', aspect: '16:9', genre: 'Country', subgenre: 'Americana', label: 'Warner Records' },
  { id: 18, title: 'Saturn', artist: 'SZA', bpm: 130, key: '9A', duration: '3:15', quality: '1080p', aspect: '16:9', genre: 'R&B', subgenre: 'Alternative R&B', label: 'Top Dawg/RCA' },
  { id: 19, title: 'Stick Season', artist: 'Noah Kahan', bpm: 98, key: '4B', duration: '3:00', quality: '1080p', aspect: '16:9', genre: 'Pop', subgenre: 'Folk Pop', label: 'Mercury/Republic' },
  { id: 20, title: 'Texas Hold Em', artist: 'Beyonce', bpm: 120, key: '2A', duration: '3:53', quality: '4K', aspect: '16:9', genre: 'Country', subgenre: 'Country Pop', label: 'Parkwood/Columbia', isHot: true },
];

// TRENDING TRACKS - Most downloaded in last 30 days
export const trendingTracks: Track[] = [
  { id: 101, title: 'Die With A Smile', artist: 'Lady Gaga & Bruno Mars', bpm: 158, key: '6B', duration: '4:12', quality: '1080p', aspect: '16:9', genre: 'Pop', subgenre: 'Ballad', label: 'Interscope/Atlantic', downloads: 15420, isHot: true },
  { id: 102, title: 'APT.', artist: 'ROSE & Bruno Mars', bpm: 148, key: '4A', duration: '2:50', quality: '1080p', aspect: '16:9', genre: 'Pop', subgenre: 'K-Pop', label: 'Atlantic Records', downloads: 12300, isHot: true },
  { id: 103, title: 'BIRDS OF A FEATHER', artist: 'Billie Eilish', bpm: 105, key: '8B', duration: '3:30', quality: '4K', aspect: '16:9', genre: 'Pop', subgenre: 'Alternative Pop', label: 'Darkroom/Interscope', downloads: 11850 },
  { id: 104, title: 'Taste', artist: 'Sabrina Carpenter', bpm: 111, key: '11A', duration: '2:37', quality: '1080p', aspect: '16:9', genre: 'Pop', subgenre: 'Dance Pop', label: 'Island Records', downloads: 10200 },
  { id: 105, title: 'Too Sweet', artist: 'Hozier', bpm: 62, key: '9B', duration: '4:12', quality: '1080p', aspect: '16:9', genre: 'Pop', subgenre: 'Indie Pop', label: 'Island Records/Columbia', downloads: 9800 },
  { id: 106, title: 'A Bar Song (Tipsy)', artist: 'Shaboozey', bpm: 82, key: '2A', duration: '3:50', quality: '720p', aspect: '16:9', genre: 'Country', subgenre: 'Country Pop', label: 'American Dogwood/Republic', downloads: 9500, isHot: true },
  { id: 107, title: 'Please Please Please', artist: 'Sabrina Carpenter', bpm: 107, key: '1B', duration: '3:06', quality: '1080p', aspect: '16:9', genre: 'Pop', subgenre: 'Dance Pop', label: 'Island Records', downloads: 8900 },
  { id: 108, title: 'Lose Control', artist: 'Teddy Swims', bpm: 97, key: '10B', duration: '3:28', quality: '1080p', aspect: '16:9', genre: 'R&B', subgenre: 'Soul', label: 'Warner Records', downloads: 8400 },
  { id: 109, title: 'MILLION DOLLAR BABY', artist: 'Tommy Richman', bpm: 104, key: '2B', duration: '2:31', quality: '720p', aspect: '16:9', genre: 'Pop', subgenre: 'R&B Pop', label: 'ISO Supremacy/PULSE', downloads: 7900 },
  { id: 110, title: 'Not Like Us', artist: 'Kendrick Lamar', bpm: 100, key: '8A', duration: '4:34', quality: '1080p', aspect: '16:9', genre: 'Hip-Hop', subgenre: 'West Coast', label: 'pgLang/Interscope', downloads: 7500, isHot: true },
];

// LATEST TRACKS - Added in last 30 days
export const latestTracks: Track[] = [
  { id: 201, title: 'Moonlit Floor', artist: 'Lisa', bpm: 115, key: '3A', duration: '3:22', quality: '1080p', aspect: '16:9', genre: 'Pop', subgenre: 'K-Pop', label: 'LLOUD/RCA', isNew: true, addedDate: '2026-01-14' },
  { id: 202, title: 'LUNCH', artist: 'Billie Eilish', bpm: 110, key: '6A', duration: '2:59', quality: '4K', aspect: '16:9', genre: 'Pop', subgenre: 'Alternative Pop', label: 'Darkroom/Interscope', isNew: true, addedDate: '2026-01-13' },
  { id: 203, title: 'Nasty', artist: 'Tinashe', bpm: 108, key: '9B', duration: '3:21', quality: '1080p', aspect: '16:9', genre: 'R&B', subgenre: 'Pop R&B', label: 'Nice Life/RCA', isNew: true, addedDate: '2026-01-12' },
  { id: 204, title: 'Guess', artist: 'Charli XCX ft. Billie Eilish', bpm: 130, key: '5A', duration: '2:42', quality: '1080p', aspect: '16:9', genre: 'Pop', subgenre: 'Hyperpop', label: 'Atlantic Records', isNew: true, addedDate: '2026-01-11' },
  { id: 205, title: '360', artist: 'Charli XCX', bpm: 135, key: '8B', duration: '2:13', quality: '720p', aspect: '16:9', genre: 'Pop', subgenre: 'Hyperpop', label: 'Atlantic Records', isNew: true, addedDate: '2026-01-10' },
  { id: 206, title: 'HOT TO GO!', artist: 'Chappell Roan', bpm: 132, key: '4B', duration: '3:05', quality: '1080p', aspect: '16:9', genre: 'Pop', subgenre: 'Synth Pop', label: 'Island Records', isNew: true, addedDate: '2026-01-09' },
  { id: 207, title: 'Austin', artist: 'Dasha', bpm: 144, key: '7A', duration: '2:40', quality: '720p', aspect: '16:9', genre: 'Country', subgenre: 'Country Pop', label: 'Warner Music Nashville', isNew: true, addedDate: '2026-01-08' },
  { id: 208, title: 'Beautiful Things', artist: 'Benson Boone', bpm: 110, key: '3B', duration: '3:00', quality: '1080p', aspect: '16:9', genre: 'Pop', subgenre: 'Indie Pop', label: 'Night Street/Warner', isNew: true, addedDate: '2026-01-07' },
  { id: 209, title: 'Si Antes Te Hubiera Conocido', artist: 'Karol G', bpm: 128, key: '1A', duration: '3:15', quality: '1080p', aspect: '16:9', genre: 'Latin', subgenre: 'Reggaeton', label: 'Universal Music Latin', isNew: true, addedDate: '2026-01-06' },
  { id: 210, title: 'Feather', artist: 'Sabrina Carpenter', bpm: 100, key: '10A', duration: '3:06', quality: '1080p', aspect: '16:9', genre: 'Pop', subgenre: 'Dance Pop', label: 'Island Records', isNew: true, addedDate: '2026-01-05' },
];

// FOR YOU TRACKS - Popular chart hits
export const forYouTracks: Track[] = [
  { id: 301, title: 'Die With A Smile', artist: 'Lady Gaga & Bruno Mars', bpm: 158, key: '6B', duration: '4:12', quality: '1080p', aspect: '16:9', genre: 'Pop', subgenre: 'Ballad', label: 'Interscope/Atlantic', isHot: true },
  { id: 302, title: 'APT.', artist: 'ROSE & Bruno Mars', bpm: 148, key: '4A', duration: '2:50', quality: '4K', aspect: '16:9', genre: 'Pop', subgenre: 'K-Pop', label: 'Atlantic Records', isHot: true },
  { id: 303, title: 'Taste', artist: 'Sabrina Carpenter', bpm: 111, key: '11A', duration: '2:37', quality: '1080p', aspect: '16:9', genre: 'Pop', subgenre: 'Dance Pop', label: 'Island Records', isNew: true },
  { id: 304, title: 'A Bar Song (Tipsy)', artist: 'Shaboozey', bpm: 82, key: '2A', duration: '3:50', quality: '1080p', aspect: '16:9', genre: 'Country', subgenre: 'Country Pop', label: 'American Dogwood/Republic', isHot: true },
  { id: 305, title: 'Espresso', artist: 'Sabrina Carpenter', bpm: 126, key: '5A', duration: '3:42', quality: '1080p', aspect: '16:9', genre: 'Pop', subgenre: 'Dance Pop', label: 'Island Records' },
  { id: 306, title: 'BIRDS OF A FEATHER', artist: 'Billie Eilish', bpm: 105, key: '8B', duration: '3:30', quality: '4K', aspect: '16:9', genre: 'Pop', subgenre: 'Alternative Pop', label: 'Darkroom/Interscope' },
  { id: 307, title: 'Good Luck, Babe!', artist: 'Chappell Roan', bpm: 110, key: '7A', duration: '3:38', quality: '1080p', aspect: '16:9', genre: 'Pop', subgenre: 'Synth Pop', label: 'Island Records', isNew: true },
  { id: 308, title: 'Lose Control', artist: 'Teddy Swims', bpm: 97, key: '10B', duration: '3:28', quality: '1080p', aspect: '16:9', genre: 'R&B', subgenre: 'Soul', label: 'Warner Records' },
  { id: 309, title: 'Please Please Please', artist: 'Sabrina Carpenter', bpm: 107, key: '1B', duration: '3:06', quality: '1080p', aspect: '16:9', genre: 'Pop', subgenre: 'Dance Pop', label: 'Island Records' },
  { id: 310, title: 'Not Like Us', artist: 'Kendrick Lamar', bpm: 100, key: '8A', duration: '4:34', quality: '1080p', aspect: '16:9', genre: 'Hip-Hop', subgenre: 'West Coast', label: 'pgLang/Interscope', isHot: true },
];

// THROWBACK TRACKS - Classic hits by era
export const throwbackTracks: Track[] = [
  // 80s Classics
  { id: 401, title: 'Billie Jean', artist: 'Michael Jackson', bpm: 117, key: '4A', duration: '4:54', quality: '480p', aspect: '4:3', genre: 'Throwbacks', subgenre: '80s Classics', label: 'Epic Records' },
  { id: 402, title: 'Take On Me', artist: 'a-ha', bpm: 169, key: '1A', duration: '3:46', quality: '480p', aspect: '4:3', genre: 'Throwbacks', subgenre: '80s Classics', label: 'Warner Bros' },
  { id: 403, title: 'Sweet Child O Mine', artist: "Guns N' Roses", bpm: 125, key: '4B', duration: '5:56', quality: '720p', aspect: '4:3', genre: 'Throwbacks', subgenre: '80s Classics', label: 'Geffen Records' },
  { id: 404, title: 'Purple Rain', artist: 'Prince', bpm: 113, key: '6B', duration: '8:41', quality: '480p', aspect: '4:3', genre: 'Throwbacks', subgenre: '80s Classics', label: 'Warner Bros' },
  // 90s Hits
  { id: 405, title: 'Smells Like Teen Spirit', artist: 'Nirvana', bpm: 117, key: '6A', duration: '5:01', quality: '720p', aspect: '4:3', genre: 'Throwbacks', subgenre: '90s Hits', label: 'DGC Records' },
  { id: 406, title: 'Waterfalls', artist: 'TLC', bpm: 87, key: '3B', duration: '4:39', quality: '480p', aspect: '4:3', genre: 'Throwbacks', subgenre: '90s Hits', label: 'LaFace Records' },
  { id: 407, title: 'No Diggity', artist: 'Blackstreet ft. Dr. Dre', bpm: 89, key: '5A', duration: '5:00', quality: '480p', aspect: '4:3', genre: 'Throwbacks', subgenre: '90s Hits', label: 'Interscope' },
  { id: 408, title: 'California Love', artist: '2Pac ft. Dr. Dre', bpm: 92, key: '11A', duration: '4:45', quality: '720p', aspect: '4:3', genre: 'Throwbacks', subgenre: '90s Hits', label: 'Death Row Records' },
  // 2000s Bangers
  { id: 409, title: 'In Da Club', artist: '50 Cent', bpm: 89, key: '10B', duration: '3:42', quality: '720p', aspect: '16:9', genre: 'Throwbacks', subgenre: '2000s Bangers', label: 'Shady/Aftermath/Interscope' },
  { id: 410, title: 'Crazy In Love', artist: 'Beyonce ft. Jay-Z', bpm: 99, key: '4A', duration: '3:56', quality: '720p', aspect: '16:9', genre: 'Throwbacks', subgenre: '2000s Bangers', label: 'Columbia Records' },
  { id: 411, title: 'Yeah!', artist: 'Usher ft. Lil Jon', bpm: 105, key: '12A', duration: '4:10', quality: '720p', aspect: '16:9', genre: 'Throwbacks', subgenre: '2000s Bangers', label: 'Arista Records' },
  { id: 412, title: 'Get Low', artist: 'Lil Jon & The East Side Boyz', bpm: 137, key: '1A', duration: '6:02', quality: '480p', aspect: '4:3', genre: 'Throwbacks', subgenre: '2000s Bangers', label: 'TVT Records' },
  // 2010s Anthems
  { id: 413, title: 'Uptown Funk', artist: 'Bruno Mars ft. Mark Ronson', bpm: 115, key: '4A', duration: '4:30', quality: '1080p', aspect: '16:9', genre: 'Throwbacks', subgenre: '2010s Anthems', label: 'Atlantic Records' },
  { id: 414, title: 'Happy', artist: 'Pharrell Williams', bpm: 160, key: '6A', duration: '3:53', quality: '1080p', aspect: '16:9', genre: 'Throwbacks', subgenre: '2010s Anthems', label: 'Back Lot Music/Columbia' },
  { id: 415, title: "Can't Stop The Feeling", artist: 'Justin Timberlake', bpm: 113, key: '7B', duration: '4:00', quality: '1080p', aspect: '16:9', genre: 'Throwbacks', subgenre: '2010s Anthems', label: 'RCA Records' },
  { id: 416, title: 'Blinding Lights', artist: 'The Weeknd', bpm: 171, key: '6A', duration: '3:20', quality: '4K', aspect: '16:9', genre: 'Throwbacks', subgenre: '2010s Anthems', label: 'XO/Republic' },
];

// REMIX TRACKS - Club versions, extended mixes, mashups
export const remixTracks: Track[] = [
  { id: 501, title: 'Espresso (Club Mix)', artist: 'Sabrina Carpenter', bpm: 128, key: '5A', duration: '5:42', quality: '1080p', aspect: '16:9', genre: 'Remixes', subgenre: 'Club Remixes', label: 'Island Records' },
  { id: 502, title: 'Die With A Smile (Extended)', artist: 'Lady Gaga & Bruno Mars', bpm: 158, key: '6B', duration: '6:30', quality: '1080p', aspect: '16:9', genre: 'Remixes', subgenre: 'Extended Mixes', label: 'Interscope/Atlantic' },
  { id: 503, title: 'APT. (Dance Remix)', artist: 'ROSE & Bruno Mars', bpm: 130, key: '4A', duration: '4:15', quality: '1080p', aspect: '16:9', genre: 'Remixes', subgenre: 'Club Remixes', label: 'Atlantic Records' },
  { id: 504, title: 'Taste vs Please (Mashup)', artist: 'Sabrina Carpenter', bpm: 109, key: '11A', duration: '4:02', quality: '720p', aspect: '16:9', genre: 'Remixes', subgenre: 'Mashups', label: 'Video Pool Exclusive' },
  { id: 505, title: 'Lose Control (Sped Up)', artist: 'Teddy Swims', bpm: 112, key: '10B', duration: '2:45', quality: '1080p', aspect: '16:9', genre: 'Remixes', subgenre: 'Radio Edits', label: 'Warner Records' },
  { id: 506, title: 'Water (Afro House Remix)', artist: 'Tyla', bpm: 122, key: '12A', duration: '5:20', quality: '1080p', aspect: '16:9', genre: 'Remixes', subgenre: 'Club Remixes', label: 'Epic/Fax Records' },
  { id: 507, title: 'Good Luck Babe (Slowed)', artist: 'Chappell Roan', bpm: 85, key: '7A', duration: '4:38', quality: '720p', aspect: '16:9', genre: 'Remixes', subgenre: 'Radio Edits', label: 'Island Records' },
  { id: 508, title: 'Not Like Us (Dirty South Mix)', artist: 'Kendrick Lamar', bpm: 128, key: '8A', duration: '5:44', quality: '1080p', aspect: '16:9', genre: 'Remixes', subgenre: 'Club Remixes', label: 'pgLang/Interscope' },
];

// Legacy/Archived content with lower quality
export const legacyTracks: Track[] = [
  { id: 601, title: 'Thriller', artist: 'Michael Jackson', bpm: 118, key: '5A', duration: '5:57', quality: '320p', aspect: '4:3', genre: 'Throwbacks', subgenre: '80s Classics', label: 'Epic Records' },
  { id: 602, title: 'Video Killed The Radio Star', artist: 'The Buggles', bpm: 133, key: '11A', duration: '4:12', quality: '320p', aspect: '4:3', genre: 'Throwbacks', subgenre: '80s Classics', label: 'Island Records' },
  { id: 603, title: 'Push It', artist: 'Salt-N-Pepa', bpm: 130, key: '9B', duration: '4:28', quality: '320p', aspect: '4:3', genre: 'Throwbacks', subgenre: '80s Classics', label: 'Next Plateau' },
];

// Recent downloads history
export const recentDownloads: RecentDownload[] = [
  { id: 1, title: 'Espresso', artist: 'Sabrina Carpenter', bpm: 126, key: '5A', date: '2 hours ago', downloadCount: 3 },
  { id: 6, title: "We Can't Be Friends", artist: 'Ariana Grande', bpm: 118, key: '1A', date: '5 hours ago', downloadCount: 1 },
  { id: 2, title: 'Not Like Us', artist: 'Kendrick Lamar', bpm: 100, key: '8A', date: 'Yesterday', downloadCount: 2 },
  { id: 15, title: 'Water', artist: 'Tyla', bpm: 114, key: '12A', date: 'Yesterday', downloadCount: 1 },
  { id: 20, title: 'Texas Hold Em', artist: 'Beyonce', bpm: 120, key: '2A', date: '2 days ago', downloadCount: 1 },
  { id: 10, title: 'Bonita', artist: 'Daddy Yankee', bpm: 96, key: '4A', date: '3 days ago', downloadCount: 2 },
  { id: 14, title: 'Lose Control', artist: 'Teddy Swims', bpm: 97, key: '10B', date: '3 days ago', downloadCount: 1 },
  { id: 3, title: 'Beautiful Things', artist: 'Benson Boone', bpm: 110, key: '3B', date: '4 days ago', downloadCount: 1 },
  { id: 9, title: 'Birds of a Feather', artist: 'Billie Eilish', bpm: 105, key: '8B', date: '5 days ago', downloadCount: 1 },
  { id: 16, title: 'Houdini', artist: 'Eminem', bpm: 140, key: '5B', date: '1 week ago', downloadCount: 1 },
  { id: 11, title: 'La Bebe', artist: 'Yng Lvcas & Peso Pluma', bpm: 92, key: '1B', date: '1 week ago', downloadCount: 1 },
  { id: 13, title: 'Good Luck, Babe!', artist: 'Chappell Roan', bpm: 110, key: '7A', date: '1 week ago', downloadCount: 1 },
  { id: 4, title: 'Lovin On Me', artist: 'Jack Harlow', bpm: 116, key: '11B', date: '2 weeks ago', downloadCount: 2 },
  { id: 7, title: 'I Had Some Help', artist: 'Post Malone ft. Morgan Wallen', bpm: 108, key: '6B', date: '2 weeks ago', downloadCount: 1 },
  { id: 8, title: 'Million Dollar Baby', artist: 'Tommy Richman', bpm: 104, key: '2B', date: '3 weeks ago', downloadCount: 1 },
];

// Get all tracks combined
export const getAllTracks = (): Track[] => {
  return [...sampleTracks, ...trendingTracks, ...latestTracks, ...forYouTracks, ...throwbackTracks, ...remixTracks, ...legacyTracks];
};

// Get track by ID
export const getTrackById = (id: number): Track | undefined => {
  return getAllTracks().find(track => track.id === id);
};

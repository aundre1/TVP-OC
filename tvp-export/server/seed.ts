import { db } from "./db";
import { videos, userProfiles } from "@shared/schema";
import { sql } from "drizzle-orm";

const daysAgo = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d;
};

async function seed() {
  console.log("🌱 Seeding database...");

  // Clear existing data
  await db.delete(videos);
  await db.delete(userProfiles);

  // Insert sample videos
  const videoData = [
    {
      title: 'Midnight City (Extended Mix)',
      artist: 'M83',
      label: 'Naïve Records',
      bpm: 105,
      key: '6A',
      genre: 'Indie Dance',
      subgenres: ['Synthpop', 'Nu Disco'],
      quality: '4K',
      duration: '05:45',
      thumbnail: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=1000&auto=format&fit=crop',
      isHot: true,
      isNew: false,
      dateCreated: daysAgo(2),
      dateModified: daysAgo(2),
      uploadDate: daysAgo(2),
    },
    {
      title: 'One Kiss (Club Edit)',
      artist: 'Calvin Harris, Dua Lipa',
      label: 'Columbia',
      bpm: 124,
      key: '8A',
      genre: 'House',
      subgenres: ['Dance Pop', 'Deep House'],
      quality: '1080p',
      duration: '04:12',
      thumbnail: 'https://images.unsplash.com/photo-1493225255756-d9584f8606e9?q=80&w=1000&auto=format&fit=crop',
      isNew: true,
      isHot: false,
      dateCreated: daysAgo(5),
      dateModified: daysAgo(6),
      uploadDate: daysAgo(5),
    },
    {
      title: 'Lose Control',
      artist: 'Meduza, Becky Hill',
      label: 'Virgin',
      bpm: 124,
      key: '4A',
      genre: 'Deep House',
      subgenres: ['Tech House'],
      quality: '4K',
      duration: '03:58',
      thumbnail: 'https://images.unsplash.com/photo-1514525253440-b393452e3383?q=80&w=1000&auto=format&fit=crop',
      isNew: false,
      isHot: false,
      dateCreated: daysAgo(12),
      dateModified: daysAgo(12),
      uploadDate: daysAgo(12),
    },
    {
      title: 'Starlight (Keep Me Afloat)',
      artist: 'Martin Garrix',
      label: 'STMPD RCRDS',
      bpm: 128,
      key: '2A',
      genre: 'Progressive',
      subgenres: ['Big Room', 'Festival'],
      quality: '720p',
      duration: '04:22',
      thumbnail: 'https://images.unsplash.com/photo-1574169208507-84376144848b?q=80&w=1000&auto=format&fit=crop',
      isNew: false,
      isHot: false,
      dateCreated: daysAgo(45),
      dateModified: daysAgo(46),
      uploadDate: daysAgo(45),
    },
    {
      title: 'Levels (Original Mix)',
      artist: 'Avicii',
      label: 'Universal Music',
      bpm: 126,
      key: '12B',
      genre: 'Progressive House',
      subgenres: ['Anthem'],
      quality: '1080p',
      duration: '05:38',
      thumbnail: 'https://images.unsplash.com/photo-1598387993441-a364f854c3e1?q=80&w=1000&auto=format&fit=crop',
      isNew: true,
      isHot: true,
      dateCreated: daysAgo(1),
      dateModified: daysAgo(1),
      uploadDate: daysAgo(1),
    },
    {
      title: 'Titanium (feat. Sia)',
      artist: 'David Guetta',
      label: 'Parlophone',
      bpm: 126,
      key: '8B',
      genre: 'Dance',
      subgenres: ['Electro Pop'],
      quality: '1080p',
      duration: '04:05',
      thumbnail: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=1000&auto=format&fit=crop',
      isNew: false,
      isHot: false,
      dateCreated: daysAgo(35),
      dateModified: daysAgo(35),
      uploadDate: daysAgo(35),
    },
    {
      title: 'Don\'t You Worry Child',
      artist: 'Swedish House Mafia',
      label: 'EMI',
      bpm: 129,
      key: '10B',
      genre: 'Progressive House',
      subgenres: ['Anthem'],
      quality: '4K',
      duration: '06:35',
      thumbnail: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?q=80&w=1000&auto=format&fit=crop',
      isNew: false,
      isHot: true,
      dateCreated: daysAgo(3),
      dateModified: daysAgo(3),
      uploadDate: daysAgo(3),
    },
  ];

  await db.insert(videos).values(videoData);

  // Create default user profile
  await db.insert(userProfiles).values({
    userId: 'demo-user',
    name: 'John Doe',
    email: 'john@thevideopool.com',
    plan: 'elite',
    downloadsRemaining: 200,
    sectionOrder: ['new-releases', 'trending', 'for-you'],
    sectionStates: {},
    genreOrder: ["All Genres", "House", "Hip Hop", "R&B", "Latin", "Dance", "Pop", "Rock", "Reggae"],
    viewMode: 'list',
  });

  console.log("✅ Database seeded successfully!");
}

seed()
  .catch((error) => {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });

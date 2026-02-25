// ============================================
// THE VIDEO POOL - HOME PAGE v7.0
// Real API data, loading skeletons, drag-drop sections
// ============================================

import { useMemo, useEffect, useState } from 'react';
import DraggableSections from '@/components/DraggableSections';
import VideoGrid from '@/components/VideoGrid';
import VideoList from '@/components/VideoList';
import RecentSection from '@/components/RecentSection';
import AISearchHero from '@/components/AISearchHero';
import { useAppStore } from '@/stores/appStore';
import { get } from '@/api/client';
import { Track } from '@/types';

// Loading skeleton for video sections
function SectionSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="aspect-video bg-tvp-bg-tertiary rounded-lg mb-2" />
          <div className="h-3 bg-tvp-bg-tertiary rounded w-3/4 mb-1" />
          <div className="h-3 bg-tvp-bg-tertiary rounded w-1/2" />
        </div>
      ))}
    </div>
  );
}

// Section content wrapper that handles view mode + genre filtering
function SectionContent({ tracks, sectionId }: { tracks: Track[]; sectionId: string }) {
  const { viewMode, activeGenre, activeSubgenre } = useAppStore();

  const filteredTracks = useMemo(() => {
    if (!activeGenre) return tracks;
    return tracks.filter((track) => {
      const genreMatch = track.genre.toLowerCase().replace(/[^a-z]/g, '') ===
        activeGenre.toLowerCase().replace(/[^a-z]/g, '');
      if (activeSubgenre) {
        const subgenreMatch = track.subgenre?.toLowerCase().replace(/[^a-z]/g, '') ===
          activeSubgenre.toLowerCase().replace(/[^a-z]/g, '');
        return genreMatch && subgenreMatch;
      }
      return genreMatch;
    });
  }, [tracks, activeGenre, activeSubgenre]);

  if (filteredTracks.length === 0) {
    return (
      <div className="py-12 text-center" style={{ color: 'var(--text-muted)' }}>
        No tracks found for this filter. Try a different genre.
      </div>
    );
  }

  if (viewMode === 'list') {
    return <VideoList tracks={filteredTracks} showHeader={true} />;
  }
  return <VideoGrid tracks={filteredTracks} />;
}

export default function HomePage() {
  const { viewMode } = useAppStore();
  const [sectionData, setSectionData] = useState<Record<string, Track[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchSections() {
      setLoading(true);
      try {
        const [trending, latest, forYou, throwbacks, remixes] = await Promise.allSettled([
          get<Track[]>('/videos', { sortBy: 'popular', limit: 15 }),
          get<Track[]>('/videos', { sortBy: 'newest', limit: 15 }),
          get<Track[]>('/videos', { limit: 15 }),
          get<Track[]>('/videos', { genre: 'throwbacks', limit: 15 }),
          get<Track[]>('/videos', { genre: 'remixes', limit: 15 }),
        ]);

        if (cancelled) return;

        const extract = (r: PromiseSettledResult<Track[]>) =>
          r.status === 'fulfilled' ? (Array.isArray(r.value) ? r.value : []) : [];

        setSectionData({
          trending: extract(trending),
          latest: extract(latest),
          forYou: extract(forYou),
          throwbacks: extract(throwbacks),
          remixes: extract(remixes),
        });
      } catch (err) {
        console.error('Failed to fetch home sections:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchSections();
    return () => { cancelled = true; };
  }, []);

  const sections = useMemo(
    () => [
      {
        id: 'trending',
        title: 'Trending Now',
        seeAllLink: '/browse/trending',
        content: loading
          ? <SectionSkeleton />
          : <SectionContent tracks={sectionData.trending || []} sectionId="trending" />,
      },
      {
        id: 'latest',
        title: 'Latest Releases',
        seeAllLink: '/browse/latest',
        content: loading
          ? <SectionSkeleton />
          : <SectionContent tracks={sectionData.latest || []} sectionId="latest" />,
      },
      {
        id: 'forYou',
        title: 'For You',
        seeAllLink: '/browse/for-you',
        content: loading
          ? <SectionSkeleton />
          : <SectionContent tracks={sectionData.forYou || []} sectionId="forYou" />,
      },
      {
        id: 'throwbacks',
        title: 'Throwbacks',
        seeAllLink: '/browse/throwbacks',
        content: loading
          ? <SectionSkeleton />
          : <SectionContent tracks={sectionData.throwbacks || []} sectionId="throwbacks" />,
      },
      {
        id: 'remixes',
        title: 'Remixes & Edits',
        seeAllLink: '/browse/remixes',
        content: loading
          ? <SectionSkeleton />
          : <SectionContent tracks={sectionData.remixes || []} sectionId="remixes" />,
      },
    ],
    [viewMode, loading, sectionData]
  );

  return (
    <div className="px-6 py-6">
      <AISearchHero />
      <RecentSection />
      <DraggableSections sections={sections} />
    </div>
  );
}

// ============================================
// THE VIDEO POOL - HOME PAGE v6.0 (Reskinned)
// Main page with all sections, drag-drop reordering,
// and view mode toggle (grid/list)
// ============================================

import { useMemo } from 'react';
import DraggableSections from '@/components/DraggableSections';
import VideoGrid from '@/components/VideoGrid';
import VideoList from '@/components/VideoList';
import RecentSection from '@/components/RecentSection';
import AISearchHero from '@/components/AISearchHero';
import { useAppStore } from '@/stores/appStore';
import {
  trendingTracks,
  latestTracks,
  forYouTracks,
  throwbackTracks,
  remixTracks,
} from '@/data/tracks';
import { Track } from '@/types';

// Section content wrapper that handles view mode
function SectionContent({ tracks, sectionId }: { tracks: Track[]; sectionId: string }) {
  const { viewMode, activeGenre, activeSubgenre } = useAppStore();

  // Filter tracks by active genre/subgenre if set
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

  // Define sections with their content
  const sections = useMemo(
    () => [
      {
        id: 'trending',
        title: 'Trending Now',
        seeAllLink: '/browse/trending',
        content: <SectionContent tracks={trendingTracks} sectionId="trending" />,
      },
      {
        id: 'latest',
        title: 'Latest Releases',
        seeAllLink: '/browse/latest',
        content: <SectionContent tracks={latestTracks} sectionId="latest" />,
      },
      {
        id: 'forYou',
        title: 'For You',
        seeAllLink: '/browse/for-you',
        content: <SectionContent tracks={forYouTracks} sectionId="forYou" />,
      },
      {
        id: 'throwbacks',
        title: 'Throwbacks',
        seeAllLink: '/browse/throwbacks',
        content: <SectionContent tracks={throwbackTracks} sectionId="throwbacks" />,
      },
      {
        id: 'remixes',
        title: 'Remixes & Edits',
        seeAllLink: '/browse/remixes',
        content: <SectionContent tracks={remixTracks} sectionId="remixes" />,
      },
    ],
    [viewMode]
  );

  return (
    <div className="px-6 py-6">
      {/* AI Search Hero */}
      <AISearchHero />

      {/* Recent Downloads Section (not draggable, always at top) */}
      <RecentSection />

      {/* Draggable Content Sections */}
      <DraggableSections sections={sections} />
    </div>
  );
}

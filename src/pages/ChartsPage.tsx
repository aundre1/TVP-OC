// ============================================
// CHARTS PAGE - Top Videos & Trending
// ============================================

import { useEffect, useState, useMemo } from 'react';
import VideoGrid from '@/components/VideoGrid';
import VideoList from '@/components/VideoList';
import { useAppStore } from '@/stores/appStore';
import { get } from '@/api/client';
import { extractTracks } from '@/api/adapters';
import { Track } from '@/types';

// Loading skeleton
function SectionSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {Array.from({ length: 20 }).map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="aspect-video bg-tvp-bg-tertiary rounded-lg mb-2" />
          <div className="h-3 bg-tvp-bg-tertiary rounded w-3/4 mb-1" />
          <div className="h-3 bg-tvp-bg-tertiary rounded w-1/2" />
        </div>
      ))}
    </div>
  );
}

// Chart section - trending in a specific genre
function ChartSection({ title, sortBy, limit = 15 }: { title: string; sortBy: 'popular' | 'newest'; limit?: number }) {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchChart() {
      setLoading(true);
      try {
        const response = await get<unknown>('/videos', { sortBy, limit });

        if (cancelled) return;

        const data = extractTracks(response);
        setTracks(data);
      } catch (err) {
        console.error(`Failed to fetch ${title}:`, err);
        setTracks([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchChart();
    return () => { cancelled = true; };
  }, [sortBy, limit]);

  const { viewMode } = useAppStore();

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-tvp-text-primary">{title}</h2>

      {loading ? (
        <SectionSkeleton />
      ) : tracks.length === 0 ? (
        <div className="py-12 text-center text-tvp-text-muted">
          No tracks found for {title.toLowerCase()}
        </div>
      ) : (
        <>
          {viewMode === 'list' ? (
            <VideoList tracks={tracks} showHeader={true} />
          ) : (
            <VideoGrid tracks={tracks} />
          )}
        </>
      )}
    </div>
  );
}

export default function ChartsPage() {
  return (
    <div className="space-y-12">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-tvp-text-primary mb-2">Charts</h1>
        <p className="text-tvp-text-muted">
          Top videos this week and hottest new releases
        </p>
      </div>

      {/* Trending Now */}
      <ChartSection title="🔥 Trending Now" sortBy="popular" limit={20} />

      {/* New Releases */}
      <ChartSection title="✨ New Releases" sortBy="newest" limit={15} />
    </div>
  );
}

// ============================================
// THE VIDEO POOL - HOME PAGE
// ============================================

import { useTrendingVideos, useNewReleases, useRecommendedVideos, useVideosByGenre } from '@/hooks/useVideos';
import { useUIStore } from '@/stores/uiStore';
import VideoSection from '@/components/VideoSection';
import WeeklyPackSection from '@/components/WeeklyPackSection';

export default function HomePage() {
  const { sectionPreferences } = useUIStore();

  // Fetch all section data
  const { data: trending, isLoading: loadingTrending } = useTrendingVideos(20);
  const { data: newReleases, isLoading: loadingNew } = useNewReleases(20);
  const { data: forYou, isLoading: loadingForYou } = useRecommendedVideos(20);

  // Fetch genre sections
  const { data: hipHop } = useVideosByGenre('Hip-Hop', 20);
  const { data: edm } = useVideosByGenre('EDM', 20);
  const { data: latin } = useVideosByGenre('Latin', 20);
  const { data: pop } = useVideosByGenre('Pop', 20);

  // Section configuration
  const sections = [
    { id: 'weekly-pack', component: <WeeklyPackSection key="weekly-pack" /> },
    { id: 'trending', title: 'Trending Now', videos: trending || [], accentColor: '#ff6b4a' },
    { id: 'new-releases', title: 'New Releases', videos: newReleases || [], accentColor: '#00d4ff' },
    { id: 'for-you', title: 'For You', videos: forYou || [], accentColor: '#ffd700' },
    { id: 'hip-hop', title: 'Hip-Hop', videos: hipHop || [] },
    { id: 'edm', title: 'EDM', videos: edm || [] },
    { id: 'latin', title: 'Latin', videos: latin || [] },
    { id: 'pop', title: 'Pop', videos: pop || [] },
  ];

  // Sort sections by user preference
  const sortedSections = [...sections].sort((a, b) => {
    const indexA = sectionPreferences.order.indexOf(a.id);
    const indexB = sectionPreferences.order.indexOf(b.id);
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;
    return indexA - indexB;
  });

  // Loading skeleton
  if (loadingTrending && loadingNew && loadingForYou) {
    return (
      <div className="space-y-8 px-6 py-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="h-6 w-40 bg-tvp-bg-tertiary rounded mb-4" />
            <div className="flex gap-4 overflow-hidden">
              {[1, 2, 3, 4, 5, 6].map((j) => (
                <div key={j} className="w-48 flex-shrink-0">
                  <div className="aspect-video bg-tvp-bg-tertiary rounded-lg" />
                  <div className="h-4 w-full bg-tvp-bg-tertiary rounded mt-2" />
                  <div className="h-3 w-2/3 bg-tvp-bg-tertiary rounded mt-1" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      {sortedSections.map((section, idx) => {
        if (section.component) {
          // Wrap WeeklyPackSection with alternating background
          return (
            <div
              key={section.id}
              className={idx % 2 === 0
                ? 'bg-tvp-bg-primary'
                : 'bg-tvp-bg-secondary border-t border-b border-tvp-border-subtle'
              }
            >
              {section.component}
            </div>
          );
        }
        return (
          <VideoSection
            key={section.id}
            id={section.id}
            title={section.title!}
            videos={section.videos!}
            accentColor={section.accentColor}
            index={idx}
          />
        );
      })}
    </div>
  );
}

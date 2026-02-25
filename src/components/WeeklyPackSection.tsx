// ============================================
// THE VIDEO POOL - WEEKLY PACK SECTION (Simplified)
// Clean horizontal row of tracks with Download All
// ============================================

import { ChevronDown, ChevronUp, Sparkles, Download } from 'lucide-react';
import { useUIStore } from '@/stores/uiStore';
import { useRecommendedVideos } from '@/hooks/useVideos';
import VideoCard from './VideoCard';

export default function WeeklyPackSection() {
  const { sectionPreferences, toggleSectionCollapse } = useUIStore();
  const { data: videos, isLoading } = useRecommendedVideos(10);

  const isCollapsed = sectionPreferences.collapsed.includes('weekly-pack');

  if (isLoading) {
    return (
      <section className="mx-6 my-4">
        <div className="bg-tvp-bg-secondary rounded-2xl p-6 animate-pulse">
          <div className="h-8 w-64 bg-tvp-bg-elevated rounded mb-4" />
          <div className="flex gap-4 overflow-hidden">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="w-40 flex-shrink-0">
                <div className="aspect-video bg-tvp-bg-elevated rounded-lg" />
                <div className="h-4 bg-tvp-bg-elevated rounded mt-2" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!videos || videos.length === 0) return null;

  return (
    <section className="mx-6 my-4">
      <div className="bg-tvp-bg-secondary rounded-2xl overflow-hidden border border-tvp-border-subtle">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-tvp-border-subtle">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-tvp-accent-cyan/20 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-tvp-accent-cyan" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-tvp-text-primary flex items-center gap-2">
                Weekly Discovery Pack
                <span className="px-2 py-0.5 bg-tvp-accent-cyan/20 text-tvp-accent-cyan text-xs font-medium rounded-full">
                  NEW
                </span>
              </h2>
              <p className="text-sm text-tvp-text-muted">10 personalized picks just for you</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-tvp-accent-cyan hover:bg-tvp-accent-cyan-hover text-tvp-bg-primary font-medium rounded-lg transition-colors">
              <Download className="w-4 h-4" />
              Download All
            </button>
            <button
              onClick={() => toggleSectionCollapse('weekly-pack')}
              className="p-2 text-tvp-text-muted hover:text-tvp-text-primary hover:bg-tvp-bg-tertiary rounded-lg transition-colors"
            >
              {isCollapsed ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Content — horizontal row */}
        {!isCollapsed && (
          <div className="p-6 overflow-x-auto hide-scrollbar">
            <div className="flex gap-4">
              {videos.slice(0, 10).map((video) => (
                <VideoCard key={video.id} video={video} size="sm" showStats={false} />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

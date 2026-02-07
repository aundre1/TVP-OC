// ============================================
// THE VIDEO POOL - WEEKLY PACK SECTION
// ============================================

import { ChevronDown, ChevronUp, Sparkles, Download, Play } from 'lucide-react';
import { useUIStore } from '@/stores/uiStore';
import { useRecommendedVideos } from '@/hooks/useVideos';
import VideoCard from './VideoCard';

export default function WeeklyPackSection() {
  const { sectionPreferences, toggleSectionCollapse } = useUIStore();
  const { data: videos, isLoading } = useRecommendedVideos(20);

  const isCollapsed = sectionPreferences.collapsed.includes('weekly-pack');
  const featuredVideo = videos?.[0];

  if (isLoading) {
    return (
      <section className="mx-6 my-4">
        <div className="bg-gradient-to-r from-tvp-bg-tertiary to-tvp-bg-secondary rounded-2xl p-6 animate-pulse">
          <div className="h-8 w-64 bg-tvp-bg-elevated rounded mb-4" />
          <div className="flex gap-6">
            <div className="w-80 aspect-video bg-tvp-bg-elevated rounded-xl" />
            <div className="flex-1 flex gap-4 overflow-hidden">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-40 flex-shrink-0">
                  <div className="aspect-video bg-tvp-bg-elevated rounded-lg" />
                  <div className="h-4 bg-tvp-bg-elevated rounded mt-2" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (!videos || videos.length === 0) return null;

  return (
    <section className="mx-6 my-4">
      <div className="bg-gradient-to-r from-tvp-accent-cyan/10 via-tvp-bg-secondary to-tvp-accent-gold/10 rounded-2xl overflow-hidden border border-tvp-border-subtle">
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
              <p className="text-sm text-tvp-text-muted">20 personalized picks just for you</p>
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

        {/* Content */}
        {!isCollapsed && (
          <div className="p-6">
            <div className="flex gap-6">
              {/* Featured Video */}
              {featuredVideo && (
                <div className="w-80 flex-shrink-0">
                  <div className="relative aspect-video rounded-xl overflow-hidden bg-tvp-bg-tertiary group cursor-pointer">
                    <img
                      src={featuredVideo.thumbnailUrl}
                      alt={featuredVideo.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <button className="absolute inset-0 flex items-center justify-center">
                      <div className="w-14 h-14 bg-tvp-accent-cyan rounded-full flex items-center justify-center transform scale-90 group-hover:scale-100 transition-transform">
                        <Play className="w-6 h-6 text-tvp-bg-primary ml-1" fill="currentColor" />
                      </div>
                    </button>
                    <div className="absolute bottom-4 left-4 right-4">
                      <span className="px-2 py-1 bg-tvp-accent-gold text-tvp-bg-primary text-xs font-bold rounded mb-2 inline-block">
                        TOP PICK
                      </span>
                      <h3 className="text-lg font-semibold text-white">{featuredVideo.title}</h3>
                      <p className="text-sm text-white/80">{featuredVideo.artist}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Remaining Videos */}
              <div className="flex-1 overflow-x-auto hide-scrollbar">
                <div className="flex gap-4">
                  {videos.slice(1, 10).map((video) => (
                    <VideoCard key={video.id} video={video} size="sm" showStats={false} />
                  ))}
                </div>
              </div>
            </div>

            {/* View All Link */}
            <div className="mt-4 text-center">
              <button className="text-sm font-medium text-tvp-accent-cyan hover:text-tvp-accent-cyan-hover transition-colors">
                View all 20 picks →
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

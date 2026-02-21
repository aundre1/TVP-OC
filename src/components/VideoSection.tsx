// ============================================
// THE VIDEO POOL - VIDEO SECTION COMPONENT
// ============================================

import { useState, useRef } from 'react';
import { ChevronLeft, ChevronRight, ChevronDown, ChevronUp, GripVertical } from 'lucide-react';
import { useUIStore } from '@/stores/uiStore';
import VideoCard from './VideoCard';
import type { Video } from '@/types';

interface VideoSectionProps {
  id: string;
  title: string;
  videos: Video[];
  showSeeAll?: boolean;
  isDraggable?: boolean;
  isCollapsible?: boolean;
  accentColor?: string;
  index?: number;
}

export default function VideoSection({
  id,
  title,
  videos,
  showSeeAll = true,
  isDraggable = true,
  isCollapsible = true,
  accentColor,
  index = 0,
}: VideoSectionProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { sectionPreferences, toggleSectionCollapse, openSidePanel } = useUIStore();

  const isCollapsed = sectionPreferences.collapsed.includes(id);
  const [isDragging, setIsDragging] = useState(false);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = scrollRef.current.clientWidth * 0.8;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  const handleSeeAll = () => {
    openSidePanel('seeAll', { sectionId: id, title, videos });
  };

  if (videos.length === 0) return null;

  // Alternating section backgrounds for visual contrast
  const sectionBgClass = index % 2 === 0
    ? 'bg-tvp-bg-primary'
    : 'bg-tvp-bg-secondary border-t border-b border-tvp-border-subtle';

  return (
    <section
      className={`relative py-4 transition-all duration-300 ${sectionBgClass} ${isDragging ? 'opacity-50 scale-[0.98]' : ''}`}
      draggable={isDraggable}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={() => setIsDragging(false)}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 mb-4">
        <div className="flex items-center gap-3">
          {isDraggable && (
            <div className="cursor-grab text-tvp-text-muted hover:text-tvp-text-secondary opacity-0 group-hover:opacity-100 transition-opacity">
              <GripVertical className="w-5 h-5" />
            </div>
          )}
          <h2
            className="text-xl font-semibold text-tvp-text-primary"
            style={accentColor ? { color: accentColor } : {}}
          >
            {title}
          </h2>
          <span className="px-2 py-0.5 bg-tvp-bg-tertiary rounded-full text-xs text-tvp-text-muted">
            {videos.length}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {showSeeAll && (
            <button
              onClick={handleSeeAll}
              className="text-sm font-medium text-tvp-accent-cyan hover:text-tvp-accent-cyan-hover transition-colors"
            >
              See All
            </button>
          )}
          {isCollapsible && (
            <button
              onClick={() => toggleSectionCollapse(id)}
              className="p-1.5 text-tvp-text-muted hover:text-tvp-text-primary hover:bg-tvp-bg-tertiary rounded-lg transition-colors"
            >
              {isCollapsed ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      {!isCollapsed && (
        <div className="relative group">
          {/* Scroll Buttons */}
          <button
            onClick={() => scroll('left')}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-tvp-bg-elevated/90 hover:bg-tvp-bg-elevated rounded-full flex items-center justify-center text-tvp-text-primary shadow-elevated opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-0"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => scroll('right')}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-tvp-bg-elevated/90 hover:bg-tvp-bg-elevated rounded-full flex items-center justify-center text-tvp-text-primary shadow-elevated opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Video Grid */}
          <div
            ref={scrollRef}
            className="flex gap-4 px-6 overflow-x-auto hide-scrollbar scroll-smooth"
          >
            {videos.map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

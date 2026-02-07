// ============================================
// THE VIDEO POOL - VIDEO GRID v5.5
// Responsive grid layout for video cards
// ============================================

import { Track } from '@/types';
import { Search } from 'lucide-react';
import VideoCard from './VideoCardV2';

interface VideoGridProps {
  tracks: Track[];
  showCheckbox?: boolean;
  emptyMessage?: string;
  emptySubMessage?: string;
}

export default function VideoGrid({
  tracks,
  showCheckbox = true,
  emptyMessage = 'No videos found',
  emptySubMessage = 'Try adjusting your filters or search terms',
}: VideoGridProps) {
  // Empty state
  if (tracks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-tvp-bg-tertiary flex items-center justify-center mb-4">
          <Search className="w-8 h-8 text-tvp-text-muted" />
        </div>
        <h3 className="text-lg font-medium text-tvp-text-primary mb-2">
          {emptyMessage}
        </h3>
        <p className="text-tvp-text-secondary max-w-md">
          {emptySubMessage}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-5">
      {tracks.map((track) => (
        <VideoCard key={track.id} track={track} showCheckbox={showCheckbox} />
      ))}
    </div>
  );
}

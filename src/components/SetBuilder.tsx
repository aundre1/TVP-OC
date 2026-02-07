// ============================================
// THE VIDEO POOL - SET BUILDER PANEL v6.0 (Reskinned)
// Right slide-out panel with drag-drop and
// smart recommendations (BPM/Key/Genre algorithm)
// ============================================

import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  X,
  GripVertical,
  Play,
  Trash2,
  Download,
  Plus,
  Sparkles,
  Music,
  Clock,
  Zap,
  Share2,
  Info,
  Check,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/stores/appStore';
import { getAllTracks } from '@/data/tracks';
import { SetBuilderTrack, Track } from '@/types';
import ShareSetModal from './ShareSetModal';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

// Sortable Track Item
function SortableTrackItem({
  track,
  index,
  onRemove,
  onPlay,
}: {
  track: SetBuilderTrack;
  index: number;
  onRemove: () => void;
  onPlay: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: track.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        background: 'var(--bg-tertiary)',
        border: '1px solid var(--border-subtle)',
      }}
      className={cn(
        'flex items-center gap-3 p-3 rounded-lg transition-all',
        isDragging && 'opacity-50 shadow-lg z-50'
      )}
    >
      {/* Drag Handle */}
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing hover:text-cyan-400 transition-colors"
        style={{ color: 'var(--text-muted)' }}
      >
        <GripVertical className="w-4 h-4" />
      </button>

      {/* Track Number */}
      <span className="w-6 text-center text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
        {index + 1}
      </span>

      {/* Track Info */}
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
          {track.title}
        </div>
        <div className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
          {track.artist}
        </div>
      </div>

      {/* BPM/Key */}
      <div className="flex items-center gap-2 text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
        <span>{track.bpm}</span>
        <span className="text-cyan-400">{track.key}</span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1">
        <button
          onClick={onPlay}
          className="p-1.5 rounded hover:text-cyan-400 transition-colors"
          style={{ color: 'var(--text-muted)' }}
          title="Preview"
        >
          <Play className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={onRemove}
          className="p-1.5 rounded hover:text-red-400 transition-colors"
          style={{ color: 'var(--text-muted)' }}
          title="Remove"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

// Recommendation Item with Transparency
function RecommendationItem({
  track,
  score,
  reasons,
  onAdd,
}: {
  track: Track;
  score: number;
  reasons: string[];
  onAdd: () => void;
}) {
  const [showDetails, setShowDetails] = useState(false);

  // Score breakdown for tooltip
  const getScoreLabel = (s: number) => {
    if (s >= 75) return 'Excellent';
    if (s >= 60) return 'Great';
    if (s >= 40) return 'Good';
    if (s >= 20) return 'Fair';
    return 'Low';
  };

  return (
    <div className="group">
      <div
        className={cn(
          'flex items-center gap-3 p-3 rounded-lg transition-colors hover:border-cyan-400/50',
          showDetails && 'border-cyan-400/30'
        )}
        style={{
          background: 'var(--bg-tertiary)',
          border: '1px solid var(--border-subtle)',
        }}
      >
        {/* Score Indicator */}
        <button
          onClick={() => setShowDetails(!showDetails)}
          className={cn(
            'relative w-10 h-10 rounded-full flex flex-col items-center justify-center',
            'text-xs font-bold transition-transform hover:scale-105',
            score >= 60 ? 'bg-green-500/20 text-green-400' :
            score >= 40 ? 'bg-yellow-500/20 text-yellow-400' :
            'text-gray-400'
          )}
          style={score < 40 ? { background: 'var(--bg-elevated)' } : undefined}
          title={`Match Score: ${score} (${getScoreLabel(score)})`}
        >
          <span className="text-sm font-bold">{score}</span>
          <Info className="w-3 h-3 absolute -bottom-0.5 -right-0.5 opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>

        {/* Track Info */}
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
            {track.title}
          </div>
          <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-muted)' }}>
            <span className="truncate">{track.artist}</span>
            <span>•</span>
            <span className="font-mono">{track.bpm} BPM</span>
            <span>•</span>
            <span className="font-mono text-cyan-400">{track.key}</span>
          </div>
          <div className="flex flex-wrap gap-1 mt-1.5">
            {reasons.map((reason, i) => {
              const [type] = reason.split(':').map(s => s.trim());
              const isActive = reason.toLowerCase().includes('harmonic') ||
                               reason.toLowerCase().includes('same');
              return (
                <span
                  key={i}
                  className={cn(
                    'text-[10px] px-1.5 py-0.5 rounded',
                    isActive ? 'bg-cyan-400/20 text-cyan-400' : ''
                  )}
                  style={!isActive ? { background: 'var(--bg-elevated)', color: 'var(--text-muted)' } : undefined}
                  title={reason}
                >
                  {type}
                </span>
              );
            })}
          </div>
        </div>

        {/* Add Button */}
        <button
          onClick={onAdd}
          className="p-2 rounded-lg bg-cyan-400 text-black hover:bg-cyan-300 transition-colors"
          title="Add to set"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Expanded Details Panel */}
      {showDetails && (
        <div
          className="mt-1 ml-12 p-2.5 rounded-lg"
          style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}
        >
          <div className="flex items-center gap-2 mb-2 text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
            <Sparkles className="w-3 h-3 text-cyan-400" />
            Why this track?
          </div>
          <ul className="space-y-1">
            {reasons.map((reason, i) => (
              <li key={i} className="flex items-start gap-2 text-xs" style={{ color: 'var(--text-muted)' }}>
                <Check className="w-3 h-3 text-green-400 flex-shrink-0 mt-0.5" />
                <span>{reason}</span>
              </li>
            ))}
          </ul>
          <div
            className="mt-2 pt-2 flex justify-between items-center text-[10px]"
            style={{ borderTop: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}
          >
            <span>Match Quality: {getScoreLabel(score)}</span>
            <span className="font-mono">{score}/100</span>
          </div>
        </div>
      )}
    </div>
  );
}

// Main Set Builder Panel
export default function SetBuilder() {
  const {
    isSetBuilderOpen,
    closeSetBuilder,
    setBuilderTracks,
    removeFromSet,
    reorderSet,
    clearSet,
    getSetRecommendations,
    addToSet,
    openPreviewModal,
    showToast,
    openScoringModal,
  } = useAppStore();

  const [showRecommendations, setShowRecommendations] = useState(true);
  const [showShareModal, setShowShareModal] = useState(false);
  const [setName, setSetName] = useState('My DJ Set');
  const [isEditingName, setIsEditingName] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = setBuilderTracks.findIndex((t) => t.id === active.id);
      const newIndex = setBuilderTracks.findIndex((t) => t.id === over.id);
      reorderSet(oldIndex, newIndex);
    }
  };

  const recommendations = getSetRecommendations(getAllTracks(), 5);

  const totalDuration = setBuilderTracks.reduce((acc, track) => {
    if (typeof track.duration === 'number') return acc + track.duration;
    const parts = track.duration.split(':').map(Number);
    if (parts.length === 2) return acc + parts[0] * 60 + parts[1];
    return acc + (parseInt(track.duration, 10) || 0);
  }, 0);

  const formatDuration = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hrs > 0) return `${hrs}h ${mins}m`;
    return `${mins}m`;
  };

  const handleDownloadSet = () => {
    showToast('info', `Downloading ${setBuilderTracks.length} tracks...`);
  };

  return (
    <>
      <Sheet open={isSetBuilderOpen} onOpenChange={(open) => !open && closeSetBuilder()}>
        <SheetContent
          side="right"
          className="w-[400px] max-w-full p-0 flex flex-col"
          style={{
            background: 'var(--bg-secondary)',
            borderLeft: '1px solid var(--border-subtle)',
          }}
        >
          {/* Header */}
          <SheetHeader className="px-5 py-4" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                {isEditingName ? (
                  <input
                    type="text"
                    value={setName}
                    onChange={(e) => setSetName(e.target.value)}
                    onBlur={() => setIsEditingName(false)}
                    onKeyDown={(e) => e.key === 'Enter' && setIsEditingName(false)}
                    autoFocus
                    className="text-lg font-bold bg-transparent border-b border-cyan-400 outline-none w-full"
                  />
                ) : (
                  <SheetTitle
                    onClick={() => setIsEditingName(true)}
                    className="text-lg font-bold flex items-center gap-2 cursor-pointer hover:text-cyan-400 transition-colors"
                  >
                    <Music className="w-5 h-5 text-cyan-400" />
                    {setName}
                  </SheetTitle>
                )}
                <div className="flex items-center gap-4 mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                  <span>{setBuilderTracks.length} tracks</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatDuration(totalDuration)}
                  </span>
                </div>
              </div>

              {setBuilderTracks.length > 0 && (
                <button
                  onClick={() => setShowShareModal(true)}
                  className="p-2 rounded-lg hover:bg-cyan-400 hover:text-black transition-colors"
                  style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}
                  title="Share Set"
                >
                  <Share2 className="w-5 h-5" />
                </button>
              )}
            </div>
          </SheetHeader>

          {/* Track List */}
          <div className="flex-1 overflow-y-auto p-4">
            {setBuilderTracks.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center px-8">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
                  style={{ background: 'var(--bg-tertiary)' }}
                >
                  <Music className="w-8 h-8" style={{ color: 'var(--text-muted)' }} />
                </div>
                <h3 className="text-lg font-semibold mb-2">Your set is empty</h3>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  Add tracks to build your perfect DJ set. Use the <kbd className="px-1.5 py-0.5 rounded bg-black/20 text-xs font-mono mx-1">S</kbd> key
                  or click the + button on any track.
                </p>
              </div>
            ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={setBuilderTracks.map((t) => t.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2">
                  {setBuilderTracks.map((track, index) => (
                    <SortableTrackItem
                      key={track.id}
                      track={track}
                      index={index}
                      onRemove={() => removeFromSet(track.id)}
                      onPlay={() => openPreviewModal(track.id)}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}

            {/* Recommendations Section */}
            {setBuilderTracks.length > 0 && recommendations.length > 0 && (
              <div className="mt-6">
                <div className="flex items-center justify-between mb-3">
                  <button
                    onClick={() => setShowRecommendations(!showRecommendations)}
                    className="flex items-center gap-2 text-sm font-semibold text-cyan-400"
                  >
                    <Sparkles className="w-4 h-4" />
                    Recommended Next
                    <Zap className="w-3 h-3" />
                  </button>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={openScoringModal}
                      className="text-xs hover:text-cyan-400 hover:underline transition-colors"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      How scoring works
                    </button>

                    <button
                      onClick={() => {
                        const tracksToAdd = recommendations.slice(0, 5);
                        tracksToAdd.forEach(rec => addToSet(rec.track));
                        showToast('success', `Added ${tracksToAdd.length} tracks to your set`);
                      }}
                      className="flex items-center gap-1 text-xs text-cyan-400 hover:underline transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                      Add Top {Math.min(5, recommendations.length)}
                    </button>
                  </div>
                </div>

                {showRecommendations && (
                  <div className="space-y-2">
                    {recommendations.map(({ track, score, reasons }) => (
                      <RecommendationItem
                        key={track.id}
                        track={track}
                        score={score}
                        reasons={reasons}
                        onAdd={() => addToSet(track)}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer Actions */}
          {setBuilderTracks.length > 0 && (
            <div className="px-4 py-4" style={{ borderTop: '1px solid var(--border-subtle)' }}>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={clearSet}
                  className="flex-1 hover:border-red-400 hover:text-red-400"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear
                </Button>
                <Button
                  onClick={handleDownloadSet}
                  className="flex-[2] bg-cyan-400 text-black hover:bg-cyan-300"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Set
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Share Modal */}
      <ShareSetModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        tracks={setBuilderTracks}
        setName={setName}
      />
    </>
  );
}

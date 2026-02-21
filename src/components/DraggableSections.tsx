// ============================================
// THE VIDEO POOL - DRAGGABLE SECTIONS v5.5
// Section reordering with drag-drop
// localStorage persistence
// ============================================

import { ReactNode, useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, ChevronDown } from 'lucide-react';
import { clsx } from 'clsx';
import { useAppStore } from '@/stores/appStore';

interface SectionData {
  id: string;
  title: string;
  content: ReactNode;
  seeAllLink?: string;
}

interface SortableSectionProps {
  section: SectionData;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

// Individual sortable section
function SortableSection({ section, isCollapsed, onToggleCollapse }: SortableSectionProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 100 : undefined,
    position: 'relative' as const,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={clsx(
        'mb-6 pt-6 border-t border-tvp-border-subtle',
        'first:border-t-0 first:pt-0',
        isDragging && 'opacity-70 bg-tvp-bg-elevated rounded-xl shadow-elevated'
      )}
    >
      {/* Section Header */}
      <div
        className="flex items-center gap-2 py-2 cursor-pointer select-none group/header"
        onClick={onToggleCollapse}
      >
        {/* Drag Handle */}
        <button
          type="button"
          className={clsx(
            'w-7 h-7 flex items-center justify-center rounded',
            'text-tvp-text-muted cursor-grab active:cursor-grabbing',
            'opacity-40 hover:opacity-100 transition-all',
            'hover:text-tvp-accent-cyan hover:bg-tvp-accent-cyan/10',
            'touch-none'
          )}
          style={{ touchAction: 'none' }}
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
          }}
          onPointerDown={(e) => e.stopPropagation()}
          title="Drag to reorder sections"
          aria-label={`Drag to reorder ${section.title} section`}
          {...attributes}
          {...listeners}
        >
          <GripVertical className="w-4 h-4" />
        </button>

        {/* Title */}
        <h2 className="text-lg font-semibold text-tvp-text-primary flex-1">{section.title}</h2>

        {/* See All Link */}
        {section.seeAllLink && (
          <button
            onClick={(e) => e.stopPropagation()}
            className="text-tvp-text-muted text-xs font-medium hover:text-tvp-accent-cyan transition-colors"
          >
            See all
          </button>
        )}

        {/* Collapse Toggle */}
        <button
          className={clsx(
            'w-7 h-7 flex items-center justify-center rounded-md',
            'text-tvp-text-muted hover:text-tvp-text-primary hover:bg-tvp-bg-tertiary',
            'transition-all',
            isCollapsed && '-rotate-90'
          )}
          title={isCollapsed ? 'Expand section' : 'Collapse section'}
        >
          <ChevronDown className="w-4 h-4" />
        </button>
      </div>

      {/* Section Content */}
      <div
        className={clsx(
          'transition-all duration-300 overflow-hidden',
          isCollapsed ? 'max-h-0 opacity-0 mt-0' : 'max-h-[2000px] opacity-100 mt-2'
        )}
      >
        {section.content}
      </div>
    </div>
  );
}

// Drag overlay for better UX
function DragOverlayContent({ section }: { section: SectionData | null }) {
  if (!section) return null;

  return (
    <div
      className="p-4 bg-tvp-bg-secondary border-2 border-tvp-accent-cyan rounded-xl shadow-elevated"
      style={{
        boxShadow: '0 20px 40px rgba(0, 212, 255, 0.3), 0 10px 20px rgba(0, 0, 0, 0.4)',
        cursor: 'grabbing',
      }}
    >
      <div className="flex items-center gap-3">
        <GripVertical className="w-5 h-5 text-tvp-accent-cyan" />
        <span className="text-lg font-semibold text-tvp-text-primary">{section.title}</span>
      </div>
    </div>
  );
}

// Main draggable sections container
interface DraggableSectionsProps {
  sections: SectionData[];
}

export default function DraggableSections({ sections: initialSections }: DraggableSectionsProps) {
  const { sectionOrder, setSectionOrder, collapsedSections, toggleSectionCollapse } = useAppStore();
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // Reduced for easier activation
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 150, // Short delay to distinguish from scroll
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Sort sections based on stored order
  const sortedSections = [...initialSections].sort((a, b) => {
    const aIndex = sectionOrder.indexOf(a.id);
    const bIndex = sectionOrder.indexOf(b.id);
    if (aIndex === -1 && bIndex === -1) return 0;
    if (aIndex === -1) return 1;
    if (bIndex === -1) return -1;
    return aIndex - bIndex;
  });

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (over && active.id !== over.id) {
      const oldIndex = sortedSections.findIndex((s) => s.id === active.id);
      const newIndex = sortedSections.findIndex((s) => s.id === over.id);

      const newOrder = arrayMove(
        sortedSections.map((s) => s.id),
        oldIndex,
        newIndex
      );

      setSectionOrder(newOrder);
    }
  };

  const activeSection = activeId
    ? sortedSections.find((s) => s.id === activeId)
    : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={sortedSections.map((s) => s.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-0">
          {sortedSections.map((section) => (
            <SortableSection
              key={section.id}
              section={section}
              isCollapsed={collapsedSections.includes(section.id)}
              onToggleCollapse={() => toggleSectionCollapse(section.id)}
            />
          ))}
        </div>
      </SortableContext>

      <DragOverlay
        dropAnimation={{
          duration: 250,
          easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)',
        }}
        style={{ zIndex: 9999 }}
      >
        <DragOverlayContent section={activeSection || null} />
      </DragOverlay>
    </DndContext>
  );
}

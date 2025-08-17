import React from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy
} from '@dnd-kit/sortable';
import {
  restrictToVerticalAxis,
  restrictToParentElement
} from '@dnd-kit/modifiers';
import { PromptSegment, PromptSegment as SegmentType } from './PromptSegment';

// Define DragEndEvent inline to avoid import issues
interface DragEndEvent {
  active: { id: string | number };
  over: { id: string | number } | null;
}

interface SegmentsPanelProps {
  segments: SegmentType[];
  onReorderSegments: (segments: SegmentType[]) => void;
  onUpdateSegment: (id: string, updates: Partial<SegmentType>) => void;
  onMakeConcise: (id: string) => void;
  isLoading: boolean;
  hasApiKey: boolean;
}

export const SegmentsPanel: React.FC<SegmentsPanelProps> = ({
  segments,
  onReorderSegments,
  onUpdateSegment,
  onMakeConcise,
  isLoading,
  hasApiKey
}) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = segments.findIndex(item => item.id === active.id);
      const newIndex = segments.findIndex(item => item.id === over?.id);

      const newSegments = arrayMove(segments, oldIndex, newIndex);
      onReorderSegments(newSegments);
    }
  };

  const includedCount = segments.filter(s => s.isIncluded).length;
  const totalCharacters = segments
    .filter(s => s.isIncluded)
    .reduce((sum, s) => sum + s.content.length, 0);

  const handleSelectAll = () => {
    segments.forEach(segment => {
      if (!segment.isIncluded) {
        onUpdateSegment(segment.id, { isIncluded: true });
      }
    });
  };

  const handleSelectNone = () => {
    segments.forEach(segment => {
      if (segment.isIncluded) {
        onUpdateSegment(segment.id, { isIncluded: false });
      }
    });
  };

  if (segments.length === 0) {
    return (
      <div className="segments-panel empty">
        <div className="empty-state">
          <div className="empty-icon">Document</div>
          <h3>No segments yet</h3>
          <p>Paste a prompt in the input area and click "Break Into Sections" to get started.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="segments-panel">
      <div className="segments-header">
        <h2>Prompt Segments</h2>
        <div className="segments-stats">
          <span className="segment-count">
            {includedCount} of {segments.length} included
          </span>
          <span className="char-count">
            {totalCharacters.toLocaleString()} characters
          </span>
        </div>
      </div>

      <div className="segments-controls">
        <div className="bulk-actions">
          <button 
            onClick={handleSelectAll}
            className="btn-select-all"
            disabled={includedCount === segments.length}
          >
            Select All
          </button>
          <button 
            onClick={handleSelectNone}
            className="btn-select-none"
            disabled={includedCount === 0}
          >
            Select None
          </button>
        </div>
        
        <div className="segments-info">
          <small>Tip: Drag segments to reorder • Uncheck to exclude from output</small>
        </div>
      </div>

      <div className="segments-list">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
          modifiers={[restrictToVerticalAxis, restrictToParentElement]}
        >
          <SortableContext
            items={segments.map(s => s.id)}
            strategy={verticalListSortingStrategy}
          >
            {segments.map((segment) => (
              <PromptSegment
                key={segment.id}
                segment={segment}
                onUpdate={onUpdateSegment}
                onMakeConcise={onMakeConcise}
                isLoading={isLoading}
                hasApiKey={hasApiKey}
              />
            ))}
          </SortableContext>
        </DndContext>
      </div>

      <div className="segments-footer">
        <div className="reorder-help">
          <details>
            <summary>How to use segments</summary>
            <ul>
              <li><strong>Drag & Drop:</strong> Use the drag handle to reorder segments</li>
              <li><strong>Include/Exclude:</strong> Check/uncheck to control what goes in the final output</li>
              <li><strong>Edit:</strong> Click Edit to manually edit any segment</li>
              <li><strong>Make Concise:</strong> Click Concise to make a segment more concise with AI</li>
              <li><strong>Order matters:</strong> The final output will follow the segment order</li>
            </ul>
          </details>
        </div>
      </div>
    </div>
  );
};
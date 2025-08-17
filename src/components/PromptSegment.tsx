import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faGripVertical,
  faEdit,
  faChevronDown,
  faChevronUp,
  faSave,
  faTimes,
  faSpinner,
  faCut
} from '@fortawesome/free-solid-svg-icons';

export interface PromptSegment {
  id: string;
  content: string;
  title: string;
  isIncluded: boolean;
  order: number;
  isEditing: boolean;
  isExpanded?: boolean;
}

interface PromptSegmentProps {
  segment: PromptSegment;
  onUpdate: (id: string, updates: Partial<PromptSegment>) => void;
  onMakeConcise: (id: string) => void;
  isLoading: boolean;
  hasApiKey: boolean;
}

export const PromptSegment: React.FC<PromptSegmentProps> = ({
  segment,
  onUpdate,
  onMakeConcise,
  isLoading,
  hasApiKey
}) => {
  const [editedContent, setEditedContent] = useState(segment.content);
  const [originalContent, setOriginalContent] = useState(segment.content);
  const [isExpanded, setIsExpanded] = useState(segment.isExpanded ?? false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: segment.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1
  };

  const handleToggleInclude = () => {
    onUpdate(segment.id, { isIncluded: !segment.isIncluded });
  };

  const handleStartEdit = () => {
    setOriginalContent(segment.content);
    setEditedContent(segment.content);
    onUpdate(segment.id, { isEditing: true });
  };

  const handleSaveEdit = () => {
    onUpdate(segment.id, { 
      content: editedContent,
      isEditing: false 
    });
  };

  const handleCancelEdit = () => {
    setEditedContent(originalContent);
    onUpdate(segment.id, { isEditing: false });
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditedContent(e.target.value);
  };

  const handleMakeConcise = () => {
    if (hasApiKey && !isLoading) {
      onMakeConcise(segment.id);
    }
  };

  const handleToggleExpanded = () => {
    const newExpanded = !isExpanded;
    setIsExpanded(newExpanded);
    onUpdate(segment.id, { isExpanded: newExpanded });
  };

  const getPreviewText = (text: string, maxLength: number = 150) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  // Update edited content when segment content changes (from external updates like AI processing)
  React.useEffect(() => {
    if (!segment.isEditing) {
      setEditedContent(segment.content);
    }
  }, [segment.content, segment.isEditing]);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`prompt-segment ${segment.isIncluded ? 'included' : 'excluded'} ${isDragging ? 'dragging' : ''}`}
    >
      <div className="segment-header" onClick={(e) => {
        // Only toggle if clicking on the header itself, not buttons or controls
        if ((e.target as HTMLElement).closest('.segment-controls, .segment-actions')) {
          return;
        }
        handleToggleExpanded();
      }} style={{ cursor: 'pointer' }}>
        <div className="segment-controls">
          <button
            className="drag-handle"
            {...attributes}
            {...listeners}
            title="Drag to reorder"
          >
            <FontAwesomeIcon icon={faGripVertical} />
          </button>
          
          <label className="include-checkbox">
            <input
              type="checkbox"
              checked={segment.isIncluded}
              onChange={handleToggleInclude}
            />
            <span className="checkmark"></span>
          </label>
          
          <div className="segment-order">#{segment.order + 1}</div>
        </div>
        
        <h3 className="segment-title">{segment.title}</h3>
        
        {!isExpanded && (
          <div className="segment-preview-info">
            <span className="segment-preview-text">
              {getPreviewText(segment.content, 60)}
            </span>
            <span className="segment-char-info">
              {segment.content.length} chars
            </span>
          </div>
        )}
        
        <div className="segment-actions">
          {!segment.isEditing ? (
            <>
              <button
                onClick={handleToggleExpanded}
                className="btn-toggle"
                title={isExpanded ? "Collapse content" : "Expand content"}
              >
                <FontAwesomeIcon icon={isExpanded ? faChevronUp : faChevronDown} />
              </button>
              
              {isExpanded && (
                <>
                  <button
                    onClick={handleStartEdit}
                    className="btn-edit"
                    title="Edit manually"
                  >
                    <FontAwesomeIcon icon={faEdit} />
                  </button>
                  
                  <button
                    onClick={handleMakeConcise}
                    className="btn-concise"
                    disabled={!hasApiKey || isLoading}
                    title={hasApiKey ? "Make more concise with AI" : "API key required"}
                  >
                    {isLoading ? <FontAwesomeIcon icon={faSpinner} spin /> : <FontAwesomeIcon icon={faCut} />}
                  </button>
                </>
              )}
            </>
          ) : (
            <>
              <button
                onClick={handleSaveEdit}
                className="btn-save"
                title="Save changes"
              >
                <FontAwesomeIcon icon={faSave} />
              </button>
              
              <button
                onClick={handleCancelEdit}
                className="btn-cancel"
                title="Cancel editing"
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </>
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="segment-content">
          {segment.isEditing ? (
            <div className="edit-mode">
              <textarea
                value={editedContent}
                onChange={handleContentChange}
                className="segment-editor"
                rows={Math.max(3, editedContent.split('\n').length)}
                placeholder="Edit segment content..."
              />
              <div className="edit-info">
                <span className="char-count">{editedContent.length} characters</span>
              </div>
            </div>
          ) : (
            <div className="view-mode">
              <div className="segment-text">
                {segment.content}
              </div>
              <div className="segment-info">
                <span className="char-count">{segment.content.length} characters</span>
                {!segment.isIncluded && (
                  <span className="excluded-badge">Excluded from output</span>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
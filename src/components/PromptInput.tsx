import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChevronRight,
  faChevronLeft,
  faSpinner,
  faCog,
  faTrash,
  faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons';

interface PromptInputProps {
  value: string;
  onChange: (value: string) => void;
  onBreakPrompt: () => void;
  isLoading: boolean;
  hasApiKey: boolean;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const PromptInput: React.FC<PromptInputProps> = ({
  value,
  onChange,
  onBreakPrompt,
  isLoading,
  hasApiKey,
  isCollapsed = false,
  onToggleCollapse
}) => {
  const [charCount, setCharCount] = useState(value.length);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    setCharCount(newValue.length);
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    // Capture the target reference before setTimeout to avoid race condition
    const target = e.currentTarget;
    
    // Allow natural paste behavior, but update character count
    setTimeout(() => {
      // Use the captured target reference which won't become null
      if (target && target.value !== undefined) {
        setCharCount(target.value.length);
      }
    }, 0);
  };

  const canBreakPrompt = hasApiKey && value.trim().length > 0 && !isLoading;

  return (
    <div className={`prompt-input ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="input-header">
        {isCollapsed ? (
          <div className="collapsed-header" onClick={onToggleCollapse} title="Expand prompt input">
            <FontAwesomeIcon icon={faChevronRight} className="expand-icon" />
            <span className="collapsed-title">Input Prompt</span>
          </div>
        ) : (
          <>
            <h2>Input Prompt</h2>
            <div className="input-header-right">
              <div className="input-info">
                <span className="char-count">
                  {charCount.toLocaleString()} chars
                </span>
                {!hasApiKey && (
                  <span className="warning">
                    <FontAwesomeIcon icon={faExclamationTriangle} />
                    API key required
                  </span>
                )}
              </div>
              {onToggleCollapse && value.length > 0 && (
                <button
                  onClick={onToggleCollapse}
                  className="btn-collapse"
                  disabled={isLoading}
                  title="Collapse prompt input"
                >
                  <FontAwesomeIcon icon={faChevronLeft} />
                  Collapse
                </button>
              )}
            </div>
          </>
        )}
      </div>
      
      <div className={`input-container ${isCollapsed ? 'collapsed' : ''}`}>
        <textarea
          value={value}
          onChange={handleChange}
          onPaste={handlePaste}
          placeholder="Paste your large prompt here...

This tool will help you:
• Break down complex prompts into manageable sections
• Reorder sections with drag & drop
• Make sections more concise with AI
• Manually edit each section
• Generate a final optimized output

Start by pasting your prompt and clicking 'Break Into Sections'."
          className="prompt-textarea"
          disabled={isLoading}
          rows={12}
        />
        
        <div className="input-actions">
          <button
            onClick={onBreakPrompt}
            disabled={!canBreakPrompt}
            className={`btn-break-prompt ${canBreakPrompt ? 'enabled' : 'disabled'}`}
          >
            {isLoading ? (
              <>
                <FontAwesomeIcon icon={faSpinner} spin />
                Breaking into sections...
              </>
            ) : (
              <>
                <FontAwesomeIcon icon={faCog} />
                Break Into Sections
              </>
            )}
          </button>
          
          {value.length > 0 && (
            <button
              onClick={() => onChange('')}
              className="btn-clear"
              disabled={isLoading}
            >
              <FontAwesomeIcon icon={faTrash} />
              Clear
            </button>
          )}
        </div>
      </div>

      <div className="input-tips">
        <details>
          <summary>Tips for better results</summary>
          <ul>
            <li>Longer, more detailed prompts work better for AI segmentation</li>
            <li>The AI will identify logical sections and topics automatically</li>
            <li>Each section will be editable after breaking down</li>
            <li>You can exclude sections from the final output</li>
          </ul>
        </details>
      </div>
    </div>
  );
};
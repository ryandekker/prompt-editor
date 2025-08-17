import React, { useState } from 'react';

interface PreviewPanelProps {
  finalOutput: string;
  onExportOutput: () => void;
  isLoading: boolean;
  hasApiKey: boolean;
  segmentCount: number;
}

export const PreviewPanel: React.FC<PreviewPanelProps> = ({
  finalOutput,
  onExportOutput,
  isLoading,
  hasApiKey,
  segmentCount
}) => {
  const [viewMode, setViewMode] = useState<'preview' | 'raw'>('preview');

  const wordCount = finalOutput.split(/\s+/).filter(word => word.length > 0).length;
  const charCount = finalOutput.length;
  const lineCount = finalOutput.split('\n').length;

  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(finalOutput);
      alert('Copied to clipboard!');
    } catch (error) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = finalOutput;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('Copied to clipboard!');
    }
  };

  if (finalOutput.length === 0) {
    return (
      <div className="preview-panel empty">
        <div className="empty-state">
          <div className="empty-icon">Preview</div>
          <h3>Output Preview</h3>
          <p>Your final prompt will appear here as you work with segments.</p>
          <div className="preview-features">
            <h4>What you'll see here:</h4>
            <ul>
              <li>Real-time preview of included segments</li>
              <li>Export and copy functionality</li>
              <li>Character and word counts</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="preview-panel">
      <div className="preview-header">
        <h2>Final Output</h2>
        <div className="preview-stats">
          <span className="word-count">{wordCount.toLocaleString()} words</span>
          <span className="char-count">{charCount.toLocaleString()} chars</span>
          <span className="line-count">{lineCount} lines</span>
        </div>
      </div>

      <div className="preview-controls">
        <div className="view-controls">
          <button
            className={`btn-view ${viewMode === 'preview' ? 'active' : ''}`}
            onClick={() => setViewMode('preview')}
          >
            Preview
          </button>
          <button
            className={`btn-view ${viewMode === 'raw' ? 'active' : ''}`}
            onClick={() => setViewMode('raw')}
          >
            Raw Text
          </button>
        </div>

        <div className="preview-actions">
          <button
            onClick={handleCopyToClipboard}
            className="btn-copy"
            disabled={finalOutput.length === 0}
          >
            Copy
          </button>
          
          <button
            onClick={onExportOutput}
            className="btn-export"
            disabled={finalOutput.length === 0}
          >
            Export
          </button>
        </div>
      </div>

      <div className="preview-content">
        {viewMode === 'preview' ? (
          <div className="preview-formatted">
            {finalOutput.split('\n\n').map((paragraph, index) => (
              <div key={index} className="preview-paragraph">
                {paragraph.split('\n').map((line, lineIndex) => (
                  <div key={lineIndex} className="preview-line">
                    {line || '\u00A0' /* Non-breaking space for empty lines */}
                  </div>
                ))}
              </div>
            ))}
          </div>
        ) : (
          <textarea
            className="preview-raw"
            value={finalOutput}
            readOnly
            rows={Math.min(30, Math.max(10, lineCount))}
          />
        )}
      </div>

      <div className="preview-footer">
        <div className="output-info">
          <small>
            Tip: Output updates automatically as you modify segments
          </small>
        </div>
      </div>
    </div>
  );
};
import React, { useEffect, useState } from 'react';
import { ApiKeyManager } from './components/ApiKeyManager';
import { PromptInput } from './components/PromptInput';
import { SegmentsPanel } from './components/SegmentsPanel';
import { PreviewPanel } from './components/PreviewPanel';
import { usePromptEditor } from './hooks/usePromptEditor';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMoon, faSun, faExclamationTriangle, faTimes, faSpinner } from '@fortawesome/free-solid-svg-icons';
import './App.scss';

const App: React.FC = () => {
  const {
    state,
    config,
    setConfig,
    setOriginalPrompt,
    breakPromptIntoSegments,
    updateSegment,
    reorderSegments,
    makeConcise,
    clearError,
    saveSession,
    loadSession,
    exportOutput
  } = usePromptEditor();

  const [isPromptCollapsed, setIsPromptCollapsed] = useState(false);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Initialize dark mode from localStorage or default to true (dark mode by default)
    const saved = localStorage.getItem('prompt-editor-theme');
    return saved ? saved === 'dark' : true;
  });

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
    localStorage.setItem('prompt-editor-theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  // Auto-save session periodically
  useEffect(() => {
    const interval = setInterval(() => {
      if (state.segments.length > 0) {
        saveSession();
      }
    }, 30000); // Save every 30 seconds

    return () => clearInterval(interval);
  }, [saveSession, state.segments.length]);

  // Load session on mount
  useEffect(() => {
    const loaded = loadSession();
    if (loaded) {
      console.log('Previous session loaded');
    }
  }, [loadSession]);

  // Auto-save when segments change
  useEffect(() => {
    if (state.segments.length > 0) {
      const timeoutId = setTimeout(() => {
        saveSession();
      }, 2000); // Debounce saves

      return () => clearTimeout(timeoutId);
    }
  }, [state.segments, state.originalPrompt, saveSession]);

  const hasApiKey = config !== null;
  const includedSegments = state.segments.filter(s => s.isIncluded);

  // Auto-collapse prompt after segments are generated, but allow re-opening
  useEffect(() => {
    // Only auto-collapse if user hasn't manually interacted and segments are newly generated
    if (state.segments.length > 0 && !isPromptCollapsed && !state.isLoading && !hasUserInteracted) {
      const timeoutId = setTimeout(() => {
        setIsPromptCollapsed(true);
      }, 1000);
      
      return () => {
        clearTimeout(timeoutId);
      };
    }
  }, [state.segments.length, state.isLoading, hasUserInteracted]); // Removed isPromptCollapsed from dependencies

  // Reset user interaction flag when prompt changes or is cleared
  useEffect(() => {
    if (state.segments.length === 0) {
      setHasUserInteracted(false);
      setIsPromptCollapsed(false);
    }
  }, [state.segments.length]);

  const handleTogglePromptCollapse = () => {
    setIsPromptCollapsed(!isPromptCollapsed);
    setHasUserInteracted(true); // Mark that user has manually interacted
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <div className="app-title">
            <h1>Prompt Editor</h1>
            <p>Break down, edit, and optimize your prompts with AI assistance</p>
            {isPromptCollapsed && state.segments.length > 0 && (
              <div className="header-stats">
                <span>{state.segments.length} segments</span>
                <span>•</span>
                <span>{includedSegments.length} included</span>
                <span>•</span>
                <span>{state.finalOutput.length.toLocaleString()} chars output</span>
              </div>
            )}
          </div>
          
          <div className="header-actions">
            <button
              onClick={toggleTheme}
              className="theme-toggle"
              title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              <FontAwesomeIcon icon={isDarkMode ? faSun : faMoon} />
            </button>
            <ApiKeyManager
              currentConfig={config}
              onConfigChange={setConfig}
            />
          </div>
        </div>
        
        {state.error && (
          <div className="error-banner">
            <div className="error-content">
              <FontAwesomeIcon icon={faExclamationTriangle} className="error-icon" />
              <span className="error-message">{state.error}</span>
              <button onClick={clearError} className="error-dismiss">
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
          </div>
        )}

        {state.isLoading && (
          <div className="loading-banner prominent">
            <div className="loading-content">
              <FontAwesomeIcon icon={faSpinner} className="loading-spinner" spin />
              <div className="loading-text">
                <span className="loading-main">AI is processing your request...</span>
                <div className="loading-warning">
                  <FontAwesomeIcon icon={faExclamationTriangle} className="loading-warning-icon" />
                  This may take up to 3-5 minutes. Please be patient and don't refresh the page.
                </div>
              </div>
            </div>
          </div>
        )}
      </header>

      <main className="app-main">
        <div className={`app-layout ${isPromptCollapsed ? 'input-collapsed' : ''}`}>
          <div className={`input-section ${isPromptCollapsed ? 'collapsed' : ''}`}>
            <PromptInput
              value={state.originalPrompt}
              onChange={setOriginalPrompt}
              onBreakPrompt={breakPromptIntoSegments}
              isLoading={state.isLoading}
              hasApiKey={hasApiKey}
              isCollapsed={isPromptCollapsed}
              onToggleCollapse={handleTogglePromptCollapse}
            />
          </div>

          <div className="segments-section">
            <SegmentsPanel
              segments={state.segments}
              onReorderSegments={reorderSegments}
              onUpdateSegment={updateSegment}
              onMakeConcise={makeConcise}
              isLoading={state.isLoading}
              hasApiKey={hasApiKey}
            />
          </div>

          <div className="preview-section">
            <PreviewPanel
              finalOutput={state.finalOutput}
              onExportOutput={exportOutput}
              isLoading={state.isLoading}
              hasApiKey={hasApiKey}
              segmentCount={includedSegments.length}
            />
          </div>
        </div>
      </main>

      <footer className="app-footer">
        <div className="footer-content">
          <div className="footer-info">
            <span>Built with React + OpenAI</span>
            <span>•</span>
            <span>Your data stays in your browser</span>
          </div>
          
          <div className="footer-stats">
            {state.segments.length > 0 && !isPromptCollapsed && (
              <>
                <span>{state.segments.length} segments</span>
                <span>•</span>
                <span>{includedSegments.length} included</span>
                <span>•</span>
                <span>{state.finalOutput.length.toLocaleString()} chars output</span>
              </>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
import { useState, useCallback, useEffect } from 'react';
import { PromptSegment } from '../components/PromptSegment';
import { openAIService } from '../services/openai';

interface OpenAIConfig {
  apiKey: string;
  model: 'gpt-5-mini' | 'gpt-4o-mini' | 'gpt-3.5-turbo';
}

interface AppState {
  originalPrompt: string;
  segments: PromptSegment[];
  finalOutput: string;
  isLoading: boolean;
  error: string | null;
}

export const usePromptEditor = () => {
  const [state, setState] = useState<AppState>({
    originalPrompt: '',
    segments: [],
    finalOutput: '',
    isLoading: false,
    error: null
  });

  const [config, setConfig] = useState<OpenAIConfig | null>(null);

  // Initialize OpenAI service when config changes
  useEffect(() => {
    if (config) {
      openAIService.initialize(config);
    }
  }, [config]);

  // Update final output whenever segments change
  useEffect(() => {
    updateFinalOutput();
  }, [state.segments]);

  const updateFinalOutput = useCallback(() => {
    const includedSegments = state.segments
      .filter(s => s.isIncluded)
      .sort((a, b) => a.order - b.order);
    
    const output = includedSegments.map(s => s.content).join('\n\n');
    setState(prev => ({ ...prev, finalOutput: output }));
  }, [state.segments]);

  const setOriginalPrompt = useCallback((prompt: string) => {
    setState(prev => ({
      ...prev,
      originalPrompt: prompt,
      segments: [],
      finalOutput: '',
      error: null
    }));
  }, []);

  const breakPromptIntoSegments = useCallback(async () => {
    if (!state.originalPrompt.trim() || !openAIService.isInitialized()) {
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const segments = await openAIService.breakPromptIntoSegments(state.originalPrompt);
      setState(prev => ({
        ...prev,
        segments,
        isLoading: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to break prompt into segments'
      }));
    }
  }, [state.originalPrompt]);

  const updateSegment = useCallback((id: string, updates: Partial<PromptSegment>) => {
    setState(prev => ({
      ...prev,
      segments: prev.segments.map(segment =>
        segment.id === id ? { ...segment, ...updates } : segment
      )
    }));
  }, []);

  const reorderSegments = useCallback((newSegments: PromptSegment[]) => {
    // Update order property based on new position
    const reorderedSegments = newSegments.map((segment, index) => ({
      ...segment,
      order: index
    }));

    setState(prev => ({
      ...prev,
      segments: reorderedSegments
    }));
  }, []);

  const makeConcise = useCallback(async (segmentId: string) => {
    const segment = state.segments.find(s => s.id === segmentId);
    if (!segment || !openAIService.isInitialized()) {
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const conciseContent = await openAIService.makeConcise(segment.content);
      updateSegment(segmentId, { content: conciseContent });
      setState(prev => ({ ...prev, isLoading: false }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to make content concise'
      }));
    }
  }, [state.segments, updateSegment]);


  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  const saveSession = useCallback(() => {
    const sessionData = {
      originalPrompt: state.originalPrompt,
      segments: state.segments,
      timestamp: Date.now()
    };
    localStorage.setItem('prompt-editor-session', JSON.stringify(sessionData));
  }, [state.originalPrompt, state.segments]);

  const loadSession = useCallback(() => {
    try {
      const saved = localStorage.getItem('prompt-editor-session');
      if (saved) {
        const sessionData = JSON.parse(saved);
        setState(prev => ({
          ...prev,
          originalPrompt: sessionData.originalPrompt || '',
          segments: sessionData.segments || [],
          error: null
        }));
        return true;
      }
    } catch (error) {
      console.error('Failed to load session:', error);
    }
    return false;
  }, []);

  const exportOutput = useCallback(() => {
    const blob = new Blob([state.finalOutput], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'prompt-output.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [state.finalOutput]);

  return {
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
  };
};
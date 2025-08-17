import { PromptSegment } from '../components/PromptSegment';

export interface AppState {
  originalPrompt: string;
  segments: PromptSegment[];
  finalOutput: string;
  isLoading: boolean;
  error: string | null;
}

export interface OpenAIConfig {
  apiKey: string;
  model: 'gpt-4o-mini' | 'gpt-3.5-turbo';
}

export interface AIOperation {
  type: 'break' | 'concise' | 'edit';
  isLoading: boolean;
  error: string | null;
}
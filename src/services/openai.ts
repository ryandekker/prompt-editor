import OpenAI from 'openai';
import { PromptSegment } from '../components/PromptSegment';

interface OpenAIConfig {
  apiKey: string;
  model: 'gpt-5-mini' | 'gpt-4o-mini' | 'gpt-3.5-turbo';
}

export class OpenAIService {
  private client: OpenAI | null = null;
  private config: OpenAIConfig | null = null;
  private cachePrefix = 'prompt-editor-cache-';

  initialize(config: OpenAIConfig) {
    this.config = config;
    this.client = new OpenAI({
      apiKey: config.apiKey,
      dangerouslyAllowBrowser: true
    });
  }

  isInitialized(): boolean {
    return this.client !== null && this.config !== null;
  }

  private generateCacheKey(operation: string, input: string): string {
    // Create a simple hash of the input for cache key
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return `${this.cachePrefix}${operation}-${Math.abs(hash)}`;
  }

  private getCachedResult(key: string): unknown | null {
    try {
      const cached = localStorage.getItem(key);
      if (cached) {
        const parsed = JSON.parse(cached);
        const now = Date.now();
        // Cache expires after 24 hours
        if (now - parsed.timestamp < 24 * 60 * 60 * 1000) {
          return parsed.data;
        } else {
          localStorage.removeItem(key);
        }
      }
    } catch (error) {
      console.warn('Cache read error:', error);
    }
    return null;
  }

  private setCachedResult(key: string, data: unknown): void {
    try {
      const cacheData = {
        data,
        timestamp: Date.now()
      };
      localStorage.setItem(key, JSON.stringify(cacheData));
    } catch (error) {
      console.warn('Cache write error:', error);
    }
  }

  async breakPromptIntoSegments(prompt: string): Promise<PromptSegment[]> {
    if (!this.client || !this.config) {
      throw new Error('OpenAI service not initialized');
    }

    // Check cache first
    const cacheKey = this.generateCacheKey('break-segments', prompt);
    const cached = this.getCachedResult(cacheKey);
    if (cached && Array.isArray(cached)) {
      console.log('[OpenAI] Using cached segments');
      return cached as PromptSegment[];
    }

    try {
      // Remove token limits for gpt-5-mini to allow full response generation
      const tokenParam = this.config.model === 'gpt-5-mini'
        ? {} // No token limit for gpt-5-mini
        : { max_tokens: 16000 }; // Keep limit for older models
      
      const temperatureParam = this.config.model === 'gpt-5-mini'
        ? { temperature: 1 }
        : { temperature: 0.3 };

      console.log('[OpenAI] Making request with model:', this.config.model);
      console.log('[OpenAI] Request parameters:', { ...temperatureParam, ...tokenParam });

      const response = await this.client.chat.completions.create({
        model: this.config.model,
        messages: [
          {
            role: 'system',
            content: `You are an expert at analyzing and breaking down large prompts into logical, coherent sections.
            
Your task is to:
1. Analyze the given prompt and identify distinct logical sections/topics
2. Break it into meaningful segments that make sense independently
3. Give each segment a clear, descriptive title
4. Preserve all the original content - don't summarize or omit anything
5. Return the result as a JSON array of objects with "title" and "content" fields

Example format:
[
  {
    "title": "Introduction and Context",
    "content": "The original text content for this section..."
  },
  {
    "title": "Main Requirements",
    "content": "The original text content for this section..."
  }
]

Make sure each segment is substantial enough to be useful but focused enough to be coherent.`
          },
          {
            role: 'user',
            content: `Please break this prompt into logical sections:\n\n${prompt}`
          }
        ],
        ...temperatureParam,
        ...tokenParam
      });

      console.log('[OpenAI] Raw response received:', response);
      console.log('[OpenAI] Response choices:', response.choices);
      console.log('[OpenAI] First choice:', response.choices[0]);
      console.log('[OpenAI] Message content:', response.choices[0]?.message?.content);

      const choice = response.choices[0];
      const content = choice?.message?.content;
      
      if (!content) {
        console.error('[OpenAI] No content in response - choices array:', response.choices);
        console.error('[OpenAI] Full response object:', JSON.stringify(response, null, 2));
        
        // Provide better error message if truncated due to length
        if (choice?.finish_reason === 'length') {
          throw new Error('Response was truncated due to token limit. The prompt may be too large to process in one request.');
        }
        
        throw new Error('No response from OpenAI');
      }

      // Parse the JSON response
      const segments = JSON.parse(content);
      
      // Convert to PromptSegment objects
      const result = segments.map((segment: { title?: string; content?: string }, index: number): PromptSegment => ({
        id: `segment-${Date.now()}-${index}`,
        title: segment.title || `Segment ${index + 1}`,
        content: segment.content || '',
        isIncluded: true,
        order: index,
        isEditing: false,
        isExpanded: false
      }));

      // Cache the result
      this.setCachedResult(cacheKey, result);
      return result;

    } catch (error) {
      console.error('Error breaking prompt:', error);
      throw new Error(`Failed to break prompt into segments: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async makeConcise(content: string): Promise<string> {
    if (!this.client || !this.config) {
      throw new Error('OpenAI service not initialized');
    }

    // Check cache first
    const cacheKey = this.generateCacheKey('make-concise', content);
    const cached = this.getCachedResult(cacheKey);
    if (cached && typeof cached === 'string') {
      console.log('[OpenAI] Using cached concise result');
      return cached;
    }

    try {
      // Use appropriate parameters based on model
      const tokenParam = this.config.model === 'gpt-5-mini'
        ? { max_completion_tokens: 2000 }
        : { max_tokens: 2000 };
      
      const temperatureParam = this.config.model === 'gpt-5-mini'
        ? { temperature: 1 }
        : { temperature: 0.2 };

      const response = await this.client.chat.completions.create({
        model: this.config.model,
        messages: [
          {
            role: 'system',
            content: `You are an expert editor focused on making text more concise while preserving all important information and meaning.

Your task is to:
1. Remove redundancy and unnecessary words
2. Combine similar ideas efficiently
3. Use more precise and direct language
4. Maintain the original tone and intent
5. Keep all essential information and details
6. Return only the revised text, no explanations

The goal is to make the text clearer and more efficient, not to change its meaning or remove important content.`
          },
          {
            role: 'user',
            content: `Please make this text more concise:\n\n${content}`
          }
        ],
        ...temperatureParam,
        ...tokenParam
      });

      const result = response.choices[0]?.message?.content;
      if (!result) {
        throw new Error('No response from OpenAI');
      }

      const trimmedResult = result.trim();
      // Cache the result
      this.setCachedResult(cacheKey, trimmedResult);
      return trimmedResult;

    } catch (error) {
      console.error('Error making content concise:', error);
      throw new Error(`Failed to make content concise: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

}

export const openAIService = new OpenAIService();
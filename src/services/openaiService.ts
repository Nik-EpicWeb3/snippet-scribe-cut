
import { Timestamp } from '@/types/transcript';

// Store API key in memory (for frontend-only implementation)
let openaiApiKey: string | null = null;

export const setOpenAIApiKey = (key: string) => {
  openaiApiKey = key;
  localStorage.setItem('openai_api_key', key);
};

export const getOpenAIApiKey = (): string | null => {
  if (!openaiApiKey) {
    openaiApiKey = localStorage.getItem('openai_api_key');
  }
  return openaiApiKey;
};

export const clearOpenAIApiKey = () => {
  openaiApiKey = null;
  localStorage.removeItem('openai_api_key');
};

interface OpenAICompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    text?: string;
    message?: {
      role: string;
      content: string;
    };
    index: number;
    finish_reason: string;
  }[];
}

/**
 * Transcribe a video using OpenAI's Whisper model
 */
export const transcribeVideoWithWhisper = async (file: File): Promise<Timestamp[]> => {
  const key = getOpenAIApiKey();
  if (!key) {
    throw new Error('OpenAI API key not found. Please set your API key first.');
  }

  // Create a form data object to send the file
  const formData = new FormData();
  formData.append('file', file);
  formData.append('model', 'whisper-1');
  formData.append('response_format', 'verbose_json');
  formData.append('timestamp_granularities', '["segment"]');

  try {
    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${key}`
      },
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Failed to transcribe video');
    }

    const data = await response.json();
    
    // Convert Whisper segments to our Timestamp format
    if (data.segments) {
      return data.segments.map((segment: any) => ({
        start: segment.start,
        end: segment.end,
        text: segment.text
      }));
    }
    
    // Fallback if segments aren't available
    return [{
      start: 0,
      end: data.duration || 10,
      text: data.text
    }];
  } catch (error) {
    console.error('Transcription error:', error);
    throw error;
  }
};

/**
 * Extract insights from transcript using OpenAI
 */
export const extractInsightsWithGPT = async (transcript: Timestamp[], prompt: string): Promise<Timestamp[]> => {
  const key = getOpenAIApiKey();
  if (!key) {
    throw new Error('OpenAI API key not found. Please set your API key first.');
  }

  // Combine transcript segments into a single text for context
  const transcriptText = transcript.map(segment => `[${formatTime(segment.start)}-${formatTime(segment.end)}] ${segment.text}`).join('\n');

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an AI assistant that helps extract insights from video transcripts. Your task is to find relevant segments based on the user prompt and return them in a structured format.'
          },
          {
            role: 'user',
            content: `Here is a transcript with timestamps:\n\n${transcriptText}\n\nBased on this prompt: "${prompt}", identify the most relevant segments. For each segment, return the start time, end time, and text content. Focus on extracting insights that directly relate to the prompt.`
          }
        ],
        temperature: 0.3
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Failed to extract insights');
    }

    const data: OpenAICompletionResponse = await response.json();
    const content = data.choices[0]?.message?.content || '';

    // Extract segments from the response
    // The response format might vary, so we'll try to be flexible
    const segments: Timestamp[] = [];
    
    // Look for patterns like [00:05-00:10] or time markers in the content
    const timeRangeRegex = /\[?(\d{1,2}:\d{2})-(\d{1,2}:\d{2})\]?(.*?)(?=\[?\d{1,2}:\d{2}-\d{1,2}:\d{2}\]?|$)/gs;
    let match;
    
    while ((match = timeRangeRegex.exec(content)) !== null) {
      const startTime = parseTimeString(match[1]);
      const endTime = parseTimeString(match[2]);
      const text = match[3].trim();
      
      if (startTime !== null && endTime !== null && text) {
        segments.push({
          start: startTime,
          end: endTime,
          text
        });
      }
    }

    // If we couldn't extract segments using regex, try to find the original segments
    if (segments.length === 0) {
      // Search for the original transcript segments that contain words from the prompt
      const promptWords = prompt.toLowerCase().split(/\s+/).filter(word => word.length > 3);
      return transcript.filter(segment => {
        const segmentText = segment.text.toLowerCase();
        return promptWords.some(word => segmentText.includes(word));
      });
    }

    return segments;
  } catch (error) {
    console.error('Error extracting insights:', error);
    throw error;
  }
};

// Helper function to format time in MM:SS format
const formatTime = (time: number) => {
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

// Helper function to parse time string (MM:SS) to seconds
const parseTimeString = (timeStr: string): number | null => {
  const parts = timeStr.split(':');
  if (parts.length !== 2) return null;
  
  const minutes = parseInt(parts[0], 10);
  const seconds = parseInt(parts[1], 10);
  
  if (isNaN(minutes) || isNaN(seconds)) return null;
  
  return minutes * 60 + seconds;
};

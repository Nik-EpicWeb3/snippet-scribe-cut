
import { Timestamp } from '@/types/transcript';
import { supabase } from '@/integrations/supabase/client';

/**
 * Transcribe a video using Supabase Edge Function with OpenAI's Whisper model
 */
export const transcribeVideoWithWhisper = async (file: File): Promise<Timestamp[]> => {
  try {
    // Create form data to send the file
    const formData = new FormData();
    formData.append('file', file);

    // Call the Supabase Edge Function
    const { data, error } = await supabase.functions.invoke('transcribe-video', {
      body: formData,
    });

    if (error) {
      console.error('Supabase function error:', error);
      throw new Error(error.message || 'Failed to transcribe video');
    }

    if (data.error) {
      throw new Error(data.error);
    }

    return data.segments || [];
  } catch (error) {
    console.error('Transcription error:', error);
    throw error;
  }
};

/**
 * Extract insights from transcript using Supabase Edge Function with OpenAI
 */
export const extractInsightsWithGPT = async (transcript: Timestamp[], prompt: string): Promise<Timestamp[]> => {
  try {
    // Call the Supabase Edge Function
    const { data, error } = await supabase.functions.invoke('extract-insights', {
      body: {
        transcript,
        prompt
      },
    });

    if (error) {
      console.error('Supabase function error:', error);
      throw new Error(error.message || 'Failed to extract insights');
    }

    if (data.error) {
      throw new Error(data.error);
    }

    return data.insights || [];
  } catch (error) {
    console.error('Error extracting insights:', error);
    throw error;
  }
};

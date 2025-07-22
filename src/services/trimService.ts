import { supabase } from '@/integrations/supabase/client';

/**
 * Server-side video trimming using FFmpeg in Supabase Edge Function
 * This ensures frame-perfect trimming with proper A/V sync
 */
export const trimVideoServerSide = async (
  videoFile: File, 
  startTime: number, 
  endTime: number,
  outputFilename?: string
): Promise<string> => {
  try {
    // Convert video file to base64 for transmission
    const arrayBuffer = await videoFile.arrayBuffer();
    const base64Video = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
    
    // Call the Supabase Edge Function
    const { data, error } = await supabase.functions.invoke('trim-video', {
      body: {
        videoFile: base64Video,
        startTime,
        endTime,
        outputFilename: outputFilename || `trimmed_${videoFile.name}`
      },
    });

    if (error) {
      console.error('Supabase function error:', error);
      throw new Error(error.message || 'Failed to trim video');
    }

    if (data.error) {
      throw new Error(data.error);
    }

    return data.trimmedVideoUrl;
  } catch (error) {
    console.error('Video trimming error:', error);
    throw error;
  }
};

/**
 * Download a trimmed video from the server-side processing result
 */
export const downloadTrimmedVideoServerSide = async (
  trimmedVideoUrl: string,
  filename: string
): Promise<void> => {
  try {
    // Fetch the trimmed video
    const response = await fetch(trimmedVideoUrl);
    if (!response.ok) {
      throw new Error('Failed to download trimmed video');
    }
    
    const blob = await response.blob();
    
    // Create download link
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up the blob URL
    URL.revokeObjectURL(link.href);
    
    console.log(`Download completed: ${filename}`);
  } catch (error) {
    console.error('Error downloading trimmed video:', error);
    throw new Error('Failed to download trimmed video');
  }
};
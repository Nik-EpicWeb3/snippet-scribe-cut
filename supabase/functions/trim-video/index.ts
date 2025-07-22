import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.52.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { videoFile, startTime, endTime, outputFilename } = await req.json();
    
    if (!videoFile || startTime === undefined || endTime === undefined) {
      throw new Error('Missing required parameters: videoFile, startTime, endTime');
    }

    console.log(`Trimming video from ${startTime}s to ${endTime}s`);

    // Decode base64 video file
    const videoBuffer = new Uint8Array(atob(videoFile).split('').map(c => c.charCodeAt(0)));
    
    // Generate unique filenames
    const inputFilename = `input_${Date.now()}.mp4`;
    const trimmedFilename = outputFilename || `trimmed_${Date.now()}.mp4`;
    
    // Write input file to temporary location
    await Deno.writeFile(`/tmp/${inputFilename}`, videoBuffer);
    
    // Calculate duration for FFmpeg
    const duration = endTime - startTime;
    
    // FFmpeg command with proper flags to preserve sync and quality
    const ffmpegCommand = [
      'ffmpeg',
      '-y', // Overwrite output file
      '-ss', startTime.toString(), // Start time (seeking before input for speed)
      '-i', `/tmp/${inputFilename}`, // Input file
      '-t', duration.toString(), // Duration to trim
      '-c', 'copy', // Stream copy (no re-encoding for quality preservation)
      '-avoid_negative_ts', 'make_zero', // Fix timestamp issues
      '-fflags', '+genpts', // Generate presentation timestamps
      `-tmp/${trimmedFilename}`
    ];

    console.log('Running FFmpeg command:', ffmpegCommand.join(' '));
    
    // Execute FFmpeg
    const process = new Deno.Command('ffmpeg', {
      args: ffmpegCommand.slice(1), // Remove 'ffmpeg' from args
      stdout: 'piped',
      stderr: 'piped',
    });

    const { code, stdout, stderr } = await process.output();
    
    if (code !== 0) {
      const errorOutput = new TextDecoder().decode(stderr);
      console.error('FFmpeg error:', errorOutput);
      throw new Error(`FFmpeg failed with code ${code}: ${errorOutput}`);
    }

    // Read the trimmed video file
    const trimmedVideoBuffer = await Deno.readFile(`/tmp/${trimmedFilename}`);
    
    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('video-processing')
      .upload(trimmedFilename, trimmedVideoBuffer, {
        contentType: 'video/mp4',
        upsert: true
      });

    if (uploadError) {
      throw new Error(`Failed to upload trimmed video: ${uploadError.message}`);
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('video-processing')
      .getPublicUrl(trimmedFilename);

    // Clean up temporary files
    try {
      await Deno.remove(`/tmp/${inputFilename}`);
      await Deno.remove(`/tmp/${trimmedFilename}`);
    } catch (cleanupError) {
      console.warn('Failed to clean up temporary files:', cleanupError);
    }

    console.log('Video trimming completed successfully');

    return new Response(JSON.stringify({ 
      success: true,
      trimmedVideoUrl: urlData.publicUrl,
      filename: trimmedFilename,
      duration: duration,
      startTime: startTime,
      endTime: endTime
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Video trimming error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to trim video',
        details: error.toString()
      }), 
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
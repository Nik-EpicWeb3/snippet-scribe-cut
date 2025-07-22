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

  let inputPath = '';
  let outputPath = '';
  
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
    inputPath = `/tmp/${inputFilename}`;
    outputPath = `/tmp/${trimmedFilename}`;
    
    // Write input file to temporary location
    await Deno.writeFile(inputPath, videoBuffer);
    
    // Calculate duration for FFmpeg
    const duration = endTime - startTime;
    
    // Get frame rate from input video for proper sync
    const frameRateProcess = new Deno.Command('ffprobe', {
      args: [
        '-v', '0',
        '-of', 'csv=p=0',
        '-select_streams', 'v:0',
        '-show_entries', 'stream=r_frame_rate',
        inputPath
      ],
      stdout: 'piped',
      stderr: 'piped'
    });
    
    const { code: frCode, stdout: frStdout } = await frameRateProcess.output();
    let frameRate = '30'; // Default fallback
    
    if (frCode === 0) {
      const frOutput = new TextDecoder().decode(frStdout).trim();
      if (frOutput && frOutput !== '0/0') {
        frameRate = frOutput;
      }
    }
    
    // FFmpeg command with re-encode to fix A/V sync issues
    const ffmpegCommand = [
      'ffmpeg',
      '-y', // Overwrite output file
      '-ss', startTime.toString(), // Start time
      '-i', inputPath, // Input file
      '-t', duration.toString(), // Duration to trim
      '-vf', 'setpts=PTS-STARTPTS', // Reset video timestamps
      '-af', 'asetpts=PTS-STARTPTS', // Reset audio timestamps
      '-r', frameRate, // Preserve original frame rate
      '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '23', // Video encoding
      '-c:a', 'aac', // Audio encoding
      '-movflags', '+faststart', // Web optimization
      outputPath
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
    const trimmedVideoBuffer = await Deno.readFile(outputPath);
    
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
  } finally {
    // Always clean up temporary files
    if (inputPath) {
      try {
        await Deno.remove(inputPath);
      } catch (cleanupError) {
        console.warn('Failed to clean up input file:', cleanupError);
      }
    }
    if (outputPath) {
      try {
        await Deno.remove(outputPath);
      } catch (cleanupError) {
        console.warn('Failed to clean up output file:', cleanupError);
      }
    }
  }
});
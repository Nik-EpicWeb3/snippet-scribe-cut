import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Get the form data from the request
    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      throw new Error('No file provided');
    }

    // Create form data for OpenAI API
    const openaiFormData = new FormData();
    openaiFormData.append('file', file);
    openaiFormData.append('model', 'whisper-1');
    openaiFormData.append('response_format', 'verbose_json');
    openaiFormData.append('timestamp_granularities', '["segment"]');

    console.log('Sending transcription request to OpenAI...');

    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`
      },
      body: openaiFormData
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', errorData);
      throw new Error(errorData.error?.message || 'Failed to transcribe video');
    }

    const data = await response.json();
    console.log('Transcription successful');

    // Convert Whisper segments to our Timestamp format
    let segments = [];
    if (data.segments) {
      segments = data.segments.map((segment: any) => ({
        start: segment.start,
        end: segment.end,
        text: segment.text
      }));
    } else {
      // Fallback if segments aren't available
      segments = [{
        start: 0,
        end: data.duration || 10,
        text: data.text
      }];
    }

    return new Response(JSON.stringify({ segments }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Transcription error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to transcribe video',
        details: error.toString()
      }), 
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
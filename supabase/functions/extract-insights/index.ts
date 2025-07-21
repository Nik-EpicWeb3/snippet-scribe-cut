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

    const { transcript, prompt } = await req.json();

    if (!transcript || !prompt) {
      throw new Error('Missing transcript or prompt');
    }

    // Helper function to format time in MM:SS format
    const formatTime = (time: number) => {
      const minutes = Math.floor(time / 60);
      const seconds = Math.floor(time % 60);
      return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    // Combine transcript segments into a single text for context
    const transcriptText = transcript.map((segment: any) => 
      `[${formatTime(segment.start)}-${formatTime(segment.end)}] ${segment.text}`
    ).join('\n');

    console.log('Extracting insights with GPT...');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
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
      console.error('OpenAI API error:', errorData);
      throw new Error(errorData.error?.message || 'Failed to extract insights');
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content || '';

    console.log('Insights extraction successful');

    // Helper function to parse time string (MM:SS) to seconds
    const parseTimeString = (timeStr: string): number | null => {
      const parts = timeStr.split(':');
      if (parts.length !== 2) return null;
      
      const minutes = parseInt(parts[0], 10);
      const seconds = parseInt(parts[1], 10);
      
      if (isNaN(minutes) || isNaN(seconds)) return null;
      
      return minutes * 60 + seconds;
    };

    // Extract segments from the response
    const segments: any[] = [];
    
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
      const promptWords = prompt.toLowerCase().split(/\s+/).filter((word: string) => word.length > 3);
      const filteredSegments = transcript.filter((segment: any) => {
        const segmentText = segment.text.toLowerCase();
        return promptWords.some((word: string) => segmentText.includes(word));
      });
      
      return new Response(JSON.stringify({ insights: filteredSegments }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ insights: segments }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error extracting insights:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to extract insights',
        details: error.toString()
      }), 
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
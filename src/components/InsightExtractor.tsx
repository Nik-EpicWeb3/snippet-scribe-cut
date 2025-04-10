
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Search, Scissors, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Timestamp } from '@/types/transcript';
import { extractInsightsWithGPT, getOpenAIApiKey } from '@/services/openaiService';
import { useToast } from '@/components/ui/use-toast';
import OpenAISetup from './OpenAISetup';

interface InsightExtractorProps {
  transcript: Timestamp[];
  onExtract: (insights: Timestamp[]) => void;
  onSegmentSelect: (segment: { start: number; end: number }) => void;
  className?: string;
}

const InsightExtractor: React.FC<InsightExtractorProps> = ({
  transcript,
  onExtract,
  onSegmentSelect,
  className
}) => {
  const [prompt, setPrompt] = useState('');
  const [insights, setInsights] = useState<Timestamp[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [useAI, setUseAI] = useState(true);
  const { toast } = useToast();

  // Check if OpenAI API key is available
  const hasApiKey = !!getOpenAIApiKey();

  // Extract insights based on the prompt
  const extractInsights = async () => {
    if (!prompt.trim()) return;
    
    setIsLoading(true);
    
    try {
      let extractedInsights: Timestamp[] = [];
      
      if (useAI && hasApiKey) {
        // Use OpenAI to extract insights
        extractedInsights = await extractInsightsWithGPT(transcript, prompt);
      } else {
        // Fallback to simple keyword matching
        const searchTerm = prompt.toLowerCase();
        extractedInsights = transcript.filter(segment => 
          segment.text.toLowerCase().includes(searchTerm)
        );
      }
      
      setInsights(extractedInsights);
      onExtract(extractedInsights);
    } catch (error) {
      console.error("Error extracting insights:", error);
      toast({
        title: "Error extracting insights",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(e.target.value);
  };

  const handleInsightClick = (insight: Timestamp) => {
    onSegmentSelect({
      start: insight.start,
      end: insight.end
    });
  };

  const formatTimestamp = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (!hasApiKey && useAI) {
    return (
      <div className={cn('rounded-lg border bg-card shadow-sm', className)}>
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold">Extract Insights with AI</h3>
          <p className="text-sm text-muted-foreground">
            Set up your OpenAI API key to unlock AI-powered insight extraction
          </p>
        </div>
        
        <div className="p-4">
          <OpenAISetup />
          <div className="mt-4 text-center">
            <Button variant="outline" onClick={() => setUseAI(false)}>
              Continue without AI
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('rounded-lg border bg-card shadow-sm', className)}>
      <div className="p-4 border-b">
        <h3 className="text-lg font-semibold">
          {useAI && hasApiKey ? 'Extract Insights with AI' : 'Extract Insights'}
        </h3>
        <p className="text-sm text-muted-foreground">
          {useAI && hasApiKey 
            ? 'Use AI to find relevant moments based on your prompt'
            : 'Search through the transcript to find relevant moments'
          }
        </p>
      </div>
      
      <div className="p-4">
        <Textarea
          placeholder={useAI && hasApiKey 
            ? "Enter a prompt like 'main arguments', 'key takeaways', or 'action items'"
            : "Enter a search term to find in the transcript"
          }
          value={prompt}
          onChange={handlePromptChange}
          className="mb-3 min-h-[100px]"
        />
        
        <div className="flex gap-2 w-full mb-3">
          <Button 
            onClick={extractInsights} 
            disabled={!prompt.trim() || isLoading || transcript.length === 0}
            className="flex-1"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {useAI && hasApiKey ? 'Processing with AI...' : 'Searching...'}
              </>
            ) : (
              <>
                {useAI && hasApiKey ? 'Extract with AI' : 'Search Transcript'}
                <Search className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
          
          {hasApiKey && (
            <Button 
              variant="outline" 
              onClick={() => setUseAI(!useAI)}
              className="whitespace-nowrap"
            >
              {useAI ? 'Use Simple Search' : 'Use AI'}
            </Button>
          )}
        </div>
        
        {insights.length > 0 && (
          <div className="mt-4">
            <h4 className="font-medium mb-2">Found Insights ({insights.length})</h4>
            <ScrollArea className="h-[200px] rounded-md border">
              <div className="p-3 space-y-2">
                {insights.map((insight, index) => (
                  <div 
                    key={index}
                    className="p-2 rounded border hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => handleInsightClick(insight)}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-mono bg-secondary px-1.5 py-0.5 rounded">
                        {formatTimestamp(insight.start)} - {formatTimestamp(insight.end)}
                      </span>
                      <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-primary">
                        <Scissors className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                    <p className="text-sm line-clamp-2">{insight.text}</p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}
      </div>
    </div>
  );
};

export default InsightExtractor;

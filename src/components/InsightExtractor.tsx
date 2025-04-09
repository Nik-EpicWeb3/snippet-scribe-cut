
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Search, Scissors } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Timestamp } from '@/types/transcript';

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

  // Demo function to simulate insight extraction based on a prompt
  // In a real implementation, this would call an AI service
  const extractInsights = () => {
    setIsLoading(true);
    
    // Simulate API delay
    setTimeout(() => {
      // For demo purposes, just filter segments containing the prompt text (case insensitive)
      if (prompt.trim()) {
        const searchTerm = prompt.toLowerCase();
        const extractedInsights = transcript.filter(segment => 
          segment.text.toLowerCase().includes(searchTerm)
        );
        
        setInsights(extractedInsights);
        onExtract(extractedInsights);
      } else {
        setInsights([]);
        onExtract([]);
      }
      
      setIsLoading(false);
    }, 1500);
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

  return (
    <div className={cn('rounded-lg border bg-card shadow-sm', className)}>
      <div className="p-4 border-b">
        <h3 className="text-lg font-semibold">Extract Insights</h3>
        <p className="text-sm text-muted-foreground">
          Enter a prompt to find relevant moments in the video
        </p>
      </div>
      
      <div className="p-4">
        <Textarea
          placeholder="Enter a search term or prompt, e.g., 'key takeaways', 'project updates', etc."
          value={prompt}
          onChange={handlePromptChange}
          className="mb-3 min-h-[100px]"
        />
        
        <Button 
          onClick={extractInsights} 
          disabled={!prompt.trim() || isLoading || transcript.length === 0}
          className="w-full"
        >
          {isLoading ? 'Processing...' : 'Extract Insights'}
          {isLoading ? null : <Search className="ml-2 h-4 w-4" />}
        </Button>
        
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

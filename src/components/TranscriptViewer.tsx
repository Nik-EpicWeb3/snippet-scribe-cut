
import React, { useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Timestamp } from '@/types/transcript';

interface TranscriptViewerProps {
  transcript: Timestamp[];
  onTimestampClick: (timestamp: number) => void;
  currentTime?: number;
  selectedSegment?: { start: number; end: number } | null;
  onSegmentSelect?: (segment: { start: number; end: number } | null) => void;
  className?: string;
}

const TranscriptViewer: React.FC<TranscriptViewerProps> = ({
  transcript,
  onTimestampClick,
  currentTime = 0,
  selectedSegment,
  onSegmentSelect,
  className
}) => {
  const formatTimestamp = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Log when component receives new transcript data
  useEffect(() => {
    console.log("TranscriptViewer received transcript data:", transcript ? transcript.length : 0, "segments");
    console.log("TranscriptViewer transcript data type:", typeof transcript);
    console.log("TranscriptViewer transcript data is array?", Array.isArray(transcript));
    
    if (transcript && transcript.length > 0) {
      console.log("First segment in TranscriptViewer:", JSON.stringify(transcript[0]));
    } else {
      console.log("No transcript segments available in TranscriptViewer");
    }
  }, [transcript]);

  // Determine if a timestamp is within the current playing time (for highlighting)
  const isCurrentTimestamp = (start: number, end: number) => {
    return currentTime >= start && currentTime <= end;
  };

  // Determine if a timestamp is part of the selected segment
  const isSelectedSegment = (start: number, end: number) => {
    if (!selectedSegment) return false;
    return start >= selectedSegment.start && end <= selectedSegment.end;
  };

  const handleSegmentClick = (start: number, end: number) => {
    if (onSegmentSelect) {
      if (selectedSegment && start === selectedSegment.start && end === selectedSegment.end) {
        // Clicking the same segment deselects it
        onSegmentSelect(null);
      } else {
        // Select a new segment
        onSegmentSelect({ start, end });
      }
    }
    
    // Always jump to the start of the segment when clicked
    onTimestampClick(start);
  };

  // Check if transcript is valid for rendering
  const hasValidTranscript = transcript && Array.isArray(transcript) && transcript.length > 0;

  return (
    <div className={cn('rounded-lg border bg-card shadow-sm', className)}>
      <div className="p-4 border-b">
        <h3 className="text-lg font-semibold">Video Transcript</h3>
        <p className="text-sm text-muted-foreground">
          Click on any timestamp to jump to that point in the video.
          {onSegmentSelect && " Select text segments for extraction."}
        </p>
      </div>
      
      <ScrollArea className="h-[500px] transcript-container">
        <div className="p-4 space-y-2">
          {hasValidTranscript ? (
            transcript.map((item, index) => (
              <div 
                key={index}
                className={cn(
                  'timestamp-segment p-2 rounded-md transition-colors',
                  isCurrentTimestamp(item.start, item.end) && 'bg-secondary',
                  isSelectedSegment(item.start, item.end) && 'bg-primary/10 border border-primary/30',
                  onSegmentSelect && 'cursor-pointer hover:bg-secondary/50'
                )}
                onClick={() => handleSegmentClick(item.start, item.end)}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span 
                    className="text-xs font-mono bg-secondary px-2 py-1 rounded cursor-pointer hover:bg-primary hover:text-white transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      onTimestampClick(item.start);
                    }}
                  >
                    {formatTimestamp(item.start)}
                  </span>
                  <span className="text-muted-foreground text-xs">→</span>
                  <span 
                    className="text-xs font-mono bg-secondary px-2 py-1 rounded cursor-pointer hover:bg-primary hover:text-white transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      onTimestampClick(item.end);
                    }}
                  >
                    {formatTimestamp(item.end)}
                  </span>
                </div>
                <p className="text-sm">{item.text}</p>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No transcript available yet. Upload a video to generate a transcript.
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default TranscriptViewer;

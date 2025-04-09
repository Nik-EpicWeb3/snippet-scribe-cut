
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Scissors, Download } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface VideoTrimmerProps {
  videoSrc: string;
  duration: number;
  selectedSegment: { start: number; end: number } | null;
  onTrim: (start: number, end: number) => void;
  onDownload: () => void;
}

const VideoTrimmer: React.FC<VideoTrimmerProps> = ({
  videoSrc,
  duration,
  selectedSegment,
  onTrim,
  onDownload
}) => {
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(duration);
  const [isTrimmed, setIsTrimmed] = useState(false);
  const { toast } = useToast();

  // Update trim values when selectedSegment changes
  useEffect(() => {
    if (selectedSegment) {
      setTrimStart(selectedSegment.start);
      setTrimEnd(selectedSegment.end);
    } else {
      setTrimStart(0);
      setTrimEnd(duration);
    }
    setIsTrimmed(false);
  }, [selectedSegment, duration]);

  const handleRangeChange = (values: number[]) => {
    if (values.length === 2) {
      setTrimStart(values[0]);
      setTrimEnd(values[1]);
    }
  };

  const handleTrim = () => {
    if (trimEnd <= trimStart) {
      toast({
        title: "Invalid trim range",
        description: "End time must be greater than start time",
        variant: "destructive",
      });
      return;
    }
    
    onTrim(trimStart, trimEnd);
    setIsTrimmed(true);
    
    toast({
      title: "Video trimmed successfully",
      description: `Segment from ${formatTime(trimStart)} to ${formatTime(trimEnd)} is ready for download.`,
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const trimDuration = trimEnd - trimStart;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>Trim Video</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="px-1">
            <Slider
              value={[trimStart, trimEnd]}
              min={0}
              max={duration}
              step={0.01}
              onValueChange={handleRangeChange}
              className="my-4"
            />
            
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{formatTime(trimStart)}</span>
              <span>{formatTime(trimEnd)}</span>
            </div>
          </div>
          
          <div className="bg-muted/40 p-3 rounded-md">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium">Segment Duration:</span>
              <span className="font-mono text-sm">{formatTime(trimDuration)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Selected Range:</span>
              <span className="font-mono text-sm">
                {formatTime(trimStart)} - {formatTime(trimEnd)}
              </span>
            </div>
          </div>
          
          <div className="flex gap-3">
            <Button 
              onClick={handleTrim}
              className="flex-1"
              variant="default"
              disabled={!videoSrc || trimEnd <= trimStart}
            >
              <Scissors className="mr-2 h-4 w-4" />
              Trim Video
            </Button>
            
            <Button 
              onClick={onDownload}
              className="flex-1"
              variant="outline"
              disabled={!isTrimmed}
            >
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default VideoTrimmer;

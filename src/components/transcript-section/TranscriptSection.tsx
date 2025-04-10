
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import TranscriptViewer from '@/components/TranscriptViewer';
import InsightExtractor from '@/components/InsightExtractor';
import VideoTrimmer from '@/components/VideoTrimmer';
import { Timestamp } from '@/types/transcript';
import { FileText, Sparkles, Scissors } from 'lucide-react';

interface TranscriptSectionProps {
  videoUrl: string;
  videoFile: File | null;
  transcript: Timestamp[];
  isTranscribing: boolean;
  currentTime: number;
  selectedSegment: { start: number; end: number } | null;
  videoDuration: number;
  trimmedVideoUrl: string;
  activeTab: string;
  setActiveTab: React.Dispatch<React.SetStateAction<string>>;
  onTimestampClick: (timestamp: number) => void;
  onSegmentSelect: (segment: { start: number; end: number } | null) => void;
  onInsightExtract: (insights: Timestamp[]) => void;
  onTrim: (start: number, end: number) => void;
  onDownload: () => void;
}

const TranscriptSection: React.FC<TranscriptSectionProps> = ({
  videoUrl,
  videoFile,
  transcript,
  isTranscribing,
  currentTime,
  selectedSegment,
  videoDuration,
  trimmedVideoUrl,
  activeTab,
  setActiveTab,
  onTimestampClick,
  onSegmentSelect,
  onInsightExtract,
  onTrim,
  onDownload
}) => {
  return (
    <div>
      {videoUrl ? (
        <Tabs 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="bg-card rounded-lg shadow-md"
        >
          <TabsList className="w-full border-b rounded-t-lg rounded-b-none p-0">
            <TabsTrigger 
              value="transcript" 
              className="flex-1 py-3 rounded-none data-[state=active]:bg-background"
            >
              <FileText className="h-4 w-4 mr-2" />
              Transcript
            </TabsTrigger>
            <TabsTrigger 
              value="insights" 
              className="flex-1 py-3 rounded-none data-[state=active]:bg-background"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Insights
            </TabsTrigger>
            <TabsTrigger 
              value="trim" 
              className="flex-1 py-3 rounded-none data-[state=active]:bg-background"
            >
              <Scissors className="h-4 w-4 mr-2" />
              Trim
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="transcript" className="mt-0">
            {isTranscribing ? (
              <Card>
                <CardContent className="flex items-center justify-center h-[500px] flex-col gap-3">
                  <div className="animate-pulse h-6 w-6 rounded-full bg-primary/20" />
                  <p className="text-muted-foreground">Transcribing your video...</p>
                </CardContent>
              </Card>
            ) : (
              <>
                {console.log("About to render TranscriptViewer with", transcript.length, "segments")}
                <TranscriptViewer 
                  transcript={transcript}
                  onTimestampClick={onTimestampClick}
                  currentTime={currentTime}
                  selectedSegment={selectedSegment}
                  onSegmentSelect={onSegmentSelect}
                />
              </>
            )}
          </TabsContent>
          
          <TabsContent value="insights" className="mt-0">
            <InsightExtractor 
              transcript={transcript}
              onExtract={onInsightExtract}
              onSegmentSelect={onSegmentSelect}
            />
          </TabsContent>
          
          <TabsContent value="trim" className="mt-0">
            <Card>
              <CardContent className="p-4">
                <VideoTrimmer 
                  videoSrc={videoUrl}
                  duration={videoDuration}
                  selectedSegment={selectedSegment}
                  onTrim={onTrim}
                  onDownload={onDownload}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      ) : (
        <EmptyState />
      )}
    </div>
  );
};

// Extracted the empty state to its own component
const EmptyState: React.FC = () => (
  <Card className="h-full">
    <CardContent className="flex items-center justify-center h-[500px] flex-col gap-4 text-center p-8">
      <div className="bg-muted/50 p-6 rounded-full">
        <Scissors className="h-12 w-12 text-primary/40" />
      </div>
      <h2 className="text-2xl font-semibold">Start by uploading a video</h2>
      <p className="text-muted-foreground max-w-md">
        Upload your video to transcribe, extract insights, and create precise video clips based on the content.
      </p>
    </CardContent>
  </Card>
);

export default TranscriptSection;

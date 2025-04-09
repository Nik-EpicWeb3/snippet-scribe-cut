
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import VideoUploader from '@/components/VideoUploader';
import VideoPlayer from '@/components/VideoPlayer';
import TranscriptViewer from '@/components/TranscriptViewer';
import InsightExtractor from '@/components/InsightExtractor';
import VideoTrimmer from '@/components/VideoTrimmer';
import { transcribeVideo, trimVideo, downloadTrimmedVideo } from '@/services/videoService';
import { Timestamp } from '@/types/transcript';
import { Scissors, FileText, Sparkles } from 'lucide-react';

const Index = () => {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [transcript, setTranscript] = useState<Timestamp[]>([]);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);
  const [selectedSegment, setSelectedSegment] = useState<{ start: number; end: number } | null>(null);
  const [trimmedVideoUrl, setTrimmedVideoUrl] = useState<string>('');
  const [insights, setInsights] = useState<Timestamp[]>([]);
  const [activeTab, setActiveTab] = useState('transcript');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const { toast } = useToast();

  // Handle video file upload
  const handleVideoUpload = async (file: File) => {
    const url = URL.createObjectURL(file);
    setVideoFile(file);
    setVideoUrl(url);
    setTrimmedVideoUrl('');
    setSelectedSegment(null);
    
    // Create a temporary video element to get the duration
    const video = document.createElement('video');
    video.src = url;
    video.onloadedmetadata = () => {
      setVideoDuration(video.duration);
    };
    
    // Start transcription process
    setIsTranscribing(true);
    setTranscript([]);
    
    try {
      const result = await transcribeVideo(file);
      setTranscript(result);
      toast({
        title: "Transcription complete",
        description: "Your video has been successfully transcribed.",
      });
    } catch (error) {
      toast({
        title: "Transcription failed",
        description: "There was an error transcribing your video. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsTranscribing(false);
    }
  };

  // Handle timestamp clicks in the transcript
  const handleTimestampClick = (timestamp: number) => {
    setCurrentTime(timestamp);
    if (videoRef.current) {
      videoRef.current.currentTime = timestamp;
    }
  };

  // Handle segment selection for trimming
  const handleSegmentSelect = (segment: { start: number; end: number } | null) => {
    setSelectedSegment(segment);
    if (segment) {
      setActiveTab('trim');
    }
  };

  // Handle insights extraction
  const handleInsightExtract = (extractedInsights: Timestamp[]) => {
    setInsights(extractedInsights);
    if (extractedInsights.length > 0) {
      toast({
        title: "Insights extracted",
        description: `Found ${extractedInsights.length} relevant segments in your video.`,
      });
    } else {
      toast({
        title: "No insights found",
        description: "Try a different search term or prompt.",
      });
    }
  };

  // Handle video trimming
  const handleTrim = async (start: number, end: number) => {
    try {
      const trimmedUrl = await trimVideo(videoUrl, start, end);
      setTrimmedVideoUrl(trimmedUrl);
      
      toast({
        title: "Video trimmed",
        description: "Your video segment is ready for preview and download.",
      });
    } catch (error) {
      toast({
        title: "Trimming failed",
        description: "There was an error trimming your video. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle download of trimmed video
  const handleDownload = () => {
    if (!selectedSegment) return;
    
    const filename = videoFile ? 
      `trimmed-${videoFile.name}` : 
      "trimmed-video.mp4";
      
    downloadTrimmedVideo(
      videoUrl, 
      selectedSegment.start, 
      selectedSegment.end, 
      filename
    );
    
    toast({
      title: "Download started",
      description: "Your trimmed video is being downloaded.",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto py-8 px-4 md:px-6">
        <header className="text-center mb-10">
          <h1 className="text-4xl font-bold tracking-tight">Video Snippet Extractor</h1>
          <p className="text-lg text-muted-foreground mt-2 max-w-2xl mx-auto">
            Upload a video, extract insights, and create precise video clips based on content
          </p>
        </header>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Left Column - Video Upload & Display */}
          <div className="space-y-6">
            {!videoUrl ? (
              <VideoUploader 
                onVideoUpload={handleVideoUpload} 
                className="h-[350px]"
              />
            ) : (
              <>
                <div className="bg-card rounded-lg overflow-hidden shadow-md">
                  <VideoPlayer 
                    videoSrc={trimmedVideoUrl || videoUrl}
                    startTime={selectedSegment?.start}
                    endTime={selectedSegment?.end}
                    onDownload={handleDownload}
                    ref={videoRef}
                  />
                </div>
                
                {selectedSegment && (
                  <VideoTrimmer 
                    videoSrc={videoUrl}
                    duration={videoDuration}
                    selectedSegment={selectedSegment}
                    onTrim={handleTrim}
                    onDownload={handleDownload}
                  />
                )}
              </>
            )}
          </div>

          {/* Right Column - Transcript & Tools */}
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
                    <TranscriptViewer 
                      transcript={transcript}
                      onTimestampClick={handleTimestampClick}
                      currentTime={currentTime}
                      selectedSegment={selectedSegment}
                      onSegmentSelect={handleSegmentSelect}
                    />
                  )}
                </TabsContent>
                
                <TabsContent value="insights" className="mt-0">
                  <InsightExtractor 
                    transcript={transcript}
                    onExtract={handleInsightExtract}
                    onSegmentSelect={handleSegmentSelect}
                  />
                </TabsContent>
                
                <TabsContent value="trim" className="mt-0">
                  <Card>
                    <CardContent className="p-4">
                      <VideoTrimmer 
                        videoSrc={videoUrl}
                        duration={videoDuration}
                        selectedSegment={selectedSegment}
                        onTrim={handleTrim}
                        onDownload={handleDownload}
                      />
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            ) : (
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;


import { useState, useEffect, useRef } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { transcribeVideo, trimVideo, downloadTrimmedVideo } from '@/services/videoService';
import { transcribeVideoWithWhisper, getOpenAIApiKey } from '@/services/openaiService';
import { Timestamp } from '@/types/transcript';

export const useVideoProcessing = () => {
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
  const [useAI, setUseAI] = useState(true);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const { toast } = useToast();

  // Handle video file upload
  const handleVideoUpload = async (file: File) => {
    console.log("Video upload started:", file.name, "Size:", file.size);
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
      console.log("Video duration set:", video.duration);
    };
    
    // Start transcription process
    setIsTranscribing(true);
    setTranscript([]); // Clear existing transcript
    console.log("Starting transcription process");
    
    try {
      let result: Timestamp[] = [];
      const hasOpenAIKey = !!getOpenAIApiKey();
      
      if (useAI && hasOpenAIKey) {
        console.log("Using OpenAI for transcription");
        toast({
          title: "AI Transcription Started",
          description: "Using OpenAI to transcribe your video...",
        });
        result = await transcribeVideoWithWhisper(file);
      } else {
        console.log("Using mock transcription service");
        result = await transcribeVideo(file);
      }
      
      console.log("Transcription completed successfully with result:", result ? result.length : 0, "segments");
      
      // Force the component to recognize the new data by creating a new array
      setTranscript([...result]);
      console.log("Transcript state updated with data:", result.length, "segments");
      
      toast({
        title: "Transcription complete",
        description: "Your video has been successfully transcribed.",
      });
    } catch (error) {
      console.error("Transcription error:", error);
      toast({
        title: "Transcription failed",
        description: error instanceof Error ? error.message : "There was an error transcribing your video. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsTranscribing(false);
      console.log("Transcription process finished, isTranscribing set to false");
      // Explicitly set active tab to transcript
      setActiveTab('transcript');
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

  // Set useAI based on API key availability
  useEffect(() => {
    const hasApiKey = !!getOpenAIApiKey();
    setUseAI(hasApiKey);
  }, []);

  // Effect to monitor transcript state changes
  useEffect(() => {
    console.log("Transcript state updated in Index component, segments:", transcript.length);
  }, [transcript]);

  // Effect to ensure the transcript tab is active after transcription
  useEffect(() => {
    if (!isTranscribing && transcript.length > 0) {
      setActiveTab('transcript');
      console.log("Setting active tab to transcript. Transcript length:", transcript.length);
    }
  }, [isTranscribing, transcript]);

  return {
    videoFile,
    videoUrl,
    transcript,
    isTranscribing,
    currentTime,
    videoDuration,
    selectedSegment,
    trimmedVideoUrl,
    insights,
    activeTab,
    useAI,
    setUseAI,
    videoRef,
    setActiveTab,
    handleVideoUpload,
    handleTimestampClick,
    handleSegmentSelect,
    handleInsightExtract,
    handleTrim,
    handleDownload
  };
};

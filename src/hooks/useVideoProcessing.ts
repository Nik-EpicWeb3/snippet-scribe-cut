
import { useState, useEffect, useRef, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { transcribeVideo, trimVideo, downloadTrimmedVideo } from '@/services/videoService';
import { transcribeVideoWithWhisper } from '@/services/openaiService';
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

  // Handle video file upload - memoized to prevent recreation
  const handleVideoUpload = useCallback(async (file: File) => {
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
      // For Supabase implementation, we always use AI transcription
      const hasOpenAIKey = true;
      
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
  }, [toast, useAI]);

  // Handle timestamp clicks in the transcript - memoized
  const handleTimestampClick = useCallback((timestamp: number) => {
    setCurrentTime(timestamp);
    if (videoRef.current) {
      videoRef.current.currentTime = timestamp;
    }
  }, []);

  // Handle segment selection for trimming - memoized
  const handleSegmentSelect = useCallback((segment: { start: number; end: number } | null) => {
    setSelectedSegment(segment);
    if (segment) {
      setActiveTab('trim');
    }
  }, []);

  // Handle insights extraction - memoized
  const handleInsightExtract = useCallback((extractedInsights: Timestamp[]) => {
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
  }, [toast]);

  // Handle video trimming - memoized
  const handleTrim = useCallback(async (start: number, end: number) => {
    try {
      // For server-side trimming, we need the original file
      if (videoFile) {
        const trimmedUrl = await trimVideo(videoFile, start, end);
        setTrimmedVideoUrl(trimmedUrl);
      } else {
        throw new Error('Original video file not available for trimming');
      }
      
      toast({
        title: "Video trimmed",
        description: "Your video segment is ready for preview and download.",
      });
    } catch (error) {
      toast({
        title: "Trimming failed",
        description: error instanceof Error ? error.message : "There was an error trimming your video. Please try again.",
        variant: "destructive",
      });
    }
  }, [videoFile, toast]);

  // Handle download of trimmed video - memoized
  const handleDownload = useCallback(async () => {
    if (!selectedSegment || !videoFile) return;
    
    const filename = `trimmed-${videoFile.name}`;
      
    try {
      await downloadTrimmedVideo(
        videoFile, 
        selectedSegment.start, 
        selectedSegment.end, 
        filename
      );
      
      toast({
        title: "Download completed",
        description: "Your trimmed video has been downloaded successfully.",
      });
    } catch (error) {
      toast({
        title: "Download failed",
        description: "There was an error downloading your video. Please try again.",
        variant: "destructive",
      });
    }
  }, [selectedSegment, videoFile, toast]);

  // For Supabase implementation, AI is always available
  useEffect(() => {
    setUseAI(true);
  }, []);

  // Effect to monitor transcript state changes (throttled to prevent loops)
  useEffect(() => {
    console.log("Transcript state updated in Index component, segments:", transcript.length);
  }, [transcript]);

  // Effect to ensure the transcript tab is active after transcription (with stability check)
  useEffect(() => {
    if (!isTranscribing && transcript.length > 0 && activeTab !== 'transcript') {
      const timer = setTimeout(() => {
        setActiveTab('transcript');
        console.log("Setting active tab to transcript. Transcript length:", transcript.length);
      }, 100); // Debounce to prevent rapid state changes
      
      return () => clearTimeout(timer);
    }
  }, [isTranscribing, transcript.length, activeTab]); // Changed dependency to transcript.length instead of transcript array

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

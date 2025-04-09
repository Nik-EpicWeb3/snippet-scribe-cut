
import React, { useRef, useState, useEffect } from 'react';
import { 
  Play, Pause, Volume2, VolumeX, 
  SkipBack, SkipForward, Maximize, 
  Download
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

interface VideoPlayerProps {
  videoSrc: string;
  className?: string;
  startTime?: number;
  endTime?: number;
  onDownload?: () => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ 
  videoSrc, 
  className,
  startTime,
  endTime,
  onDownload
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Initialize video with start time if provided
  useEffect(() => {
    if (videoRef.current && startTime !== undefined) {
      videoRef.current.currentTime = startTime;
    }
  }, [startTime, videoSrc]);

  // Set up event listeners
  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    const handleTimeUpdate = () => {
      setCurrentTime(videoElement.currentTime);
      
      // If we've reached the end time, pause the video
      if (endTime !== undefined && videoElement.currentTime >= endTime) {
        videoElement.pause();
        videoElement.currentTime = endTime;
        setIsPlaying(false);
      }
    };

    const handleLoadedMetadata = () => {
      setDuration(videoElement.duration);
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleVolumeChange = () => {
      setVolume(videoElement.volume);
      setIsMuted(videoElement.muted);
    };

    // Add event listeners
    videoElement.addEventListener('timeupdate', handleTimeUpdate);
    videoElement.addEventListener('loadedmetadata', handleLoadedMetadata);
    videoElement.addEventListener('play', handlePlay);
    videoElement.addEventListener('pause', handlePause);
    videoElement.addEventListener('volumechange', handleVolumeChange);

    // Clean up listeners
    return () => {
      videoElement.removeEventListener('timeupdate', handleTimeUpdate);
      videoElement.removeEventListener('loadedmetadata', handleLoadedMetadata);
      videoElement.removeEventListener('play', handlePlay);
      videoElement.removeEventListener('pause', handlePause);
      videoElement.removeEventListener('volumechange', handleVolumeChange);
    };
  }, [endTime]);

  // Handle fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(document.fullscreenElement !== null);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const togglePlay = () => {
    if (!videoRef.current) return;
    
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
  };

  const handleVolumeChange = (value: number[]) => {
    if (!videoRef.current) return;
    const newVolume = value[0];
    videoRef.current.volume = newVolume;
    
    if (newVolume === 0) {
      videoRef.current.muted = true;
    } else if (isMuted) {
      videoRef.current.muted = false;
    }
  };

  const handleSeek = (value: number[]) => {
    if (!videoRef.current) return;
    
    const newTime = value[0];
    
    // If we have a defined trim range, constrain seeking within that range
    if (startTime !== undefined && endTime !== undefined) {
      if (newTime < startTime) {
        videoRef.current.currentTime = startTime;
      } else if (newTime > endTime) {
        videoRef.current.currentTime = endTime;
      } else {
        videoRef.current.currentTime = newTime;
      }
    } else {
      videoRef.current.currentTime = newTime;
    }
  };

  const skipBackward = () => {
    if (!videoRef.current) return;
    const newTime = Math.max(currentTime - 5, startTime || 0);
    videoRef.current.currentTime = newTime;
  };

  const skipForward = () => {
    if (!videoRef.current) return;
    const maxTime = endTime || duration;
    const newTime = Math.min(currentTime + 5, maxTime);
    videoRef.current.currentTime = newTime;
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    
    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  // Format time in MM:SS format
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Calculate the slider min/max values based on trim settings
  const sliderMin = startTime || 0;
  const sliderMax = endTime || duration;

  return (
    <div 
      ref={containerRef}
      className={cn('video-player-container bg-black relative overflow-hidden', className)}
    >
      {/* Video Element */}
      <video 
        ref={videoRef}
        src={videoSrc}
        className="w-full h-auto"
        onClick={togglePlay}
      />

      {/* Controls Overlay */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3 transition-opacity">
        {/* Progress Bar */}
        <div className="relative w-full mb-2">
          <Slider
            value={[currentTime]}
            min={sliderMin}
            max={sliderMax || 100}
            step={0.01}
            onValueChange={handleSeek}
            className="cursor-pointer"
          />
        </div>
        
        {/* Controls Row */}
        <div className="flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            {/* Play/Pause Button */}
            <Button 
              variant="ghost" 
              size="icon"
              onClick={togglePlay}
              className="h-8 w-8 text-white hover:bg-white/20"
            >
              {isPlaying ? <Pause size={18} /> : <Play size={18} />}
            </Button>
            
            {/* Skip Buttons */}
            <Button 
              variant="ghost" 
              size="icon"
              onClick={skipBackward}
              className="h-8 w-8 text-white hover:bg-white/20"
            >
              <SkipBack size={18} />
            </Button>
            
            <Button 
              variant="ghost" 
              size="icon"
              onClick={skipForward}
              className="h-8 w-8 text-white hover:bg-white/20"
            >
              <SkipForward size={18} />
            </Button>
            
            {/* Volume Control */}
            <div className="flex items-center gap-1">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={toggleMute}
                className="h-8 w-8 text-white hover:bg-white/20"
              >
                {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
              </Button>
              
              <div className="hidden sm:block w-20">
                <Slider
                  value={[isMuted ? 0 : volume]}
                  min={0}
                  max={1}
                  step={0.01}
                  onValueChange={handleVolumeChange}
                />
              </div>
            </div>
            
            {/* Time Display */}
            <div className="text-xs ml-1">
              {formatTime(currentTime)} / {formatTime(sliderMax)}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Download Button (if provided) */}
            {onDownload && (
              <Button 
                variant="ghost" 
                size="icon"
                onClick={onDownload}
                className="h-8 w-8 text-white hover:bg-white/20"
              >
                <Download size={18} />
              </Button>
            )}
            
            {/* Fullscreen Button */}
            <Button 
              variant="ghost" 
              size="icon"
              onClick={toggleFullscreen}
              className="h-8 w-8 text-white hover:bg-white/20"
            >
              <Maximize size={18} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;

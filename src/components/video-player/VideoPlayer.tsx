
import React, { useRef, useState, useEffect, forwardRef, ForwardedRef } from 'react';
import VideoElement from './VideoElement';
import VideoControls from './VideoControls';
import { cn } from '@/lib/utils';

interface VideoPlayerProps {
  videoSrc: string;
  className?: string;
  startTime?: number;
  endTime?: number;
  onDownload?: () => void;
}

// Format time in MM:SS format
export const formatTime = (time: number) => {
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

const VideoPlayer = forwardRef<HTMLVideoElement, VideoPlayerProps>(({ 
  videoSrc, 
  className,
  startTime,
  endTime,
  onDownload
}, ref) => {
  const internalVideoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Use the forwarded ref if provided, otherwise fall back to internal ref
  const videoRef = ref || internalVideoRef;

  // Initialize video with start time if provided
  useEffect(() => {
    if (videoRef && 'current' in videoRef && videoRef.current && startTime !== undefined) {
      videoRef.current.currentTime = startTime;
    }
  }, [startTime, videoSrc, videoRef]);

  // Set up event listeners
  useEffect(() => {
    const videoElement = ref ? 
      (ref as React.RefObject<HTMLVideoElement>).current : 
      internalVideoRef.current;
      
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
  }, [endTime, ref]);

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
    const videoElement = ref ? 
      (ref as React.RefObject<HTMLVideoElement>).current : 
      internalVideoRef.current;
      
    if (!videoElement) return;
    
    if (isPlaying) {
      videoElement.pause();
    } else {
      videoElement.play();
    }
  };

  const toggleMute = () => {
    const videoElement = ref ? 
      (ref as React.RefObject<HTMLVideoElement>).current : 
      internalVideoRef.current;
      
    if (!videoElement) return;
    videoElement.muted = !isMuted;
  };

  const handleVolumeChange = (value: number[]) => {
    const videoElement = ref ? 
      (ref as React.RefObject<HTMLVideoElement>).current : 
      internalVideoRef.current;
      
    if (!videoElement) return;
    const newVolume = value[0];
    videoElement.volume = newVolume;
    
    if (newVolume === 0) {
      videoElement.muted = true;
    } else if (isMuted) {
      videoElement.muted = false;
    }
  };

  const handleSeek = (value: number[]) => {
    const videoElement = ref ? 
      (ref as React.RefObject<HTMLVideoElement>).current : 
      internalVideoRef.current;
      
    if (!videoElement) return;
    
    const newTime = value[0];
    
    // If we have a defined trim range, constrain seeking within that range
    if (startTime !== undefined && endTime !== undefined) {
      if (newTime < startTime) {
        videoElement.currentTime = startTime;
      } else if (newTime > endTime) {
        videoElement.currentTime = endTime;
      } else {
        videoElement.currentTime = newTime;
      }
    } else {
      videoElement.currentTime = newTime;
    }
  };

  const skipBackward = () => {
    const videoElement = ref ? 
      (ref as React.RefObject<HTMLVideoElement>).current : 
      internalVideoRef.current;
      
    if (!videoElement) return;
    const newTime = Math.max(currentTime - 5, startTime || 0);
    videoElement.currentTime = newTime;
  };

  const skipForward = () => {
    const videoElement = ref ? 
      (ref as React.RefObject<HTMLVideoElement>).current : 
      internalVideoRef.current;
      
    if (!videoElement) return;
    const maxTime = endTime || duration;
    const newTime = Math.min(currentTime + 5, maxTime);
    videoElement.currentTime = newTime;
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

  // Calculate the slider min/max values based on trim settings
  const sliderMin = startTime || 0;
  const sliderMax = endTime || duration;

  return (
    <div 
      ref={containerRef}
      className={cn('video-player-container bg-black relative overflow-hidden', className)}
    >
      <VideoElement 
        ref={videoRef as ForwardedRef<HTMLVideoElement>}
        videoSrc={videoSrc}
        togglePlay={togglePlay}
      />

      <VideoControls 
        isPlaying={isPlaying}
        currentTime={currentTime}
        duration={duration}
        volume={volume}
        isMuted={isMuted}
        sliderMin={sliderMin}
        sliderMax={sliderMax}
        togglePlay={togglePlay}
        toggleMute={toggleMute}
        handleVolumeChange={handleVolumeChange}
        handleSeek={handleSeek}
        skipBackward={skipBackward}
        skipForward={skipForward}
        toggleFullscreen={toggleFullscreen}
        onDownload={onDownload}
        formatTime={formatTime}
      />
    </div>
  );
});

VideoPlayer.displayName = 'VideoPlayer';

export default VideoPlayer;

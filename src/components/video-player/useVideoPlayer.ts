
import { useState, useEffect, RefObject } from 'react';

interface UseVideoPlayerProps {
  videoRef: RefObject<HTMLVideoElement>;
  startTime?: number;
  endTime?: number;
}

export const useVideoPlayer = ({ videoRef, startTime, endTime }: UseVideoPlayerProps) => {
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
  }, [startTime, videoRef]);

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
  }, [endTime, videoRef]);

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

  const toggleFullscreen = (containerRef: React.RefObject<HTMLDivElement>) => {
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

  return {
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    isFullscreen,
    sliderMin,
    sliderMax,
    togglePlay,
    toggleMute,
    handleVolumeChange,
    handleSeek,
    skipBackward,
    skipForward,
    toggleFullscreen
  };
};

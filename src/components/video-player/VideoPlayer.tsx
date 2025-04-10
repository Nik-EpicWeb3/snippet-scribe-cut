
import React, { useRef, forwardRef, ForwardedRef } from 'react';
import VideoElement from './VideoElement';
import VideoControls from './VideoControls';
import { useVideoPlayer } from './useVideoPlayer';
import { formatTime } from './utils';
import { cn } from '@/lib/utils';

interface VideoPlayerProps {
  videoSrc: string;
  className?: string;
  startTime?: number;
  endTime?: number;
  onDownload?: () => void;
}

const VideoPlayer = forwardRef<HTMLVideoElement, VideoPlayerProps>(({ 
  videoSrc, 
  className,
  startTime,
  endTime,
  onDownload
}, ref) => {
  const internalVideoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Use the forwarded ref if provided, otherwise fall back to internal ref
  const videoRef = ref || internalVideoRef;
  
  const {
    isPlaying,
    currentTime,
    volume,
    isMuted,
    sliderMin,
    sliderMax,
    togglePlay,
    toggleMute,
    handleVolumeChange,
    handleSeek,
    skipBackward,
    skipForward,
    toggleFullscreen
  } = useVideoPlayer({
    videoRef: videoRef as React.RefObject<HTMLVideoElement>,
    startTime,
    endTime
  });

  const handleToggleFullscreen = () => {
    toggleFullscreen(containerRef);
  };

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
        duration={sliderMax}
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
        toggleFullscreen={handleToggleFullscreen}
        onDownload={onDownload}
        formatTime={formatTime}
      />
    </div>
  );
});

VideoPlayer.displayName = 'VideoPlayer';

export default VideoPlayer;

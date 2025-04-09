
import React, { forwardRef } from 'react';

interface VideoElementProps {
  videoSrc: string;
  togglePlay: () => void;
}

const VideoElement = forwardRef<HTMLVideoElement, VideoElementProps>(
  ({ videoSrc, togglePlay }, ref) => {
    return (
      <video 
        ref={ref}
        src={videoSrc}
        className="w-full h-auto"
        onClick={togglePlay}
      />
    );
  }
);

VideoElement.displayName = 'VideoElement';

export default VideoElement;

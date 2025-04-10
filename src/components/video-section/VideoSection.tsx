
import React from 'react';
import VideoUploader from '@/components/VideoUploader';
import VideoPlayer from '@/components/VideoPlayer';
import VideoTrimmer from '@/components/VideoTrimmer';

interface VideoSectionProps {
  videoUrl: string;
  trimmedVideoUrl: string;
  selectedSegment: { start: number; end: number } | null;
  videoDuration: number;
  videoRef: React.RefObject<HTMLVideoElement>;
  onVideoUpload: (file: File) => void;
  onTrim: (start: number, end: number) => void;
  onDownload: () => void;
}

const VideoSection: React.FC<VideoSectionProps> = ({
  videoUrl,
  trimmedVideoUrl,
  selectedSegment,
  videoDuration,
  videoRef,
  onVideoUpload,
  onTrim,
  onDownload
}) => {
  return (
    <div className="space-y-6">
      {!videoUrl ? (
        <VideoUploader 
          onVideoUpload={onVideoUpload} 
          className="h-[350px]"
        />
      ) : (
        <>
          <div className="bg-card rounded-lg overflow-hidden shadow-md">
            <VideoPlayer 
              videoSrc={trimmedVideoUrl || videoUrl}
              startTime={selectedSegment?.start}
              endTime={selectedSegment?.end}
              onDownload={onDownload}
              ref={videoRef}
            />
          </div>
          
          {selectedSegment && (
            <VideoTrimmer 
              videoSrc={videoUrl}
              duration={videoDuration}
              selectedSegment={selectedSegment}
              onTrim={onTrim}
              onDownload={onDownload}
            />
          )}
        </>
      )}
    </div>
  );
};

export default VideoSection;

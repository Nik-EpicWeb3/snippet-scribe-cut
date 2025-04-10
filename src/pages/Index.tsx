
import React from 'react';
import Header from '@/components/Header';
import VideoSection from '@/components/video-section/VideoSection';
import TranscriptSection from '@/components/transcript-section/TranscriptSection';
import { useVideoProcessing } from '@/hooks/useVideoProcessing';

const Index = () => {
  const {
    videoFile,
    videoUrl,
    transcript,
    isTranscribing,
    currentTime,
    videoDuration,
    selectedSegment,
    trimmedVideoUrl,
    activeTab,
    videoRef,
    setActiveTab,
    handleVideoUpload,
    handleTimestampClick,
    handleSegmentSelect,
    handleInsightExtract,
    handleTrim,
    handleDownload
  } = useVideoProcessing();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto py-8 px-4 md:px-6">
        <Header />

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Left Column - Video Upload & Display */}
          <VideoSection 
            videoUrl={videoUrl}
            trimmedVideoUrl={trimmedVideoUrl}
            selectedSegment={selectedSegment}
            videoDuration={videoDuration}
            videoRef={videoRef}
            onVideoUpload={handleVideoUpload}
            onTrim={handleTrim}
            onDownload={handleDownload}
          />

          {/* Right Column - Transcript & Tools */}
          <TranscriptSection 
            videoUrl={videoUrl}
            videoFile={videoFile}
            transcript={transcript}
            isTranscribing={isTranscribing}
            currentTime={currentTime}
            selectedSegment={selectedSegment}
            videoDuration={videoDuration}
            trimmedVideoUrl={trimmedVideoUrl}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onTimestampClick={handleTimestampClick}
            onSegmentSelect={handleSegmentSelect}
            onInsightExtract={handleInsightExtract}
            onTrim={handleTrim}
            onDownload={handleDownload}
          />
        </div>
      </div>
    </div>
  );
};

export default Index;


import { Timestamp } from '@/types/transcript';

/**
 * Mock API call to transcribe a video file.
 * In a real application, this would send the file to a backend service.
 */
export const transcribeVideo = async (file: File): Promise<Timestamp[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  console.log("Mock transcription service processing file:", file.name);
  
  // Create mock transcript data
  const mockTranscript: Timestamp[] = [
    {
      start: 0,
      end: 4,
      text: "Hello everyone, today I want to talk about our new video snippet extraction tool."
    },
    {
      start: 4,
      end: 10,
      text: "This innovative solution allows you to upload videos and automatically extract precise moments based on your criteria."
    },
    {
      start: 10,
      end: 15,
      text: "Let me show you how it works. First, you upload your video to the platform."
    },
    {
      start: 15,
      end: 22,
      text: "Then, our AI-powered system processes the content and generates a transcript like the one you're seeing right now."
    },
    {
      start: 22,
      end: 28,
      text: "You can then search through the transcript to find specific moments or topics you're interested in."
    },
    {
      start: 28,
      end: 34,
      text: "Simply click on any segment to jump to that point in the video, or select a range to extract."
    },
    {
      start: 34,
      end: 40,
      text: "The extracted video snippets can be previewed and downloaded for use in your presentations or social media."
    },
    {
      start: 40,
      end: 48,
      text: "Our insight extraction feature can also automatically identify key moments, saving you from manually reviewing long videos."
    },
    {
      start: 48,
      end: 56,
      text: "For example, if you need to find all mentions of 'performance optimization', just type it in and we'll find relevant segments."
    },
    {
      start: 56,
      end: 63,
      text: "Videos often contain valuable information, but finding the exact moments can be time-consuming without the right tools."
    },
    {
      start: 63,
      end: 70,
      text: "With our solution, you can efficiently extract the specific content you need without any technical expertise."
    },
    {
      start: 70,
      end: 80,
      text: "Thank you for watching this demonstration, and we hope you'll give our video snippet extraction tool a try for your next project."
    }
  ];
  
  console.log("Mock transcription completed successfully with", mockTranscript.length, "segments");
  return mockTranscript;
};

/**
 * Mock API call to trim a video.
 * In a real application, this would send the request to a backend service.
 */
export const trimVideo = async (videoUrl: string, startTime: number, endTime: number): Promise<string> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  console.log(`Trimming video from ${startTime}s to ${endTime}s`);
  
  // In a real implementation, this would return a new URL to the trimmed video
  // For this mock, we just return the original URL
  return videoUrl;
};

/**
 * Mock function to download a trimmed video.
 * In a real application, this might create a file from a blob or redirect to a download URL.
 */
export const downloadTrimmedVideo = (
  videoUrl: string, 
  startTime: number, 
  endTime: number, 
  filename: string
): void => {
  console.log(`Downloading trimmed video from ${startTime}s to ${endTime}s as ${filename}`);
  
  // In a real implementation, this would trigger a file download
  // For this mock, we just log the action
  alert(`In a production app, this would download a trimmed video from ${startTime}s to ${endTime}s as ${filename}`);
};

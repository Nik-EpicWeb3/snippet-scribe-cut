
import { Timestamp } from "@/types/transcript";

// Mock transcription service
// In a real implementation, this would call a speech-to-text API
export const transcribeVideo = async (videoFile: File): Promise<Timestamp[]> => {
  // Simulate API call delay
  return new Promise((resolve) => {
    setTimeout(() => {
      // Generate a mock transcript with timestamps
      const mockTranscript: Timestamp[] = [
        {
          start: 0,
          end: 4.5,
          text: "Hello everyone, today I want to talk about our new video snippet extraction tool."
        },
        {
          start: 4.5,
          end: 10.2,
          text: "This innovative solution allows you to upload videos and automatically extract precise moments based on your criteria."
        },
        {
          start: 10.2,
          end: 15.8,
          text: "Let me show you how it works. First, you upload your video to the platform."
        },
        {
          start: 15.8,
          end: 22.3,
          text: "Then, our advanced AI transcribes the entire content with accurate timestamps at regular intervals."
        },
        {
          start: 22.3,
          end: 30.1,
          text: "Next, you can provide specific criteria or search terms, and the system will identify relevant moments in the video."
        },
        {
          start: 30.1,
          end: 36.7,
          text: "Once you've found the perfect snippet, you can trim it precisely and download it in high quality."
        },
        {
          start: 36.7,
          end: 43.4,
          text: "This is perfect for content creators, educators, and business professionals who need to extract key moments from longer recordings."
        },
        {
          start: 43.4,
          end: 50.2,
          text: "The best part is how simple and intuitive the interface is. Anyone can use it without technical expertise."
        },
        {
          start: 50.2,
          end: 58.9,
          text: "Our beta testers have reported saving hours of time compared to traditional video editing methods."
        },
        {
          start: 58.9,
          end: 65.5,
          text: "In addition to the core features, we're continuously developing new capabilities based on user feedback."
        },
        {
          start: 65.5,
          end: 73.0,
          text: "Future updates will include batch processing, automatic highlight generation, and integration with popular video platforms."
        },
        {
          start: 73.0,
          end: 80.4,
          text: "Thank you for your attention. I hope you're as excited about this tool as we are."
        }
      ];
      
      resolve(mockTranscript);
    }, 3000);
  });
};

// Simulate video trimming functionality
// In a real implementation, this would use a video processing library
export const trimVideo = async (
  videoUrl: string, 
  startTime: number, 
  endTime: number
): Promise<string> => {
  // In a real implementation, this would create a new trimmed video file
  // For this demo, we're just returning the original URL with params
  return `${videoUrl}#t=${startTime},${endTime}`;
};

// Generate a download for the trimmed video
// In a real implementation, this would create a downloadable file
export const downloadTrimmedVideo = (
  videoUrl: string, 
  startTime: number, 
  endTime: number,
  filename: string = "trimmed-video.mp4"
) => {
  // In a real implementation, the trimmed video would be downloaded
  // For this demo, we just create a link with the URL and parameters
  const a = document.createElement('a');
  a.href = `${videoUrl}#t=${startTime},${endTime}`;
  a.download = filename;
  a.click();
};

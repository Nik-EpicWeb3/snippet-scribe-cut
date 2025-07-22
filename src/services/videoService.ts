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
  
  console.log("Mock transcription service created transcript with", mockTranscript.length, "segments");
  console.log("Mock transcription first segment:", JSON.stringify(mockTranscript[0]));
  console.log("Mock transcription data type:", typeof mockTranscript);
  console.log("Mock transcription data is array?", Array.isArray(mockTranscript));
  
  return mockTranscript;
};

/**
 * Create a trimmed video using browser APIs and return a blob URL
 */
export const trimVideo = async (videoUrl: string, startTime: number, endTime: number): Promise<string> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.crossOrigin = 'anonymous';
    video.src = videoUrl;
    
    video.onloadedmetadata = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Set up MediaRecorder to capture the video
      const stream = canvas.captureStream(30); // 30 FPS
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9'
      });
      
      const chunks: Blob[] = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const trimmedUrl = URL.createObjectURL(blob);
        resolve(trimmedUrl);
      };
      
      // Start recording
      mediaRecorder.start();
      
      // Set video to start time
      video.currentTime = startTime;
      
      let frameCount = 0;
      const expectedFrames = Math.ceil((endTime - startTime) * 30); // 30 FPS
      
      const drawFrame = () => {
        if (video.currentTime >= endTime || frameCount >= expectedFrames) {
          mediaRecorder.stop();
          return;
        }
        
        ctx.drawImage(video, 0, 0);
        frameCount++;
        
        // Advance video time slightly for next frame
        video.currentTime = Math.min(startTime + (frameCount / 30), endTime);
        
        requestAnimationFrame(drawFrame);
      };
      
      video.onseeked = () => {
        drawFrame();
      };
    };
    
    video.onerror = () => {
      reject(new Error('Failed to load video'));
    };
  });
};

/**
 * Download a trimmed video segment
 */
export const downloadTrimmedVideo = async (
  videoUrl: string, 
  startTime: number, 
  endTime: number, 
  filename: string
): Promise<void> => {
  try {
    console.log(`Creating trimmed video from ${startTime}s to ${endTime}s`);
    
    // Create a trimmed video blob
    const trimmedUrl = await trimVideo(videoUrl, startTime, endTime);
    
    // Create download link
    const link = document.createElement('a');
    link.href = trimmedUrl;
    link.download = filename.replace(/\.(mp4|mov|avi|mkv)$/i, '.webm');
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up the blob URL after a delay
    setTimeout(() => {
      URL.revokeObjectURL(trimmedUrl);
    }, 1000);
    
    console.log(`Download initiated for ${filename}`);
  } catch (error) {
    console.error('Error downloading trimmed video:', error);
    throw new Error('Failed to create and download trimmed video');
  }
};

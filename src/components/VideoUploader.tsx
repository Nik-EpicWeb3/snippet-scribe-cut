
import React, { useState, useRef } from 'react';
import { Upload, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';

interface VideoUploaderProps {
  onVideoUpload: (file: File) => void;
  className?: string;
}

const VideoUploader: React.FC<VideoUploaderProps> = ({ onVideoUpload, className }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (validateVideoFile(file)) {
        onVideoUpload(file);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (validateVideoFile(file)) {
        onVideoUpload(file);
      }
    }
  };

  const validateVideoFile = (file: File) => {
    if (!file.type.startsWith('video/')) {
      toast({
        title: "Invalid file type",
        description: "Please upload a video file (MP4, WebM, etc.)",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const handleClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div 
      className={cn(
        'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all',
        isDragging ? 'border-primary bg-primary/5' : 'border-gray-300',
        className
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
    >
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept="video/*" 
        className="hidden" 
      />
      
      <div className="flex flex-col items-center justify-center gap-3">
        {isDragging ? (
          <Video className="h-12 w-12 text-primary animate-pulse" />
        ) : (
          <Upload className="h-12 w-12 text-muted-foreground" />
        )}
        <h3 className="text-xl font-semibold">Upload Video</h3>
        <p className="text-muted-foreground max-w-xs mx-auto">
          Drag and drop a video file or click to browse
        </p>
        <p className="text-xs text-muted-foreground mt-2">
          Supported formats: MP4, WebM, MOV (max 500MB)
        </p>
      </div>
    </div>
  );
};

export default VideoUploader;

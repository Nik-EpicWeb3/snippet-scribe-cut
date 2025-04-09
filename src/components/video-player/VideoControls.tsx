
import React from 'react';
import { 
  Play, Pause, Volume2, VolumeX, 
  SkipBack, SkipForward, Maximize, 
  Download
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import ProgressBar from './ProgressBar';
import VolumeControl from './VolumeControl';
import TimeDisplay from './TimeDisplay';

interface VideoControlsProps {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  sliderMin: number;
  sliderMax: number;
  togglePlay: () => void;
  toggleMute: () => void;
  handleVolumeChange: (value: number[]) => void;
  handleSeek: (value: number[]) => void;
  skipBackward: () => void;
  skipForward: () => void;
  toggleFullscreen: () => void;
  onDownload?: () => void;
  formatTime: (time: number) => string;
}

const VideoControls: React.FC<VideoControlsProps> = ({
  isPlaying,
  currentTime,
  sliderMin,
  sliderMax,
  volume,
  isMuted,
  togglePlay,
  toggleMute,
  handleVolumeChange,
  handleSeek,
  skipBackward,
  skipForward,
  toggleFullscreen,
  onDownload,
  formatTime
}) => {
  return (
    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3 transition-opacity">
      <ProgressBar 
        currentTime={currentTime}
        min={sliderMin}
        max={sliderMax}
        onSeek={handleSeek}
      />
      
      <div className="flex items-center justify-between text-white">
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={togglePlay}
            className="h-8 w-8 text-white hover:bg-white/20"
          >
            {isPlaying ? <Pause size={18} /> : <Play size={18} />}
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon"
            onClick={skipBackward}
            className="h-8 w-8 text-white hover:bg-white/20"
          >
            <SkipBack size={18} />
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon"
            onClick={skipForward}
            className="h-8 w-8 text-white hover:bg-white/20"
          >
            <SkipForward size={18} />
          </Button>
          
          <VolumeControl 
            volume={volume}
            isMuted={isMuted}
            toggleMute={toggleMute}
            handleVolumeChange={handleVolumeChange}
          />
          
          <TimeDisplay 
            currentTime={currentTime}
            duration={sliderMax}
            formatTime={formatTime}
          />
        </div>
        
        <div className="flex items-center gap-2">
          {onDownload && (
            <Button 
              variant="ghost" 
              size="icon"
              onClick={onDownload}
              className="h-8 w-8 text-white hover:bg-white/20"
            >
              <Download size={18} />
            </Button>
          )}
          
          <Button 
            variant="ghost" 
            size="icon"
            onClick={toggleFullscreen}
            className="h-8 w-8 text-white hover:bg-white/20"
          >
            <Maximize size={18} />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default VideoControls;

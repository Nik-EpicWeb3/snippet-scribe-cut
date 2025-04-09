
import React from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';

interface VolumeControlProps {
  volume: number;
  isMuted: boolean;
  toggleMute: () => void;
  handleVolumeChange: (value: number[]) => void;
}

const VolumeControl: React.FC<VolumeControlProps> = ({ 
  volume, 
  isMuted, 
  toggleMute, 
  handleVolumeChange 
}) => {
  return (
    <div className="flex items-center gap-1">
      <Button 
        variant="ghost" 
        size="icon"
        onClick={toggleMute}
        className="h-8 w-8 text-white hover:bg-white/20"
      >
        {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
      </Button>
      
      <div className="hidden sm:block w-20">
        <Slider
          value={[isMuted ? 0 : volume]}
          min={0}
          max={1}
          step={0.01}
          onValueChange={handleVolumeChange}
        />
      </div>
    </div>
  );
};

export default VolumeControl;

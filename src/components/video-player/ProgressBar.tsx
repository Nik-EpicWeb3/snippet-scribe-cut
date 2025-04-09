
import React from 'react';
import { Slider } from '@/components/ui/slider';

interface ProgressBarProps {
  currentTime: number;
  min: number;
  max: number;
  onSeek: (value: number[]) => void;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ currentTime, min, max, onSeek }) => {
  return (
    <div className="relative w-full mb-2">
      <Slider
        value={[currentTime]}
        min={min}
        max={max || 100}
        step={0.01}
        onValueChange={onSeek}
        className="cursor-pointer"
      />
    </div>
  );
};

export default ProgressBar;

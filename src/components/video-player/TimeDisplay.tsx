
import React from 'react';

interface TimeDisplayProps {
  currentTime: number;
  duration: number;
  formatTime: (time: number) => string;
}

const TimeDisplay: React.FC<TimeDisplayProps> = ({ currentTime, duration, formatTime }) => {
  return (
    <div className="text-xs ml-1">
      {formatTime(currentTime)} / {formatTime(duration)}
    </div>
  );
};

export default TimeDisplay;

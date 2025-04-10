
import React from 'react';

interface HeaderProps {
  title?: string;
  description?: string;
}

const Header: React.FC<HeaderProps> = ({ 
  title = "Video Snippet Extractor",
  description = "Upload a video, extract insights, and create precise video clips based on content"
}) => {
  return (
    <header className="text-center mb-10">
      <h1 className="text-4xl font-bold tracking-tight">{title}</h1>
      <p className="text-lg text-muted-foreground mt-2 max-w-2xl mx-auto">
        {description}
      </p>
    </header>
  );
};

export default Header;

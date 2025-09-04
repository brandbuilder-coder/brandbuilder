
import React from 'react';

interface GeneratedImageProps {
  src: string;
}

export const GeneratedImage: React.FC<GeneratedImageProps> = ({ src }) => {
  return (
    <div className="relative w-full h-full group">
      <img
        src={src}
        alt="AI Generated"
        className="object-contain w-full h-full rounded-lg shadow-lg"
      />
      <span className="absolute bottom-2 right-3 text-white text-sm font-bold opacity-50 pointer-events-none select-none">
        BBAI
      </span>
    </div>
  );
};

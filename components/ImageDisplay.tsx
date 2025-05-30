
import React from 'react';
import { Lightbulb } from 'lucide-react'; // Import Lightbulb icon

interface ImageDisplayProps {
  imageUrl: string | null; // Changed from string[] to string
  isLoading: boolean;
  prompt: string; // The original user prompt for alt text
}

export const ImageDisplay: React.FC<ImageDisplayProps> = ({ imageUrl, isLoading, prompt }) => {
  return (
    <div className="aspect-square bg-slate-200 dark:bg-slate-700 rounded-lg shadow-inner flex items-center justify-center p-2 overflow-hidden relative w-full">
      {isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-200/80 dark:bg-slate-700/80 backdrop-blur-sm z-10">
          {/* Skeleton Loader */}
          <div className="w-full h-full p-2">
            <div className="w-full h-full bg-slate-300 dark:bg-slate-600 rounded animate-shimmer [background-image:linear-gradient(to_right,_transparent_0%,_rgba(255,255,255,0.2)_50%,_transparent_100%)] [background-size:1000px_100%]" />
          </div>
          <p className="absolute bottom-4 text-slate-600 dark:text-slate-300 text-sm">Creating your vision...</p>
        </div>
      )}
      {!isLoading && !imageUrl && (
        <div className="text-center text-slate-500 dark:text-slate-400 p-4 flex flex-col items-center justify-center">
          <Lightbulb size={48} className="mb-3 text-slate-400 dark:text-slate-500" strokeWidth={1.5} />
          <p className="mt-2 text-sm font-medium text-slate-600 dark:text-slate-300">Let's create something amazing!</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">Your generated image will appear here.</p>
        </div>
      )}
      {imageUrl && !isLoading && (
        <img
          src={imageUrl}
          alt={prompt || 'Generated image'}
          className="object-contain w-full h-full rounded-md"
          aria-live="polite"
        />
      )}
    </div>
  );
};

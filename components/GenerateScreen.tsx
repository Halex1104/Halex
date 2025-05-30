
import React from 'react';
import { PromptInputForm } from './PromptInputForm';
import { ImageDisplay } from './ImageDisplay';
import { ErrorMessage } from './ErrorMessage';
import { downloadImage, generateFilename } from '../utils/imageUtils';
import { Download as DownloadIcon } from 'lucide-react';

interface GenerateScreenProps {
  prompt: string;
  onPromptChange: (value: string) => void;
  negativePrompt: string;
  onNegativePromptChange: (value: string) => void;
  seed: string;
  onSeedChange: (value: string) => void;
  promptHistory: string[];
  selectedStyle: string;
  onStyleChange: (value: string) => void;
  selectedAspectRatio: string;
  onAspectRatioChange: (value: string) => void;
  numberOfImages: number;
  onNumberOfImagesChange: (value: number) => void;
  onSubmit: () => void;
  isLoading: boolean;
  error: string | null;
  onClearError: () => void;
  generatedImageUrls: string[] | null;
  selectedImageIndex: number;
  onSelectedImageIndexChange: (index: number) => void;
  showToast: (message: string, type?: 'success' | 'error' | 'warning') => void;
  onRefinePrompt: (currentPrompt: string) => Promise<string | null>;
  onGeneratePromptFromImage: (base64Data: string, mimeType: string) => Promise<void>;
  onSuggestRelatedPrompts: (currentPrompt: string) => Promise<string[] | null>; // New prop
}

export const GenerateScreen: React.FC<GenerateScreenProps> = (props) => {
  const { 
    generatedImageUrls, 
    selectedImageIndex, 
    onSelectedImageIndexChange, 
    isLoading, 
    prompt 
  } = props;

  const handleDownload = () => {
    if (generatedImageUrls && generatedImageUrls.length > selectedImageIndex) {
      const imageUrlToDownload = generatedImageUrls[selectedImageIndex];
      const filename = generateFilename(props.prompt, `variation_${selectedImageIndex + 1}`);
      downloadImage(imageUrlToDownload, filename);
      props.showToast("Download started!");
    }
  };

  const currentImageUrl = generatedImageUrls && generatedImageUrls.length > selectedImageIndex 
    ? generatedImageUrls[selectedImageIndex] 
    : null;

  return (
    <div className="flex flex-col p-4 sm:p-6 space-y-4 h-full">
      <PromptInputForm
        prompt={props.prompt}
        onPromptChange={props.onPromptChange}
        negativePrompt={props.negativePrompt}
        onNegativePromptChange={props.onNegativePromptChange}
        seed={props.seed}
        onSeedChange={props.onSeedChange}
        promptHistory={props.promptHistory}
        selectedStyle={props.selectedStyle}
        onStyleChange={props.onStyleChange}
        selectedAspectRatio={props.selectedAspectRatio}
        onAspectRatioChange={props.onAspectRatioChange}
        numberOfImages={props.numberOfImages}
        onNumberOfImagesChange={props.onNumberOfImagesChange}
        onSubmit={props.onSubmit}
        isLoading={props.isLoading}
        onRefinePrompt={props.onRefinePrompt}
        showToast={props.showToast}
        onGeneratePromptFromImage={props.onGeneratePromptFromImage}
        onSuggestRelatedPrompts={props.onSuggestRelatedPrompts} // Pass down
      />
      {props.error && <ErrorMessage message={props.error} onClose={props.onClearError} />}
      
      <div className="flex-grow flex flex-col justify-center items-center min-h-[200px] sm:min-h-[300px] space-y-3">
        <ImageDisplay
            imageUrl={currentImageUrl}
            isLoading={isLoading}
            prompt={prompt} 
        />
        {currentImageUrl && !isLoading && (
          <button
            onClick={handleDownload}
            className="mt-2 bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-lg shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:ring-offset-2 dark:focus:ring-offset-slate-800 transition-all duration-150 ease-in-out flex items-center text-sm active:scale-[0.98]"
            aria-label="Download displayed image"
          >
            <DownloadIcon size={18} className="mr-2" />
            Download Image {generatedImageUrls && generatedImageUrls.length > 1 ? `(${selectedImageIndex + 1}/${generatedImageUrls.length})` : ''}
          </button>
        )}

        {generatedImageUrls && generatedImageUrls.length > 1 && !isLoading && (
          <div className="mt-2 w-full max-w-md">
            <p className="text-xs text-center text-slate-600 dark:text-slate-400 mb-2">
              {generatedImageUrls.length} images generated. Click a thumbnail to view.
            </p>
            <div className={`grid ${generatedImageUrls.length <= 2 ? 'grid-cols-2' : 'grid-cols-4'} gap-2`}>
              {generatedImageUrls.map((url, index) => (
                <button
                  key={index}
                  onClick={() => onSelectedImageIndexChange(index)}
                  className={`aspect-square rounded-md overflow-hidden focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-800 ${index === selectedImageIndex ? 'ring-2 ring-blue-500 dark:ring-blue-400' : 'ring-1 ring-slate-300 dark:ring-slate-600 hover:ring-slate-400 dark:hover:ring-slate-500'} transition-all duration-150 active:scale-95`}
                  aria-label={`View image ${index + 1}`}
                >
                  <img 
                    src={url} 
                    alt={`Generated variation ${index + 1}`} 
                    className="w-full h-full object-cover" 
                  />
                </button>
              ))}
            </div>
          </div>
        )}
         {generatedImageUrls && generatedImageUrls.length === 1 && !isLoading && (
             <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                1 image generated and saved to library.
             </p>
         )}
      </div>
    </div>
  );
};

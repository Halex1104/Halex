
import React, { useState, useRef } from 'react';
import { IMAGE_STYLES, ASPECT_RATIOS, SAMPLE_PROMPTS, NUMBER_OF_IMAGES_OPTIONS } from '../constants/options';
import { Sparkles, Wand2, Loader2, ImageUp, Lightbulb, X as ClearIcon } from 'lucide-react';

interface PromptInputFormProps {
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
  onRefinePrompt: (currentPrompt: string) => Promise<string | null>;
  showToast: (message: string, type?: 'success' | 'error' | 'warning') => void;
  onGeneratePromptFromImage: (base64Data: string, mimeType: string) => Promise<void>;
  onSuggestRelatedPrompts: (currentPrompt: string) => Promise<string[] | null>; // New prop
}

export const PromptInputForm: React.FC<PromptInputFormProps> = ({
  prompt,
  onPromptChange,
  negativePrompt,
  onNegativePromptChange,
  seed,
  onSeedChange,
  promptHistory,
  selectedStyle,
  onStyleChange,
  selectedAspectRatio,
  onAspectRatioChange,
  numberOfImages,
  onNumberOfImagesChange,
  onSubmit,
  isLoading,
  onRefinePrompt,
  showToast,
  onGeneratePromptFromImage,
  onSuggestRelatedPrompts, // New prop
}) => {
  const [isRefiningPrompt, setIsRefiningPrompt] = useState(false);
  const [isAnalyzingImage, setIsAnalyzingImage] = useState(false);
  const [isSuggestingPrompts, setIsSuggestingPrompts] = useState(false); // New state for suggestions
  const [suggestedPrompts, setSuggestedPrompts] = useState<string[] | null>(null); // New state for suggestions
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  const handleSurpriseMe = () => {
    const randomIndex = Math.floor(Math.random() * SAMPLE_PROMPTS.length);
    onPromptChange(SAMPLE_PROMPTS[randomIndex]);
    setSuggestedPrompts(null); // Clear suggestions when new prompt is set
  };

  const handleRefineClick = async () => {
    if (!prompt.trim() || isLoading || isRefiningPrompt || isAnalyzingImage || isSuggestingPrompts) return;
    setIsRefiningPrompt(true);
    setSuggestedPrompts(null); // Clear suggestions
    try {
      const refinedPromptText = await onRefinePrompt(prompt);
      if (refinedPromptText) {
        onPromptChange(refinedPromptText);
      }
    } catch (error) {
      console.error("Error during prompt refinement in form:", error);
      showToast("An unexpected error occurred while refining prompt.", "error");
    } finally {
      setIsRefiningPrompt(false);
    }
  };

  const handleImageToPromptClick = () => {
    if (isLoading || isRefiningPrompt || isAnalyzingImage || isSuggestingPrompts) return;
    fileInputRef.current?.click();
    setSuggestedPrompts(null); // Clear suggestions
  };

  const handleFileSelected = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 4 * 1024 * 1024) { // Limit file size (e.g., 4MB)
        showToast("Image file too large. Please select an image under 4MB.", "error");
        if(fileInputRef.current) fileInputRef.current.value = ""; // Reset file input
        return;
    }

    setIsAnalyzingImage(true);
    setSuggestedPrompts(null); // Clear suggestions
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const base64String = reader.result as string;
        const mimeType = base64String.substring(base64String.indexOf(':') + 1, base64String.indexOf(';'));
        const pureBase64Data = base64String.substring(base64String.indexOf(',') + 1);
        
        await onGeneratePromptFromImage(pureBase64Data, mimeType);
      } catch (error) {
        console.error("Error processing image for prompt generation:", error);
        showToast("Failed to process image. Please try again.", "error");
      } finally {
        setIsAnalyzingImage(false);
        if(fileInputRef.current) fileInputRef.current.value = ""; 
      }
    };
    reader.onerror = () => {
        console.error("Error reading file:", reader.error);
        showToast("Error reading image file.", "error");
        setIsAnalyzingImage(false);
        if(fileInputRef.current) fileInputRef.current.value = "";
    };
    reader.readAsDataURL(file);
  };

  const handleSuggestIdeasClick = async () => {
    if (!prompt.trim() || isLoading || isRefiningPrompt || isAnalyzingImage || isSuggestingPrompts) return;
    setIsSuggestingPrompts(true);
    setSuggestedPrompts(null);
    try {
      const suggestions = await onSuggestRelatedPrompts(prompt);
      if (suggestions && suggestions.length > 0) {
        setSuggestedPrompts(suggestions);
      } else if (suggestions === null) { // API error or no new suggestions based on handler logic
        // Toast is handled in App.tsx
      } else { // suggestions is an empty array
        showToast("No suggestions found, try a different prompt.", "warning");
      }
    } catch (error) {
      console.error("Error during prompt suggestion in form:", error);
      showToast("An unexpected error occurred while suggesting prompts.", "error");
    } finally {
      setIsSuggestingPrompts(false);
    }
  };

  const handleClearSuggestions = () => {
    setSuggestedPrompts(null);
  };

  const handleUseSuggestion = (suggestion: string) => {
    onPromptChange(suggestion);
    setSuggestedPrompts(null);
  };


  const commonInputBaseClasses = "w-full p-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out text-sm";
  const lightModeInputClasses = "bg-white border-slate-300 text-slate-900 placeholder-slate-400";
  const darkModeInputClasses = "dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100 dark:placeholder-slate-400";
  
  const commonTextareaClasses = `${commonInputBaseClasses} ${lightModeInputClasses} ${darkModeInputClasses}`;
  const commonSelectClasses = `${commonInputBaseClasses.replace('p-3', 'p-2.5')} ${lightModeInputClasses} ${darkModeInputClasses}`;
  const commonLabelClasses = "block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1";
  const smallButtonClasses = "text-xs hover:underline flex items-center transition-transform duration-100 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed";


  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <div className="flex justify-between items-center mb-1">
          <label htmlFor="prompt" className={commonLabelClasses}>
            Your Creative Prompt:
          </label>
          <div className="flex items-center space-x-1.5 sm:space-x-2"> {/* Adjusted spacing for more buttons */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelected}
              accept="image/png, image/jpeg, image/webp"
              className="hidden"
              disabled={isLoading || isRefiningPrompt || isAnalyzingImage || isSuggestingPrompts}
            />
            <button
              type="button"
              onClick={handleImageToPromptClick}
              className={`${smallButtonClasses} text-teal-600 dark:text-teal-400`}
              disabled={isLoading || isRefiningPrompt || isAnalyzingImage || isSuggestingPrompts}
              title="Generate prompt from image"
            >
              {isAnalyzingImage ? (
                <Loader2 size={14} className="mr-1 animate-spin" />
              ) : (
                <ImageUp size={14} className="mr-1" />
              )}
               <span className="hidden sm:inline">Image</span>
            </button>
            <button 
              type="button"
              onClick={handleSurpriseMe}
              className={`${smallButtonClasses} text-blue-600 dark:text-blue-400`}
              disabled={isLoading || isRefiningPrompt || isAnalyzingImage || isSuggestingPrompts}
              title="Generate a random prompt"
            >
              <Sparkles size={14} className="mr-1" />
              <span className="hidden sm:inline">Random</span>
            </button>
            <button
              type="button"
              onClick={handleRefineClick}
              className={`${smallButtonClasses} text-purple-600 dark:text-purple-400`}
              disabled={isLoading || isRefiningPrompt || isAnalyzingImage || isSuggestingPrompts || !prompt.trim()}
              title="Refine prompt with AI"
            >
              {isRefiningPrompt ? (
                <Loader2 size={14} className="mr-1 animate-spin" />
              ) : (
                <Wand2 size={14} className="mr-1" />
              )}
              <span className="hidden sm:inline">Refine</span>
            </button>
            <button
              type="button"
              onClick={handleSuggestIdeasClick}
              className={`${smallButtonClasses} text-yellow-600 dark:text-yellow-400`}
              disabled={isLoading || isRefiningPrompt || isAnalyzingImage || isSuggestingPrompts || !prompt.trim()}
              title="Suggest related prompts"
            >
              {isSuggestingPrompts ? (
                 <Loader2 size={14} className="mr-1 animate-spin" />
              ) : (
                <Lightbulb size={14} className="mr-1" />
              )}
              <span className="hidden sm:inline">Ideas</span>
            </button>
          </div>
        </div>
        <textarea
          id="prompt"
          value={prompt}
          onChange={(e) => { onPromptChange(e.target.value); if (suggestedPrompts) setSuggestedPrompts(null); }}
          placeholder="e.g., A cat astronaut exploring Mars, or upload an image"
          rows={3}
          className={commonTextareaClasses}
          disabled={isLoading || isRefiningPrompt || isAnalyzingImage || isSuggestingPrompts}
          aria-required="true"
        />
        <datalist id="prompt-history">
          {promptHistory.map((p, index) => (
            <option key={index} value={p} />
          ))}
        </datalist>
      </div>

      {suggestedPrompts && suggestedPrompts.length > 0 && (
        <div className="mt-2 p-3 bg-slate-100 dark:bg-slate-700/50 rounded-lg shadow">
          <div className="flex justify-between items-center mb-2">
            <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300">Suggestions:</h4>
            <button
              type="button"
              onClick={handleClearSuggestions}
              className="p-1 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-all duration-100 active:scale-90"
              aria-label="Clear suggestions"
            >
              <ClearIcon size={16} />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {suggestedPrompts.map((suggestion, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleUseSuggestion(suggestion)}
                className="bg-sky-100 hover:bg-sky-200 dark:bg-sky-700/70 dark:hover:bg-sky-600/70 text-sky-700 dark:text-sky-200 text-xs px-2.5 py-1.5 rounded-md shadow-sm transition-all duration-150 ease-in-out active:scale-95 focus:outline-none focus:ring-1 focus:ring-sky-500"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label htmlFor="style" className={commonLabelClasses}>
            Artistic Style:
          </label>
          <select
            id="style"
            value={selectedStyle}
            onChange={(e) => onStyleChange(e.target.value)}
            className={commonSelectClasses}
            disabled={isLoading || isRefiningPrompt || isAnalyzingImage || isSuggestingPrompts}
            aria-label="Select artistic style"
          >
            {IMAGE_STYLES.map((style) => (
              <option key={style} value={style}>
                {style === "None" ? "Default (No specific style)" : style}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="aspectRatio" className={commonLabelClasses}>
            Aspect Ratio:
          </label>
          <select
            id="aspectRatio"
            value={selectedAspectRatio}
            onChange={(e) => onAspectRatioChange(e.target.value)}
            className={commonSelectClasses}
            disabled={isLoading || isRefiningPrompt || isAnalyzingImage || isSuggestingPrompts}
            aria-label="Select aspect ratio preference"
          >
            {Object.entries(ASPECT_RATIOS).map(([key, value]) => (
              <option key={key} value={key}>{value}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="numberOfImages" className={commonLabelClasses}>
            Variations:
          </label>
          <select
            id="numberOfImages"
            value={numberOfImages}
            onChange={(e) => onNumberOfImagesChange(Number(e.target.value))}
            className={commonSelectClasses}
            disabled={isLoading || isRefiningPrompt || isAnalyzingImage || isSuggestingPrompts}
            aria-label="Select number of image variations"
          >
            {NUMBER_OF_IMAGES_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      <div>
        <label htmlFor="negativePrompt" className={commonLabelClasses}>
          Negative Prompt (Optional):
        </label>
        <textarea
          id="negativePrompt"
          value={negativePrompt}
          onChange={(e) => onNegativePromptChange(e.target.value)}
          placeholder="e.g., blurry, low quality, text, watermark"
          rows={2}
          className={commonTextareaClasses}
          disabled={isLoading || isRefiningPrompt || isAnalyzingImage || isSuggestingPrompts}
          aria-label="Enter negative prompt"
        />
      </div>

      <div>
        <label htmlFor="seed" className={commonLabelClasses}>
          Seed (Optional):
        </label>
        <input
          id="seed"
          type="number"
          value={seed}
          onChange={(e) => onSeedChange(e.target.value)}
          placeholder="e.g., 12345 (for reference)"
          className={`${commonInputBaseClasses.replace('p-3', 'p-2.5')} ${lightModeInputClasses} ${darkModeInputClasses}`}
          disabled={isLoading || isRefiningPrompt || isAnalyzingImage || isSuggestingPrompts}
          aria-label="Enter seed value (for reference)"
        />
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Note: Seed is stored with image, but may not directly influence Imagen 3 via current API options.</p>
      </div>

      <button
        type="submit"
        disabled={isLoading || isRefiningPrompt || isAnalyzingImage || isSuggestingPrompts || !prompt.trim()}
        className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:ring-offset-2 dark:focus:ring-offset-slate-800 transition-all duration-150 ease-in-out flex items-center justify-center text-base active:scale-[0.98]"
        aria-label="Generate image with current settings"
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Generating...
          </>
        ) : (
          'Generate Image'
        )}
      </button>
    </form>
  );
};

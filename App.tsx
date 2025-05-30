
import React, { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { BottomNavigationBar } from './components/BottomNavigationBar';
import { GenerateScreen } from './components/GenerateScreen';
import { LibraryScreen } from './components/LibraryScreen';
import { SettingsScreen } from './components/SettingsScreen';
import { OnboardingGuide } from './components/OnboardingGuide'; // Import OnboardingGuide
import { generateImageFromApi, refinePromptWithGemini, generatePromptFromImageWithGemini, suggestRelatedPromptsWithGemini } from './services/geminiService';
import type { StoredImage } from './types';
import { IMAGE_STYLES, ASPECT_RATIOS, NUMBER_OF_IMAGES_OPTIONS, SORT_OPTIONS } from './constants/options';
import { Toast } from './components/Toast';

type Theme = 'light' | 'dark';

// Define initial default values
const INITIAL_DEFAULT_STYLE = IMAGE_STYLES[0]; // "None"
const INITIAL_DEFAULT_ASPECT_RATIO = Object.keys(ASPECT_RATIOS)[0]; // "1:1"
const INITIAL_DEFAULT_NUMBER_OF_IMAGES = NUMBER_OF_IMAGES_OPTIONS[0].value; // 1

const App: React.FC = () => {
  // Default settings state
  const [defaultStyle, setDefaultStyle] = useState<string>(() => {
    return localStorage.getItem('imagenAppDefaultStyle') || INITIAL_DEFAULT_STYLE;
  });
  const [defaultAspectRatio, setDefaultAspectRatio] = useState<string>(() => {
    return localStorage.getItem('imagenAppDefaultAspectRatio') || INITIAL_DEFAULT_ASPECT_RATIO;
  });
  const [defaultNumberOfImages, setDefaultNumberOfImages] = useState<number>(() => {
    const storedNum = localStorage.getItem('imagenAppDefaultNumberOfImages');
    return storedNum ? parseInt(storedNum, 10) : INITIAL_DEFAULT_NUMBER_OF_IMAGES;
  });

  // Generation parameters, initialized with defaults
  const [prompt, setPrompt] = useState<string>('');
  const [negativePrompt, setNegativePrompt] = useState<string>('');
  const [seed, setSeed] = useState<string>('');
  const [selectedStyle, setSelectedStyle] = useState<string>(defaultStyle);
  const [selectedAspectRatio, setSelectedAspectRatio] = useState<string>(defaultAspectRatio);
  const [numberOfImages, setNumberOfImages] = useState<number>(defaultNumberOfImages);
  
  const [generatedImages, setGeneratedImages] = useState<string[] | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const [activeTab, setActiveTab] = useState<'generate' | 'library'>('generate');
  const [libraryImages, setLibraryImages] = useState<StoredImage[]>([]);
  const [librarySortOption, setLibrarySortOption] = useState<string>(SORT_OPTIONS[0].value);

  const [toastInfo, setToastInfo] = useState<{ message: string; type: 'success' | 'error' | 'warning' } | null>(null);
  const [theme, setTheme] = useState<Theme>('light');
  const [promptHistory, setPromptHistory] = useState<string[]>([]);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [showOnboarding, setShowOnboarding] = useState<boolean>(false); // State for onboarding

  // Effect to load and set theme
  useEffect(() => {
    const storedTheme = localStorage.getItem('imagenAppTheme') as Theme | null;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = storedTheme || (prefersDark ? 'dark' : 'light');
    setTheme(initialTheme);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.style.setProperty('color-scheme', 'dark');
      document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '#1e293b'); // slate-800
    } else {
      root.classList.remove('dark');
      root.style.setProperty('color-scheme', 'light');
      document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '#ffffff');
    }
    localStorage.setItem('imagenAppTheme', theme);
  }, [theme]);

  // Effect for onboarding guide
  useEffect(() => {
    const onboardingShown = localStorage.getItem('imagenAppOnboardingShown');
    if (onboardingShown !== 'true') {
      setShowOnboarding(true);
    }
  }, []);

  const handleDismissOnboarding = () => {
    setShowOnboarding(false);
    localStorage.setItem('imagenAppOnboardingShown', 'true');
  };

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const toggleSettingsScreen = () => {
    setIsSettingsOpen(!isSettingsOpen);
  };

  // Save default settings to localStorage
  useEffect(() => {
    localStorage.setItem('imagenAppDefaultStyle', defaultStyle);
    setSelectedStyle(defaultStyle);
  }, [defaultStyle]);

  useEffect(() => {
    localStorage.setItem('imagenAppDefaultAspectRatio', defaultAspectRatio);
    setSelectedAspectRatio(defaultAspectRatio);
  }, [defaultAspectRatio]);

  useEffect(() => {
    localStorage.setItem('imagenAppDefaultNumberOfImages', defaultNumberOfImages.toString());
    setNumberOfImages(defaultNumberOfImages);
  }, [defaultNumberOfImages]);


  const showToast = (message: string, type: 'success' | 'error' | 'warning' = 'success') => {
    setToastInfo({ message, type });
  };

  useEffect(() => {
    try {
      const storedLibrary = localStorage.getItem('imagenAppLibrary');
      if (storedLibrary) setLibraryImages(JSON.parse(storedLibrary));
      const storedPromptHistory = localStorage.getItem('imagenAppPromptHistory');
      if (storedPromptHistory) setPromptHistory(JSON.parse(storedPromptHistory));
    } catch (e) {
      console.error("Failed to load from localStorage:", e);
      showToast("Error loading saved data.", "error");
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('imagenAppLibrary', JSON.stringify(libraryImages));
    } catch (e) {
      console.error("Failed to save library to localStorage:", e);
      showToast("Error saving library.", "error");
    }
  }, [libraryImages]);

  useEffect(() => {
    try {
      localStorage.setItem('imagenAppPromptHistory', JSON.stringify(promptHistory));
    } catch (e) {
      console.error("Failed to save prompt history to localStorage:", e);
    }
  }, [promptHistory]);
  
  const addPromptToHistory = (newPrompt: string) => {
    if (!newPrompt.trim()) return;
    setPromptHistory(prevHistory => {
      const updatedHistory = [newPrompt.trim(), ...prevHistory.filter(p => p !== newPrompt.trim())];
      return updatedHistory.slice(0, 10); 
    });
  };

  const handleClearPromptHistory = () => {
    setPromptHistory([]);
    localStorage.removeItem('imagenAppPromptHistory');
    showToast("Prompt history cleared!", "success");
  };

  const handleClearLibrary = () => {
    setLibraryImages([]);
    localStorage.removeItem('imagenAppLibrary');
    showToast("Image library cleared!", "success");
  };

  const addImagesToLibrary = (imagesData: StoredImage[]) => {
    setLibraryImages(prevImages => [...imagesData, ...prevImages].slice(0, 100));
    const message = imagesData.length > 1 
        ? `${imagesData.length} images saved to library!`
        : "Image saved to library!";
    showToast(message);
  };

  const deleteImageFromLibrary = (id: string) => {
    setLibraryImages(prevImages => prevImages.filter(image => image.id !== id));
    showToast("Image deleted from library.");
  };
  
  const deleteMultipleImagesFromLibrary = (ids: string[]) => {
    setLibraryImages(prevImages => prevImages.filter(image => !ids.includes(image.id)));
    showToast(`${ids.length} image${ids.length > 1 ? 's' : ''} deleted.`);
  };

  const toggleFavoriteImage = (id: string) => {
    let isNowFavorite = false;
    setLibraryImages(prevImages => 
      prevImages.map(img => {
        if (img.id === id) {
          isNowFavorite = !img.isFavorite;
          return { ...img, isFavorite: isNowFavorite };
        }
        return img;
      })
    );
     showToast(isNowFavorite ? "Added to favorites" : "Removed from favorites", "success");
  };

  const handleGenerateImage = useCallback(async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt.');
      showToast('Prompt cannot be empty.', 'warning');
      return;
    }
    setIsLoading(true);
    setError(null);
    setGeneratedImages(null); 
    setSelectedImageIndex(0);

    let fullPrompt = prompt.trim();
    if (selectedStyle !== "None" && selectedStyle) {
      fullPrompt = `${selectedStyle} style: ${fullPrompt}`;
    }

    try {
      const apiKey = process.env.API_KEY;
      if (!apiKey) throw new Error("API_KEY is not configured.");
      const imageDataUrls = await generateImageFromApi(fullPrompt, apiKey, negativePrompt.trim(), numberOfImages);
      setGeneratedImages(imageDataUrls);
      addPromptToHistory(prompt.trim()); 
      
      const newImages: StoredImage[] = imageDataUrls.map((url, index) => ({
        id: `${Date.now().toString()}-${index}`, imageUrl: url, prompt: prompt.trim(),
        fullPrompt: fullPrompt, style: selectedStyle, aspectRatio: selectedAspectRatio,
        negativePrompt: negativePrompt.trim(), timestamp: Date.now(),
        seed: seed.trim() || undefined, isFavorite: false, 
      }));
      addImagesToLibrary(newImages);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(`Failed to generate image(s): ${errorMessage}`);
      showToast(`Error: ${errorMessage}`, 'error');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [prompt, negativePrompt, selectedStyle, selectedAspectRatio, seed, numberOfImages, showToast]);

  const handleRefineCurrentPrompt = async (currentPromptText: string): Promise<string | null> => {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      showToast("API_KEY is not configured. Cannot refine prompt.", "error");
      return null;
    }
    if (!currentPromptText.trim()) {
      showToast("Prompt is empty, nothing to refine.", "warning");
      return null;
    }
    showToast("Refining prompt...", "warning"); 
    try {
      const refinedPromptText = await refinePromptWithGemini(currentPromptText, apiKey);
      if (refinedPromptText) {
        showToast("Prompt refined successfully!", "success");
        return refinedPromptText;
      } else {
        showToast("Failed to refine prompt.", "error");
        return null;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      showToast(`Error refining prompt: ${errorMessage}`, 'error');
      return null;
    }
  };

  const handleGeneratePromptFromImage = async (base64Data: string, mimeType: string): Promise<void> => {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      showToast("API_KEY is not configured. Cannot analyze image.", "error");
      return;
    }
    showToast("Analyzing image...", "warning");
    try {
      const generatedDescription = await generatePromptFromImageWithGemini(base64Data, mimeType, apiKey);
      if (generatedDescription) {
        setPrompt(generatedDescription);
        showToast("Image described! Prompt updated.", "success");
      } else {
        showToast("Failed to describe image.", "error");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      showToast(`Error analyzing image: ${errorMessage}`, 'error');
    }
  };

  const handleSuggestRelatedPrompts = async (currentPromptText: string): Promise<string[] | null> => {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      showToast("API_KEY is not configured. Cannot suggest prompts.", "error");
      return null;
    }
    if (!currentPromptText.trim()) {
      showToast("Prompt is empty, nothing to base suggestions on.", "warning");
      return null;
    }
    showToast("Suggesting ideas...", "warning");
    try {
      const suggestions = await suggestRelatedPromptsWithGemini(currentPromptText, apiKey);
      if (suggestions && suggestions.length > 0) {
        showToast("Suggestions loaded!", "success");
        return suggestions;
      } else if (suggestions && suggestions.length === 0) {
        showToast("No new suggestions found.", "warning");
        return null;
      }
      else {
        showToast("Failed to get suggestions.", "error");
        return null;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      showToast(`Error suggesting prompts: ${errorMessage}`, 'error');
      return null;
    }
  };

  const clearError = useCallback(() => setError(null), []);

  return (
    <div className="bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 flex flex-col h-full w-full transition-colors duration-300">
      <Header 
        title={activeTab === 'generate' ? "Image Studio" : "Image Library"} 
        theme={theme}
        toggleTheme={toggleTheme}
        onToggleSettings={toggleSettingsScreen}
      />
      <main className="flex-grow overflow-y-auto pb-16 sm:pb-4 bg-white dark:bg-slate-800">
        {activeTab === 'generate' && (
          <GenerateScreen
            prompt={prompt} onPromptChange={setPrompt}
            negativePrompt={negativePrompt} onNegativePromptChange={setNegativePrompt}
            seed={seed} onSeedChange={setSeed}
            promptHistory={promptHistory}
            selectedStyle={selectedStyle} onStyleChange={setSelectedStyle}
            selectedAspectRatio={selectedAspectRatio} onAspectRatioChange={setSelectedAspectRatio}
            numberOfImages={numberOfImages} onNumberOfImagesChange={setNumberOfImages}
            onSubmit={handleGenerateImage}
            isLoading={isLoading} error={error} onClearError={clearError}
            generatedImageUrls={generatedImages}
            selectedImageIndex={selectedImageIndex} onSelectedImageIndexChange={setSelectedImageIndex}
            showToast={showToast}
            onRefinePrompt={handleRefineCurrentPrompt}
            onGeneratePromptFromImage={handleGeneratePromptFromImage}
            onSuggestRelatedPrompts={handleSuggestRelatedPrompts}
          />
        )}
        {activeTab === 'library' && (
          <LibraryScreen 
            images={libraryImages} sortOption={librarySortOption} onSortOptionChange={setLibrarySortOption}
            onDeleteImage={deleteImageFromLibrary} onDeleteMultipleImages={deleteMultipleImagesFromLibrary}
            onToggleFavorite={toggleFavoriteImage}
            onRegenerateImage={(imageParams) => {
              setPrompt(imageParams.prompt);
              setNegativePrompt(imageParams.negativePrompt);
              setSelectedStyle(imageParams.style);
              setSelectedAspectRatio(imageParams.aspectRatio);
              setSeed(imageParams.seed || '');
              setNumberOfImages(defaultNumberOfImages); 
              setGeneratedImages(null); 
              setSelectedImageIndex(0);
              setActiveTab('generate');
              showToast("Image settings loaded! Modify as needed and click Generate.", "success");
            }}
            showToast={showToast} onTabChange={setActiveTab}
          />
        )}
      </main>
      <BottomNavigationBar activeTab={activeTab} onTabChange={setActiveTab} />
      {toastInfo && <Toast message={toastInfo.message} type={toastInfo.type} onClose={() => setToastInfo(null)} />}
      
      <SettingsScreen
        isOpen={isSettingsOpen}
        onClose={toggleSettingsScreen}
        theme={theme}
        toggleTheme={toggleTheme}
        defaultStyle={defaultStyle}
        onDefaultStyleChange={setDefaultStyle}
        defaultAspectRatio={defaultAspectRatio}
        onDefaultAspectRatioChange={setDefaultAspectRatio}
        defaultNumberOfImages={defaultNumberOfImages}
        onDefaultNumberOfImagesChange={setDefaultNumberOfImages}
        onClearPromptHistory={handleClearPromptHistory}
        onClearLibrary={handleClearLibrary}
      />
      {showOnboarding && <OnboardingGuide onDismiss={handleDismissOnboarding} />}
    </div>
  );
};

export default App;

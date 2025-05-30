
import React from 'react';
import { X, Sun, Moon, Settings as SettingsIcon, Info, Palette, Images, Trash2, Database } from 'lucide-react'; // Added Trash2 and Database
import { IMAGE_STYLES, ASPECT_RATIOS, NUMBER_OF_IMAGES_OPTIONS } from '../constants/options';

type Theme = 'light' | 'dark';

interface SettingsScreenProps {
  isOpen: boolean;
  onClose: () => void;
  theme: Theme;
  toggleTheme: () => void;
  defaultStyle: string;
  onDefaultStyleChange: (value: string) => void;
  defaultAspectRatio: string;
  onDefaultAspectRatioChange: (value: string) => void;
  defaultNumberOfImages: number;
  onDefaultNumberOfImagesChange: (value: number) => void;
  onClearPromptHistory: () => void;
  onClearLibrary: () => void; // New prop for clearing library
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  isOpen,
  onClose,
  theme,
  toggleTheme,
  defaultStyle,
  onDefaultStyleChange,
  defaultAspectRatio,
  onDefaultAspectRatioChange,
  defaultNumberOfImages,
  onDefaultNumberOfImagesChange,
  onClearPromptHistory,
  onClearLibrary, // New prop
}) => {
  if (!isOpen) return null;

  const commonSelectClasses = "w-full p-2.5 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out text-sm bg-white border-slate-300 text-slate-900 placeholder-slate-400 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100 dark:placeholder-slate-400";
  const sectionTitleClasses = "text-lg font-semibold text-slate-700 dark:text-slate-200 mb-3 flex items-center";
  const labelClasses = "block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1";
  const buttonClasses = "w-full flex items-center justify-center p-2.5 border rounded-lg shadow-sm focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-700 transition-all duration-150 ease-in-out text-sm font-medium active:scale-[0.98]";


  const handleClearHistoryClick = () => {
    if (window.confirm("Are you sure you want to clear your prompt history? This action cannot be undone.")) {
      onClearPromptHistory();
    }
  };

  const handleClearLibraryClick = () => {
    if (window.confirm("ARE YOU ABSOLUTELY SURE?\n\nThis will permanently delete all images from your library. This action cannot be undone.")) {
      onClearLibrary();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity duration-300"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-title"
    >
      <div 
        className="bg-slate-50 dark:bg-slate-800 rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700 sticky top-0 bg-slate-50 dark:bg-slate-800 rounded-t-xl">
          <h2 id="settings-title" className="text-xl font-semibold text-slate-800 dark:text-slate-100 flex items-center">
            <SettingsIcon size={22} className="mr-2 text-blue-600 dark:text-blue-400" />
            Settings
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all duration-150 active:scale-90"
            aria-label="Close settings"
          >
            <X size={22} />
          </button>
        </header>

        <div className="p-4 sm:p-6 space-y-6 overflow-y-auto">
          {/* Appearance Section */}
          <section aria-labelledby="appearance-settings">
            <h3 id="appearance-settings" className={sectionTitleClasses}>
              <Palette size={20} className="mr-2 text-purple-600 dark:text-purple-400" />
              Appearance
            </h3>
            <div className="bg-white dark:bg-slate-700 p-4 rounded-lg shadow">
              <label className={labelClasses} htmlFor="theme-toggle">Theme</label>
              <div id="theme-toggle" className="flex items-center justify-between p-2 bg-slate-100 dark:bg-slate-600 rounded-lg">
                <span className="text-sm text-slate-700 dark:text-slate-200">
                  Currently: {theme === 'light' ? 'Light Mode' : 'Dark Mode'}
                </span>
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-500 transition-all duration-150 active:scale-90"
                  aria-label={theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme'}
                >
                  {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                </button>
              </div>
            </div>
          </section>

          {/* Default Generation Settings Section */}
          <section aria-labelledby="default-generation-settings">
            <h3 id="default-generation-settings" className={sectionTitleClasses}>
              <Images size={20} className="mr-2 text-green-600 dark:text-green-400" />
              Default Generation
            </h3>
            <div className="bg-white dark:bg-slate-700 p-4 rounded-lg shadow space-y-4">
              <div>
                <label htmlFor="default-style" className={labelClasses}>Default Artistic Style</label>
                <select
                  id="default-style"
                  value={defaultStyle}
                  onChange={(e) => onDefaultStyleChange(e.target.value)}
                  className={commonSelectClasses}
                >
                  {IMAGE_STYLES.map((style) => (
                    <option key={style} value={style}>
                      {style === "None" ? "Default (No specific style)" : style}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="default-aspect-ratio" className={labelClasses}>Default Aspect Ratio</label>
                <select
                  id="default-aspect-ratio"
                  value={defaultAspectRatio}
                  onChange={(e) => onDefaultAspectRatioChange(e.target.value)}
                  className={commonSelectClasses}
                >
                  {Object.entries(ASPECT_RATIOS).map(([key, value]) => (
                    <option key={key} value={key}>{value}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="default-number-of-images" className={labelClasses}>Default Number of Images</label>
                <select
                  id="default-number-of-images"
                  value={defaultNumberOfImages}
                  onChange={(e) => onDefaultNumberOfImagesChange(Number(e.target.value))}
                  className={commonSelectClasses}
                >
                  {NUMBER_OF_IMAGES_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          {/* Data Management Section */}
          <section aria-labelledby="data-management-settings">
            <h3 id="data-management-settings" className={sectionTitleClasses}>
              <Database size={20} className="mr-2 text-orange-600 dark:text-orange-400" />
              Data Management
            </h3>
            <div className="bg-white dark:bg-slate-700 p-4 rounded-lg shadow space-y-4"> {/* Increased space-y */}
              <div>
                <label className={labelClasses}>Prompt History</label>
                <button
                  onClick={handleClearHistoryClick}
                  className={`${buttonClasses} bg-orange-500 hover:bg-orange-600 text-white border-orange-600 dark:border-orange-500 focus:ring-orange-500`}
                  aria-label="Clear prompt history"
                >
                  <Trash2 size={16} className="mr-2" />
                  Clear Prompt History
                </button>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Clears your saved prompt suggestions.</p>
              </div>
              <div>
                <label className={labelClasses}>Image Library</label>
                <button
                  onClick={handleClearLibraryClick}
                  className={`${buttonClasses} bg-red-600 hover:bg-red-700 text-white border-red-700 dark:border-red-600 focus:ring-red-500`}
                  aria-label="Clear entire image library"
                >
                  <Trash2 size={16} className="mr-2" />
                  Clear Entire Library
                </button>
                <p className="text-xs text-red-500 dark:text-red-400 mt-1">Warning: This will permanently delete all your saved images from this browser.</p>
              </div>
            </div>
          </section>
          
          {/* About Section */}
          <section aria-labelledby="about-app-settings">
            <h3 id="about-app-settings" className={sectionTitleClasses}>
               <Info size={20} className="mr-2 text-sky-600 dark:text-sky-400" />
              About
            </h3>
            <div className="bg-white dark:bg-slate-700 p-4 rounded-lg shadow text-sm text-slate-600 dark:text-slate-300 space-y-1">
              <p><strong>Image Studio v1.0</strong></p>
              <p>Powered by Google Gemini API.</p>
              <p>This application demonstrates creative image generation and multimodal interactions using Google's advanced AI models.</p>
              {/* <a href="#" className="text-blue-600 dark:text-blue-400 hover:underline">Learn more about Gemini API (Coming Soon)</a> */}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

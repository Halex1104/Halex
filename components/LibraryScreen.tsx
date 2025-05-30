import React, { useState, useEffect, useMemo } from 'react';
import type { StoredImage, ImageRegenerationParams, SortOption } from '../types';
import { ImageCard } from './ImageCard';
import { Library as LibraryIcon, Trash2 as TrashIcon, Download as DownloadIcon, XCircle as DeselectIcon, CheckSquare as SelectAllIcon, ListChecks as SelectModeIcon, Search as SearchIcon, Heart as HeartIcon, Paintbrush } from 'lucide-react';
import { downloadImage, generateFilename } from '../utils/imageUtils';
import { IMAGE_STYLES, SORT_OPTIONS } from '../constants/options';
import JSZip from 'jszip';

interface LibraryScreenProps {
  images: StoredImage[];
  sortOption: string;
  onSortOptionChange: (option: string) => void;
  onDeleteImage: (id: string) => void;
  onDeleteMultipleImages: (ids: string[]) => void;
  onToggleFavorite: (id: string) => void;
  onRegenerateImage: (params: ImageRegenerationParams) => void;
  showToast: (message: string, type?: 'success' | 'error' | 'warning') => void;
  onTabChange: (tab: 'generate' | 'library') => void; // Added for navigation
}

export const LibraryScreen: React.FC<LibraryScreenProps> = ({ 
  images, 
  sortOption,
  onSortOptionChange,
  onDeleteImage, 
  onDeleteMultipleImages, 
  onToggleFavorite,
  onRegenerateImage, 
  showToast,
  onTabChange 
}) => {
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedImageIds, setSelectedImageIds] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStyle, setFilterStyle] = useState(''); 
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  const sortedAndFilteredImages = useMemo(() => {
    let processedImages = images.filter(image => {
      const matchesSearchTerm = image.prompt.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                (image.fullPrompt && image.fullPrompt.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesStyle = filterStyle ? image.style === filterStyle : true;
      const matchesFavorite = showFavoritesOnly ? image.isFavorite : true;
      return matchesSearchTerm && matchesStyle && matchesFavorite;
    });

    // Apply sorting
    switch (sortOption) {
      case 'date_asc':
        processedImages.sort((a, b) => a.timestamp - b.timestamp);
        break;
      case 'prompt_asc':
        processedImages.sort((a, b) => a.prompt.localeCompare(b.prompt));
        break;
      case 'prompt_desc':
        processedImages.sort((a, b) => b.prompt.localeCompare(a.prompt));
        break;
      case 'style_asc':
        processedImages.sort((a, b) => {
          const styleA = a.style === "None" ? "" : (a.style || "").toLowerCase();
          const styleB = b.style === "None" ? "" : (b.style || "").toLowerCase();
          return styleA.localeCompare(styleB);
        });
        break;
      case 'style_desc':
        processedImages.sort((a, b) => {
          const styleA = a.style === "None" ? "" : (a.style || "").toLowerCase();
          const styleB = b.style === "None" ? "" : (b.style || "").toLowerCase();
          return styleB.localeCompare(styleA);
        });
        break;
      case 'fav_date_desc':
        processedImages.sort((a, b) => {
          if (a.isFavorite && !b.isFavorite) return -1;
          if (!a.isFavorite && b.isFavorite) return 1;
          return b.timestamp - a.timestamp; // Secondary sort by date desc
        });
        break;
      case 'date_desc': // Default
      default:
        processedImages.sort((a, b) => b.timestamp - a.timestamp);
        break;
    }
    return processedImages;
  }, [images, searchTerm, filterStyle, showFavoritesOnly, sortOption]);

  useEffect(() => {
    if (!isSelectionMode) {
      setSelectedImageIds(new Set());
    }
  }, [isSelectionMode]);
  
  useEffect(() => {
    const currentImageIds = new Set(images.map(img => img.id));
    setSelectedImageIds(prevSelected => {
        const newSelected = new Set(prevSelected);
        newSelected.forEach(id => {
            if(!currentImageIds.has(id)) {
                newSelected.delete(id);
            }
        });
        return newSelected;
    });
  }, [images, sortedAndFilteredImages, isSelectionMode]);

  const toggleSelectionMode = () => setIsSelectionMode(!isSelectionMode);
  const toggleImageSelection = (id: string) => {
    setSelectedImageIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  };
  const selectAllVisibleImages = () => setSelectedImageIds(new Set(sortedAndFilteredImages.map(img => img.id)));
  const deselectAllImages = () => setSelectedImageIds(new Set());

  const handleBulkDelete = () => {
    if (selectedImageIds.size === 0) return;
    if (window.confirm(`Are you sure you want to delete ${selectedImageIds.size} selected image(s)?`)) {
      onDeleteMultipleImages(Array.from(selectedImageIds));
      showToast(`${selectedImageIds.size} image(s) deleted.`, 'success');
      setSelectedImageIds(new Set());
      setIsSelectionMode(false);
    }
  };

  const handleBulkDownload = async () => {
    if (selectedImageIds.size === 0) return;
    const imagesToDownload = images.filter(img => selectedImageIds.has(img.id));
    if (imagesToDownload.length === 0) return;

    showToast(`Preparing ${imagesToDownload.length} image(s) for download...`, 'warning');

    if (imagesToDownload.length === 1) {
        const img = imagesToDownload[0];
        downloadImage(img.imageUrl, generateFilename(img.prompt, img.id));
        showToast("Download started!");
    } else {
        const zip = new JSZip();
        try {
            for (const img of imagesToDownload) {
                const response = await fetch(img.imageUrl);
                const blob = await response.blob();
                zip.file(generateFilename(img.prompt, img.id) + (img.imageUrl.startsWith('data:image/png') ? '.png' : '.jpg'), blob);
            }
            const zipBlob = await zip.generateAsync({ type: "blob" });
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            downloadImage(URL.createObjectURL(zipBlob), `imagen_studio_selection_${timestamp}.zip`);
            showToast("Zipped images download started!");
        } catch (error) {
            console.error("Error creating zip file:", error);
            showToast("Error creating zip file.", "error");
        }
    }
  };

  const commonButtonClass = "flex items-center px-3 py-2 text-xs sm:text-sm font-medium rounded-md";
  const inputBaseClasses = "border rounded-md shadow-sm text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500";
  const lightInputClasses = "bg-white border-slate-300 text-slate-700 placeholder-slate-400";
  const darkInputClasses = "dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200 dark:placeholder-slate-400";

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-800">
      <div className="p-2 sm:p-3 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 sticky top-0 z-[5]">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          {/* Filter Group */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative flex-grow sm:flex-grow-0">
              <SearchIcon size={16} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none" />
              <input 
                type="search"
                placeholder="Search..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className={`${inputBaseClasses} ${lightInputClasses} ${darkInputClasses} py-1.5 pl-8 pr-2 w-full sm:w-32 md:w-40`}
              />
            </div>
            <select 
              value={filterStyle} 
              onChange={e => setFilterStyle(e.target.value)}
              className={`${inputBaseClasses} ${lightInputClasses} ${darkInputClasses} py-1.5 px-2 w-full sm:w-auto flex-grow sm:flex-grow-0`}
              aria-label="Filter by style"
            >
              <option value="">All Styles</option>
              {IMAGE_STYLES.filter(s => s !== "None").map(style => <option key={style} value={style}>{style}</option>)}
            </select>
            <select 
              value={sortOption} 
              onChange={e => onSortOptionChange(e.target.value)}
              className={`${inputBaseClasses} ${lightInputClasses} ${darkInputClasses} py-1.5 px-2 w-full sm:w-auto flex-grow sm:flex-grow-0`}
              aria-label="Sort images by"
            >
              {SORT_OPTIONS.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </div>
          
          {/* Action Group */}
          <div className="flex items-center gap-2 flex-wrap justify-start sm:justify-end">
            <button
              onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
              className={`${commonButtonClass} ${showFavoritesOnly ? 'bg-pink-100 dark:bg-pink-700 text-pink-600 dark:text-pink-300' : 'bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-500 text-slate-700 dark:text-slate-200'} min-w-[110px] justify-center transition-all duration-150 active:scale-95`}
              title={showFavoritesOnly ? "Show All Images" : "Show Favorites Only"}
            >
              <HeartIcon size={16} className={`mr-1 sm:mr-1.5 ${showFavoritesOnly ? 'fill-current' : ''}`} />
              Favorites
            </button>
            {isSelectionMode && sortedAndFilteredImages.length > 0 && (
              <button
                onClick={selectedImageIds.size === sortedAndFilteredImages.length ? deselectAllImages : selectAllVisibleImages}
                className={`${commonButtonClass} bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-500 text-slate-700 dark:text-slate-200 min-w-[110px] sm:min-w-[120px] justify-center transition-all duration-150 active:scale-95`}
                title={selectedImageIds.size === sortedAndFilteredImages.length ? "Deselect All Visible" : "Select All Visible"}
              >
                {selectedImageIds.size === sortedAndFilteredImages.length && sortedAndFilteredImages.length > 0 ? <DeselectIcon size={16} className="mr-1 sm:mr-1.5"/> : <SelectAllIcon size={16} className="mr-1 sm:mr-1.5"/>}
                {selectedImageIds.size === sortedAndFilteredImages.length && sortedAndFilteredImages.length > 0 ? "None" : `All (${sortedAndFilteredImages.length})`}
              </button>
            )}
            {images.length > 0 && (
              <button
                onClick={toggleSelectionMode}
                className={`${commonButtonClass} ${isSelectionMode ? 'bg-red-100 dark:bg-red-700 text-red-600 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-600' : 'bg-blue-100 dark:bg-blue-700 text-blue-600 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-600'} min-w-[100px] justify-center transition-all duration-150 active:scale-95`}
              >
                {isSelectionMode ? <DeselectIcon size={16} className="mr-1 sm:mr-1.5"/> : <SelectModeIcon size={16} className="mr-1 sm:mr-1.5"/>}
                {isSelectionMode ? 'Cancel' : 'Select'}
              </button>
            )}
          </div>
        </div>
        <div className="text-xs text-slate-500 dark:text-slate-400 mt-2 text-left sm:text-right">
          {isSelectionMode ? `${selectedImageIds.size} selected. ` : ''}
          Displaying {sortedAndFilteredImages.length} of {images.length} total image(s).
        </div>
      </div>

      {sortedAndFilteredImages.length > 0 ? (
        <div className={`flex-grow overflow-y-auto p-2 sm:p-4 ${isSelectionMode && selectedImageIds.size > 0 ? 'pb-16 sm:pb-[72px]' : ''}`}>
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-4">
            {sortedAndFilteredImages.map((image) => (
              <ImageCard 
                key={image.id} 
                image={image} 
                onDelete={onDeleteImage}
                onToggleFavorite={onToggleFavorite}
                onRegenerate={onRegenerateImage}
                isSelectionMode={isSelectionMode}
                isSelected={selectedImageIds.has(image.id)}
                onToggleSelect={toggleImageSelection}
                showToast={showToast}
              />
            ))}
          </div>
        </div>
      ) : (
         <div className="flex flex-col items-center justify-center h-full text-slate-500 dark:text-slate-400 p-8 text-center">
            <LibraryIcon size={64} className="text-slate-400 dark:text-slate-500 mb-4" strokeWidth={1.5}/>
            <h2 className="text-xl font-semibold mb-2 text-slate-700 dark:text-slate-300">
                {images.length === 0 ? "Your Library is Empty" : "No Images Match Filters"}
            </h2>
             <p className="text-sm mb-4">
                {images.length === 0 ? "Generated images will appear here. Let's create something!" : "Try adjusting your search, filter, or sort criteria."}
             </p>
             {images.length === 0 && (
                <button
                    onClick={() => onTabChange('generate')}
                    className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-semibold py-2.5 px-5 rounded-lg shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:ring-offset-2 dark:focus:ring-offset-slate-800 transition-all duration-150 ease-in-out flex items-center text-base active:scale-[0.98]"
                >
                    <Paintbrush size={18} className="mr-2" />
                    Create Your First Image
                </button>
             )}
         </div>
      )}

      {isSelectionMode && selectedImageIds.size > 0 && (
         <div className="fixed bottom-14 sm:bottom-0 left-0 right-0 sm:max-w-md mx-auto bg-slate-100/90 dark:bg-slate-800/90 backdrop-blur-md border-t border-slate-300 dark:border-slate-700 p-2.5 shadow-top-strong z-20">
          <div className="flex justify-around items-center space-x-2">
            <button
              onClick={handleBulkDownload}
              className={`${commonButtonClass} bg-green-500 hover:bg-green-600 text-white flex-1 justify-center transition-all duration-150 active:scale-[0.98]`}
              aria-label={`Download ${selectedImageIds.size} selected images`}
            >
              <DownloadIcon size={18} className="mr-2" />
              Download ({selectedImageIds.size})
            </button>
            <button
              onClick={handleBulkDelete}
              className={`${commonButtonClass} bg-red-500 hover:bg-red-600 text-white flex-1 justify-center transition-all duration-150 active:scale-[0.98]`}
              aria-label={`Delete ${selectedImageIds.size} selected images`}
            >
              <TrashIcon size={18} className="mr-2" />
              Delete ({selectedImageIds.size})
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
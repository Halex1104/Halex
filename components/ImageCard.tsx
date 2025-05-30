
import React, { useState } from 'react';
import type { StoredImage, ImageRegenerationParams } from '../types';
import { ASPECT_RATIOS } from '../constants/options';
import { Trash2 as TrashIcon, Edit3 as RegenerateIcon, Info as InfoIcon, X as CloseIcon, Download as DownloadIcon, CheckSquare, Square, Heart, ClipboardCopy } from 'lucide-react';
import { downloadImage, generateFilename } from '../utils/imageUtils';

interface ImageCardProps {
  image: StoredImage;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onRegenerate: (params: ImageRegenerationParams) => void;
  isSelectionMode: boolean;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
  showToast: (message: string, type?: 'success' | 'error' | 'warning') => void;
}

export const ImageCard: React.FC<ImageCardProps> = ({ 
    image, 
    onDelete, 
    onToggleFavorite, 
    onRegenerate, 
    isSelectionMode, 
    isSelected, 
    onToggleSelect, 
    showToast 
}) => {
  const [showDetails, setShowDetails] = useState(false);

  const handleCardClick = () => {
    if (isSelectionMode) {
      onToggleSelect(image.id);
    } else {
      setShowDetails(true);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this image from your library?")) {
      onDelete(image.id);
      showToast("Image deleted.", "success");
    }
  };
  
  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleFavorite(image.id);
  };

  const handleRegenerate = (e: React.MouseEvent) => {
    e.stopPropagation();
    const params: ImageRegenerationParams = {
      prompt: image.prompt,
      negativePrompt: image.negativePrompt,
      style: image.style,
      aspectRatio: image.aspectRatio,
      seed: image.seed,
    };
    onRegenerate(params);
  };
  
  const toggleDetails = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDetails(!showDetails);
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    const filename = generateFilename(image.prompt, image.id);
    downloadImage(image.imageUrl, filename);
    showToast("Download started!");
    if (showDetails) setShowDetails(false);
  };

  const handleCopyToClipboard = async (textToCopy: string, fieldName: string) => {
    if (!navigator.clipboard) {
      showToast('Clipboard API not available.', 'error');
      return;
    }
    try {
      await navigator.clipboard.writeText(textToCopy);
      showToast(`${fieldName} copied to clipboard!`, 'success');
    } catch (err) {
      console.error('Failed to copy text: ', err);
      showToast(`Failed to copy ${fieldName.toLowerCase()}.`, 'error');
    }
  };

  const timeAgo = (timestamp: number): string => {
    const now = Date.now();
    const seconds = Math.round((now - timestamp) / 1000);
    if (seconds < 5) return "just now";
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.round(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.round(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.round(hours / 24);
    return `${days}d ago`;
  };

  const detailItemClass = "flex justify-between items-start py-1";
  const detailLabelClass = "font-medium text-slate-600 dark:text-slate-400 text-xs sm:text-sm";
  const detailValueClass = "text-xs sm:text-sm break-all ml-2 text-right";
  const copyButtonClass = "ml-2 p-1 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-100 flex-shrink-0 active:scale-90";


  return (
    <div 
      className={`relative aspect-[1/1] bg-slate-200 dark:bg-slate-700 rounded-lg shadow-md dark:shadow-slate-900/50 overflow-hidden group transition-all duration-300 ease-in-out hover:shadow-xl dark:hover:shadow-slate-900/70 ${isSelectionMode ? 'cursor-pointer active:scale-[0.97]' : ''} ${isSelected ? 'ring-2 ring-blue-500 dark:ring-blue-400 ring-offset-2 dark:ring-offset-slate-800' : ''}`}
      onClick={handleCardClick}
      role={isSelectionMode ? "checkbox" : "figure"}
      aria-checked={isSelectionMode ? isSelected : undefined}
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); handleCardClick(); }}}
    >
      <img 
        src={image.imageUrl} 
        alt={image.prompt} 
        className="w-full h-full object-cover" 
        loading="lazy"
      />
      {isSelectionMode && (
        <div className={`absolute top-2 right-2 p-1 shadow rounded-full ${isSelected ? 'bg-blue-500 dark:bg-blue-400' : 'bg-white/80 dark:bg-slate-600/80'}`}>
          {isSelected ? <CheckSquare size={20} className="text-white" /> : <Square size={20} className="text-slate-500 dark:text-slate-300" />}
        </div>
      )}
      <div className={`absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent ${isSelectionMode && !isSelected ? 'opacity-0' : 'opacity-0 group-hover:opacity-100'} transition-opacity duration-300 p-2 flex flex-col justify-end`}>
        <p className="text-white text-xs font-medium truncate" title={image.prompt}>{image.prompt}</p>
        <div className="flex justify-between items-center mt-1 pt-1 border-t border-white/20">
            <span className="text-white/80 text-[10px]">{timeAgo(image.timestamp)}</span>
            <div className="flex space-x-0.5">
                <button 
                    onClick={handleToggleFavorite}
                    className={`p-0.5 rounded ${image.isFavorite ? 'text-pink-500' : 'text-white/80 hover:text-white'} transition-transform duration-100 active:scale-90`} 
                    aria-label={image.isFavorite ? "Remove from favorites" : "Add to favorites"}
                    title={image.isFavorite ? "Unfavorite" : "Favorite"}
                >
                    <Heart size={14} fill={image.isFavorite ? 'currentColor' : 'none'} />
                </button>
                 <button 
                    onClick={toggleDetails}
                    className="text-white/80 hover:text-white p-0.5 rounded transition-transform duration-100 active:scale-90" 
                    aria-label="Show image details" title="Details"
                > <InfoIcon size={14} /> </button>
                <button 
                    onClick={handleDownload}
                    className="text-white/80 hover:text-white p-0.5 rounded transition-transform duration-100 active:scale-90" 
                    aria-label="Download this image" title="Download"
                > <DownloadIcon size={14} /> </button>
                <button 
                    onClick={handleRegenerate}
                    className="text-white/80 hover:text-white p-0.5 rounded transition-transform duration-100 active:scale-90" 
                    aria-label="Regenerate" title="Use Settings"
                > <RegenerateIcon size={14} /> </button>
                <button 
                    onClick={handleDelete}
                    className="text-red-400/80 hover:text-red-400 p-0.5 rounded transition-transform duration-100 active:scale-90" 
                    aria-label="Delete image" title="Delete"
                > <TrashIcon size={14} /> </button>
            </div>
        </div>
      </div>

      {showDetails && (
        <div 
            className="fixed inset-0 bg-black/60 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowDetails(false)}
            role="dialog"
            aria-modal="true"
            aria-labelledby="image-details-title"
        >
          <div 
            className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-4 sm:p-6 max-w-md w-full max-h-[90vh] overflow-y-auto text-slate-800 dark:text-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-3">
              <h3 id="image-details-title" className="text-lg font-semibold">Image Details</h3>
              <div className="flex items-center">
                <button onClick={handleToggleFavorite} className={`p-1.5 rounded-full ${image.isFavorite ? 'text-pink-500 dark:text-pink-400 bg-pink-100 dark:bg-pink-700/50' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'} transition-all duration-150 active:scale-90`} aria-label="Toggle Favorite">
                  <Heart size={20} fill={image.isFavorite ? 'currentColor' : 'none'} />
                </button>
                <button onClick={() => setShowDetails(false)} className="ml-2 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 transition-transform duration-100 active:scale-90" aria-label="Close details">
                  <CloseIcon size={24} />
                </button>
              </div>
            </div>
            <img src={image.imageUrl} alt={image.prompt} className="w-full aspect-square object-contain rounded-md mb-4 bg-slate-100 dark:bg-slate-700" />
            <div className="space-y-0.5 text-sm">
              <div className={detailItemClass}>
                <div>
                  <strong className={detailLabelClass}>Prompt:</strong>
                  <p className={`${detailValueClass} text-left`}>{image.prompt}</p>
                </div>
                <button onClick={() => handleCopyToClipboard(image.prompt, "Prompt")} className={copyButtonClass} aria-label="Copy prompt">
                    <ClipboardCopy size={16} />
                </button>
              </div>
             
              {image.style && image.style !== "None" && (
                <div className={detailItemClass}>
                  <strong className={detailLabelClass}>Style:</strong>
                  <span className={detailValueClass}>{image.style}</span>
                </div>
              )}

              {image.negativePrompt && (
                <div className={detailItemClass}>
                  <div>
                    <strong className={detailLabelClass}>Negative Prompt:</strong>
                    <p className={`${detailValueClass} text-left`}>{image.negativePrompt}</p>
                  </div>
                  <button onClick={() => handleCopyToClipboard(image.negativePrompt, "Negative Prompt")} className={copyButtonClass} aria-label="Copy negative prompt">
                      <ClipboardCopy size={16} />
                  </button>
                </div>
              )}
              
              <div className={detailItemClass}>
                <strong className={detailLabelClass}>Aspect Ratio Pref:</strong>
                <span className={detailValueClass}>{ASPECT_RATIOS[image.aspectRatio as keyof typeof ASPECT_RATIOS] || image.aspectRatio}</span>
              </div>

              {image.seed && (
                 <div className={detailItemClass}>
                    <strong className={detailLabelClass}>Seed:</strong>
                    <span className={detailValueClass}>{image.seed}</span>
                    <button onClick={() => handleCopyToClipboard(image.seed!, "Seed")} className={`${copyButtonClass} transition-transform duration-100 active:scale-90`} aria-label="Copy seed">
                        <ClipboardCopy size={16} />
                    </button>
                 </div>
              )}
              <div className={detailItemClass}>
                <strong className={detailLabelClass}>Generated:</strong>
                <span className={detailValueClass}>{new Date(image.timestamp).toLocaleString()}</span>
              </div>
            </div>
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                    onClick={handleDownload}
                    className="sm:col-span-1 bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-3 rounded-md text-sm transition-all duration-150 flex items-center justify-center active:scale-95"
                > <DownloadIcon size={16} className="mr-1.5" /> Download </button>
                <button
                    onClick={(e) => {handleRegenerate(e); setShowDetails(false);}}
                    className="sm:col-span-1 bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 text-white font-medium py-2 px-3 rounded-md text-sm transition-all duration-150 flex items-center justify-center active:scale-95"
                > <RegenerateIcon size={16} className="mr-1.5" /> Use Settings </button>
                 <button
                    onClick={() => setShowDetails(false)}
                    className="sm:col-span-1 bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-500 text-slate-700 dark:text-slate-200 font-medium py-2 px-3 rounded-md text-sm transition-all duration-150 flex items-center justify-center active:scale-95"
                > Close </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
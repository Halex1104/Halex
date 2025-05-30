export interface StoredImage {
  id: string;
  imageUrl: string;
  prompt: string;
  fullPrompt: string; // The actual prompt sent to API (e.g. with style prepended)
  style: string;
  aspectRatio: string; // Key of ASPECT_RATIOS
  negativePrompt: string;
  timestamp: number;
  seed?: string; // Optional seed value
  isFavorite?: boolean; // Optional favorite status
}

export interface ImageRegenerationParams {
  prompt: string;
  negativePrompt: string;
  style: string;
  aspectRatio: string;
  seed?: string;
}

export interface SortOption {
  value: string;
  label: string;
}

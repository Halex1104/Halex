import type { SortOption } from '../types';

export const IMAGE_STYLES: string[] = [
  "None",
  "Photorealistic",
  "Cartoon",
  "Anime",
  "Watercolor",
  "Oil Painting",
  "Pixel Art",
  "Abstract",
  "Impressionistic",
  "Surreal",
  "Minimalist",
  "Steampunk",
  "Cyberpunk",
  "Fantasy Art",
  "Concept Art",
  "Low Poly",
  "Line Art",
  "Vintage",
  "Sketch"
];

export const ASPECT_RATIOS: Record<string, string> = {
  "1:1": "Square (1:1)",
  "16:9": "Landscape (16:9)",
  "9:16": "Portrait (9:16)",
  "4:3": "Standard (4:3)",
  "3:4": "Tall (3:4)",
  "3:2": "Photo (3:2)",
  "2:3": "Photo (2:3)",
  "21:9": "Cinematic (21:9)",
  "9:21": "Tall Cinematic (9:21)",
};

export const SAMPLE_PROMPTS: string[] = [
  "A bioluminescent forest at twilight, mysterious creatures lurking in the shadows.",
  "A steampunk city powered by giant clockwork mechanisms, airships docking at tall spires.",
  "An astronaut discovering an ancient alien library on a forgotten moon.",
  "A cat wizard conjuring a storm of yarn balls.",
  "A serene Japanese garden in the style of Van Gogh.",
  "A futuristic cityscape with flying vehicles, rendered in a cyberpunk aesthetic.",
  "A majestic griffin soaring above snow-capped mountains.",
  "A hidden underwater kingdom made of coral and pearls.",
  "A vintage robot tending to a vibrant rooftop garden.",
  "An enchanted library where books fly and whisper secrets.",
  "A detailed close-up of a dragon's eye, reflecting a fiery landscape.",
  "A whimsical treehouse village connected by rope bridges.",
  "A surreal landscape where the sky is an ocean and clouds are islands.",
  "A knight battling a giant mechanical spider in a post-apocalyptic wasteland.",
  "A minimalist abstract representation of 'serenity'."
];

export const NUMBER_OF_IMAGES_OPTIONS: { value: number; label: string; }[] = [
  { value: 1, label: "1 Image" },
  { value: 2, label: "2 Images" },
  { value: 4, label: "4 Images" },
];

export const SORT_OPTIONS: SortOption[] = [
  { value: 'date_desc', label: 'Date (Newest First)' },
  { value: 'date_asc', label: 'Date (Oldest First)' },
  { value: 'prompt_asc', label: 'Prompt (A-Z)' },
  { value: 'prompt_desc', label: 'Prompt (Z-A)' },
  { value: 'style_asc', label: 'Style (A-Z)' },
  { value: 'style_desc', label: 'Style (Z-A)' },
  { value: 'fav_date_desc', label: 'Favorites First' },
];
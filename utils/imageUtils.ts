/**
 * Generates a sanitized filename for the image.
 * @param prompt The prompt used to generate the image.
 * @param id A unique identifier for the image (e.g., timestamp).
 * @returns A string suitable for use as a filename.
 */
export const generateFilename = (prompt?: string, id?: string): string => {
  const promptPart = prompt 
    ? prompt.substring(0, 30).replace(/[^a-z0-9_]/gi, '_').toLowerCase() 
    : 'image';
  const idPart = id || Date.now().toString();
  return `${promptPart}_${idPart}`; // Extension will be added based on mime type or default .png
};

/**
 * Triggers a browser download for the given image URL.
 * @param imageUrl The URL of the image to download (can be data URL or direct link).
 * @param filename The desired filename for the downloaded image.
 */
export const downloadImage = (imageUrl: string, filename: string): void => {
  const anchor = document.createElement('a');
  anchor.href = imageUrl;
  
  // Ensure filename has an extension, default to .png if imageUrl is a dataURL without obvious extension
  let finalFilename = filename;
  if (!/\.[^/.]+$/.test(finalFilename)) { // if no extension
    if (imageUrl.startsWith('data:image/png')) {
      finalFilename += '.png';
    } else if (imageUrl.startsWith('data:image/jpeg') || imageUrl.startsWith('data:image/jpg')) {
      finalFilename += '.jpg';
    } else if (imageUrl.endsWith('.zip')) { // For zip files
        // filename should already include .zip
    }
    else {
      finalFilename += '.png'; // Default extension
    }
  }
  
  anchor.download = finalFilename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);

  // If it was a blob URL, revoke it after a short delay
  if (imageUrl.startsWith('blob:')) {
    setTimeout(() => URL.revokeObjectURL(imageUrl), 1000);
  }
};

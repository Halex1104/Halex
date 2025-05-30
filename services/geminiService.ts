
import { GoogleGenAI, GenerateImagesResponse, GenerateContentResponse } from "@google/genai";
import type { GenerateImagesConfig, Part } from "@google/genai";

export const generateImageFromApi = async (
  prompt: string, 
  apiKey: string,
  negativePrompt?: string,
  numberOfImages: number = 1
): Promise<string[]> => {
  if (!apiKey) {
    throw new Error("API key is missing. Please ensure process.env.API_KEY is set and passed to this function.");
  }

  const ai = new GoogleGenAI({ apiKey });

  try {
    const config: GenerateImagesConfig = {
      numberOfImages: numberOfImages,
      outputMimeType: 'image/png', 
    };

    if (negativePrompt && negativePrompt.trim() !== "") {
      config.negativePrompt = negativePrompt.trim();
    }
    
    const response: GenerateImagesResponse = await ai.models.generateImages({
      model: 'imagen-3.0-generate-002',
      prompt: prompt,
      config: config,
    });

    if (response.generatedImages && response.generatedImages.length > 0) {
      const imageUrls = response.generatedImages.map(imgObj => {
        if (imgObj.image?.imageBytes) {
          return `data:image/png;base64,${imgObj.image.imageBytes}`;
        }
        throw new Error('Image object received from API, but imageBytes are missing for one or more images.');
      });
      // Ensure we return as many images as requested, or as many as the API gave, if fewer.
      return imageUrls.slice(0, numberOfImages);
    } else {
      throw new Error('No image data received from API or the response structure is unexpected.');
    }
  } catch (error) {
    console.error('Error generating image(s) with Gemini API:', error);
    let errorMessage = 'An unknown error occurred while communicating with the image generation API.';
    if (error instanceof Error) {
        if (error.message.includes("API key not valid") || error.message.includes("API_KEY_INVALID")) {
            errorMessage = "Invalid API Key. Please check your API_KEY configuration.";
        } else if (error.message.includes("quota")) {
            errorMessage = "API quota exceeded. Please check your Google Cloud project billing or quotas.";
        } else if (error.message.includes("model not found") || error.message.includes("does not exist")) {
            errorMessage = "The specified image generation model is not available or configured incorrectly.";
        } else if (error.message.startsWith("Image object received from API, but imageBytes are missing")) {
            errorMessage = error.message;
        } else {
            errorMessage = `API Error: ${error.message}`;
        }
    }
    throw new Error(errorMessage);
  }
};

export const refinePromptWithGemini = async (
  currentPrompt: string,
  apiKey: string
): Promise<string | null> => {
  if (!apiKey) {
    console.error("API key is missing for prompt refinement.");
    return null;
  }
  if (!currentPrompt || currentPrompt.trim() === "") {
    console.warn("Current prompt is empty, skipping refinement.");
    return null;
  }

  const ai = new GoogleGenAI({ apiKey });
  const systemInstruction = "You are an expert prompt engineer for AI image generation. Refine the following user prompt to be more descriptive, vivid, and effective for creating high-quality images. Consider adding details about composition, lighting, artistic style elements (if not already specified), and mood. Return ONLY the refined prompt text. Do not include any other conversational text, preambles, or explanations.";

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash-preview-04-17',
      contents: currentPrompt,
      config: {
        systemInstruction: systemInstruction,
      },
    });

    const refinedText = response.text;
    if (refinedText && refinedText.trim() !== "") {
      return refinedText.trim();
    } else {
      console.warn('Gemini API returned an empty or whitespace-only refined prompt for refinement.');
      return null;
    }
  } catch (error) {
    console.error('Error refining prompt with Gemini API:', error);
    return null;
  }
};

export const generatePromptFromImageWithGemini = async (
  base64ImageData: string,
  mimeType: string,
  apiKey: string
): Promise<string | null> => {
  if (!apiKey) {
    console.error("API key is missing for image-to-prompt generation.");
    return null;
  }
  if (!base64ImageData || !mimeType) {
    console.warn("Image data or MIME type is missing, skipping image-to-prompt generation.");
    return null;
  }

  const ai = new GoogleGenAI({ apiKey });

  const imagePart: Part = {
    inlineData: {
      mimeType: mimeType,
      data: base64ImageData,
    },
  };

  const textPart: Part = {
    text: "Describe this image in detail to be used as a prompt for an AI image generator. Focus on key visual elements, style, composition, and mood. Return only the descriptive prompt text. Do not include any conversational text or preambles."
  };

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash-preview-04-17', // This model supports multimodal input
      contents: { parts: [imagePart, textPart] },
    });
    
    const description = response.text;
    if (description && description.trim() !== "") {
      return description.trim();
    } else {
      console.warn('Gemini API returned an empty or whitespace-only description for the image.');
      return null;
    }
  } catch (error) {
    console.error('Error generating prompt from image with Gemini API:', error);
    // Consider more specific error handling based on API responses if needed
    if (error instanceof Error && error.message.includes("currently not supported for this model")) {
        throw new Error("The model does not support image input or the format is incorrect.");
    }
    return null;
  }
};

export const suggestRelatedPromptsWithGemini = async (
  currentPrompt: string,
  apiKey: string
): Promise<string[] | null> => {
  if (!apiKey) {
    console.error("API key is missing for prompt suggestions.");
    return null;
  }
  if (!currentPrompt || currentPrompt.trim() === "") {
    console.warn("Current prompt is empty, skipping suggestions.");
    return null;
  }

  const ai = new GoogleGenAI({ apiKey });
  const systemInstruction = "You are a creative assistant. Based on the user's input, generate 3 distinct and imaginative alternative prompt ideas for an AI image generator. Return ONLY a valid JSON array of 3 strings. For example: [\"prompt idea 1\", \"prompt idea 2\", \"prompt idea 3\"]";
  
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash-preview-04-17',
      contents: currentPrompt,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
      },
    });

    let jsonStr = response.text.trim();
    const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
    const match = jsonStr.match(fenceRegex);
    if (match && match[2]) {
      jsonStr = match[2].trim(); 
    }

    try {
      const parsedData = JSON.parse(jsonStr);
      if (Array.isArray(parsedData) && parsedData.every(item => typeof item === 'string') && parsedData.length > 0) {
        return parsedData.slice(0, 3); // Ensure max 3 suggestions
      } else {
        console.warn('Gemini API returned an invalid JSON structure for prompt suggestions. Expected array of strings.', parsedData);
        return null;
      }
    } catch (e) {
      console.error("Failed to parse JSON response for prompt suggestions:", e, "Raw response:", jsonStr);
      return null;
    }
  } catch (error) {
    console.error('Error suggesting prompts with Gemini API:', error);
    return null;
  }
};

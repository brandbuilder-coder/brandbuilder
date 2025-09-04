
import { GoogleGenAI, Modality, Part } from "@google/genai";
import { ImageFile } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const model = ai.models['gemini-2.5-flash-image-preview'];

/**
 * Converts a base64 data URL to a Gemini-compatible Part.
 * @param base64Data - The base64 data URL (e.g., "data:image/png;base64,...").
 * @param file - The original File object to get the MIME type.
 * @returns A Gemini Part object.
 */
function fileToGenerativePart(base64Data: string, file: File): Part {
  const base64String = base64Data.split(',')[1];
  return {
    inlineData: {
      data: base64String,
      mimeType: file.type,
    },
  };
}


/**
 * Edits an image using the Gemini "NanoBanana" model.
 * @param imageFiles - An array of ImageFile objects to be used as input.
 * @param prompt - The text prompt describing the desired edits.
 * @returns An object containing the URL of the generated image and any accompanying text.
 */
export async function editImageWithNanoBanana(
  imageFiles: ImageFile[],
  prompt: string
): Promise<{ imageUrl: string; text: string | null }> {
  try {
    const imageParts: Part[] = imageFiles
      .filter(f => f.base64 && f.file)
      .map(f => fileToGenerativePart(f.base64!, f.file!));

    const textPart: Part = { text: prompt };

    const contents = {
      parts: [...imageParts, textPart],
    };

    const response = await model.generateContent({
      contents,
      config: {
        responseModalities: [Modality.IMAGE, Modality.TEXT],
      },
    });

    let imageUrl: string | null = null;
    let text: string | null = null;
    
    // The response is not available through response.text
    // It's available through response.candidates[0].content.parts
    const parts = response.candidates?.[0]?.content?.parts ?? [];

    for (const part of parts) {
      if (part.inlineData && !imageUrl) { // Take the first image part
        const { mimeType, data } = part.inlineData;
        imageUrl = `data:${mimeType};base64,${data}`;
      } else if (part.text) {
        text = (text ? text + " " : "") + part.text; // Concatenate text parts
      }
    }
    
    if (!imageUrl) {
      throw new Error("The AI did not return an image. It might have refused the request.");
    }

    return { imageUrl, text };
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    if (error instanceof Error && error.message.includes('API key not valid')) {
       throw new Error('The provided API key is not valid. Please check your configuration.');
    }
    throw new Error('Failed to generate image. The request may have been blocked or an unknown error occurred.');
  }
}

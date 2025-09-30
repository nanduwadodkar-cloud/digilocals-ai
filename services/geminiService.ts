
import { GoogleGenAI, Modality } from '@google/genai';
import type { GenerateContentResponse, Part } from '@google/genai';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error('API_KEY environment variable is not set');
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export const generateMergedImage = async (
  image1: { base64: string; mimeType: string },
  image2: { base64: string; mimeType: string },
  prompt: string
): Promise<string> => {
  try {
    const model = 'gemini-2.5-flash-image-preview';

    const imagePart1: Part = {
      inlineData: {
        data: image1.base64,
        mimeType: image1.mimeType,
      },
    };

    const imagePart2: Part = {
      inlineData: {
        data: image2.base64,
        mimeType: image2.mimeType,
      },
    };

    const textPart: Part = {
      text: `You are an expert at creatively merging and blending images. Combine the following two images based on this user instruction: "${prompt}". The output must be a single, new image that masterfully combines elements from both inputs as described.`,
    };

    const response: GenerateContentResponse = await ai.models.generateContent({
      model,
      contents: {
        parts: [imagePart1, imagePart2, textPart],
      },
      config: {
        responseModalities: [Modality.IMAGE, Modality.TEXT],
      },
    });

    const candidate = response.candidates?.[0];
    if (!candidate) {
      throw new Error('No candidate response from the model.');
    }

    const imagePart = candidate.content.parts.find(part => part.inlineData);
    if (imagePart && imagePart.inlineData) {
      const mimeType = imagePart.inlineData.mimeType;
      const base64Data = imagePart.inlineData.data;
      return `data:${mimeType};base64,${base64Data}`;
    }

    throw new Error('API did not return an image. It may have refused the request.');

  } catch (error) {
    console.error('Error generating merged image:', error);
    if (error instanceof Error) {
        return Promise.reject(error.message);
    }
    return Promise.reject('An unknown error occurred during image generation.');
  }
};

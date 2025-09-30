
import { GoogleGenAI, Modality } from '@google/genai';
import type { GenerateContentResponse, Part } from '@google/genai';

// This is a serverless function, so it can safely use environment variables.
const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error('API_KEY environment variable is not set');
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

// This function will be exported and can be used as an API endpoint.
// In many serverless environments, the request and response objects
// are compatible with the Web Standards `Request` and `Response`.
export async function POST(req: Request) {
  try {
    const { image1, image2, prompt } = await req.json();

    if (!image1 || !image2 || !prompt) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

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
      const imageUrl = `data:${mimeType};base64,${base64Data}`;
      
      return new Response(JSON.stringify({ imageUrl }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    throw new Error('API did not return an image. It may have refused the request.');

  } catch (error) {
    console.error('Error in serverless function:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return new Response(JSON.stringify({ error: errorMessage }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
  }
}

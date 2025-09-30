
export const generateMergedImage = async (
  image1: { base64: string; mimeType: string },
  image2: { base64: string; mimeType: string },
  prompt: string
): Promise<string> => {
  try {
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ image1, image2, prompt }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Request failed with status ${response.status}`);
    }

    const { imageUrl } = await response.json();
    return imageUrl;

  } catch (error) {
    console.error('Error generating merged image:', error);
    if (error instanceof Error) {
        return Promise.reject(error.message);
    }
    return Promise.reject('An unknown error occurred during image generation.');
  }
};


import React, { useState, useCallback } from 'react';
import ImageUploader from './components/ImageUploader';
import Button from './components/Button';
import Spinner from './components/Spinner';
import Icon from './components/Icon';
import { generateMergedImage } from './services/geminiService';
import type { ImageState } from './types';

const App: React.FC = () => {
  const [image1, setImage1] = useState<ImageState>(null);
  const [image2, setImage2] = useState<ImageState>(null);
  const [prompt, setPrompt] = useState('');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImage1Upload = useCallback((base64: string, mimeType: string) => {
    setImage1({ base64, mimeType });
  }, []);

  const handleImage2Upload = useCallback((base64: string, mimeType: string) => {
    setImage2({ base64, mimeType });
  }, []);
  
  const handleGenerate = async () => {
    if (!image1 || !image2 || !prompt) return;

    setIsLoading(true);
    setError(null);
    setGeneratedImage(null);

    try {
      const result = await generateMergedImage(image1, image2, prompt);
      setGeneratedImage(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (!generatedImage) return;
    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = 'digilocals-merged-image.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const isFormComplete = image1 && image2 && prompt.trim().length > 0;

  return (
    <div className="bg-black text-white min-h-screen flex flex-col items-center p-4 sm:p-8 font-sans">
      <header className="w-full max-w-5xl text-center mb-8">
        <h1 className="text-4xl sm:text-5xl font-bold text-[#00BFFF]">
          DIGILOCALS
        </h1>
        <p className="text-xl text-gray-300">Smart Image Mixer</p>
      </header>

      <main className="w-full max-w-5xl flex flex-col gap-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-gray-900/50 rounded-lg border border-[#00BFFF]/30 shadow-lg shadow-[#00BFFF]/10">
          <ImageUploader id="uploader1" onImageUpload={handleImage1Upload} title="Upload Image 1" />
          <ImageUploader id="uploader2" onImageUpload={handleImage2Upload} title="Upload Image 2" />
        </div>

        <div className="flex flex-col gap-4 p-6 bg-gray-900/50 rounded-lg border border-[#00BFFF]/30 shadow-lg shadow-[#00BFFF]/10">
          <label htmlFor="prompt" className="text-lg font-semibold text-gray-200">
            Describe the merged image you want:
          </label>
          <textarea
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., A futuristic city skyline blended into a dense forest..."
            className="w-full p-3 bg-gray-800 border-2 border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00BFFF] focus:border-transparent transition-colors duration-200 text-white min-h-[100px]"
          />
          <Button onClick={handleGenerate} disabled={!isFormComplete || isLoading}>
            {isLoading ? <Spinner /> : null}
            {isLoading ? 'Generating...' : 'Generate'}
          </Button>
        </div>

        {error && (
          <div className="p-4 bg-red-900/50 border border-red-500 text-red-300 rounded-lg text-center">
            <strong>Error:</strong> {error}
          </div>
        )}

        {(isLoading || generatedImage) && (
          <div className="flex flex-col gap-4 p-6 items-center justify-center bg-gray-900/50 rounded-lg border border-[#00BFFF]/30 shadow-lg shadow-[#00BFFF]/10 min-h-[300px]">
            <h2 className="text-2xl font-bold text-[#00BFFF] mb-4">Generated Image</h2>
            {isLoading && !generatedImage && (
                <div className="flex flex-col items-center gap-4 text-gray-300">
                    <Spinner />
                    <p>Mixing your images... Please wait.</p>
                </div>
            )}
            {generatedImage && (
              <div className="w-full max-w-md flex flex-col items-center gap-4">
                <img src={generatedImage} alt="Generated merge" className="rounded-lg shadow-2xl shadow-black" />
                <Button onClick={handleDownload} icon={<Icon name="download" className="w-5 h-5" />}>
                  Download Image
                </Button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default App;

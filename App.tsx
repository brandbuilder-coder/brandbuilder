
import React, { useState, useCallback } from 'react';
import { ImageFile } from './types';
import { editImageWithNanoBanana } from './services/geminiService';
import { GeneratedImage } from './components/GeneratedImage';
import { ImageInput } from './components/ImageInput';
import { PlusIcon } from './components/icons/PlusIcon';
import { SparklesIcon } from './components/icons/SparklesIcon';

const MAX_IMAGES = 10;

export default function App(): React.ReactElement {
  const [imageFiles, setImageFiles] = useState<ImageFile[]>([{ id: Date.now(), file: null, base64: null }]);
  const [prompt, setPrompt] = useState<string>('');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [generatedText, setGeneratedText] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageChange = useCallback((id: number, file: File | null) => {
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageFiles(prevFiles =>
          prevFiles.map(f =>
            f.id === id ? { ...f, file, base64: reader.result as string } : f
          )
        );
      };
      reader.readAsDataURL(file);
    } else {
      setImageFiles(prevFiles =>
        prevFiles.map(f => (f.id === id ? { ...f, file: null, base64: null } : f))
      );
    }
  }, []);

  const addImageInput = useCallback(() => {
    if (imageFiles.length < MAX_IMAGES) {
      setImageFiles(prev => [...prev, { id: Date.now(), file: null, base64: null }]);
    }
  }, [imageFiles.length]);

  const removeImageInput = useCallback((id: number) => {
    setImageFiles(prev => prev.filter(f => f.id !== id));
  }, []);

  const handleGenerate = async () => {
    const validImages = imageFiles.filter(f => f.base64 && f.file);
    if (validImages.length === 0) {
      setError('Please upload at least one image.');
      return;
    }
    if (!prompt.trim()) {
      setError('Please enter a prompt to describe the changes.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedImage(null);
    setGeneratedText(null);

    try {
      const result = await editImageWithNanoBanana(validImages, prompt);
      setGeneratedImage(result.imageUrl);
      setGeneratedText(result.text);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans p-4 sm:p-6 md:p-8">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
            NanoBanana AI Image Editor
          </h1>
          <p className="text-gray-400 mt-2 text-lg">
            Bring your creative visions to life. Edit images with the power of Google AI.
          </p>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Panel */}
          <div className="bg-gray-800 p-6 rounded-2xl shadow-lg flex flex-col gap-6">
            <div>
              <label className="text-xl font-semibold mb-3 block">1. Upload Source Images</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {imageFiles.map((imageFile, index) => (
                  <ImageInput
                    key={imageFile.id}
                    imageFile={imageFile}
                    onImageChange={(file) => handleImageChange(imageFile.id, file)}
                    onRemove={imageFiles.length > 1 ? () => removeImageInput(imageFile.id) : undefined}
                  />
                ))}
                {imageFiles.length < MAX_IMAGES && (
                  <button
                    onClick={addImageInput}
                    className="aspect-square border-2 border-dashed border-gray-600 rounded-lg flex items-center justify-center hover:border-purple-500 hover:bg-gray-700/50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    aria-label="Add new image slot"
                  >
                    <PlusIcon className="w-8 h-8 text-gray-500" />
                  </button>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="prompt" className="text-xl font-semibold mb-3 block">2. Describe Your Edit</label>
              <textarea
                id="prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., 'Add a futuristic city in the background' or 'Change the color of the car to vibrant red'"
                className="w-full h-32 p-4 bg-gray-700 border border-gray-600 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
              />
            </div>

            <button
              onClick={handleGenerate}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 text-lg font-bold bg-gradient-to-r from-purple-500 to-pink-500 text-white py-4 px-6 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating...
                </>
              ) : (
                <>
                  <SparklesIcon className="w-6 h-6" />
                  Generate Image
                </>
              )}
            </button>
          </div>
          
          {/* Output Panel */}
          <div className="bg-gray-800 p-6 rounded-2xl shadow-lg flex flex-col justify-center items-center aspect-square">
            {error && <div className="text-red-400 bg-red-900/50 p-4 rounded-lg text-center">{error}</div>}
            
            {!isLoading && !generatedImage && !error && (
              <div className="text-center text-gray-500">
                <SparklesIcon className="w-16 h-16 mx-auto mb-4" />
                <h3 className="text-2xl font-semibold">Your Edited Image Will Appear Here</h3>
                <p>Upload an image and write a prompt to get started.</p>
              </div>
            )}
            
            {isLoading && (
               <div className="text-center text-gray-400">
                <div className="animate-pulse">
                  <SparklesIcon className="w-16 h-16 mx-auto mb-4 text-purple-400" />
                  <h3 className="text-2xl font-semibold">AI is creating magic...</h3>
                  <p>This may take a moment.</p>
                </div>
              </div>
            )}
            
            {generatedImage && (
              <div className="w-full h-full flex flex-col gap-4">
                <GeneratedImage src={generatedImage} />
                {generatedText && (
                  <p className="text-sm text-gray-400 bg-gray-700/50 p-3 rounded-md">
                    <span className="font-bold text-gray-300">AI Note:</span> {generatedText}
                  </p>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}


import React, { useRef } from 'react';
import { ImageFile } from '../types';
import { ImageIcon } from './icons/ImageIcon';
import { TrashIcon } from './icons/TrashIcon';

interface ImageInputProps {
  imageFile: ImageFile;
  onImageChange: (file: File | null) => void;
  onRemove?: () => void;
}

export const ImageInput: React.FC<ImageInputProps> = ({ imageFile, onImageChange, onRemove }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    onImageChange(file);
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onImageChange(null);
    if (onRemove) {
        onRemove();
    }
    if (inputRef.current) {
        inputRef.current.value = "";
    }
  }

  return (
    <div
      className="relative aspect-square border-2 border-dashed border-gray-600 rounded-lg flex items-center justify-center cursor-pointer group hover:border-purple-500 transition-colors duration-200"
      onClick={() => inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/png, image/jpeg, image/webp"
        className="hidden"
        onChange={handleFileChange}
      />
      {imageFile.base64 ? (
        <>
          <img
            src={imageFile.base64}
            alt="Preview"
            className="object-cover w-full h-full rounded-md"
          />
          {onRemove && (
            <button
                onClick={handleRemove}
                className="absolute top-1 right-1 p-1.5 bg-black/60 rounded-full text-white hover:bg-red-500 transition-colors opacity-0 group-hover:opacity-100"
                aria-label="Remove image"
            >
                <TrashIcon className="w-4 h-4" />
            </button>
          )}
        </>
      ) : (
        <div className="text-center text-gray-500">
          <ImageIcon className="w-8 h-8 mx-auto" />
          <p className="text-xs mt-1">Click to upload</p>
        </div>
      )}
    </div>
  );
};


import React, { useState, useCallback } from 'react';
import type { ChangeEvent } from 'react';
import Icon from './Icon';

interface ImageUploaderProps {
  id: string;
  onImageUpload: (base64: string, mimeType: string) => void;
  title: string;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ id, onImageUpload, title }) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPreviewUrl(result);
        const base64Data = result.split(',')[1];
        onImageUpload(base64Data, file.type);
      };
      reader.readAsDataURL(file);
    }
  }, [onImageUpload]);

  return (
    <div className="w-full flex flex-col items-center">
      <label
        htmlFor={id}
        className="w-full h-64 flex flex-col justify-center items-center border-2 border-dashed border-gray-600 rounded-lg cursor-pointer hover:border-[#00BFFF] transition-colors duration-200 relative group bg-gray-900/50"
      >
        {previewUrl ? (
          <img src={previewUrl} alt="Preview" className="w-full h-full object-cover rounded-lg" />
        ) : (
          <div className="text-center text-gray-400">
            <Icon name="upload" className="w-12 h-12 mx-auto mb-2 text-gray-500 group-hover:text-[#00BFFF]" />
            <p className="font-semibold">{title}</p>
            <p className="text-sm">Click to upload</p>
          </div>
        )}
        <input id={id} type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
      </label>
    </div>
  );
};

export default ImageUploader;

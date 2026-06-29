'use client';

import { useRef, ChangeEvent } from 'react';
import { ImagePlus } from 'lucide-react';

interface UploadImageButtonProps {
  onImageSelected: (base64: string) => void;
  disabled?: boolean;
}

export default function UploadImageButton({
  onImageSelected,
  disabled = false
}: UploadImageButtonProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    if (disabled) return;
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Only image files are supported (PNG, JPEG, WEBP, etc.).');
      return;
    }

    // Limit to 4.5MB (approx API limit for base64 payload overheads)
    if (file.size > 4.5 * 1024 * 1024) {
      alert('Image size exceeds 4.5MB. Please choose a smaller image.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onImageSelected(reader.result);
      }
    };
    reader.readAsDataURL(file);
    
    // Reset file input value so same image can be re-selected if removed
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
        disabled={disabled}
      />
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled}
        className="p-2 rounded-xl text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900 transition-all disabled:opacity-50 disabled:pointer-events-none hover:scale-105 active:scale-95"
        aria-label="Upload image"
      >
        <ImagePlus className="w-5 h-5" />
      </button>
    </div>
  );
}

'use client';

import { useState, useRef } from 'react';
import { uploadImage, validateImageFile, UploadResult } from '@/lib/storage';
import { FiUpload, FiImage, FiX, FiCheck } from 'react-icons/fi';
import Image from 'next/image';

interface ImageUploadProps {
  onUploadSuccessAction: (result: UploadResult) => void;
  onUploadError?: (error: string) => void;
  folder?: string;
  currentImageUrl?: string;
  disabled?: boolean;
}

export default function ImageUpload({
  onUploadSuccessAction,
  onUploadError,
  folder = 'products',
  currentImageUrl,
  disabled = false
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentImageUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File) => {
    // Validate file
    const validation = validateImageFile(file);
    if (!validation.valid) {
      onUploadError?.(validation.error || 'Invalid file');
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload file
    try {
      setUploading(true);
      const result = await uploadImage(file, folder);
      onUploadSuccessAction(result);
    } catch (error) {
      console.error('Upload error:', error);
      onUploadError?.(error instanceof Error ? error.message : 'Upload failed');
      setPreview(currentImageUrl || null); // Reset preview on error
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);

    if (disabled || uploading) return;

    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find(file => file.type.startsWith('image/'));
    
    if (imageFile) {
      handleFileSelect(imageFile);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const openFileDialog = () => {
    if (!disabled && !uploading) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer
          ${dragOver ? 'border-lime-500 bg-lime-50' : 'border-gray-300 hover:border-lime-400'}
          ${disabled || uploading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled && !uploading) setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onClick={openFileDialog}
      >
        <label htmlFor="image-upload-input" className="sr-only">
          Upload image file
        </label>
        <input
          id="image-upload-input"
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileInput}
          className="hidden"
          disabled={disabled || uploading}
          aria-label="Upload image file"
        />

        {uploading ? (
          <div className="space-y-2">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lime-500 mx-auto"></div>
            <p className="text-gray-600">Uploading image...</p>
          </div>
        ) : (
          <div className="space-y-2">
            <FiUpload className="h-12 w-12 text-gray-400 mx-auto" />
            <div>
              <p className="text-lg font-medium text-gray-900">
                {dragOver ? 'Drop image here' : 'Upload product image'}
              </p>
              <p className="text-sm text-gray-500">
                Drag and drop or click to select • Max 5MB • JPEG, PNG, WebP
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Preview */}
      {preview && (
        <div className="relative">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium text-gray-900 flex items-center">
                <FiImage className="mr-2" />
                {uploading ? 'Uploading...' : 'Preview'}
              </h4>
              {!uploading && (
                <button
                  onClick={() => setPreview(null)}
                  className="text-red-500 hover:text-red-700"
                  title="Remove preview"
                >
                  <FiX className="h-4 w-4" />
                </button>
              )}
            </div>
            
            <div className="relative w-full h-48 bg-white rounded border">
              <Image
                src={preview}
                alt="Preview"
                fill
                className="object-contain rounded"
                unoptimized={preview.startsWith('data:')}
              />
              
              {uploading && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                  <div className="bg-white rounded-full p-2">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-lime-500"></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Status */}
      {currentImageUrl && !preview && (
        <div className="flex items-center text-sm text-gray-600">
          <FiCheck className="mr-2 text-green-500" />
          Current image uploaded
        </div>
      )}

      {/* Help Text */}
      <div className="bg-blue-50 border-l-4 border-blue-400 p-3">
        <p className="text-sm text-blue-700">
          <strong>Tip:</strong> Upload high-quality product images for the best customer experience. 
          Images will be stored securely in Firebase Storage.
        </p>
      </div>
    </div>
  );
}
'use client';

import React, { useState, useMemo, useCallback } from 'react';
import Image from 'next/image';

interface ProductImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
  fill?: boolean;
}

// Cache for converted URLs to prevent re-computation
const urlCache = new Map<string, string>();

// Function to convert image URLs/IDs to proper URLs
function convertImageUrl(url: string): string {
  if (!url) return '';
  
  // Check cache first
  if (urlCache.has(url)) {
    return urlCache.get(url)!;
  }
  
  let convertedUrl = url;
  
  // Handle Square image API URLs (already properly formatted)
  if (url.startsWith('/api/square/image/')) {
    convertedUrl = url;
    console.log('✅ Using Square image API URL:', url);
  }
  // Handle Square image IDs (they don't start with http or /)
  else if (!url.startsWith('http') && !url.startsWith('/') && url.length > 10) {
    // Assume it's a Square image ID
    convertedUrl = `/api/square/image/${url}`;
    console.log('🔄 Converting Square image ID:', url, '→', convertedUrl);
  }
  // Handle Google Drive URLs (legacy support)
  else if (url.includes('drive.google.com')) {
    let fileId = '';
    
    if (url.includes('/file/d/')) {
      const match = url.match(/\/file\/d\/([a-zA-Z0-9-_]+)/);
      if (match) fileId = match[1];
    } else if (url.includes('id=')) {
      const match = url.match(/id=([a-zA-Z0-9-_]+)/);
      if (match) fileId = match[1];
    } else if (url.includes('/d/')) {
      const match = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
      if (match) fileId = match[1];
    }

    if (fileId) {
      convertedUrl = `https://lh3.googleusercontent.com/d/${fileId}=w1000`;
      console.log('🔄 Converting Google Drive URL:', url, '→', convertedUrl);
    }
  }
  // Handle direct Google image URLs
  else if (url.startsWith('https://lh3.googleusercontent.com')) {
    convertedUrl = url;
    console.log('✅ Using direct Google image URL:', url);
  }
  // Handle other HTTP URLs or relative paths
  else if (url.startsWith('http') || url.startsWith('/')) {
    convertedUrl = url;
    console.log('✅ Using direct URL:', url);
  }
  
  // Cache the result
  urlCache.set(url, convertedUrl);
  return convertedUrl;
}

export default function ProductImage({ 
  src, 
  alt, 
  className = '', 
  width = 400, 
  height = 400,
  priority = false,
  fill = false
}: ProductImageProps) {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Memoize the URL conversion to prevent re-computation on re-renders
  const imageUrl = useMemo(() => convertImageUrl(src), [src]);

  const handleImageError = useCallback(() => {
    console.error('❌ Image failed to load:', imageUrl);
    setImageError(true);
    setIsLoading(false);
  }, [imageUrl]);

  const handleImageLoad = useCallback(() => {
    console.log('✅ Next.js Image loaded:', imageUrl);
    setIsLoading(false);
  }, [imageUrl]);

  // Reset loading state when src changes
  React.useEffect(() => {
    if (src) {
      setImageError(false);
      setIsLoading(true);
    }
  }, [src]);

  // Debug logging
  React.useEffect(() => {
    console.log('🖼️ ProductImage props:', { src, imageUrl, alt });
    if (imageUrl && !imageError) {
      console.log('✅ Image URL ready for loading:', imageUrl);
    } else if (imageError) {
      console.log('❌ Image error state:', imageUrl);
    } else if (!imageUrl) {
      console.log('⚠️ No image URL provided');
    }
  }, [src, imageUrl, imageError, alt]);

  if (imageError || !imageUrl || !src) {
    return (
      <div 
        className={`bg-gray-200 dark:bg-gray-700 flex items-center justify-center ${className}`}
        style={fill ? {} : { width, height }}
      >
        <div className="text-gray-400 dark:text-gray-500 text-center">
          <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="mt-2 text-sm">No image</p>
          {src && (
            <p className="mt-1 text-xs opacity-70">
              {src.substring(0, 40)}...
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${className}`} style={fill ? {} : { width, height }}>
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse flex items-center justify-center z-10">
          <div className="text-gray-400 text-sm">Loading...</div>
        </div>
      )}
      <Image
        src={imageUrl}
        alt={alt}
        {...(fill ? { fill: true } : { width, height })}
        className={`${fill ? 'object-cover' : 'w-full h-full object-contain'} transition-opacity duration-200 ${className}`}
        onError={handleImageError}
        onLoad={handleImageLoad}
        priority={priority || true} // Always prioritize loading
        unoptimized={true} // Needed for external URLs
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        loading="eager" // Always load eagerly for better preview experience
        fetchPriority="high" // High priority fetching
      />
    </div>
  );
}
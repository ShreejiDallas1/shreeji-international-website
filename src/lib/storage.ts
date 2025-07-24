// Firebase Storage configuration for images
import { storage } from './firebase';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

export interface UploadResult {
  url: string;
  path: string;
  name: string;
}

/**
 * Upload an image to Firebase Storage
 */
export async function uploadImage(
  file: File, 
  folder: string = 'products'
): Promise<UploadResult> {
  try {
    // Create a unique filename
    const timestamp = Date.now();
    const fileName = `${timestamp}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const filePath = `${folder}/${fileName}`;
    
    // Create storage reference
    const storageRef = ref(storage, filePath);
    
    // Upload file
    const snapshot = await uploadBytes(storageRef, file);
    
    // Get download URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    console.log('✅ Image uploaded successfully:', downloadURL);
    
    return {
      url: downloadURL,
      path: filePath,
      name: fileName
    };
  } catch (error) {
    console.error('❌ Error uploading image:', error);
    throw new Error(`Failed to upload image: ${error}`);
  }
}

/**
 * Delete an image from Firebase Storage
 */
export async function deleteImage(imagePath: string): Promise<void> {
  try {
    const storageRef = ref(storage, imagePath);
    await deleteObject(storageRef);
    console.log('✅ Image deleted successfully:', imagePath);
  } catch (error) {
    console.error('❌ Error deleting image:', error);
    throw new Error(`Failed to delete image: ${error}`);
  }
}

/**
 * Generate a placeholder image URL for products
 */
export function getPlaceholderImageUrl(productName: string = 'Product'): string {
  // Use a simple service for placeholder images
  return `https://via.placeholder.com/400x400/84cc16/ffffff?text=${encodeURIComponent(productName.substring(0, 10))}`;
}

/**
 * Get optimized image URL from Firebase Storage
 */
export function getOptimizedImageUrl(originalUrl: string, size: number = 400): string {
  if (!originalUrl || !originalUrl.includes('firebase')) {
    return originalUrl;
  }
  
  // Firebase Storage doesn't have built-in resizing, but we can add query params for future use
  return `${originalUrl}`;
}

/**
 * Validate image file
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  // Check file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    return { 
      valid: false, 
      error: 'Only JPEG, PNG, and WebP images are allowed' 
    };
  }
  
  // Check file size (max 5MB)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    return { 
      valid: false, 
      error: 'Image must be smaller than 5MB' 
    };
  }
  
  return { valid: true };
}

/**
 * Create a simple product image placeholder as base64
 */
export function createProductPlaceholder(productName: string = 'Product Image'): string {
  const colors = [
    { bg: '#84cc16', text: '#ffffff' }, // lime
    { bg: '#f59e0b', text: '#ffffff' }, // amber
    { bg: '#3b82f6', text: '#ffffff' }, // blue
    { bg: '#ec4899', text: '#ffffff' }, // pink
    { bg: '#10b981', text: '#ffffff' }, // emerald
  ];
  
  // Use product name to pick consistent color
  const colorIndex = productName.length % colors.length;
  const color = colors[colorIndex];
  
  const svg = `
    <svg width="400" height="400" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
      <rect width="400" height="400" fill="${color.bg}"/>
      <rect x="50" y="50" width="300" height="200" rx="20" fill="rgba(255,255,255,0.2)"/>
      <circle cx="200" cy="150" r="40" fill="rgba(255,255,255,0.3)"/>
      <rect x="120" y="200" width="160" height="20" rx="10" fill="rgba(255,255,255,0.2)"/>
      <rect x="140" y="230" width="120" height="15" rx="7" fill="rgba(255,255,255,0.15)"/>
      <text x="200" y="320" text-anchor="middle" fill="${color.text}" font-family="system-ui, sans-serif" font-size="18" font-weight="600">
        ${productName.length > 15 ? productName.substring(0, 15) + '...' : productName}
      </text>
      <text x="200" y="350" text-anchor="middle" fill="rgba(255,255,255,0.8)" font-family="system-ui, sans-serif" font-size="14">
        Shreeji International
      </text>
    </svg>
  `;
  
  return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;
}
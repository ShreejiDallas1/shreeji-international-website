// Image proxy and fallback system
export interface ImageSource {
  url: string;
  type: 'google-drive' | 'imgur' | 'firebase' | 'placeholder';
  priority: number;
}

// Extract Google Drive file ID
export function extractGoogleDriveId(url: string): string | null {
  if (!url || !url.includes('drive.google.com')) return null;
  
  // Try different patterns
  const patterns = [
    /\/file\/d\/([a-zA-Z0-9-_]+)/,
    /open\?id=([a-zA-Z0-9-_]+)/,
    /thumbnail\?id=([a-zA-Z0-9-_]+)/,
    /uc\?.*id=([a-zA-Z0-9-_]+)/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  
  return null;
}

// Generate multiple image source URLs for fallback
export function generateImageSources(originalUrl: string, productName: string): ImageSource[] {
  const sources: ImageSource[] = [];
  
  if (!originalUrl || originalUrl.trim() === '') {
    return [{
      url: createPlaceholder(productName),
      type: 'placeholder',
      priority: 0
    }];
  }
  
  // If it's already a working URL, try it first
  if (originalUrl.startsWith('http') && !originalUrl.includes('drive.google.com')) {
    sources.push({
      url: originalUrl,
      type: 'firebase',
      priority: 10
    });
  }
  
  // If it's a Google Drive URL, try multiple formats
  if (originalUrl.includes('drive.google.com')) {
    const fileId = extractGoogleDriveId(originalUrl);
    
    if (fileId) {
      // Try direct download format (works for public files)
      sources.push({
        url: `https://drive.google.com/uc?export=download&id=${fileId}`,
        type: 'google-drive',
        priority: 9
      });
      
      // Try thumbnail format
      sources.push({
        url: `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`,
        type: 'google-drive',
        priority: 8
      });
      
      // Try view format
      sources.push({
        url: `https://drive.google.com/uc?export=view&id=${fileId}`,
        type: 'google-drive',
        priority: 7
      });
      
      // Try lh3 format (sometimes works)
      sources.push({
        url: `https://lh3.googleusercontent.com/d/${fileId}`,
        type: 'google-drive',
        priority: 6
      });
      
      // Try our proxy API as a fallback
      sources.push({
        url: `/api/image-proxy?url=${encodeURIComponent(`https://drive.google.com/uc?export=view&id=${fileId}`)}`,
        type: 'google-drive',
        priority: 5
      });
    }
  }
  
  // Fallback placeholder
  sources.push({
    url: createPlaceholder(productName),
    type: 'placeholder',
    priority: 0
  });
  
  // Sort by priority (highest first)
  return sources.sort((a, b) => b.priority - a.priority);
}

// Create a placeholder image with product name
export function createPlaceholder(productName: string): string {
  // Check if we're in a browser environment
  if (typeof window === 'undefined') {
    return '/placeholder-product.svg';
  }
  
  const canvas = document.createElement('canvas');
  canvas.width = 400;
  canvas.height = 400;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) return '/placeholder-product.svg';
  
  // Background gradient
  const gradient = ctx.createLinearGradient(0, 0, 400, 400);
  gradient.addColorStop(0, '#f3f4f6');
  gradient.addColorStop(1, '#e5e7eb');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 400, 400);
  
  // Border
  ctx.strokeStyle = '#d1d5db';
  ctx.lineWidth = 2;
  ctx.strokeRect(0, 0, 400, 400);
  
  // Icon (simple box)
  ctx.fillStyle = '#9ca3af';
  ctx.fillRect(150, 120, 100, 80);
  ctx.strokeStyle = '#6b7280';
  ctx.lineWidth = 1;
  ctx.strokeRect(150, 120, 100, 80);
  
  // Text
  ctx.fillStyle = '#374151';
  ctx.font = 'bold 16px Arial';
  ctx.textAlign = 'center';
  
  // Product name (truncated)
  const truncated = productName.length > 20 ? productName.substring(0, 17) + '...' : productName;
  ctx.fillText(truncated, 200, 250);
  
  // "Image Coming Soon" text
  ctx.font = '14px Arial';
  ctx.fillStyle = '#6b7280';
  ctx.fillText('Image Coming Soon', 200, 280);
  
  return canvas.toDataURL('image/png');
}

// Check if an image URL loads successfully
export async function testImageUrl(url: string): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
    
    // Timeout after 3 seconds
    setTimeout(() => resolve(false), 3000);
  });
}

// Find the first working image URL from sources
export async function findWorkingImageUrl(sources: ImageSource[]): Promise<string> {
  for (const source of sources) {
    if (source.type === 'placeholder') {
      return source.url; // Always return placeholder as last resort
    }
    
    const works = await testImageUrl(source.url);
    if (works) {
      console.log(`✅ Working image URL found: ${source.url}`);
      return source.url;
    } else {
      console.log(`❌ Image URL failed: ${source.url}`);
    }
  }
  
  // If nothing works, return the placeholder
  return sources[sources.length - 1].url;
}
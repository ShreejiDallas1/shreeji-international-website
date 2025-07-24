// Test Google Drive URL conversion
const testUrl = 'https://drive.google.com/thumbnail?id=12tUUp-6A5cIe2NMOCk9oVqgGrjqO1pSz&sz=w1000';

function processImageUrl(url) {
  // If it's a Google Drive URL, convert it to googleusercontent.com format
  if (url.includes('drive.google.com')) {
    // Extract file ID from various Google Drive URL formats
    let fileId = null;
    
    // Format: https://drive.google.com/file/d/FILE_ID/view
    if (url.includes('/file/d/')) {
      fileId = url.split('/file/d/')[1]?.split('/')[0];
    }
    // Format: https://drive.google.com/open?id=FILE_ID
    else if (url.includes('open?id=')) {
      fileId = url.split('open?id=')[1]?.split('&')[0];
    }
    // Format: https://drive.google.com/thumbnail?id=FILE_ID&sz=w1000
    else if (url.includes('thumbnail?id=')) {
      fileId = url.split('thumbnail?id=')[1]?.split('&')[0];
    }
    
    // If we found a file ID, use the direct googleusercontent.com URL
    if (fileId) {
      return `https://lh3.googleusercontent.com/d/${fileId}=w1000`;
    }
    
    // Fallback to original URL
    return url;
  }
  
  return url;
}

console.log('Original URL:', testUrl);
console.log('Converted URL:', processImageUrl(testUrl));
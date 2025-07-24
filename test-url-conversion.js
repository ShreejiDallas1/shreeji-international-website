// Test Google Drive URL conversion
function convertGoogleDriveUrl(url) {
  // If it's already a direct image URL or not a Google Drive URL, return as is
  if (!url.includes('drive.google.com') || url.includes('uc?export=view')) {
    return url;
  }
  
  // Extract file ID from Google Drive share URL
  const match = url.match(/\/file\/d\/([a-zA-Z0-9-_]+)/);
  
  if (match) {
    const fileId = match[1];
    const directUrl = `https://drive.google.com/uc?export=view&id=${fileId}`;
    console.log(`🔄 Converted: ${url} -> ${directUrl}`);
    return directUrl;
  }
  
  // If we can't parse it, return the original URL
  console.log(`⚠️ Could not convert: ${url}`);
  return url;
}

// Test cases
const testUrls = [
  'https://drive.google.com/file/d/1ABC123DEF456GHI789/view?usp=sharing',
  'https://drive.google.com/file/d/1XYZ987WVU654TSR321/view?usp=drive_link',
  'https://images.unsplash.com/photo-1234567890',
  'https://drive.google.com/uc?export=view&id=1ABC123DEF456GHI789',
  'not-a-url',
  ''
];

console.log('🧪 Testing Google Drive URL conversion...\n');

testUrls.forEach((url, index) => {
  console.log(`Test ${index + 1}: ${url || '(empty)'}`);
  const result = convertGoogleDriveUrl(url);
  console.log(`Result: ${result}\n`);
});
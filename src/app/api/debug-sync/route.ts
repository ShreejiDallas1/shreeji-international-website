import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('🔍 Starting debug sync...');
    
    // Test fetching from Google Sheets directly
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;
    console.log('📊 Sheet ID:', spreadsheetId);
    
    if (!spreadsheetId) {
      return NextResponse.json({ error: 'No sheet ID found' });
    }

    const csvUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=csv&gid=0`;
    console.log('📡 Fetching CSV from:', csvUrl);
    
    const response = await fetch(csvUrl);
    console.log('📈 CSV Response status:', response.status);
    
    if (!response.ok) {
      return NextResponse.json({ 
        error: 'Failed to fetch CSV', 
        status: response.status,
        statusText: response.statusText 
      });
    }
    
    const csvText = await response.text();
    console.log('📄 CSV Data (first 500 chars):', csvText.substring(0, 500));
    
    const lines = csvText.split('\n').filter(line => line.trim());
    console.log('📋 Total lines:', lines.length);
    
    if (lines.length <= 1) {
      return NextResponse.json({ error: 'No data in CSV', lines: lines.length });
    }
    
    // Parse first few products to see what we get
    const products = [];
    
    for (let i = 1; i < Math.min(lines.length, 4); i++) { // Only process first 3 products for debug
      const line = lines[i].trim();
      if (!line) continue;
      
      console.log(`🔍 Processing line ${i}:`, line);
      
      // Simple CSV parsing
      const cols = parseCSVLine(line);
      console.log(`📋 Parsed columns:`, cols);
      
      if (cols.length < 6) {
        console.log(`⚠️ Row ${i} has only ${cols.length} columns`);
        continue;
      }
      
      const rawImageUrl = cols[5]?.trim() || '';
      console.log(`🖼️ Raw image URL:`, rawImageUrl);
      
      // Test URL conversion
      let convertedUrl = rawImageUrl;
      if (rawImageUrl && rawImageUrl.includes('drive.google.com')) {
        convertedUrl = convertGoogleDriveUrl(rawImageUrl);
        console.log(`🔄 Converted URL:`, convertedUrl);
      }
      
      const product = {
        id: cols[0] || `product-${Date.now()}-${i}`,
        name: cols[1] || '',
        description: cols[2] || '',
        price: parseFloat((cols[3] || '0').toString().replace(/[$,]/g, '')) || 0,
        category: cols[4] || 'Uncategorized',
        image: convertedUrl || '/placeholder-product.svg',
        rawImageUrl: rawImageUrl,
        convertedImageUrl: convertedUrl,
        stock: parseInt(cols[6] || '100') || 100,
        brand: cols[7] || 'Shreeji International'
      };
      
      console.log(`✅ Product created:`, product);
      products.push(product);
    }
    
    return NextResponse.json({
      success: true,
      csvUrl,
      totalLines: lines.length,
      products,
      message: 'Debug sync completed'
    });
    
  } catch (error) {
    console.error('❌ Debug sync error:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
  }
}

// Helper function to parse CSV line
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current.trim());
  return result;
}

// Helper function to convert Google Drive URLs
function convertGoogleDriveUrl(url: string): string {
  if (!url.includes('drive.google.com') || url.includes('uc?export=view')) {
    return url;
  }
  
  const match = url.match(/\/file\/d\/([a-zA-Z0-9-_]+)/);
  
  if (match) {
    const fileId = match[1];
    const directUrl = `https://drive.google.com/uc?export=view&id=${fileId}`;
    console.log(`🔄 Converted: ${url} -> ${directUrl}`);
    return directUrl;
  }
  
  console.log(`⚠️ Could not convert: ${url}`);
  return url;
}
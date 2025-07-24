import { google } from 'googleapis';
import { JWT } from 'google-auth-library';
import { db } from './firebase';
import { doc, writeBatch, collection, getDocs, query, where, deleteDoc, setDoc } from 'firebase/firestore';
import { shouldUseGoogleSheets } from './config';

// Define the product type
export type SheetProduct = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  stock: number;
  brand?: string;
  featured?: boolean;
  sku?: string;
  unit?: string;
  minOrderQuantity?: number;
};

// Create a JWT client using service account credentials
const createJwtClient = () => {
  // Check if we have the required environment variables
  if (!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY) {
    console.warn('Google Service Account credentials not found in environment variables');
    return null;
  }

  try {
    const credentials = {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    };

    return new JWT({
      email: credentials.client_email,
      key: credentials.private_key,
      scopes: [
        'https://www.googleapis.com/auth/spreadsheets.readonly',
        'https://www.googleapis.com/auth/spreadsheets',
        'https://www.googleapis.com/auth/drive.readonly',
        'https://www.googleapis.com/auth/drive.file',
        'https://www.googleapis.com/auth/drive'
      ],
    });
  } catch (error) {
    console.error('Error creating JWT client:', error);
    return null;
  }
};

// Function to fetch products from Google Sheets
export async function fetchProductsFromSheet() {
  const spreadsheetId = process.env.GOOGLE_SHEET_ID;
  if (!spreadsheetId) {
    console.error('Google Sheet ID not found in environment variables');
    return [];
  }

  console.log('🔍 Attempting to fetch from Google Sheets ID:', spreadsheetId);

  // Skip Google Sheets API due to authentication issues
  console.log('⚠️ Skipping Google Sheets API, using CSV export directly...');

  // Fallback: Try making the sheet completely public accessible
  try {
    console.log('🌐 Trying public CSV export...');
    const csvUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=csv&gid=0`;
    console.log('CSV URL:', csvUrl);
    
    const response = await fetch(csvUrl);
    console.log('CSV Response status:', response.status);
    
    if (response.ok) {
      const csvText = await response.text();
      console.log('CSV data:', csvText.substring(0, 500));
      
      const lines = csvText.split('\n').filter(line => line.trim());
      if (lines.length <= 1) {
        console.log('No data in CSV');
        return [];
      }
      
      const products: SheetProduct[] = [];
      
      // Process each line manually to handle images
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        console.log(`🔍 Processing CSV line ${i}:`, line);
        
        // Parse CSV line properly
        const cols = parseCSVLine(line);
        console.log(`📋 Parsed columns (${cols.length}):`, cols);
        
        if (cols.length < 9) {
          console.log(`⚠️ Row ${i} has only ${cols.length} columns, expected at least 9`);
          continue;
        }
        
        if (!cols[0] || !cols[1]) {
          console.log(`⚠️ Skipping row ${i}: missing ID or name`);
          continue;
        }
        
        const priceStr = (cols[3] || '0').toString().replace(/[$,]/g, '');
        const price = parseFloat(priceStr) || 0;
        
        // Handle stock - don't default to 100, respect the actual value including 0
        const stockStr = (cols[6] || '0').toString().replace(/[^\d]/g, '');
        const stock = parseInt(stockStr, 10);
        console.log(`📦 Stock for ${cols[1]}: raw="${cols[6]}" -> parsed="${stock}"`);
        
        
        // Handle image - if empty or just whitespace, use placeholder
        let imageUrl = cols[5]?.trim() || '';
        console.log(`🖼️ Raw image value for ${cols[1]}: "${cols[5]}" -> Trimmed: "${imageUrl}"`);
        
        if (!imageUrl || imageUrl === '') {
          imageUrl = '/images/placeholder.svg';
          console.log(`🖼️ Using placeholder for ${cols[1]}`);
        } else {
          // Auto-convert Google Drive URLs to direct image URLs
          console.log(`🔄 Converting URL for ${cols[1]}: "${imageUrl}"`);
          imageUrl = convertGoogleDriveUrl(imageUrl);
          console.log(`✅ Converted URL for ${cols[1]}: "${imageUrl}"`);
        }
        
        // Handle minimum order quantity from column J (index 9)
        const minOrderStr = (cols[9] || '1').toString().replace(/[^\d.]/g, '');
        const minOrderQuantity = parseInt(minOrderStr) || 1;
        
        const product = {
          id: cols[0] || `product-${Date.now()}-${i}`,
          name: cols[1] || '',
          description: cols[2] || '',
          price: price,
          category: cols[4] || 'Uncategorized',
          image: imageUrl,
          stock: stock,
          brand: cols[7] || 'Shreeji International',
          featured: cols[8]?.toLowerCase() === 'true' || cols[8] === '1' || cols[8]?.toLowerCase() === 'yes' || false,
          sku: `SKU-${cols[0]}`,
          unit: 'unit',
          minOrderQuantity: minOrderQuantity,
        };
        
        console.log(`✅ Created product:`, product);
        products.push(product);
      }
      
      console.log(`✅ Successfully fetched ${products.length} products from CSV`);
      return products;
    }
  } catch (error) {
    console.error('❌ CSV access failed:', error);
  }

  console.error('❌ All Google Sheets access methods failed');
  return [];
}

// Function to sync products from Google Sheets to Firestore
export async function syncProductsFromSheet() {
  // Check if Google Sheets sync is enabled
  if (!shouldUseGoogleSheets()) {
    console.log('⚠️ Google Sheets sync is disabled in configuration');
    return {
      success: false,
      productsCount: 0,
      message: 'Google Sheets sync is currently disabled. Using Square inventory instead.'
    };
  }

  try {
    const count = await syncProductsToFirestore();
    return {
      success: true,
      productsCount: count,
      message: `Successfully synced ${count} products to Firestore`
    };
  } catch (error: any) {
    console.error('Error in syncProductsFromSheet:', error);
    return {
      success: false,
      productsCount: 0,
      message: error.message || 'Unknown error occurred during sync'
    };
  }
}

// Internal implementation of sync
export async function syncProductsToFirestore() {
  // Check if Google Sheets sync is enabled
  if (!shouldUseGoogleSheets()) {
    console.log('⚠️ Google Sheets sync is disabled in configuration');
    throw new Error('Google Sheets sync is currently disabled. Using Square inventory instead.');
  }

  try {
    console.log('Starting sync from Google Sheets to Firestore...');
    
    // First, try to add a test document to check permissions
    try {
      console.log('Testing Firebase write permissions...');
      const testDocRef = doc(db, 'test', 'test-permissions-' + Date.now());
      await setDoc(testDocRef, {
        test: true,
        timestamp: new Date().toISOString()
      });
      
      // Delete the test document
      await deleteDoc(testDocRef);
      console.log('Firebase write permissions confirmed');
    } catch (error) {
      console.error('Firebase permission error:', error);
      throw new Error('Firebase permission error: ' + (error as Error).message);
    }
    
    const products = await fetchProductsFromSheet();
    
    if (!products || products.length === 0) {
      console.warn('No products to sync');
      return 0;
    }
    
    console.log(`Processing ${products.length} products...`);
    
    // First, get all existing products to check for deletions
    let existingProductIds = new Set<string>();
    try {
      const existingProductsSnapshot = await getDocs(collection(db, 'products'));
      existingProductsSnapshot.forEach(doc => existingProductIds.add(doc.id));
      console.log(`Found ${existingProductIds.size} existing products`);
    } catch (error) {
      console.error('Error fetching existing products:', error);
      // Continue with an empty set if we can't fetch existing products
      existingProductIds = new Set<string>();
    }
    
    // Track new product IDs
    const newProductIds = new Set<string>();
    
    // Track categories from the sheet
    const categories = new Set<string>();
    
    // Add or update products in Firestore - one by one instead of batch
    let successCount = 0;
    
    for (const product of products) {
      try {
        const productRef = doc(db, 'products', product.id);
        newProductIds.add(product.id);
        
        // Add category to the set
        if (product.category) {
          categories.add(product.category);
        }
        
        // Generate search keywords for better search functionality
        const searchKeywords = generateSearchKeywords(product.name, product.description, product.brand);
        
        // Use setDoc to completely overwrite the product data
        await setDoc(productRef, {
          ...product,
          searchKeywords,
          updatedAt: new Date(),
          createdAt: new Date(), // Always set createdAt for new products
        }); // Complete overwrite to ensure stock is updated
        
        successCount++;
      } catch (error) {
        console.error(`Error adding product ${product.id}:`, error);
      }
    }
    
    // Find products to delete (in Firestore but not in the sheet)
    for (const existingId of existingProductIds) {
      if (!newProductIds.has(existingId)) {
        try {
          const productRef = doc(db, 'products', existingId);
          await deleteDoc(productRef);
        } catch (error) {
          console.error(`Error deleting product ${existingId}:`, error);
        }
      }
    }
    
    // Update categories collection based on sheet data
    await syncCategories(categories);
    
    console.log(`Successfully synced ${successCount} products and ${categories.size} categories to Firestore.`);
    return successCount;
  } catch (error) {
    console.error('Error syncing products to Firestore:', error);
    throw error;
  }
}

// Function to sync categories
async function syncCategories(categories: Set<string>) {
  try {
    console.log(`Processing ${categories.size} categories...`);
    const categoriesRef = collection(db, 'categories');
    const existingCategoriesSnapshot = await getDocs(categoriesRef);
    const existingCategoryIds = new Map<string, string>(); // Map of category name to doc ID
    
    existingCategoriesSnapshot.forEach(doc => {
      const data = doc.data();
      existingCategoryIds.set(data.name, doc.id);
    });
    
    // Add new categories
    for (const categoryName of categories) {
      if (!existingCategoryIds.has(categoryName)) {
        try {
          const newCategoryRef = doc(categoriesRef);
          const slug = categoryName.toLowerCase().replace(/\s+/g, '-');
          
          // Determine image based on category name
          let image = "/images/placeholder.svg";
          const lowerCategoryName = categoryName.toLowerCase();
          
          if (lowerCategoryName.includes('spice')) image = "/images/placeholder.svg";
          else if (lowerCategoryName.includes('lentil') || lowerCategoryName.includes('pulse')) image = "/images/placeholder.svg";
          else if (lowerCategoryName.includes('rice') || lowerCategoryName.includes('grain')) image = "/images/placeholder.svg";
          else if (lowerCategoryName.includes('flour') || lowerCategoryName.includes('baking')) image = "/images/placeholder.svg";
          else if (lowerCategoryName.includes('snack')) image = "/images/placeholder.svg";
          else if (lowerCategoryName.includes('beverage')) image = "/images/placeholder.svg";
          
          await setDoc(newCategoryRef, {
            name: categoryName,
            slug: slug,
            image: image,
            createdAt: new Date()
          });
        } catch (error) {
          console.error(`Error adding category ${categoryName}:`, error);
        }
      }
    }
    
    // Delete categories that are no longer in the sheet
    for (const [categoryName, categoryId] of existingCategoryIds.entries()) {
      if (!categories.has(categoryName)) {
        try {
          const categoryRef = doc(db, 'categories', categoryId);
          await deleteDoc(categoryRef);
        } catch (error) {
          console.error(`Error deleting category ${categoryName}:`, error);
        }
      }
    }
    
    console.log('Categories processed successfully');
  } catch (error) {
    console.error('Error syncing categories:', error);
    throw error;
  }
}

// Helper function to parse CSV line properly
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
  
  // Add the last field
  result.push(current.trim());
  
  return result;
}

// Helper function to convert Google Drive URLs to direct image URLs
function convertGoogleDriveUrl(url: string): string {
  // If it's not a Google Drive URL, return as is
  if (!url.includes('drive.google.com')) {
    return url;
  }
  
  // If it's already a direct/thumbnail URL, return as is
  if (url.includes('uc?export=view') || url.includes('thumbnail?id=')) {
    return url;
  }
  
  // Extract file ID from Google Drive share URL
  const match = url.match(/\/file\/d\/([a-zA-Z0-9-_]+)/);
  
  if (match) {
    const fileId = match[1];
    // Use proxy URL for better reliability and CORS handling
    const directUrl = `https://drive.google.com/uc?export=view&id=${fileId}`;
    const proxyUrl = `/api/image-proxy?url=${encodeURIComponent(directUrl)}`;
    console.log(`🔄 Converted Google Drive URL: ${url} -> proxy URL`);
    return proxyUrl;
  }
  
  // If we can't parse it, return the original URL
  console.log(`⚠️ Could not convert Google Drive URL: ${url}`);
  return url;
}

// Helper function to generate search keywords
function generateSearchKeywords(name: string, description: string, brand?: string): string[] {
  const keywords = new Set<string>();
  
  // Add name words
  if (name) {
    name.toLowerCase().split(/\s+/).forEach(word => {
      if (word.length > 2) keywords.add(word);
    });
  }
  
  // Add brand
  if (brand) {
    brand.toLowerCase().split(/\s+/).forEach(word => {
      if (word.length > 2) keywords.add(word);
    });
  }
  
  // Add some important words from description
  if (description) {
    description.toLowerCase().split(/\s+/).forEach(word => {
      if (word.length > 3) keywords.add(word);
    });
  }
  
  return Array.from(keywords);
}


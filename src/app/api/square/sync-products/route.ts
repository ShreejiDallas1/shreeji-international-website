import { NextRequest, NextResponse } from 'next/server';
import { squareService, transformSquareProduct, transformSquareCategory } from '@/lib/square-simple';
import { db } from '@/lib/firebase';
import { collection, getDocs, setDoc, doc } from 'firebase/firestore';

// Rate limiting for expensive sync operations
const lastSyncTime = new Map<string, number>();

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Starting Square to Firestore product sync...');
    
    // Check for API key for security
    const body = await request.json().catch(() => ({}));
    const apiKey = body.apiKey;
    const validApiKey = process.env.SYNC_API_KEY || 'shreeji_sync_api_2024';
    
    if (!apiKey || apiKey !== validApiKey) {
      return NextResponse.json(
        { error: 'Unauthorized: Invalid API key' },
        { status: 401 }
      );
    }
    
    // Get all products from Square Catalog
    const squareItems = await squareService.getCatalogItems();
    console.log(`📦 Found ${squareItems.length} items in Square Catalog`);
    
    // Get categories from Square
    const squareCategories = await squareService.getCategories();
    console.log(`📂 Found ${squareCategories.length} categories in Square Catalog`);
    
    // Get inventory counts for all items
    const inventoryCounts = await squareService.getInventoryCounts();
    console.log(`📊 Found ${inventoryCounts.length} inventory records`);
    
    // Transform and sync products to Firestore
    let syncedCount = 0;
    
    for (const item of squareItems) {
      try {
        // Transform Square item to our product format with inventory data
        const productData = transformSquareProduct(item, squareCategories, inventoryCounts);
        
        // Save to Firestore
        await setDoc(doc(db, 'products', item.id), productData);
        syncedCount++;
        
        console.log(`✅ Synced product: ${productData.name}`);
        
      } catch (error) {
        console.error(`❌ Error syncing product ${item.item_data?.name}:`, error);
      }
    }
    
    // Sync categories
    let categoriesSynced = 0;
    for (const category of squareCategories) {
      try {
        const categoryData = transformSquareCategory(category);
        await setDoc(doc(db, 'categories', category.id), categoryData);
        categoriesSynced++;
      } catch (error) {
        console.error(`❌ Error syncing category ${category.category_data?.name}:`, error);
      }
    }
    
    console.log(`✅ Successfully synced ${syncedCount} products and ${categoriesSynced} categories from Square`);
    
    return NextResponse.json({
      success: true,
      message: `Successfully synced ${syncedCount} products and ${categoriesSynced} categories from Square Catalog`,
      productsCount: syncedCount,
      categoriesCount: categoriesSynced,
    });
    
  } catch (error) {
    console.error('❌ Error syncing Square products:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to sync products from Square',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Get sync status
export async function GET() {
  try {
    // Get product count from Firestore
    const productsRef = collection(db, 'products');
    const productsSnapshot = await getDocs(productsRef);
    
    const squareProducts = productsSnapshot.docs.filter(doc => 
      doc.data().squareItemId
    );
    
    return NextResponse.json({
      success: true,
      firestoreProductsCount: productsSnapshot.size,
      squareSyncedProductsCount: squareProducts.length,
      lastSyncedProducts: squareProducts.slice(0, 5).map(doc => ({
        id: doc.id,
        name: doc.data().name,
        lastSyncedAt: doc.data().lastSyncedAt
      }))
    });
    
  } catch (error) {
    console.error('❌ Error getting sync status:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to get sync status'
      },
      { status: 500 }
    );
  }
}
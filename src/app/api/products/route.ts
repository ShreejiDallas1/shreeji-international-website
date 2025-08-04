import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, limit, setDoc, doc } from 'firebase/firestore';
import { squareService, transformSquareProduct } from '@/lib/square-simple';

// Track last sync time to avoid too frequent syncs
let lastSyncTime = 0;
const SYNC_INTERVAL = 2 * 60 * 1000; // 2 minutes

export async function GET(request: NextRequest) {
  try {
    const now = Date.now();
    const shouldSync = (now - lastSyncTime) > SYNC_INTERVAL;
    
    if (shouldSync) {
      console.log('🔄 Syncing products from Square...');
      await syncProductsFromSquare();
      lastSyncTime = now;
    } else {
      console.log('🔄 Fetching products from Firebase (recently synced)...');
    }
    
    const productsRef = collection(db, 'products');
    const q = query(productsRef, limit(100));
    const querySnapshot = await getDocs(q);
    
    const products: any[] = [];
    querySnapshot.forEach((doc) => {
      products.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    console.log(`✅ Found ${products.length} products in Firebase`);
    console.log('📦 First few products:', products.slice(0, 3));
    
    const response = NextResponse.json({
      success: true,
      products,
      count: products.length
    });
    
    // Shorter cache for real-time updates (1 minute)
    response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=120');
    
    return response;
    
  } catch (error) {
    console.error('❌ Error fetching products:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch products'
      },
      { status: 500 }
    );
  }
}

// Function to sync products from Square to Firebase
async function syncProductsFromSquare() {
  try {
    console.log('🔄 Starting automatic Square sync...');
    
    // Get all products from Square Catalog
    const squareItems = await squareService.getCatalogItems();
    console.log(`📦 Found ${squareItems.length} items in Square Catalog`);
    
    // Get inventory counts for all items
    const inventoryCounts = await squareService.getInventoryCounts();
    console.log(`📊 Found inventory for ${Object.keys(inventoryCounts).length} items`);
    
    let syncedCount = 0;
    
    for (const item of squareItems) {
      try {
        const transformedProduct = transformSquareProduct(item, inventoryCounts);
        
        if (transformedProduct) {
          // Save to Firebase
          await setDoc(doc(db, 'products', transformedProduct.id), transformedProduct);
          syncedCount++;
        }
      } catch (error) {
        console.error(`❌ Error syncing product ${item.id}:`, error);
      }
    }
    
    console.log(`✅ Auto-synced ${syncedCount} products from Square`);
    return syncedCount;
    
  } catch (error) {
    console.error('❌ Error in automatic Square sync:', error);
    return 0;
  }
}
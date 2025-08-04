import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs, setDoc, doc, deleteDoc } from 'firebase/firestore';
import { squareService, transformSquareProduct } from '@/lib/square-simple';

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Manual sync triggered...');
    
    // Get all products from Square Catalog
    const squareItems = await squareService.getCatalogItems();
    console.log(`📦 Found ${squareItems.length} items in Square Catalog`);
    
    // Get inventory counts for all items
    const inventoryCounts = await squareService.getInventoryCounts();
    console.log(`📊 Found inventory for ${Object.keys(inventoryCounts).length} items`);
    
    // Get current products from Firebase to identify deletions
    const productsRef = collection(db, 'products');
    const currentSnapshot = await getDocs(productsRef);
    const currentProductIds = new Set<string>();
    currentSnapshot.forEach((doc) => {
      currentProductIds.add(doc.id);
    });
    
    // Track Square product IDs
    const squareProductIds = new Set<string>();
    let syncedCount = 0;
    
    // Add/Update products from Square
    for (const item of squareItems) {
      try {
        const transformedProduct = transformSquareProduct(item, inventoryCounts);
        
        if (transformedProduct) {
          squareProductIds.add(transformedProduct.id);
          // Save to Firebase
          await setDoc(doc(db, 'products', transformedProduct.id), transformedProduct);
          syncedCount++;
        }
      } catch (error) {
        console.error(`❌ Error syncing product ${item.id}:`, error);
      }
    }
    
    // Delete products that no longer exist in Square
    let deletedCount = 0;
    for (const firebaseProductId of currentProductIds) {
      if (!squareProductIds.has(firebaseProductId)) {
        try {
          await deleteDoc(doc(db, 'products', firebaseProductId));
          deletedCount++;
          console.log(`🗑️ Deleted product ${firebaseProductId} (no longer in Square)`);
        } catch (error) {
          console.error(`❌ Error deleting product ${firebaseProductId}:`, error);
        }
      }
    }
    
    console.log(`✅ Manually synced ${syncedCount} products, deleted ${deletedCount} products from Square`);
    
    return NextResponse.json({
      success: true,
      message: `Successfully synced ${syncedCount} products and deleted ${deletedCount} products from Square`,
      syncedCount,
      deletedCount
    });
    
  } catch (error) {
    console.error('❌ Error in manual sync:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to sync products'
      },
      { status: 500 }
    );
  }
}

// GET endpoint to check sync status
export async function GET() {
  return NextResponse.json({
    message: 'Manual sync endpoint ready',
    usage: 'POST to this endpoint to trigger immediate sync from Square'
  });
}
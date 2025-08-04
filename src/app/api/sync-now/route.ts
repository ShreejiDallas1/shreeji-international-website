import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { setDoc, doc } from 'firebase/firestore';
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
    
    console.log(`✅ Manually synced ${syncedCount} products from Square`);
    
    return NextResponse.json({
      success: true,
      message: `Successfully synced ${syncedCount} products from Square`,
      syncedCount
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
import { NextRequest, NextResponse } from 'next/server';
import { SquareInventoryManager } from '@/lib/square-inventory';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const locationId = searchParams.get('locationId');
    const sync = searchParams.get('sync') === 'true';

    console.log('📦 Fetching Square inventory...');

    if (sync) {
      // Sync from Square to Firestore
      const syncResult = await SquareInventoryManager.syncToFirestore();
      
      return NextResponse.json({
        message: 'Sync completed',
        ...syncResult
      });
    } else {
      // Just fetch inventory data
      const { products, categories } = await SquareInventoryManager.getAllCatalogItems();
      const updatedProducts = await SquareInventoryManager.updateProductInventory(
        products, 
        locationId || undefined
      );

      return NextResponse.json({
        success: true,
        products: updatedProducts,
        categories: categories,
        totalProducts: updatedProducts.length,
        totalCategories: categories.length,
        inStockProducts: updatedProducts.filter(p => p.inStock).length
      });
    }

  } catch (error: any) {
    console.error('❌ Error fetching inventory:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch inventory',
        details: error.message
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ...data } = body;

    console.log('🔧 Square inventory action:', action);

    switch (action) {
      case 'create_product':
        const newProduct = await SquareInventoryManager.createProduct(data);
        if (newProduct) {
          return NextResponse.json({
            success: true,
            product: newProduct,
            message: 'Product created successfully'
          });
        } else {
          return NextResponse.json(
            { success: false, error: 'Failed to create product' },
            { status: 400 }
          );
        }

      case 'update_inventory':
        const { catalogObjectId, locationId, quantity, reason } = data;
        const updated = await SquareInventoryManager.updateInventoryCount(
          catalogObjectId,
          locationId,
          quantity,
          reason
        );
        
        return NextResponse.json({
          success: updated,
          message: updated ? 'Inventory updated' : 'Failed to update inventory'
        });

      case 'sync':
        const syncResult = await SquareInventoryManager.syncToFirestore();
        return NextResponse.json({
          message: 'Sync completed',
          ...syncResult
        });

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }

  } catch (error: any) {
    console.error('❌ Error processing inventory action:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process action',
        details: error.message
      },
      { status: 500 }
    );
  }
}
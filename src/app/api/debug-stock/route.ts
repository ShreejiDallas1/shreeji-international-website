import { NextResponse } from 'next/server';
import { SquareInventoryManager } from '@/lib/square-inventory';
import { shouldUseGoogleSheets } from '@/lib/config';

export async function GET() {
  try {
    console.log('🔍 Debug: Testing stock sync...');
    
    let products;
    if (shouldUseGoogleSheets()) {
      // Google Sheets (deactivated)
      const { fetchProductsFromSheet } = await import('@/lib/googleSheets');
      products = await fetchProductsFromSheet();
    } else {
      // Square inventory (primary)
      const { products: squareProducts } = await SquareInventoryManager.getAllCatalogItems();
      const updatedProducts = await SquareInventoryManager.updateProductInventory(squareProducts);
      products = updatedProducts.map(p => ({
        id: p.id,
        name: p.name,
        stock: p.stockQuantity || 0,
        price: p.price
      }));
    }
    
    console.log(`📊 Found ${products.length} products`);
    
    // Find product with ID "1" specifically
    const product1 = products.find(p => p.id === '1');
    const allProducts = products.map(p => ({
      id: p.id,
      name: p.name,
      stock: p.stock,
      price: p.price
    }));
    
    return NextResponse.json({
      success: true,
      totalProducts: products.length,
      product1: product1 || null,
      allProducts: allProducts,
      message: product1 ? `Product ID "1" has stock: ${product1.stock}` : 'Product ID "1" not found'
    });
    
  } catch (error) {
    console.error('❌ Debug stock error:', error);
    return NextResponse.json({
      success: false,
      error: (error as Error).message
    }, { status: 500 });
  }
}
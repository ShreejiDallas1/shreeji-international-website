import { NextRequest, NextResponse } from 'next/server';
import { squareService, transformSquareProduct, transformSquareCategory, SquareItem, SquareCategory } from '@/lib/square-simple';

export async function GET() {
  try {
    console.log('🔄 Fetching products from Square Catalog...');
    
    // Get all items from Square Catalog
    const squareItems = await squareService.getCatalogItems();
    console.log(`📦 Found ${squareItems.length} items in Square Catalog`);
    
    // Get categories
    const categories = await squareService.getCategories();
    console.log(`📂 Found ${categories.length} categories in Square Catalog`);
    
    // Transform Square items to our product format
    const products = squareItems.map((item: SquareItem) => transformSquareProduct(item, categories));
    
    console.log(`✅ Successfully transformed ${products.length} products`);
    
    return NextResponse.json({
      success: true,
      products,
      categories: categories.map((cat: SquareCategory) => transformSquareCategory(cat)),
      count: products.length
    });
    
  } catch (error) {
    console.error('❌ Error fetching Square products:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch products from Square',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('🔄 Creating new product in Square Catalog:', body);
    
    const newItem = await squareService.createCatalogItem({
      name: body.name,
      description: body.description,
      price: body.price,
      sku: body.sku,
      categoryId: body.categoryId
    });
    
    console.log('✅ Successfully created product in Square:', newItem?.id);
    
    return NextResponse.json({
      success: true,
      product: newItem
    });
    
  } catch (error) {
    console.error('❌ Error creating Square product:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create product in Square',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
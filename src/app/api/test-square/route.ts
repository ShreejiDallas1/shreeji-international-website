import { NextRequest, NextResponse } from 'next/server';
import { squareService } from '@/lib/square-simple';

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Testing Square connection...');
    
    // Test 1: Check configuration
    const config = {
      hasApplicationId: !!process.env.NEXT_PUBLIC_SQUARE_APPLICATION_ID,
      hasAccessToken: !!process.env.SQUARE_ACCESS_TOKEN,
      hasLocationId: !!process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID,
      environment: process.env.NEXT_PUBLIC_SQUARE_ENVIRONMENT,
    };
    
    console.log('📋 Square Config:', config);
    
    if (!config.hasApplicationId || !config.hasAccessToken || !config.hasLocationId) {
      return NextResponse.json({
        success: false,
        error: 'Missing Square configuration',
        config
      });
    }
    
    // Test 2: Try to fetch location info
    try {
      const locationResponse = await squareService.makeRequest(`/locations/${process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID}`, 'GET');
      console.log('📍 Location test successful:', locationResponse.location?.name);
    } catch (locationError) {
      console.error('❌ Location test failed:', locationError);
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch location info',
        details: locationError instanceof Error ? locationError.message : 'Unknown error'
      });
    }
    
    // Test 3: Try to fetch catalog items
    try {
      const catalogItems = await squareService.getCatalogItems();
      console.log(`📦 Catalog test successful: ${catalogItems.length} items found`);
      
      // Test 4: Try to fetch categories
      const categories = await squareService.getCategories();
      console.log(`📂 Categories test successful: ${categories.length} categories found`);
      
      return NextResponse.json({
        success: true,
        message: 'Square connection test successful',
        data: {
          config,
          catalogItemsCount: catalogItems.length,
          categoriesCount: categories.length,
          sampleItems: catalogItems.slice(0, 3).map((item: any) => ({
            id: item.id,
            name: item.item_data?.name,
            hasVariations: !!item.item_data?.variations?.length
          }))
        }
      });
      
    } catch (catalogError) {
      console.error('❌ Catalog test failed:', catalogError);
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch catalog items',
        details: catalogError instanceof Error ? catalogError.message : 'Unknown error'
      });
    }
    
  } catch (error) {
    console.error('❌ Square test failed:', error);
    return NextResponse.json({
      success: false,
      error: 'Square test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
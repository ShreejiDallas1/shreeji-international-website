import { NextRequest, NextResponse } from 'next/server';

// Using Square REST API directly for security

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Testing Square sync with correct location ID...');
    
    // Use the existing square service instead of the problematic SDK
    const baseUrl = process.env.SQUARE_ENVIRONMENT === 'production' 
      ? 'https://connect.squareup.com' 
      : 'https://connect.squareupsandbox.com';
    
    const headers = {
      'Authorization': `Bearer ${process.env.SQUARE_ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
      'Square-Version': '2023-10-18'
    };
    
    console.log('📍 Using Location ID:', process.env.SQUARE_LOCATION_ID);
    console.log('🌍 Environment:', process.env.SQUARE_ENVIRONMENT);
    
    // Search for all items using REST API
    const response = await fetch(`${baseUrl}/v2/catalog/search`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        object_types: ['ITEM'],
        query: {
          enabled_location_ids_filter: {
            location_ids: [process.env.SQUARE_LOCATION_ID!]
          }
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('❌ Square API error:', errorData);
      return NextResponse.json({
        success: false,
        error: 'Square API error',
        details: errorData
      });
    }

    const data = await response.json();
    
    if (data.errors) {
      console.error('❌ Square API errors:', data.errors);
      return NextResponse.json({
        success: false,
        error: 'Square API errors',
        details: data.errors
      });
    }

    const items = data.objects || [];
    console.log(`📦 Found ${items.length} items in Square`);
    
    // Process items for display
    const products = items.map((item: any) => {
      const itemData = item.item_data;
      const variations = itemData?.variations || [];
      const firstVariation = variations[0];
      const price = firstVariation?.item_variation_data?.price_money?.amount || 0;
      
      return {
        id: item.id,
        name: itemData?.name || 'Unnamed Product',
        description: itemData?.description || '',
        price: price / 100, // Convert cents to dollars
        category: itemData?.category_id || 'Uncategorized',
        imageUrl: itemData?.image_ids?.[0] || '',
        squareId: item.id,
        variations: variations.length
      };
    });

    return NextResponse.json({
      success: true,
      message: `Found ${products.length} products in Square`,
      locationId: process.env.SQUARE_LOCATION_ID,
      environment: process.env.SQUARE_ENVIRONMENT,
      products: products,
      rawItemsCount: items.length
    });

  } catch (error) {
    console.error('❌ Square sync test error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      locationId: process.env.SQUARE_LOCATION_ID,
      environment: process.env.SQUARE_ENVIRONMENT
    });
  }
}
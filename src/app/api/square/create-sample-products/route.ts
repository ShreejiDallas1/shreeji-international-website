import { NextRequest, NextResponse } from 'next/server';
import { squareService } from '@/lib/square-simple';

const sampleProducts = [
  {
    name: 'Premium Cotton T-Shirt',
    description: 'High-quality 100% cotton t-shirt with premium finish.',
    price: 2499, // $24.99 in cents
    sku: 'SHIRT-001',
    category: 'Apparel'
  },
  {
    name: 'Organic Turmeric Powder',
    description: 'Pure organic turmeric powder, 500g pack.',
    price: 1299, // $12.99 in cents
    sku: 'SPICE-001', 
    category: 'Spices'
  },
  {
    name: 'Handcrafted Wooden Bowl',
    description: 'Beautiful handcrafted wooden serving bowl.',
    price: 3499, // $34.99 in cents
    sku: 'WOOD-001',
    category: 'Home & Decor'
  },
  {
    name: 'Organic Basmati Rice',
    description: 'Premium long-grain basmati rice, 5kg bag.',
    price: 1899, // $18.99 in cents
    sku: 'RICE-001',
    category: 'Food'
  }
];

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Creating sample products in Square Catalog...');
    
    const results = [];
    
    for (const product of sampleProducts) {
      try {
        console.log(`Creating product: ${product.name}`);
        
        // Create the catalog item
        const catalogObject = {
          type: 'ITEM',
          id: `#${product.sku}`,
          item_data: {
            name: product.name,
            description: product.description,
            variations: [{
              type: 'ITEM_VARIATION',
              id: `#${product.sku}-VAR`,
              item_variation_data: {
                name: 'Regular',
                pricing_type: 'FIXED_PRICING',
                price_money: {
                  amount: product.price,
                  currency: 'USD'
                },
                sku: product.sku
              }
            }]
          }
        };
        
        const response = await squareService.makeRequest('/catalog/object', 'POST', {
          object: catalogObject
        });
        
        results.push({
          name: product.name,
          sku: product.sku,
          success: true,
          id: response.catalog_object?.id
        });
        
        console.log(`✅ Created: ${product.name}`);
        
      } catch (error) {
        console.error(`❌ Failed to create ${product.name}:`, error);
        results.push({
          name: product.name,
          sku: product.sku,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
    
    return NextResponse.json({
      success: true,
      message: `Created ${results.filter(r => r.success).length} out of ${sampleProducts.length} sample products`,
      results
    });
    
  } catch (error) {
    console.error('❌ Error creating sample products:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create sample products',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Use POST to create sample products',
    sampleProducts: sampleProducts.map(p => ({
      name: p.name,
      sku: p.sku,
      price: `$${(p.price / 100).toFixed(2)}`,
      category: p.category
    }))
  });
}
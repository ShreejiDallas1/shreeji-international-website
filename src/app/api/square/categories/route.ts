import { NextRequest, NextResponse } from 'next/server';
import { squareService } from '@/lib/square-simple';

export async function GET(request: NextRequest) {
  try {
    console.log('📂 Fetching categories from Square...');
    
    // Get categories from Square Catalog
    const squareCategories = await squareService.getCategories();
    console.log(`📂 Found ${squareCategories.length} categories in Square Catalog`);
    
    // Get products to calculate category counts
    const squareProducts = await squareService.getCatalogItems();
    console.log(`📦 Found ${squareProducts.length} products for category counting`);
    
    // Calculate product count for each category
    const categoryProductCounts: { [key: string]: number } = {};
    squareProducts.forEach(product => {
      const categoryId = product.item_data?.category_id;
      if (categoryId) {
        categoryProductCounts[categoryId] = (categoryProductCounts[categoryId] || 0) + 1;
      }
    });
    
    // Transform Square categories to our format with actual product counts
    const categories = squareCategories.map(category => ({
      id: category.id,
      name: category.category_data?.name || 'Unnamed Category',
      emoji: getCategoryEmoji(category.category_data?.name || ''),
      color: getCategoryColor(category.category_data?.name || ''),
      description: `Browse ${category.category_data?.name || 'products'} from our collection`,
      productCount: categoryProductCounts[category.id] || 0
    }));
    
    console.log('📊 Category counts:', categoryProductCounts);
    
    return NextResponse.json({
      success: true,
      categories,
      count: categories.length
    });
    
  } catch (error) {
    console.error('❌ Error fetching Square categories:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch categories from Square',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Helper function to get emoji for category
function getCategoryEmoji(categoryName: string): string {
  const name = categoryName.toLowerCase();
  
  if (name.includes('rice') || name.includes('grain')) return '🌾';
  if (name.includes('spice') || name.includes('masala')) return '🌶️';
  if (name.includes('lentil') || name.includes('dal') || name.includes('pulse')) return '🫘';
  if (name.includes('flour') || name.includes('atta')) return '🌾';
  if (name.includes('oil') || name.includes('ghee')) return '🫒';
  if (name.includes('snack') || name.includes('namkeen')) return '🍿';
  if (name.includes('sweet') || name.includes('mithai')) return '🍯';
  if (name.includes('tea') || name.includes('chai')) return '🍵';
  if (name.includes('pickle') || name.includes('achar')) return '🥒';
  if (name.includes('sauce') || name.includes('chutney')) return '🥫';
  if (name.includes('frozen')) return '🧊';
  if (name.includes('dairy') || name.includes('milk')) return '🥛';
  if (name.includes('vegetable') || name.includes('sabzi')) return '🥬';
  if (name.includes('fruit')) return '🍎';
  if (name.includes('bread') || name.includes('roti')) return '🫓';
  if (name.includes('beverage') || name.includes('drink')) return '🥤';
  
  return '🛒'; // Default emoji
}

// Helper function to get color for category
function getCategoryColor(categoryName: string): string {
  const name = categoryName.toLowerCase();
  
  if (name.includes('rice') || name.includes('grain')) return 'from-amber-500 to-yellow-600';
  if (name.includes('spice') || name.includes('masala')) return 'from-red-500 to-orange-600';
  if (name.includes('lentil') || name.includes('dal') || name.includes('pulse')) return 'from-orange-500 to-red-600';
  if (name.includes('flour') || name.includes('atta')) return 'from-yellow-500 to-amber-600';
  if (name.includes('oil') || name.includes('ghee')) return 'from-green-500 to-emerald-600';
  if (name.includes('snack') || name.includes('namkeen')) return 'from-purple-500 to-pink-600';
  if (name.includes('sweet') || name.includes('mithai')) return 'from-pink-500 to-rose-600';
  if (name.includes('tea') || name.includes('chai')) return 'from-brown-500 to-amber-600';
  if (name.includes('pickle') || name.includes('achar')) return 'from-lime-500 to-green-600';
  if (name.includes('sauce') || name.includes('chutney')) return 'from-red-500 to-pink-600';
  if (name.includes('frozen')) return 'from-blue-500 to-cyan-600';
  if (name.includes('dairy') || name.includes('milk')) return 'from-blue-500 to-indigo-600';
  if (name.includes('vegetable') || name.includes('sabzi')) return 'from-green-500 to-lime-600';
  if (name.includes('fruit')) return 'from-red-500 to-pink-600';
  if (name.includes('bread') || name.includes('roti')) return 'from-orange-500 to-yellow-600';
  if (name.includes('beverage') || name.includes('drink')) return 'from-blue-500 to-purple-600';
  
  return 'from-lime-500 to-green-600'; // Default color
}
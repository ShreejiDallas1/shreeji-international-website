import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, limit } from 'firebase/firestore';

export async function GET(request: NextRequest) {
  try {
    console.log('🔄 Fetching products from Firebase...');
    
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
    
    // Cache for 5 minutes, stale-while-revalidate for 10 minutes
    response.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
    
    // Removed resource tracking to prevent Firebase interference
    
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
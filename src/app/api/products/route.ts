import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, limit } from 'firebase/firestore';
import { trackFunction, trackRequest } from '@/lib/resource-monitor';
import { checkCircuitBreaker } from '@/lib/circuit-breaker';

export async function GET(request: NextRequest) {
  try {
    // Track function invocation for monitoring
    trackFunction();
    
    // Check circuit breaker for function invocations
    const breakerCheck = checkCircuitBreaker('FUNCTION_INVOCATIONS', 125); // Current usage
    if (breakerCheck.blocked) {
      return NextResponse.json(breakerCheck.response, { status: 503 });
    }
    
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
    
    // Track response size for monitoring
    const responseSize = JSON.stringify({ success: true, products, count: products.length }).length;
    trackRequest(responseSize);
    
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
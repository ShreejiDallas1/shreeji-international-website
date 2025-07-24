import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, limit } from 'firebase/firestore';

export async function GET() {
  try {
    console.log('🔍 Debug: Checking Firestore products...');
    
    // Get all products from Firestore
    const productsRef = collection(db, 'products');
    const q = query(productsRef, limit(10)); // Limit to 10 for debugging
    const querySnapshot = await getDocs(q);
    
    const products: any[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      products.push({
        id: doc.id,
        name: data.name,
        stock: data.stock,
        price: data.price,
        category: data.category,
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || 'No timestamp',
        createdAt: data.createdAt?.toDate?.()?.toISOString() || 'No timestamp'
      });
    });
    
    // Find product with ID "1" specifically
    const product1 = products.find(p => p.id === '1');
    
    console.log(`📊 Found ${products.length} products in Firestore`);
    if (product1) {
      console.log(`🎯 Product ID "1" in Firestore:`, product1);
    }
    
    return NextResponse.json({
      success: true,
      totalProducts: products.length,
      product1: product1 || null,
      allProducts: products,
      message: product1 ? `Product ID "1" has stock: ${product1.stock}` : 'Product ID "1" not found in Firestore'
    });
    
  } catch (error) {
    console.error('❌ Debug Firestore error:', error);
    return NextResponse.json({
      success: false,
      error: (error as Error).message
    }, { status: 500 });
  }
}
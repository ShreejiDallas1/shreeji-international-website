import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';

export async function POST(request: NextRequest) {
  try {
    console.log('🗑️ CLEARING ALL PRODUCTS AND CATEGORIES FROM FIRESTORE...');
    
    // Clear all products
    const productsRef = collection(db, 'products');
    const productsSnapshot = await getDocs(productsRef);
    
    let productCount = 0;
    for (const docSnapshot of productsSnapshot.docs) {
      await deleteDoc(doc(db, 'products', docSnapshot.id));
      productCount++;
    }
    
    // Clear all categories
    const categoriesRef = collection(db, 'categories');
    const categoriesSnapshot = await getDocs(categoriesRef);
    
    let categoryCount = 0;
    for (const docSnapshot of categoriesSnapshot.docs) {
      await deleteDoc(doc(db, 'categories', docSnapshot.id));
      categoryCount++;
    }
    
    console.log(`✅ CLEARED ${productCount} products and ${categoryCount} categories`);
    
    return NextResponse.json({
      success: true,
      message: `Cleared ${productCount} products and ${categoryCount} categories from Firestore`,
      productsDeleted: productCount,
      categoriesDeleted: categoryCount
    });
    
  } catch (error: any) {
    console.error('❌ Error clearing database:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to clear database',
        details: error.message
      },
      { status: 500 }
    );
  }
}
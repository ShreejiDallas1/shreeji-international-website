import { NextResponse } from 'next/server';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function GET() {
  try {
    // Get all products to see their categories
    const productsCollection = collection(db, 'products');
    const productsSnapshot = await getDocs(productsCollection);
    
    const products: any[] = [];
    const categories = new Set<string>();
    
    productsSnapshot.forEach((doc) => {
      const data = doc.data();
      products.push({
        id: doc.id,
        name: data.name,
        category: data.category
      });
      
      if (data.category) {
        categories.add(data.category);
      }
    });
    
    // Also get categories collection if it exists
    const categoriesCollection = collection(db, 'categories');
    const categoriesSnapshot = await getDocs(categoriesCollection);
    
    const dbCategories: any[] = [];
    categoriesSnapshot.forEach((doc) => {
      const data = doc.data();
      dbCategories.push({
        id: doc.id,
        name: data.name,
        slug: data.slug
      });
    });
    
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      products,
      uniqueCategories: Array.from(categories),
      dbCategories
    });
    
  } catch (error: any) {
    console.error('Error debugging categories:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: error.message || 'Unknown error'
      },
      { status: 500 }
    );
  }
}
import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';

export async function POST() {
  try {
    console.log('Clearing all products and categories from Firebase...');
    
    // Clear products
    const productsSnapshot = await getDocs(collection(db, 'products'));
    const productDeletePromises = productsSnapshot.docs.map(docSnapshot => 
      deleteDoc(doc(db, 'products', docSnapshot.id))
    );
    await Promise.all(productDeletePromises);
    console.log(`Deleted ${productsSnapshot.size} products`);
    
    // Clear categories
    const categoriesSnapshot = await getDocs(collection(db, 'categories'));
    const categoryDeletePromises = categoriesSnapshot.docs.map(docSnapshot => 
      deleteDoc(doc(db, 'categories', docSnapshot.id))
    );
    await Promise.all(categoryDeletePromises);
    console.log(`Deleted ${categoriesSnapshot.size} categories`);
    
    return NextResponse.json({ 
      success: true, 
      message: `Cleared ${productsSnapshot.size} products and ${categoriesSnapshot.size} categories` 
    });
  } catch (error) {
    console.error('Error clearing database:', error);
    return NextResponse.json({ 
      success: false, 
      error: (error as Error).message 
    }, { status: 500 });
  }
}
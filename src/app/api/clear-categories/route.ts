import { NextRequest, NextResponse } from 'next/server';
import { collection, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function POST(request: NextRequest) {
  try {
    // Get all categories
    const categoriesRef = collection(db, 'categories');
    const categoriesSnapshot = await getDocs(categoriesRef);
    
    // Delete all categories
    const deletePromises = categoriesSnapshot.docs.map(doc => 
      deleteDoc(doc.ref)
    );
    
    await Promise.all(deletePromises);

    return NextResponse.json({ 
      success: true, 
      message: `Cleared ${categoriesSnapshot.docs.length} categories`
    });

  } catch (error) {
    console.error('Error clearing categories:', error);
    return NextResponse.json({ 
      error: 'Failed to clear categories',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ message: 'Use POST to clear categories' });
}
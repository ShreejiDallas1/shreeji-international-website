import { NextResponse } from 'next/server';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function GET() {
  try {
    const productsCollection = collection(db, 'products');
    const productsSnapshot = await getDocs(productsCollection);
    
    const products: any[] = [];
    
    productsSnapshot.forEach((doc) => {
      const data = doc.data();
      products.push({
        id: doc.id,
        name: data.name,
        image: data.image,
        imageUrl: data.imageUrl,
        hasImage: !!(data.image || data.imageUrl),
        imageLength: (data.image || '').length,
        rawData: {
          image: data.image,
          imageUrl: data.imageUrl
        }
      });
    });
    
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      products,
      totalProducts: products.length
    });
    
  } catch (error: any) {
    console.error('Error debugging products:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: error.message || 'Unknown error'
      },
      { status: 500 }
    );
  }
}
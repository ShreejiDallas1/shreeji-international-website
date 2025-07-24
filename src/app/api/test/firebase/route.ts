import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, limit, addDoc, doc, setDoc, deleteDoc } from 'firebase/firestore';

// This is a server-side API route that will test Firebase connection and permissions
export async function GET() {
  try {
    // Test Firebase connection by fetching a small amount of data
    const productsRef = collection(db, 'products');
    const q = query(productsRef, limit(1));
    const snapshot = await getDocs(q);
    
    // Test write permission by adding a test document
    const testDocRef = doc(collection(db, 'test'), 'test-permissions');
    await setDoc(testDocRef, {
      test: true,
      timestamp: new Date().toISOString()
    });
    
    // Delete the test document
    await deleteDoc(testDocRef);
    
    const testData = {
      connected: true,
      timestamp: new Date().toISOString(),
      documentCount: snapshot.size,
      permissions: {
        read: true,
        write: true
      },
      sampleData: snapshot.empty ? null : {
        id: snapshot.docs[0].id,
        exists: snapshot.docs[0].exists(),
      }
    };
    
    return NextResponse.json(testData);
  } catch (error: any) {
    console.error('Error testing Firebase connection:', error);
    
    return NextResponse.json(
      { 
        connected: false,
        error: error.message || 'Unknown error',
        code: error.code,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
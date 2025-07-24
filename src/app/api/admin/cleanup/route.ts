import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';

export async function DELETE(request: NextRequest) {
  try {
    console.log('🧹 Starting admin cleanup...');
    
    // Get all orders
    const ordersRef = collection(db, 'orders');
    const querySnapshot = await getDocs(ordersRef);
    
    let deletedCount = 0;
    const deletePromises = [];
    
    for (const orderDoc of querySnapshot.docs) {
      const orderData = orderDoc.data();
      console.log(`🗑️ Deleting order: ${orderDoc.id}`, orderData);
      
      deletePromises.push(deleteDoc(doc(db, 'orders', orderDoc.id)));
      deletedCount++;
    }
    
    // Wait for all deletions to complete
    await Promise.all(deletePromises);
    
    console.log(`✅ Successfully deleted ${deletedCount} orders`);
    
    return NextResponse.json({
      success: true,
      message: `Successfully deleted ${deletedCount} orders`,
      deletedCount
    });
    
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Cleanup failed'
      },
      { status: 500 }
    );
  }
}
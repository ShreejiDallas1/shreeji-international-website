import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';

export const dynamic = 'force-dynamic';

export async function DELETE(request: NextRequest) {
  try {
    console.log('🗑️ Clearing all orders from Firestore...');

    // Get all orders
    const ordersRef = collection(db, 'orders');
    const querySnapshot = await getDocs(ordersRef);

    // Delete each order
    const deletePromises = querySnapshot.docs.map(orderDoc =>
      deleteDoc(doc(db, 'orders', orderDoc.id))
    );

    await Promise.all(deletePromises);

    console.log(`✅ Deleted ${querySnapshot.docs.length} orders`);

    return NextResponse.json({
      success: true,
      message: `Successfully deleted ${querySnapshot.docs.length} orders`,
      deletedCount: querySnapshot.docs.length
    });

  } catch (error) {
    console.error('❌ Error clearing orders:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to clear orders'
    }, { status: 500 });
  }
}
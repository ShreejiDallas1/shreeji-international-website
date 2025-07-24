import { NextRequest, NextResponse } from 'next/server';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function POST(request: NextRequest) {
  try {
    const { confirm } = await request.json();
    
    if (!confirm) {
      return NextResponse.json({ error: 'Confirmation required' }, { status: 400 });
    }

    console.log('🧹 Starting order cleanup...');

    // Get all orders
    const ordersRef = collection(db, 'orders');
    const querySnapshot = await getDocs(ordersRef);
    
    const deletedOrders = [];
    
    // Delete all orders
    for (const orderDoc of querySnapshot.docs) {
      const orderData = orderDoc.data();
      console.log(`🗑️ Deleting order: ${orderDoc.id} (Status: ${orderData.status})`);
      
      await deleteDoc(doc(db, 'orders', orderDoc.id));
      deletedOrders.push({
        id: orderDoc.id,
        status: orderData.status,
        total: orderData.total
      });
    }

    console.log(`✅ Cleanup complete! Deleted ${deletedOrders.length} orders`);

    return NextResponse.json({
      success: true,
      message: `Successfully deleted ${deletedOrders.length} orders`,
      deletedOrders
    });

  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    return NextResponse.json(
      { error: 'Failed to cleanup orders', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Get all orders for preview
    const ordersRef = collection(db, 'orders');
    const querySnapshot = await getDocs(ordersRef);
    
    const orders: any[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      orders.push({
        id: doc.id,
        status: data.status,
        total: data.total,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : 'Unknown',
        userId: data.userId
      });
    });

    return NextResponse.json({
      success: true,
      totalOrders: orders.length,
      orders
    });

  } catch (error) {
    console.error('❌ Error fetching orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
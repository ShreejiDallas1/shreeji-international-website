import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, query, where, orderBy, getDocs, doc, getDoc, updateDoc, addDoc, serverTimestamp } from 'firebase/firestore';

// Get user orders
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }
    
    console.log('📋 Fetching orders for user:', userId);
    
    // Query orders for the user
    const ordersRef = collection(db, 'orders');
    const q = query(
      ordersRef,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const orders = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || doc.data().createdAt
    }));
    
    console.log(`✅ Found ${orders.length} orders for user`);
    
    return NextResponse.json({
      success: true,
      orders,
      count: orders.length
    });
    
  } catch (error) {
    console.error('❌ Error fetching orders:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch orders'
      },
      { status: 500 }
    );
  }
}

// Create new order
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, items, shipping, total, shippingAddress, paymentMethod } = body;
    
    if (!userId || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid order data' },
        { status: 400 }
      );
    }
    
    console.log('🛒 Creating new order for user:', userId);
    
    // Calculate totals safely
    const subtotal = items.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 0)), 0);
    const shippingCost = shipping || 0;
    const tax = subtotal * 0.08; // 8% tax
    const orderTotal = subtotal + shippingCost + tax;
    
    // Create order object
    const orderData = {
      userId,
      items: items.map(item => ({
        id: item.id,
        name: item.name || 'Unknown Product',
        price: item.price || 0,
        quantity: item.quantity || 1,
        image: item.image || '/images/placeholder.svg'
      })),
      subtotal: Number(subtotal.toFixed(2)),
      shipping: Number(shippingCost.toFixed(2)),
      tax: Number(tax.toFixed(2)),
      total: Number(orderTotal.toFixed(2)),
      status: 'pending',
      shippingAddress: shippingAddress || {},
      paymentMethod: paymentMethod || 'pending',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    // Save to Firestore
    const docRef = await addDoc(collection(db, 'orders'), orderData);
    
    console.log('✅ Order created successfully:', docRef.id);
    
    return NextResponse.json({
      success: true,
      orderId: docRef.id,
      order: {
        id: docRef.id,
        ...orderData,
        createdAt: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('❌ Error creating order:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to create order'
      },
      { status: 500 }
    );
  }
}
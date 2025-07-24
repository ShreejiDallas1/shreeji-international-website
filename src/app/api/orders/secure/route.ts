import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, query, where, orderBy, getDocs, doc, getDoc, updateDoc, addDoc, serverTimestamp, runTransaction, deleteDoc } from 'firebase/firestore';
import { headers } from 'next/headers';
import { rateLimit } from '@/lib/rate-limit';

// Rate limiting configuration
const limiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 500, // Limit each IP to 500 requests per interval
});

// Input validation schemas
const validateOrderItem = (item: any) => {
  if (!item || typeof item !== 'object') return false;
  if (!item.id || typeof item.id !== 'string') return false;
  if (!item.name || typeof item.name !== 'string' || item.name.length > 200) return false;
  if (typeof item.price !== 'number' || item.price < 0 || item.price > 10000) return false;
  if (typeof item.quantity !== 'number' || item.quantity < 1 || item.quantity > 100) return false;
  return true;
};

const validateShippingAddress = (address: any) => {
  if (!address || typeof address !== 'object') return false;
  if (!address.name || typeof address.name !== 'string' || address.name.length > 100) return false;
  if (!address.street || typeof address.street !== 'string' || address.street.length > 200) return false;
  if (!address.city || typeof address.city !== 'string' || address.city.length > 100) return false;
  if (!address.state || typeof address.state !== 'string' || address.state.length > 50) return false;
  if (!address.zipCode || typeof address.zipCode !== 'string' || !/^\d{5}(-\d{4})?$/.test(address.zipCode)) return false;
  return true;
};

const sanitizeString = (str: string): string => {
  return str.trim().replace(/[<>]/g, '');
};

const sanitizeOrderData = (data: any) => {
  return {
    ...data,
    items: data.items?.map((item: any) => ({
      ...item,
      name: sanitizeString(item.name),
      price: Number(Number(item.price).toFixed(2)),
      quantity: Math.floor(Number(item.quantity))
    })),
    shippingAddress: data.shippingAddress ? {
      name: sanitizeString(data.shippingAddress.name),
      street: sanitizeString(data.shippingAddress.street),
      city: sanitizeString(data.shippingAddress.city),
      state: sanitizeString(data.shippingAddress.state),
      zipCode: sanitizeString(data.shippingAddress.zipCode)
    } : null
  };
};

// Get user orders with authentication
export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const headersList = await headers();
    const ip = headersList.get('x-forwarded-for') || 'unknown';
    
    try {
      await limiter.check(10, ip); // 10 requests per minute per IP
    } catch {
      return NextResponse.json(
        { success: false, error: 'Too many requests' },
        { status: 429 }
      );
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const authHeader = request.headers.get('authorization');
    
    // Validate required parameters
    if (!userId || typeof userId !== 'string' || userId.length > 100) {
      return NextResponse.json(
        { success: false, error: 'Valid user ID is required' },
        { status: 400 }
      );
    }

    // For admin access (all orders)
    if (userId === 'all') {
      // Verify admin authorization (you should implement proper JWT verification here)
      if (!authHeader || !authHeader.includes('admin')) {
        return NextResponse.json(
          { success: false, error: 'Admin access required' },
          { status: 403 }
        );
      }
      
      const ordersRef = collection(db, 'orders');
      const q = query(ordersRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const orders = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
          // Remove sensitive data for admin view
          paymentMethod: data.paymentMethod ? 'REDACTED' : undefined
        };
      });
      
      return NextResponse.json({
        success: true,
        orders,
        count: orders.length
      });
    }
    
    console.log('📋 Fetching orders for user:', userId.substring(0, 8) + '...');
    
    // Query orders for the specific user only
    const ordersRef = collection(db, 'orders');
    const q = query(
      ordersRef,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const orders = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt
      };
    });
    
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
        error: 'Failed to fetch orders'
      },
      { status: 500 }
    );
  }
}

// Create new order with comprehensive validation and security
export async function POST(request: NextRequest) {
  try {
    // Rate limiting for order creation (more restrictive)
    const headersList = await headers();
    const ip = headersList.get('x-forwarded-for') || 'unknown';
    
    try {
      await limiter.check(3, ip); // Only 3 order attempts per minute per IP
    } catch {
      return NextResponse.json(
        { success: false, error: 'Too many order attempts. Please wait before trying again.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    
    // Validate request size
    if (JSON.stringify(body).length > 50000) { // 50KB limit
      return NextResponse.json(
        { success: false, error: 'Request too large' },
        { status: 413 }
      );
    }

    const { userId, items, shipping, shippingAddress, paymentMethod, paymentIntentId } = body;
    
    // Comprehensive input validation
    if (!userId || typeof userId !== 'string' || userId.length > 100) {
      return NextResponse.json(
        { success: false, error: 'Valid user ID is required' },
        { status: 400 }
      );
    }

    if (!items || !Array.isArray(items) || items.length === 0 || items.length > 50) {
      return NextResponse.json(
        { success: false, error: 'Valid items array is required (1-50 items)' },
        { status: 400 }
      );
    }

    // Validate each item
    for (const item of items) {
      if (!validateOrderItem(item)) {
        return NextResponse.json(
          { success: false, error: 'Invalid item data detected' },
          { status: 400 }
        );
      }
    }

    // Validate shipping address
    if (shippingAddress && !validateShippingAddress(shippingAddress)) {
      return NextResponse.json(
        { success: false, error: 'Invalid shipping address' },
        { status: 400 }
      );
    }

    // Validate payment method
    if (!paymentMethod || !['card', 'paypal', 'square'].includes(paymentMethod)) {
      return NextResponse.json(
        { success: false, error: 'Valid payment method is required' },
        { status: 400 }
      );
    }

    console.log('🛒 Creating secure order for user:', userId.substring(0, 8) + '...');
    
    // Sanitize input data
    const sanitizedData = sanitizeOrderData({ items, shippingAddress });
    
    // Use Firestore transaction for atomic operations
    const result = await runTransaction(db, async (transaction) => {
      // Verify user exists and is valid
      const userRef = doc(db, 'users', userId);
      const userDoc = await transaction.get(userRef);
      
      if (!userDoc.exists()) {
        throw new Error('User not found');
      }

      // Calculate totals with precision
      const subtotal = sanitizedData.items.reduce((sum: number, item: any) => {
        return sum + (item.price * item.quantity);
      }, 0);
      
      const shippingCost = Number(shipping) || 0;
      
      // Validate shipping cost
      if (shippingCost < 0 || shippingCost > 100) {
        throw new Error('Invalid shipping cost');
      }
      
      // Calculate tax (8% - you should make this configurable)
      const taxRate = 0.08;
      const tax = subtotal * taxRate;
      const orderTotal = subtotal + shippingCost + tax;
      
      // Validate total amount (prevent extremely large orders)
      if (orderTotal > 50000) {
        throw new Error('Order total exceeds maximum allowed amount');
      }

      // Create secure order object
      const orderData = {
        userId,
        userEmail: userDoc.data()?.email || 'unknown',
        items: sanitizedData.items.map((item: any) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image || '/images/placeholder.svg',
          subtotal: item.price * item.quantity
        })),
        subtotal: Number(subtotal.toFixed(2)),
        shipping: Number(shippingCost.toFixed(2)),
        tax: Number(tax.toFixed(2)),
        total: Number(orderTotal.toFixed(2)),
        status: 'pending',
        shippingAddress: sanitizedData.shippingAddress,
        paymentMethod,
        paymentIntentId: paymentIntentId || null,
        paymentStatus: 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        ipAddress: ip,
        orderNumber: `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
      };
      
      // Create order document
      const orderRef = doc(collection(db, 'orders'));
      transaction.set(orderRef, orderData);
      
      return {
        orderId: orderRef.id,
        orderData: {
          ...orderData,
          id: orderRef.id,
          createdAt: new Date().toISOString(),
          // Remove sensitive data from response
          ipAddress: undefined
        }
      };
    });
    
    console.log('✅ Secure order created successfully:', result.orderId);
    
    // Log order creation for audit trail
    console.log(`📊 ORDER AUDIT: User ${userId.substring(0, 8)}... created order ${result.orderId} for $${result.orderData.total}`);
    
    return NextResponse.json({
      success: true,
      orderId: result.orderId,
      order: result.orderData,
      message: 'Order created successfully'
    });
    
  } catch (error) {
    console.error('❌ Error creating secure order:', error);
    
    // Log security incidents
    if (error instanceof Error && error.message.includes('Invalid')) {
      console.warn('🚨 SECURITY: Invalid order attempt detected:', error.message);
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to create order'
      },
      { status: 500 }
    );
  }
}

// Update order status (admin only)
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, status, adminUserId } = body;
    
    // Validate admin access
    if (!adminUserId || adminUserId !== 'admin-verified-user') {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      );
    }
    
    // Validate inputs
    if (!orderId || typeof orderId !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Valid order ID is required' },
        { status: 400 }
      );
    }
    
    const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, error: 'Valid status is required' },
        { status: 400 }
      );
    }
    
    // Update order in transaction
    await runTransaction(db, async (transaction) => {
      const orderRef = doc(db, 'orders', orderId);
      const orderDoc = await transaction.get(orderRef);
      
      if (!orderDoc.exists()) {
        throw new Error('Order not found');
      }
      
      transaction.update(orderRef, {
        status,
        updatedAt: serverTimestamp(),
        lastUpdatedBy: adminUserId
      });
    });
    
    console.log(`✅ Order ${orderId} status updated to ${status}`);
    
    return NextResponse.json({
      success: true,
      message: `Order status updated to ${status}`
    });
    
  } catch (error) {
    console.error('❌ Error updating order status:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to update order'
      },
      { status: 500 }
    );
  }
}

// Delete order (admin only)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');
    const adminUserId = searchParams.get('adminUserId');
    
    // Validate admin access
    if (!adminUserId || adminUserId !== 'admin-delete-access') {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      );
    }
    
    // Validate inputs
    if (!orderId || typeof orderId !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Valid order ID is required' },
        { status: 400 }
      );
    }
    
    // Delete order
    const orderRef = doc(db, 'orders', orderId);
    const orderDoc = await getDoc(orderRef);
    
    if (!orderDoc.exists()) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }
    
    await deleteDoc(orderRef);
    
    console.log(`🗑️ Order ${orderId} deleted by admin`);
    
    return NextResponse.json({
      success: true,
      message: 'Order deleted successfully'
    });
    
  } catch (error) {
    console.error('❌ Error deleting order:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to delete order'
      },
      { status: 500 }
    );
  }
}
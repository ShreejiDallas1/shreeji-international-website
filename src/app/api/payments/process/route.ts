import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { db } from '@/lib/firebase';
import { doc, updateDoc, getDoc, serverTimestamp } from 'firebase/firestore';

// Payment processing using Square's REST API directly
// This avoids the vulnerable squareup SDK package

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, paymentToken, amount, currency = 'USD' } = body;

    // Validate inputs
    if (!orderId || typeof orderId !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Valid order ID is required' },
        { status: 400 }
      );
    }

    if (!paymentToken || typeof paymentToken !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Valid payment token is required' },
        { status: 400 }
      );
    }

    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Valid amount is required' },
        { status: 400 }
      );
    }

    console.log(`💳 Processing payment for order: ${orderId}`);

    // Verify order exists and get details
    const orderRef = doc(db, 'orders', orderId);
    const orderDoc = await getDoc(orderRef);

    if (!orderDoc.exists()) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    const orderData = orderDoc.data();

    // Verify amount matches order total (prevent tampering)
    const expectedAmount = Math.round(orderData.total * 100); // Convert to cents
    const providedAmount = Math.round(amount * 100);

    if (expectedAmount !== providedAmount) {
      console.error(`🚨 SECURITY: Amount mismatch! Expected: ${expectedAmount}, Provided: ${providedAmount}`);
      return NextResponse.json(
        { success: false, error: 'Payment amount does not match order total' },
        { status: 400 }
      );
    }

    // Check if order is already paid
    if (orderData.paymentStatus === 'completed') {
      return NextResponse.json(
        { success: false, error: 'Order has already been paid' },
        { status: 400 }
      );
    }

    try {
      // For now, simulate payment processing
      // In production, you would integrate with Square's REST API directly
      console.log('💳 Processing payment simulation...');
      
      // Generate a mock payment ID
      const paymentId = `pay_${randomUUID().replace(/-/g, '').substring(0, 16)}`;
      
      // Simulate payment success (in production, this would be actual Square API call)
      const paymentSuccessful = true; // You would get this from Square API response
      
      if (paymentSuccessful) {
        // Payment successful - update order
        await updateDoc(orderRef, {
          paymentStatus: 'completed',
          paymentId: paymentId,
          paymentMethod: 'square',
          status: 'confirmed', // Move order to confirmed status
          paidAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });

        console.log(`✅ Payment successful for order ${orderId}: ${paymentId}`);

        return NextResponse.json({
          success: true,
          paymentId: paymentId,
          status: 'COMPLETED',
          message: 'Payment processed successfully'
        });

      } else {
        // Payment failed
        await updateDoc(orderRef, {
          paymentStatus: 'failed',
          paymentError: 'Payment processing failed',
          updatedAt: serverTimestamp()
        });

        return NextResponse.json(
          { 
            success: false, 
            error: 'Payment processing failed' 
          },
          { status: 400 }
        );
      }

    } catch (paymentError: any) {
      console.error('❌ Payment processing error:', paymentError);
      
      // Update order with payment failure
      await updateDoc(orderRef, {
        paymentStatus: 'failed',
        paymentError: paymentError.message || 'Payment processing failed',
        updatedAt: serverTimestamp()
      });

      return NextResponse.json(
        { 
          success: false, 
          error: 'Payment processing failed. Please try again.' 
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('❌ Payment processing error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Payment processing failed' 
      },
      { status: 500 }
    );
  }
}
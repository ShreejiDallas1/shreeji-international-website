import { NextRequest, NextResponse } from 'next/server';
import { squareService } from '@/lib/square-simple';
import { randomUUID } from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const { sourceId, amount, orderId, billingContact, shippingContact } = await request.json();

    console.log('🔄 Processing Square payment:', { amount, orderId });

    if (!sourceId || !amount) {
      return NextResponse.json(
        { success: false, error: 'Missing required payment fields' },
        { status: 400 }
      );
    }

    // Create payment request
    const paymentRequest = {
      source_id: sourceId,
      amount_money: {
        amount: Math.round(amount * 100), // Convert to cents
        currency: 'USD',
      },
      idempotency_key: randomUUID(),
      location_id: process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID,
      note: `Payment for order ${orderId || 'N/A'}`,
      billing_address: billingContact ? {
        address_line_1: billingContact.street,
        locality: billingContact.city,
        administrative_district_level_1: billingContact.state,
        postal_code: billingContact.zipCode,
        country: billingContact.country || 'US',
      } : undefined,
      shipping_address: shippingContact ? {
        address_line_1: shippingContact.street,
        locality: shippingContact.city,
        administrative_district_level_1: shippingContact.state,
        postal_code: shippingContact.zipCode,
        country: shippingContact.country || 'US',
      } : undefined,
    };

    // Process payment with Square using our simple service
    const response = await squareService.makeRequest('/payments', 'POST', paymentRequest);

    if (response.payment) {
      const payment = response.payment;
      
      console.log('✅ Payment successful:', payment.id);
      
      return NextResponse.json({
        success: true,
        paymentId: payment.id,
        status: payment.status,
        receiptUrl: payment.receipt_url,
        amount: payment.amount_money?.amount,
        currency: payment.amount_money?.currency,
        createdAt: payment.created_at,
        orderId: orderId,
      });
    } else {
      console.error('❌ Payment failed:', response);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Payment processing failed',
          details: response.errors || 'Unknown error'
        },
        { status: 400 }
      );
    }

  } catch (error: any) {
    console.error('❌ Square payment error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Payment processing failed',
        details: error.message || 'Unknown error'
      },
      { status: 500 }
    );
  }
}
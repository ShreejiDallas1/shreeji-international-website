import { NextRequest, NextResponse } from 'next/server';
import { squareService } from '@/lib/square-simple';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sourceId, amount, currency, locationId, idempotencyKey } = body;

    console.log('💳 Processing Square payment:', {
      amount,
      currency,
      locationId: locationId?.substring(0, 8) + '...',
      idempotencyKey
    });

    // Validate required fields
    if (!sourceId || !amount || !locationId || !idempotencyKey) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required payment parameters' 
        },
        { status: 400 }
      );
    }

    // Process payment with Square
    const payment = await squareService.processPayment({
      sourceId,
      amount,
      currency: currency || 'USD',
      idempotencyKey,
    });

    console.log('✅ Payment processed successfully:', payment?.id);

    return NextResponse.json({
      success: true,
      payment: {
        id: payment?.id,
        status: payment?.status,
        amountMoney: payment?.amount_money,
        createdAt: payment?.created_at,
        updatedAt: payment?.updated_at,
      }
    });

  } catch (error) {
    console.error('❌ Square payment processing error:', error);
    
    // Handle specific Square API errors
    let errorMessage = 'Payment processing failed';
    let statusCode = 500;
    
    if (error && typeof error === 'object' && 'errors' in error) {
      const squareErrors = (error as any).errors;
      if (squareErrors && squareErrors.length > 0) {
        errorMessage = squareErrors[0].detail || squareErrors[0].code || errorMessage;
        
        // Handle specific error codes
        if (squareErrors[0].code === 'CARD_DECLINED') {
          statusCode = 402;
          errorMessage = 'Your card was declined. Please try a different card.';
        } else if (squareErrors[0].code === 'CVV_FAILURE') {
          statusCode = 400;
          errorMessage = 'Invalid CVV. Please check your card information.';
        } else if (squareErrors[0].code === 'ADDRESS_VERIFICATION_FAILURE') {
          statusCode = 400;
          errorMessage = 'Address verification failed. Please check your billing address.';
        }
      }
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }

    return NextResponse.json(
      { 
        success: false, 
        error: errorMessage,
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: statusCode }
    );
  }
}
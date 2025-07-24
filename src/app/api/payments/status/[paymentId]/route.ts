import { NextRequest, NextResponse } from 'next/server';
import { squareService } from '@/lib/square-simple';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ paymentId: string }> }
) {
  try {
    const { paymentId } = await params;

    if (!paymentId) {
      return NextResponse.json(
        { success: false, error: 'Payment ID is required' },
        { status: 400 }
      );
    }

    console.log('🔍 Checking payment status:', paymentId);

    // Get payment details from Square
    const response = await squareService.makeRequest(`/payments/${paymentId}`, 'GET');

    if (response.payment) {
      const payment = response.payment;
      
      return NextResponse.json({
        success: true,
        payment: {
          id: payment.id,
          status: payment.status,
          amount: payment.amount_money?.amount ? payment.amount_money.amount / 100 : 0,
          currency: payment.amount_money?.currency || 'USD',
          sourceType: payment.source_type,
          orderId: payment.reference_id,
          receiptUrl: payment.receipt_url,
          receiptNumber: payment.receipt_number,
          createdAt: payment.created_at,
          updatedAt: payment.updated_at,
          cardDetails: payment.card_details ? {
            brand: payment.card_details.card?.card_brand,
            last4: payment.card_details.card?.last_4,
            expMonth: payment.card_details.card?.exp_month,
            expYear: payment.card_details.card?.exp_year,
            cardholderName: payment.card_details.card?.cardholder_name,
            entryMethod: payment.card_details.entry_method,
            cvvStatus: payment.card_details.cvv_status,
            avsStatus: payment.card_details.avs_status
          } : null,
          processingFee: payment.processing_fee ? 
            payment.processing_fee.map((fee: any) => ({
              amount: fee.amount_money?.amount ? fee.amount_money.amount / 100 : 0,
              currency: fee.amount_money?.currency,
              type: fee.type
            })) : []
        }
      });
    } else {
      return NextResponse.json(
        { success: false, error: 'Payment not found' },
        { status: 404 }
      );
    }

  } catch (error: any) {
    console.error('❌ Error checking payment status:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to check payment status',
        details: error.message
      },
      { status: 500 }
    );
  }
}
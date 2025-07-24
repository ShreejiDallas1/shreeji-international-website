'use client';

import { useEffect, useRef, useState } from 'react';

interface SquarePaymentFormProps {
  amount: number;
  orderId?: string;
  billingContact?: any;
  shippingContact?: any;
  onPaymentSuccessAction: (result: any) => void;
  onPaymentErrorAction: (error: any) => void;
  isLoading?: boolean;
}

// Proper Square Web SDK interface
interface SquareWebSDK {
  payments: (appId: string, locationId: string) => Promise<{
    card: () => Promise<any>;
  }>;
}

declare global {
  interface Window {
    Square?: SquareWebSDK;
  }
}

export default function SquarePaymentForm({ 
  amount, 
  orderId,
  billingContact,
  shippingContact,
  onPaymentSuccessAction, 
  onPaymentErrorAction,
  isLoading = false
}: SquarePaymentFormProps) {
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [payments, setPayments] = useState<any>(null);
  const [card, setCard] = useState<any>(null);
  const cardContainerRef = useRef<HTMLDivElement>(null);

  // Load Square Web SDK
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://sandbox.web.squarecdn.com/v1/square.js'; // Use sandbox for now
    script.async = true;
    script.onload = () => {
      console.log('✅ Square SDK loaded');
      setIsSDKLoaded(true);
    };
    script.onerror = () => {
      console.error('❌ Failed to load Square SDK');
      onPaymentErrorAction({ message: 'Failed to load payment processor' });
    };
    
    document.body.appendChild(script);
    
    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, [onPaymentErrorAction]);

  // Initialize Square Payments
  useEffect(() => {
    const initializeSquare = async () => {
      if (!isSDKLoaded || !window.Square) {
        return;
      }

      try {
        const appId = process.env.NEXT_PUBLIC_SQUARE_APPLICATION_ID;
        const locationId = process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID;

        if (!appId || !locationId) {
          throw new Error('Square credentials not configured');
        }

        console.log('🔧 Initializing Square payments...');
        const paymentsInstance = await window.Square.payments(appId, locationId);
        setPayments(paymentsInstance);

        // Initialize card payment method
        const cardInstance = await paymentsInstance.card();
        await cardInstance.attach('#card-container');
        setCard(cardInstance);

        console.log('✅ Square payment form initialized');
      } catch (error) {
        console.error('❌ Square initialization error:', error);
        onPaymentErrorAction({ message: 'Payment form initialization failed' });
      }
    };

    initializeSquare();
  }, [isSDKLoaded, onPaymentErrorAction]);

  const handlePayment = async () => {
    if (!card || !payments || isProcessing) {
      return;
    }

    setIsProcessing(true);

    try {
      console.log('💳 Processing payment...');
      
      // Tokenize the card
      const tokenResult = await card.tokenize();
      
      if (tokenResult.status === 'OK') {
        const token = tokenResult.token;
        
        // Process payment with our API
        const response = await fetch('/api/payments/square', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sourceId: token,
            amount: amount,
            orderId: orderId,
            billingContact: billingContact,
            shippingContact: shippingContact,
          }),
        });

        const result = await response.json();

        if (result.success) {
          console.log('✅ Payment successful');
          onPaymentSuccessAction(result);
        } else {
          console.error('❌ Payment failed:', result.error);
          onPaymentErrorAction({ message: result.error || 'Payment failed' });
        }
      } else {
        console.error('❌ Card tokenization failed:', tokenResult.errors);
        onPaymentErrorAction({ 
          message: 'Invalid card information',
          details: tokenResult.errors 
        });
      }
    } catch (error: any) {
      console.error('❌ Payment processing error:', error);
      onPaymentErrorAction({ 
        message: 'Payment processing failed',
        details: error.message 
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isSDKLoaded) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-lime-500"></div>
        <span className="ml-2 text-gray-600">Loading payment form...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">
          Payment Information
        </h3>
        
        {/* Square Card Container */}
        <div 
          id="card-container" 
          ref={cardContainerRef}
          className="min-h-[100px] p-4 border border-gray-300 rounded-md bg-white"
        >
          {/* Square will inject the card form here */}
        </div>
        
        <div className="mt-4 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            Total: <span className="font-semibold text-lg">${amount.toFixed(2)}</span>
          </div>
          
          <button
            onClick={handlePayment}
            disabled={!card || isProcessing || isLoading}
            className={`px-6 py-3 rounded-md font-medium transition-colors ${
              !card || isProcessing || isLoading
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-lime-600 hover:bg-lime-700 text-white'
            }`}
          >
            {isProcessing ? (
              <span className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Processing...
              </span>
            ) : (
              `Pay $${amount.toFixed(2)}`
            )}
          </button>
        </div>
      </div>
      
      <div className="text-xs text-gray-500 text-center">
        💳 Secure payment powered by Square
      </div>
    </div>
  );
}
'use client';

import { FiCreditCard, FiDollarSign, FiSmartphone } from 'react-icons/fi';

interface PaymentMethodsProps {
  selectedMethod: string;
  onMethodChange: (method: string) => void;
}

export default function PaymentMethods({ selectedMethod, onMethodChange }: PaymentMethodsProps) {
  const paymentMethods = [
    {
      id: 'credit_card',
      name: 'Credit Card',
      description: 'Visa, Mastercard, American Express',
      icon: FiCreditCard,
      enabled: true
    },
    {
      id: 'paypal',
      name: 'PayPal',
      description: 'Pay with your PayPal account',
      icon: FiDollarSign,
      enabled: false // Can be enabled later
    },
    {
      id: 'apple_pay',
      name: 'Apple Pay',
      description: 'Pay with Touch ID or Face ID',
      icon: FiSmartphone,
      enabled: false // Can be enabled later
    }
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Payment Method</h3>
      
      <div className="grid gap-3">
        {paymentMethods.map((method) => {
          const IconComponent = method.icon;
          return (
            <label
              key={method.id}
              className={`relative flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                selectedMethod === method.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              } ${!method.enabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <input
                type="radio"
                name="payment_method"
                value={method.id}
                checked={selectedMethod === method.id}
                onChange={(e) => method.enabled && onMethodChange(e.target.value)}
                disabled={!method.enabled}
                className="sr-only"
              />
              
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-full ${
                  selectedMethod === method.id ? 'bg-blue-100' : 'bg-gray-100'
                }`}>
                  <IconComponent className={`w-5 h-5 ${
                    selectedMethod === method.id ? 'text-blue-600' : 'text-gray-600'
                  }`} />
                </div>
                
                <div>
                  <div className="font-medium text-gray-900 flex items-center">
                    {method.name}
                    {!method.enabled && (
                      <span className="ml-2 text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">
                        Coming Soon
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-500">{method.description}</div>
                </div>
              </div>
              
              {selectedMethod === method.id && method.enabled && (
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                  <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              )}
            </label>
          );
        })}
      </div>

      {/* Security Notice */}
      <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-md">
        <div className="flex items-start space-x-2">
          <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path 
              fillRule="evenodd" 
              d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" 
              clipRule="evenodd" 
            />
          </svg>
          <div>
            <div className="text-sm font-medium text-gray-900">Secure Payment</div>
            <div className="text-xs text-gray-600 mt-1">
              Your payment information is encrypted and secure. We never store your card details.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
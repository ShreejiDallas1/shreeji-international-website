'use client';

import { FiPackage, FiTruck, FiShield, FiClock } from 'react-icons/fi';

interface OrderSummaryProps {
  items: any[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  shippingMethod?: {
    service: string;
    estimatedDays: string;
  };

}

export default function OrderSummary({
  items,
  subtotal,
  shipping,
  tax,
  total,
  shippingMethod
}: OrderSummaryProps) {

  return (
    <div className="bg-gray-50 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
      
      {/* Items List */}
      <div className="space-y-3 mb-6">
        {items.map((item, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gray-200 rounded-md flex items-center justify-center">
                {item.images?.[0] ? (
                  <img 
                    src={item.images[0]} 
                    alt={item.name}
                    className="w-10 h-10 object-cover rounded"
                  />
                ) : (
                  <FiPackage className="text-gray-400" />
                )}
              </div>
              <div>
                <div className="font-medium text-sm text-gray-900">{item.name}</div>
                <div className="text-xs text-gray-500">Qty: {item.quantity}</div>
              </div>
            </div>
            <div className="text-sm font-medium text-gray-900">
              ${(item.price * item.quantity).toFixed(2)}
            </div>
          </div>
        ))}
      </div>

      {/* Totals */}
      <div className="space-y-2 border-t border-gray-200 pt-4">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Subtotal</span>
          <span className="text-gray-900">${subtotal.toFixed(2)}</span>
        </div>
        
        <div className="flex justify-between text-sm">
          <span className="text-gray-600 flex items-center">
            <FiTruck className="mr-1" />
            Shipping
            {shippingMethod && (
              <span className="ml-1 text-xs text-gray-500">
                ({shippingMethod.service})
              </span>
            )}
          </span>
          <span className="text-gray-900">
            {shipping === 0 ? (
              <span className="text-green-600 font-medium">FREE</span>
            ) : (
              `$${shipping.toFixed(2)}`
            )}
          </span>
        </div>
        
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Tax</span>
          <span className="text-gray-900">${tax.toFixed(2)}</span>
        </div>
        
        <div className="flex justify-between text-lg font-semibold border-t border-gray-200 pt-2">
          <span className="text-gray-900">Total</span>
          <span className="text-gray-900">${total.toFixed(2)}</span>
        </div>
      </div>

      {/* Delivery Info */}
      {shippingMethod && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
          <div className="flex items-center text-green-700 text-sm">
            <FiClock className="mr-2" />
            <span>Estimated delivery: {shippingMethod.estimatedDays}</span>
          </div>
        </div>
      )}

      {/* Trust Badges */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-center space-x-4 text-xs text-gray-500">
          <div className="flex items-center">
            <FiShield className="mr-1" />
            <span>Secure Checkout</span>
          </div>
          <div className="flex items-center">
            <FiTruck className="mr-1" />
            <span>Fast Shipping</span>
          </div>
        </div>
      </div>
    </div>
  );
}
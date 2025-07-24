'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { FiCheckCircle, FiClock, FiTruck, FiFileText } from 'react-icons/fi';
import Button from '@/components/Button';

// Order type
type OrderItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  subtotal: number;
};

type ShippingInfo = {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
};

type Order = {
  orderNumber: string;
  userId: string;
  items: OrderItem[];
  subtotal: number;
  total: number;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  shippingInfo: ShippingInfo;
  notes?: string;
  createdAt: {
    seconds: number;
    nanoseconds: number;
  };
};

function OrderConfirmationContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) {
        setError('Order ID not found');
        setLoading(false);
        return;
      }
      
      try {
        const orderDoc = await getDoc(doc(db, 'orders', orderId));
        
        if (orderDoc.exists()) {
          setOrder(orderDoc.data() as Order);
        } else {
          setError('Order not found');
        }
      } catch (err) {
        console.error('Error fetching order:', err);
        setError('Failed to load order details');
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrder();
  }, [orderId]);
  
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-lime-500"></div>
      </div>
    );
  }
  
  if (error || !order) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-md mx-auto">
          <h1 className="text-2xl font-bold mb-4">Order Not Found</h1>
          <p className="text-gray-600 mb-8">
            {error || "We couldn't find the order you're looking for."}
          </p>
          <Button variant="primary">
            <Link href="/dashboard">Go to Dashboard</Link>
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md overflow-hidden animate-fade-in">
        {/* Order Confirmation Header */}
        <div className="bg-lime-500 text-white p-6 text-center">
          <FiCheckCircle className="h-16 w-16 mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-2">Order Confirmed!</h1>
          <p className="text-lg">
            Thank you for your order. Your order number is <span className="font-bold">{order.orderNumber}</span>
          </p>
        </div>
        
        {/* Order Details */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Order Information */}
            <div>
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <FiFileText className="mr-2" /> Order Information
              </h2>
              <div className="bg-gray-50 rounded-md p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Order Number</p>
                    <p className="font-medium">{order.orderNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Date</p>
                    <p className="font-medium">
                      {order.createdAt ? new Date(order.createdAt.seconds * 1000).toLocaleDateString() : 'Processing'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Payment Method</p>
                    <p className="font-medium">
                      {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Bank Transfer'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Payment Status</p>
                    <p className={`font-medium ${
                      order.paymentStatus === 'paid' ? 'text-green-600' : 'text-orange-500'
                    }`}>
                      {order.paymentStatus === 'paid' ? 'Paid' : 'Pending'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Shipping Information */}
            <div>
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <FiTruck className="mr-2" /> Shipping Information
              </h2>
              <div className="bg-gray-50 rounded-md p-4">
                <p className="font-medium">{order.shippingInfo.fullName}</p>
                <p>{order.shippingInfo.address}</p>
                <p>{order.shippingInfo.city}, {order.shippingInfo.state} {order.shippingInfo.zipCode}</p>
                <p className="mt-2">{order.shippingInfo.email}</p>
                <p>{order.shippingInfo.phone}</p>
              </div>
            </div>
          </div>
          
          {/* Order Status */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <FiClock className="mr-2" /> Order Status
            </h2>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="h-1 w-full bg-gray-200"></div>
              </div>
              <div className="relative flex justify-between">
                <div className="text-center">
                  <div className={`w-8 h-8 rounded-full ${
                    order.status !== 'cancelled' ? 'bg-lime-500 text-white' : 'bg-gray-200'
                  } flex items-center justify-center mx-auto`}>
                    <FiCheckCircle className="h-4 w-4" />
                  </div>
                  <p className="mt-2 text-sm font-medium">Confirmed</p>
                </div>
                <div className="text-center">
                  <div className={`w-8 h-8 rounded-full ${
                    order.status === 'processing' || order.status === 'shipped' || order.status === 'delivered' 
                      ? 'bg-lime-500 text-white' 
                      : 'bg-gray-200'
                  } flex items-center justify-center mx-auto`}>
                    <FiClock className="h-4 w-4" />
                  </div>
                  <p className="mt-2 text-sm font-medium">Processing</p>
                </div>
                <div className="text-center">
                  <div className={`w-8 h-8 rounded-full ${
                    order.status === 'shipped' || order.status === 'delivered' 
                      ? 'bg-lime-500 text-white' 
                      : 'bg-gray-200'
                  } flex items-center justify-center mx-auto`}>
                    <FiTruck className="h-4 w-4" />
                  </div>
                  <p className="mt-2 text-sm font-medium">Shipped</p>
                </div>
                <div className="text-center">
                  <div className={`w-8 h-8 rounded-full ${
                    order.status === 'delivered' 
                      ? 'bg-lime-500 text-white' 
                      : 'bg-gray-200'
                  } flex items-center justify-center mx-auto`}>
                    <FiCheckCircle className="h-4 w-4" />
                  </div>
                  <p className="mt-2 text-sm font-medium">Delivered</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Order Items */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4">Order Items</h2>
            <div className="border rounded-md overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {order.items.map((item) => (
                    <tr key={item.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{item.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">${item.price.toFixed(2)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{item.quantity}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium">${item.subtotal.toFixed(2)}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Order Summary */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
            <div className="bg-gray-50 rounded-md p-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">${order.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">$12.99</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax</span>
                  <span className="font-medium">$0.00</span>
                </div>
                <div className="border-t pt-2 flex justify-between">
                  <span className="font-semibold">Total</span>
                  <span className="font-bold text-orange-500">${order.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Notes */}
          {order.notes && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold mb-4">Order Notes</h2>
              <div className="bg-gray-50 rounded-md p-4">
                <p className="text-gray-700">{order.notes}</p>
              </div>
            </div>
          )}
          
          {/* Cancellation Policy */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4">Cancellation Policy</h2>
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <div className="space-y-3">
                <div className="flex items-start">
                  <FiClock className="h-5 w-5 text-blue-500 mr-2 mt-0.5" />
                  <div>
                    <p className="font-medium text-blue-900">Free Cancellation</p>
                    <p className="text-blue-700 text-sm">Cancel within 2 hours of ordering for no fee</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <FiFileText className="h-5 w-5 text-yellow-500 mr-2 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">After 2 Hours</p>
                    <p className="text-gray-700 text-sm">15% cancellation fee applies to cover processing costs</p>
                  </div>
                </div>
                
                <p className="text-gray-600 text-sm mt-3">
                  You can manage your order and request cancellation in the "My Orders" section.
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
            <Button variant="primary">
              <Link href="/account/orders">View All Orders</Link>
            </Button>
            <Button variant="outline">
              <Link href="/products">Continue Shopping</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Loading fallback
function OrderConfirmationLoading() {
  return (
    <div className="container mx-auto px-4 py-16 flex justify-center items-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-lime-500"></div>
    </div>
  );
}

export default function OrderConfirmationPage() {
  return (
    <Suspense fallback={<OrderConfirmationLoading />}>
      <OrderConfirmationContent />
    </Suspense>
  );
}
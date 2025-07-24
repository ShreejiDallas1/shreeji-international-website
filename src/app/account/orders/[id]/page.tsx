'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppContext } from '@/lib/context';
import Link from 'next/link';
import { FiArrowLeft, FiPackage, FiMapPin, FiCreditCard } from 'react-icons/fi';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

interface Order {
  id: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  status: string;
  createdAt: string;
  shippingAddress?: any;
  paymentMethod?: string;
}

export default function OrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { user, loading } = useAppContext();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [orderLoading, setOrderLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);

  useEffect(() => {
    // Resolve params promise
    params.then(resolvedParams => {
      setOrderId(resolvedParams.id);
    });
  }, [params]);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }

    if (user && orderId) {
      fetchOrder();
    }
  }, [user, loading, router, orderId]);

  const fetchOrder = async () => {
    if (!user || !orderId) return;

    try {
      setOrderLoading(true);
      setError(null);
      
      const orderDoc = await getDoc(doc(db, 'orders', orderId));
      
      if (!orderDoc.exists()) {
        setError('Order not found');
        return;
      }

      const orderData = orderDoc.data();
      
      // Verify this order belongs to the current user
      if (orderData.userId !== user.uid) {
        setError('Access denied');
        return;
      }

      setOrder({
        id: orderDoc.id,
        ...orderData,
        createdAt: orderData.createdAt?.toDate?.()?.toISOString() || orderData.createdAt
      } as Order);
      
    } catch (err) {
      console.error('Error fetching order:', err);
      setError('Failed to load order details');
    } finally {
      setOrderLoading(false);
    }
  };

  const safeNumber = (value: any): number => {
    const num = Number(value);
    return isNaN(num) ? 0 : num;
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Invalid Date';
    }
  };

  if (loading || orderLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-6"></div>
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Link
          href="/account/orders"
          className="inline-flex items-center text-lime-600 hover:text-lime-700 mb-6"
        >
          <FiArrowLeft className="mr-2" />
          Back to Orders
        </Link>
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-6 rounded-lg text-center">
          <h2 className="text-xl font-semibold text-red-800 dark:text-red-200 mb-2">
            {error}
          </h2>
          <button
            onClick={fetchOrder}
            className="text-red-600 hover:text-red-700 underline"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Link
          href="/account/orders"
          className="inline-flex items-center text-lime-600 hover:text-lime-700 mb-6"
        >
          <FiArrowLeft className="mr-2" />
          Back to Orders
        </Link>
        <div className="text-center py-12">
          <FiPackage className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Order not found
          </h3>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/account/orders"
          className="inline-flex items-center text-lime-600 hover:text-lime-700 mb-4"
        >
          <FiArrowLeft className="mr-2" />
          Back to Orders
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Order #{order.id.slice(-8).toUpperCase()}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Placed on {formatDate(order.createdAt)}
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <span className="px-4 py-2 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Order Items */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
              <FiPackage className="mr-2" />
              Order Items
            </h2>
            
            <div className="space-y-4">
              {(order.items || []).map((item, index) => (
                <div key={index} className="flex items-center space-x-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <img
                    src={item.image || '/images/placeholder.svg'}
                    alt={item.name || 'Product'}
                    className="w-16 h-16 object-cover rounded-lg bg-gray-100 dark:bg-gray-700"
                  />
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {item.name || 'Unknown Product'}
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                      Quantity: {item.quantity || 0}
                    </p>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                      Price: ${safeNumber(item.price).toFixed(2)} each
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900 dark:text-white">
                      ${(safeNumber(item.price) * safeNumber(item.quantity)).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Order Summary & Details */}
        <div className="space-y-6">
          {/* Order Summary */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Order Summary
            </h2>
            
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                <span className="text-gray-900 dark:text-white">${safeNumber(order.subtotal).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Shipping</span>
                <span className="text-gray-900 dark:text-white">${safeNumber(order.shipping).toFixed(2)}</span>
              </div>
              {order.tax && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Tax</span>
                  <span className="text-gray-900 dark:text-white">${safeNumber(order.tax).toFixed(2)}</span>
                </div>
              )}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-900 dark:text-white">Total</span>
                  <span className="font-bold text-xl text-gray-900 dark:text-white">
                    ${safeNumber(order.total).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          {order.shippingAddress && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <FiMapPin className="mr-2" />
                Shipping Address
              </h2>
              <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <p>{order.shippingAddress.name || 'N/A'}</p>
                <p>{order.shippingAddress.street || 'N/A'}</p>
                <p>
                  {order.shippingAddress.city || 'N/A'}, {order.shippingAddress.state || 'N/A'} {order.shippingAddress.zipCode || 'N/A'}
                </p>
                <p>{order.shippingAddress.country || 'US'}</p>
              </div>
            </div>
          )}

          {/* Payment Method */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <FiCreditCard className="mr-2" />
              Payment Method
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {order.paymentMethod || 'Not specified'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
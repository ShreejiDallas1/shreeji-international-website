'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppContext } from '@/lib/context';
import Link from 'next/link';
import { FiPackage, FiClock, FiTruck, FiCheckCircle, FiXCircle, FiEye, FiArrowLeft } from 'react-icons/fi';
import { motion } from 'framer-motion';

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
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
  shippingAddress?: any;
  paymentMethod?: string;
}

const statusConfig = {
  pending: { icon: FiClock, color: 'yellow', label: 'Pending' },
  confirmed: { icon: FiCheckCircle, color: 'blue', label: 'Confirmed' },
  processing: { icon: FiPackage, color: 'purple', label: 'Processing' },
  shipped: { icon: FiTruck, color: 'orange', label: 'Shipped' },
  delivered: { icon: FiCheckCircle, color: 'green', label: 'Delivered' },
  cancelled: { icon: FiXCircle, color: 'red', label: 'Cancelled' }
};

export default function OrdersPage() {
  const { user, loading } = useAppContext();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }

    if (user) {
      fetchOrders();
    }
  }, [user, loading, router]);

  const fetchOrders = async () => {
    if (!user) return;

    try {
      setOrdersLoading(true);
      setError(null);
      
      const response = await fetch(`/api/orders?userId=${user.uid}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch orders');
      }

      setOrders(data.orders || []);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError(err instanceof Error ? err.message : 'Failed to load orders');
    } finally {
      setOrdersLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Invalid Date';
    }
  };

  const safeNumber = (value: any): number => {
    const num = Number(value);
    return isNaN(num) ? 0 : num;
  };

  if (loading || ordersLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/account"
          className="inline-flex items-center text-lime-600 hover:text-lime-700 mb-4"
        >
          <FiArrowLeft className="mr-2" />
          Back to Account
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Orders</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Track and manage your orders
        </p>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 rounded-lg mb-6">
          <p className="text-red-700 dark:text-red-300">{error}</p>
          <button
            onClick={fetchOrders}
            className="mt-2 text-red-600 hover:text-red-700 underline"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Orders List */}
      {orders.length === 0 ? (
        <div className="text-center py-12">
          <FiPackage className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No orders yet
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            When you place orders, they'll appear here.
          </p>
          <Link
            href="/shop"
            className="inline-flex items-center px-4 py-2 bg-lime-600 text-white rounded-lg hover:bg-lime-700 transition-colors"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order, index) => {
            const status = statusConfig[order.status] || statusConfig.pending;
            const StatusIcon = status.icon;
            
            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden"
              >
                {/* Order Header */}
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center space-x-3 mb-2 sm:mb-0">
                      <StatusIcon className={`h-5 w-5 text-${status.color}-500`} />
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          Order #{order.id.slice(-8).toUpperCase()}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {formatDate(order.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium bg-${status.color}-100 text-${status.color}-800 dark:bg-${status.color}-900/30 dark:text-${status.color}-300`}>
                        {status.label}
                      </span>
                      <Link
                        href={`/account/orders/${order.id}`}
                        className="text-lime-600 hover:text-lime-700 flex items-center text-sm"
                      >
                        <FiEye className="mr-1 h-4 w-4" />
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="p-6">
                  <div className="space-y-3 mb-4">
                    {(order.items || []).slice(0, 3).map((item, itemIndex) => (
                      <div key={itemIndex} className="flex items-center space-x-3">
                        <img
                          src={item.image || '/images/placeholder.svg'}
                          alt={item.name || 'Product'}
                          className="w-12 h-12 object-cover rounded-lg bg-gray-100 dark:bg-gray-700"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 dark:text-white truncate">
                            {item.name || 'Unknown Product'}
                          </h4>
                          <p className="text-gray-500 dark:text-gray-400 text-sm">
                            Qty: {item.quantity || 0} × ${safeNumber(item.price).toFixed(2)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900 dark:text-white">
                            ${(safeNumber(item.price) * safeNumber(item.quantity)).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                    
                    {(order.items || []).length > 3 && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-2">
                        +{order.items.length - 3} more items
                      </p>
                    )}
                  </div>

                  {/* Order Total */}
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                    <div className="flex justify-between items-center">
                      <div className="space-y-1 text-sm">
                        <p className="text-gray-500 dark:text-gray-400">
                          Subtotal: ${safeNumber(order.subtotal).toFixed(2)}
                        </p>
                        <p className="text-gray-500 dark:text-gray-400">
                          Shipping: ${safeNumber(order.shipping).toFixed(2)}
                        </p>
                        {order.tax && (
                          <p className="text-gray-500 dark:text-gray-400">
                            Tax: ${safeNumber(order.tax).toFixed(2)}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-gray-900 dark:text-white">
                          ${safeNumber(order.total).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
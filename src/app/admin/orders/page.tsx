'use client';

import React, { useState, useEffect } from 'react';
import { useAppContext } from '@/lib/context';
import { useRouter } from 'next/navigation';
import { FiPackage, FiClock, FiTruck, FiCheckCircle, FiXCircle, FiEye, FiEdit } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { collection, getDocs, doc, updateDoc, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import toast from 'react-hot-toast';

interface Order {
  id: string;
  userId: string;
  userEmail?: string;
  items: any[];
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
  pending: { icon: FiClock, color: 'yellow', label: 'Pending', next: 'confirmed' },
  confirmed: { icon: FiCheckCircle, color: 'blue', label: 'Confirmed', next: 'processing' },
  processing: { icon: FiPackage, color: 'purple', label: 'Processing', next: 'shipped' },
  shipped: { icon: FiTruck, color: 'orange', label: 'Shipped', next: 'delivered' },
  delivered: { icon: FiCheckCircle, color: 'green', label: 'Delivered', next: null },
  cancelled: { icon: FiXCircle, color: 'red', label: 'Cancelled', next: null }
};

export default function AdminOrdersPage() {
  const { user, loading } = useAppContext();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && (!user || user.email !== 'shreejidallas1@gmail.com')) {
      router.push('/');
      return;
    }

    if (user && user.email === 'shreejidallas1@gmail.com') {
      fetchOrders();
    }
  }, [user, loading, router]);

  const fetchOrders = async () => {
    try {
      setOrdersLoading(true);
      
      const ordersRef = collection(db, 'orders');
      const q = query(ordersRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const ordersData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || doc.data().createdAt
      })) as Order[];
      
      setOrders(ordersData);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setOrdersLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      setUpdating(orderId);
      
      await updateDoc(doc(db, 'orders', orderId), {
        status: newStatus,
        updatedAt: new Date().toISOString()
      });
      
      // Update local state
      setOrders(prev => prev.map(order => 
        order.id === orderId 
          ? { ...order, status: newStatus as any }
          : order
      ));
      
      toast.success(`Order status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating order:', error);
      toast.error('Failed to update order status');
    } finally {
      setUpdating(null);
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

  if (!user || user.email !== 'shreejidallas1@gmail.com') {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
        <p className="text-gray-600 mt-2">You don't have permission to access this page.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Order Management</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Manage all customer orders - {orders.length} total orders
        </p>
      </div>

      {/* Orders List */}
      {orders.length === 0 ? (
        <div className="text-center py-12">
          <FiPackage className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No orders yet
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Customer orders will appear here when they place them.
          </p>
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
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-center space-x-3 mb-4 lg:mb-0">
                      <StatusIcon className={`h-5 w-5 text-${status.color}-500`} />
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          Order #{order.id.slice(-8).toUpperCase()}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {formatDate(order.createdAt)} • Customer: {order.userEmail || 'Unknown'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium bg-${status.color}-100 text-${status.color}-800 dark:bg-${status.color}-900/30 dark:text-${status.color}-300`}>
                        {status.label}
                      </span>
                      
                      {status.next && (
                        <button
                          onClick={() => updateOrderStatus(order.id, status.next!)}
                          disabled={updating === order.id}
                          className="px-3 py-1 bg-lime-600 text-white rounded-md hover:bg-lime-700 disabled:opacity-50 text-sm"
                        >
                          {updating === order.id ? 'Updating...' : `Mark ${status.next}`}
                        </button>
                      )}
                      
                      <select
                        value={order.status}
                        onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                        disabled={updating === order.id}
                        className="text-sm border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Items */}
                    <div className="lg:col-span-2">
                      <h4 className="font-medium text-gray-900 dark:text-white mb-3">Order Items</h4>
                      <div className="space-y-3">
                        {(order.items || []).map((item, itemIndex) => (
                          <div key={itemIndex} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <img
                              src={item.image || '/images/placeholder.svg'}
                              alt={item.name || 'Product'}
                              className="w-12 h-12 object-cover rounded-lg bg-gray-100 dark:bg-gray-600"
                            />
                            <div className="flex-1 min-w-0">
                              <h5 className="font-medium text-gray-900 dark:text-white truncate">
                                {item.name || 'Unknown Product'}
                              </h5>
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
                      </div>
                    </div>

                    {/* Order Summary */}
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white mb-3">Order Summary</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
                          <span className="text-gray-900 dark:text-white">${safeNumber(order.subtotal).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Shipping:</span>
                          <span className="text-gray-900 dark:text-white">${safeNumber(order.shipping).toFixed(2)}</span>
                        </div>
                        {order.tax && (
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Tax:</span>
                            <span className="text-gray-900 dark:text-white">${safeNumber(order.tax).toFixed(2)}</span>
                          </div>
                        )}
                        <div className="border-t border-gray-200 dark:border-gray-600 pt-2">
                          <div className="flex justify-between font-semibold">
                            <span className="text-gray-900 dark:text-white">Total:</span>
                            <span className="text-gray-900 dark:text-white text-lg">${safeNumber(order.total).toFixed(2)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Shipping Address */}
                      {order.shippingAddress && (
                        <div className="mt-4">
                          <h5 className="font-medium text-gray-900 dark:text-white mb-2">Shipping Address</h5>
                          <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                            <p>{order.shippingAddress.name || 'N/A'}</p>
                            <p>{order.shippingAddress.street || 'N/A'}</p>
                            <p>
                              {order.shippingAddress.city || 'N/A'}, {order.shippingAddress.state || 'N/A'} {order.shippingAddress.zipCode || 'N/A'}
                            </p>
                          </div>
                        </div>
                      )}
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
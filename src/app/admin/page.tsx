'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppContext } from '@/lib/context';
import Link from 'next/link';
import { FiPackage, FiShoppingBag, FiUsers, FiSettings, FiRefreshCw, FiDatabase, FiAlertCircle } from 'react-icons/fi';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const { user, loading } = useAppContext();
  const router = useRouter();
  const [stats, setStats] = useState({
    products: 0,
    orders: 0,
    users: 0,
    lastSync: null as string | null
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!loading && (!user || user.email !== 'shreejidallas1@gmail.com')) {
      router.push('/');
      return;
    }

    if (user && user.email === 'shreejidallas1@gmail.com') {
      fetchStats();
    }
  }, [user, loading, router]);

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      
      // Fetch products count
      const productsResponse = await fetch('/api/debug-products');
      const productsData = await productsResponse.json();
      
      // Fetch orders count
      const ordersResponse = await fetch(`/api/orders?userId=all`);
      const ordersData = await ordersResponse.json();
      
      setStats({
        products: productsData.totalProducts || 0,
        orders: ordersData.orders?.length || 0,
        users: 0, // We'll implement this later
        lastSync: localStorage.getItem('lastSync')
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSync = async () => {
    try {
      toast.loading('Syncing products from Square...', { id: 'sync' });
      
      const response = await fetch('/api/sync-products', {
        method: 'POST'
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success(`Synced ${data.syncedCount} products successfully!`, { id: 'sync' });
        localStorage.setItem('lastSync', new Date().toISOString());
        fetchStats();
      } else {
        throw new Error(data.error || 'Sync failed');
      }
    } catch (error) {
      console.error('Sync error:', error);
      toast.error(`Sync failed: ${error instanceof Error ? error.message : 'Unknown error'}`, { id: 'sync' });
    }
  };



  const handleClearOrders = async () => {
    if (!confirm('Are you sure you want to clear all orders? This cannot be undone.')) {
      return;
    }

    try {
      toast.loading('Clearing all orders...', { id: 'clear' });
      
      const response = await fetch('/api/admin/clear-orders', {
        method: 'DELETE'
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success(`Cleared ${data.deletedCount} orders!`, { id: 'clear' });
        fetchStats();
      } else {
        throw new Error(data.error || 'Failed to clear orders');
      }
    } catch (error) {
      console.error('Clear orders error:', error);
      toast.error(`Failed: ${error instanceof Error ? error.message : 'Unknown error'}`, { id: 'clear' });
    }
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lime-600"></div>
      </div>
    );
  }

  if (!user || user.email !== 'shreejidallas1@gmail.com') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-600 dark:text-gray-400">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Welcome back, {user.displayName || user.email}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center">
              <FiPackage className="h-8 w-8 text-blue-500 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Products</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.products}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center">
              <FiShoppingBag className="h-8 w-8 text-green-500 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Orders</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.orders}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center">
              <FiDatabase className="h-8 w-8 text-purple-500 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Last Sync</p>
                <p className="text-sm font-bold text-gray-900 dark:text-white">
                  {stats.lastSync ? new Date(stats.lastSync).toLocaleDateString() : 'Never'}
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              onClick={handleSync}
              className="flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <FiRefreshCw className="mr-2" />
              Sync Products
            </button>
            
            <Link
              href="https://developer.squareup.com/sandbox/item-library"
              target="_blank"
              className="flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <FiPackage className="mr-2" />
              Add Test Products
            </Link>
            
            <button
              onClick={handleClearOrders}
              className="flex items-center justify-center px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <FiAlertCircle className="mr-2" />
              Clear All Orders
            </button>
            
            <Link
              href="/api/debug-products"
              target="_blank"
              className="flex items-center justify-center px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <FiDatabase className="mr-2" />
              Debug Products
            </Link>
          </div>
        </div>

        {/* Management Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Orders Management */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <FiShoppingBag className="mr-2" />
              Order Management
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              View and manage customer orders, update order status, and track deliveries.
            </p>
            <Link
              href="/admin/orders"
              className="inline-flex items-center px-4 py-2 bg-lime-600 text-white rounded-lg hover:bg-lime-700 transition-colors"
            >
              Manage Orders
            </Link>
          </motion.div>

          {/* Products Management */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <FiPackage className="mr-2" />
              Product Management
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Sync products from Square, manage inventory, and update product information.
            </p>
            <div className="space-y-2">
              <Link
                href="https://squareup.com/dashboard/items/library"
                target="_blank"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mr-2"
              >
                Square Dashboard
              </Link>
              <Link
                href="/products"
                className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                View Products
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-200 mb-4">
            📋 Owner Instructions
          </h3>
          <div className="space-y-4 text-blue-800 dark:text-blue-300">
            <div>
              <h4 className="font-medium">To Add Products:</h4>
              <ol className="list-decimal list-inside ml-4 space-y-1 text-sm">
                <li>Go to <a href="https://squareup.com/dashboard" target="_blank" className="underline">Square Dashboard</a></li>
                <li>Click "Items & Orders" → "Items"</li>
                <li>Click "Create Item" and fill out the form</li>
                <li>Come back here and click "Sync Products"</li>
              </ol>
            </div>
            
            <div>
              <h4 className="font-medium">To Manage Orders:</h4>
              <ol className="list-decimal list-inside ml-4 space-y-1 text-sm">
                <li>Click "Manage Orders" above</li>
                <li>View all customer orders</li>
                <li>Update order status using the dropdown or quick buttons</li>
                <li>Orders will automatically notify customers of status changes</li>
              </ol>
            </div>
            
            <div>
              <h4 className="font-medium">If Products Don't Show:</h4>
              <ol className="list-decimal list-inside ml-4 space-y-1 text-sm">
                <li>Click "Add Test Products" to add items in Square sandbox</li>
                <li>Add 3-5 test products with names, prices, and categories</li>
                <li>Come back and click "Sync Products"</li>
                <li>Check <a href="/api/test-square-sync" target="_blank" className="underline">Square sync test</a></li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
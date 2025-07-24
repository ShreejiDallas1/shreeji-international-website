'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FiUser, FiShoppingBag, FiSettings } from 'react-icons/fi';
import { useAppContext } from '@/lib/context';
import { useAdmin } from '@/hooks/useAdmin';
import { motion } from 'framer-motion';

export default function DashboardPage() {
  const router = useRouter();
  const { user, logout } = useAppContext();
  const { isAdmin } = useAdmin();
  
  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      router.push('/auth/login?redirect=/dashboard');
    }
  }, [user, router]);
  
  // Handle logout
  const handleLogout = async () => {
    await logout();
    router.push('/');
  };
  
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-16 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-lime-500"></div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-lime-500 via-lime-600 to-green-600 text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">Welcome Back!</h1>
              <p className="text-lime-100 text-lg">{user.displayName || user.email}</p>
            </div>
            <button 
              onClick={handleLogout}
              className="mt-4 md:mt-0 bg-white/20 hover:bg-white/30 text-white px-6 py-2 rounded-lg font-medium transition-colors backdrop-blur-sm"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 -mt-4">
        {/* Dashboard Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <motion.div
            whileHover={{ y: -4, scale: 1.02 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300"
          >
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mb-6">
              <FiUser className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Profile Settings</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">Manage your account details and preferences</p>
            <Link 
              href="/account/profile" 
              className="inline-flex items-center bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Edit Profile
              <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </motion.div>
          
          <motion.div
            whileHover={{ y: -4, scale: 1.02 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300"
          >
            <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center mb-6">
              <FiShoppingBag className="h-8 w-8 text-orange-600 dark:text-orange-400" />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Browse Products</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">Explore our wholesale catalog and discover new items</p>
            <Link 
              href="/products" 
              className="inline-flex items-center bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              View Products
              <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </motion.div>
        </div>
        {/* Account Information */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden mb-8 border border-gray-100 dark:border-gray-700">
          <div className="p-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Account Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Email Address</label>
                  <p className="text-lg text-gray-900 dark:text-white">{user.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Display Name</label>
                  <p className="text-lg text-gray-900 dark:text-white">{user.displayName || 'Not set'}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Account Status</label>
                  <p className="text-lg text-green-600 dark:text-green-400 font-medium">Active</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Member Since</label>
                  <p className="text-lg text-gray-900 dark:text-white">
                    {user.metadata?.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString() : 'Recently'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Admin Quick Access */}
        {isAdmin && (
          <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl shadow-lg p-6 text-white">
            <h3 className="text-xl font-semibold mb-3">Admin Panel</h3>
            <p className="text-orange-100 mb-4">Access admin tools and management features</p>
            <Link 
              href="/admin" 
              className="inline-flex items-center bg-white/20 hover:bg-white/30 text-white px-6 py-2 rounded-lg font-medium transition-colors backdrop-blur-sm"
            >
              <FiSettings className="mr-2" />
              Go to Admin Panel
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
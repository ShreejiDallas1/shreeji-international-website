'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FiUser, FiShoppingBag, FiSettings, FiLogOut, FiClock, FiCheckCircle } from 'react-icons/fi';
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
      <div className="container mx-auto px-4 py-16 flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-lime-500"></div>
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    }
  };

  return (
    <motion.div
      className="min-h-screen bg-gray-50 dark:bg-gray-900"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Hero Section */}
      <motion.div
        className="bg-gradient-to-br from-lime-600 via-lime-500 to-green-600 text-white relative overflow-hidden"
        variants={itemVariants}
      >
        <div className="absolute inset-0 bg-[url('/images/pattern.png')] opacity-10 mix-blend-overlay"></div>
        <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute -top-10 -left-10 w-64 h-64 bg-yellow-400/20 rounded-full blur-3xl"></div>

        <div className="container mx-auto px-4 py-16 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h1 className="text-3xl md:text-5xl font-bold mb-3 tracking-tight">
                  Welcome Back, <span className="text-lime-100">{user.displayName?.split(' ')[0] || 'User'}!</span>
                </h1>
                <p className="text-lime-50 text-lg md:text-xl font-light opacity-90">
                  Manage your account and explore our wholesale catalog.
                </p>
              </motion.div>
            </div>

            <motion.button
              onClick={handleLogout}
              whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.25)" }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 bg-white/15 hover:bg-white/25 text-white px-6 py-3 rounded-xl font-medium transition-all backdrop-blur-md border border-white/20 shadow-lg"
            >
              <FiLogOut />
              <span>Sign Out</span>
            </motion.button>
          </div>
        </div>
      </motion.div>

      <div className="container mx-auto px-4 pt-12 pb-8 relative z-20">
        {/* Dashboard Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <motion.div
            variants={itemVariants}
            whileHover={{ y: -8, scale: 1.01 }}
            className="group bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 border border-gray-100 dark:border-gray-700 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 dark:bg-blue-900/10 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110 duration-500"></div>

            <div className="relative z-10">
              <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mb-6 group-hover:rotate-6 transition-transform duration-300">
                <FiUser className="h-7 w-7 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">Profile Settings</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                Update your personal information, manage your password, and set your preferences.
              </p>
              <Link
                href="/account/profile"
                className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 font-semibold group-hover:gap-3 transition-all"
              >
                Edit Profile
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            whileHover={{ y: -8, scale: 1.01 }}
            className="group bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 border border-gray-100 dark:border-gray-700 hover:shadow-2xl hover:shadow-orange-500/10 transition-all duration-300 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50 dark:bg-orange-900/10 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110 duration-500"></div>

            <div className="relative z-10">
              <div className="w-14 h-14 bg-orange-100 dark:bg-orange-900/30 rounded-2xl flex items-center justify-center mb-6 group-hover:rotate-6 transition-transform duration-300">
                <FiShoppingBag className="h-7 w-7 text-orange-600 dark:text-orange-400" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">Browse Products</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                Explore our extensive wholesale catalog, filter by category, and find the best deals.
              </p>
              <Link
                href="/products"
                className="inline-flex items-center gap-2 text-orange-600 dark:text-orange-400 font-semibold group-hover:gap-3 transition-all"
              >
                View Catalog
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Account Information */}
        <motion.div
          variants={itemVariants}
          className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden mb-8 border border-gray-100 dark:border-gray-700"
        >
          <div className="p-8">
            <div className="flex items-center gap-3 mb-8">
              <div className="h-8 w-1 bg-lime-500 rounded-full"></div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Account Overview</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl">
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email Address</label>
                  <p className="text-lg font-medium text-gray-900 dark:text-white mt-1">{user.email}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl">
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Display Name</label>
                  <p className="text-lg font-medium text-gray-900 dark:text-white mt-1">{user.displayName || 'Not set'}</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl border border-green-100 dark:border-green-800/30">
                  <label className="text-sm font-medium text-green-600 dark:text-green-400 uppercase tracking-wider flex items-center gap-2">
                    <FiCheckCircle /> Account Status
                  </label>
                  <p className="text-lg font-bold text-green-700 dark:text-green-300 mt-1">Active Member</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl">
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-2">
                    <FiClock /> Member Since
                  </label>
                  <p className="text-lg font-medium text-gray-900 dark:text-white mt-1">
                    {user.metadata?.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    }) : 'Recently'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Admin Quick Access */}
        {isAdmin && (
          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.01 }}
            className="bg-gradient-to-r from-gray-900 to-gray-800 text-white rounded-3xl shadow-xl p-8 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>

            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-white/10 rounded-lg">
                    <FiSettings className="h-6 w-6" />
                  </div>
                  <h3 className="text-2xl font-bold">Admin Portal</h3>
                </div>
                <p className="text-gray-300 max-w-xl">
                  Access the dashboard to manage products, view analytics, and configure system settings.
                </p>
              </div>

              <Link
                href="/admin"
                className="whitespace-nowrap bg-white text-gray-900 hover:bg-gray-100 px-8 py-4 rounded-xl font-bold transition-all shadow-lg hover:shadow-white/20 flex items-center gap-2"
              >
                Enter Admin Panel
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
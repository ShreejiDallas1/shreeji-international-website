'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppContext } from '@/lib/context';
import Link from 'next/link';
import { FiUser, FiShoppingBag, FiClock, FiEdit, FiLogOut, FiArrowLeft } from 'react-icons/fi';

export default function OrderHistoryPage() {
  const { user, loading } = useAppContext();
  const router = useRouter();

  useEffect(() => {
    // Redirect if not logged in
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="flex items-center mb-6">
        <Link href="/account" className="mr-4 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
          <FiArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-3xl font-bold">Order History</h1>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <div className="py-8 text-center text-gray-600 dark:text-gray-400">
          <FiClock className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>You don't have any order history yet.</p>
          <Link
            href="/products"
            className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Start Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FiCreditCard } from 'react-icons/fi';

export default function CheckoutPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full text-center"
      >
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-700">
          <div className="w-20 h-20 bg-lime-100 dark:bg-lime-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <FiCreditCard className="h-10 w-10 text-lime-600 dark:text-lime-400" />
          </div>

          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Checkout Unavailable
          </h1>

          <p className="text-gray-600 dark:text-gray-300 mb-8">
            Online checkout is currently disabled as we transition to our new wholesale platform. Please contact our sales team to place an order.
          </p>

          <div className="space-y-4">
            <Link
              href="/contact"
              className="block w-full py-3 px-4 bg-lime-600 hover:bg-lime-700 text-white font-medium rounded-lg transition-colors shadow-md"
            >
              Contact Sales Team
            </Link>

            <Link
              href="/products"
              className="block w-full py-3 px-4 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
            >
              Back to Products
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
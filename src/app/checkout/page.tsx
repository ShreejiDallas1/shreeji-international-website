'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ComingSoonModal from '@/components/ComingSoonModal';
import ComingSoonBanner from '@/components/ComingSoonBanner';
import { motion } from 'framer-motion';
import { FiShoppingCart, FiArrowLeft } from 'react-icons/fi';
import Link from 'next/link';

export default function CheckoutPage() {
  const router = useRouter();
  const [showModal, setShowModal] = useState(true);

  useEffect(() => {
    // Auto redirect after 3 seconds if modal is closed
    const timer = setTimeout(() => {
      if (!showModal) {
        router.push('/cart');
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [showModal, router]);

  const handleModalClose = () => {
    setShowModal(false);
    router.push('/cart');
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full text-center"
      >
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-lime-500 to-green-500 rounded-full flex items-center justify-center mb-6">
            <FiShoppingCart className="w-8 h-8 text-white" />
          </div>

          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Checkout Coming Soon!
          </h1>

          <p className="text-gray-600 dark:text-gray-300 mb-6">
            We're working on bringing you a secure checkout experience. 
            For now, please contact us directly for orders.
          </p>

          <ComingSoonBanner className="mb-6" />

          <div className="flex flex-col space-y-3">
            <Link
              href="/cart"
              className="flex items-center justify-center bg-gradient-to-r from-lime-500 to-green-500 text-white py-3 px-6 rounded-lg font-semibold hover:from-lime-600 hover:to-green-600 transition-all duration-200"
            >
              <FiArrowLeft className="w-4 h-4 mr-2" />
              Back to Cart
            </Link>
            
            <Link
              href="/contact"
              className="border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 py-3 px-6 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Contact Us for Orders
            </Link>
          </div>
        </div>
      </motion.div>

      <ComingSoonModal 
        isOpen={showModal} 
        onClose={handleModalClose}
        feature="Secure Checkout"
      />
    </div>
  );
}
'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiShoppingCart, FiClock, FiBell } from 'react-icons/fi';

interface ComingSoonModalProps {
  isOpen: boolean;
  onClose: () => void;
  feature?: string;
}

export default function ComingSoonModal({ isOpen, onClose, feature = "Shopping" }: ComingSoonModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-[9999] flex items-center justify-center p-4"
            onClick={onClose}
          >
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-sm w-full p-6 relative mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors z-10 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                aria-label="Close modal"
              >
                <FiX className="w-6 h-6" />
              </button>

              {/* Content */}
              <div className="text-center">
                {/* Icon */}
                <div className="mx-auto w-16 h-16 bg-gradient-to-r from-lime-500 to-green-500 rounded-full flex items-center justify-center mb-6">
                  <FiShoppingCart className="w-8 h-8 text-white" />
                </div>

                {/* Title */}
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  {feature} Coming Soon!
                </h2>

                {/* Description */}
                <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                  We're working hard to bring you an amazing online shopping experience. 
                  For now, you can browse our products and get familiar with our offerings.
                </p>

                {/* Features List */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center justify-center">
                    <FiClock className="w-4 h-4 mr-2" />
                    What's Coming
                  </h3>
                  <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-2">
                    <li>• Secure online payments</li>
                    <li>• Real-time inventory tracking</li>
                    <li>• Fast shipping options</li>
                    <li>• Order tracking & history</li>
                  </ul>
                </div>

                {/* Contact Info */}
                <div className="bg-lime-50 dark:bg-lime-900/20 border border-lime-200 dark:border-lime-800 rounded-lg p-4 mb-6">
                  <h3 className="font-semibold text-lime-800 dark:text-lime-300 mb-2">
                    Need Products Now?
                  </h3>
                  <p className="text-sm text-lime-700 dark:text-lime-400">
                    Contact us directly for immediate orders and wholesale inquiries.
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={onClose}
                    className="flex-1 bg-gradient-to-r from-lime-500 to-green-500 text-white py-3 px-6 rounded-lg font-semibold hover:from-lime-600 hover:to-green-600 transition-all duration-200 flex items-center justify-center"
                  >
                    <FiBell className="w-4 h-4 mr-2" />
                    Got It
                  </button>
                  <button
                    onClick={() => {
                      window.location.href = '/contact';
                    }}
                    className="flex-1 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 py-3 px-6 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Contact Us
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
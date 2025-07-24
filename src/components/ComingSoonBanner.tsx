'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { FiShoppingCart, FiClock, FiInfo } from 'react-icons/fi';

interface ComingSoonBannerProps {
  className?: string;
}

export default function ComingSoonBanner({ className = "" }: ComingSoonBannerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 ${className}`}
    >
      <div className="flex items-center justify-center text-center">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex items-center justify-center">
              <FiShoppingCart className="w-5 h-5 text-white" />
            </div>
          </div>
          
          <div className="flex-1">
            <div className="flex items-center justify-center space-x-2 mb-1">
              <FiClock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <h3 className="font-semibold text-amber-800 dark:text-amber-300">
                Online Shopping Coming Soon!
              </h3>
            </div>
            <p className="text-sm text-amber-700 dark:text-amber-400">
              Browse our products now • Contact us for immediate orders
            </p>
          </div>
          
          <div className="flex-shrink-0">
            <FiInfo className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
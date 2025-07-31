'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiDollarSign, FiTrendingUp, FiInfo } from 'react-icons/fi';
import { formatCurrency } from '@/lib/utils';

export default function CurrencyConversionTestPage() {
  const [inrAmount, setInrAmount] = useState(830); // Example: ₹830 = $10 USD

  const exchangeRate = 83; // 1 USD ≈ 83 INR
  const usdAmount = inrAmount / exchangeRate;

  // Test various price ranges
  const testPrices = [
    { inr: 83, description: 'Small item (₹83)' },
    { inr: 415, description: 'Medium item (₹415)' },
    { inr: 830, description: 'Large item (₹830)' },
    { inr: 1660, description: 'Premium item (₹1,660)' },
    { inr: 2490, description: 'Bulk item (₹2,490)' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8"
        >
          <div className="text-center mb-8">
            <FiDollarSign className="w-16 h-16 mx-auto text-green-600 mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Currency Conversion Test
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Test INR to USD conversion for product prices and filters
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* Interactive Converter */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
              <h3 className="font-semibold text-blue-900 dark:text-blue-400 mb-4 flex items-center">
                <FiTrendingUp className="w-5 h-5 mr-2" />
                Interactive Converter
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    INR Amount (₹)
                  </label>
                  <input
                    type="number"
                    value={inrAmount}
                    onChange={(e) => setInrAmount(Number(e.target.value))}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="Enter INR amount"
                  />
                </div>
                
                <div className="text-center py-4">
                  <div className="text-2xl font-bold text-green-600">
                    ₹{inrAmount.toLocaleString()} = {formatCurrency(inrAmount)}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    Exchange Rate: 1 USD = ₹{exchangeRate}
                  </div>
                </div>
              </div>
            </div>

            {/* Price Range Examples */}
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-6">
              <h3 className="font-semibold text-green-900 dark:text-green-400 mb-4 flex items-center">
                <FiDollarSign className="w-5 h-5 mr-2" />
                Filter Price Ranges
              </h3>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-white dark:bg-gray-700 rounded-lg">
                  <span className="text-sm font-medium">$0 - $5 USD</span>
                  <span className="text-sm text-gray-500">₹0 - ₹415</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white dark:bg-gray-700 rounded-lg">
                  <span className="text-sm font-medium">$5 - $15 USD</span>
                  <span className="text-sm text-gray-500">₹415 - ₹1,245</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white dark:bg-gray-700 rounded-lg">
                  <span className="text-sm font-medium">$15 - $30 USD</span>
                  <span className="text-sm text-gray-500">₹1,245 - ₹2,490</span>
                </div>
              </div>
            </div>
          </div>

          {/* Test Price Examples */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 mb-8">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
              Product Price Examples
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {testPrices.map((item, index) => (
                <div key={index} className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    {item.description}
                  </div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">
                    {formatCurrency(item.inr)}
                  </div>
                  <div className="text-xs text-gray-500">
                    (₹{item.inr.toLocaleString()})
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Information Panel */}
          <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-6">
            <h3 className="font-medium text-yellow-900 dark:text-yellow-400 mb-2 flex items-center">
              <FiInfo className="w-5 h-5 mr-2" />
              Currency Conversion Details
            </h3>
            <div className="text-sm text-yellow-800 dark:text-yellow-300 space-y-2">
              <p>• <strong>Exchange Rate:</strong> 1 USD = ₹83 (approximate)</p>
              <p>• <strong>Product Storage:</strong> All prices stored in INR in database</p>
              <p>• <strong>Display:</strong> Automatically converted to USD for US customers</p>
              <p>• <strong>Filter Range:</strong> USD filter values converted back to INR for comparison</p>
              <p>• <strong>Price Cards:</strong> All product prices now show in USD using formatCurrency()</p>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Visit the <a href="/products" className="text-blue-600 hover:text-blue-800 font-medium">Products Page</a> to see the updated price filters in action!
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
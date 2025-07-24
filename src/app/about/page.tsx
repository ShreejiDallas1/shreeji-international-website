'use client';

import React from 'react';
import Link from 'next/link';
import { 
  FiAward, 
  FiTruck, 
  FiShield, 
  FiHeart,
  FiMapPin,
  FiPhone,
  FiMail
} from 'react-icons/fi';
import { motion } from 'framer-motion';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-lime-500 via-lime-600 to-green-600 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <motion.h1 
              className="text-4xl md:text-6xl font-bold mb-6"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              About Shreeji International
            </motion.h1>
            <motion.p 
              className="text-xl text-lime-100 mb-8 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Your trusted partner for premium Indian wholesale groceries in Dallas, Texas
            </motion.p>
          </div>
        </div>
      </div>

      {/* Our Story Section */}
      <div className="container mx-auto px-4 py-24">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-8 text-gray-900 dark:text-white">Our Story</h2>
            <div className="w-24 h-1 bg-lime-500 mx-auto mb-12"></div>
            <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed max-w-3xl mx-auto mb-12">
              Shreeji International began as a family&apos;s passion project to bring authentic Indian groceries to Dallas, Texas. We&apos;ve grown into a trusted wholesale supplier serving restaurants, grocery stores, and businesses across the region.
            </p>
            <div className="flex justify-center items-center space-x-12 text-lime-600 dark:text-lime-400">
              <div className="text-center">
                <FiMapPin className="text-3xl mx-auto mb-3" />
                <span className="font-semibold text-lg">Dallas, TX</span>
              </div>
              <div className="text-center">
                <FiHeart className="text-3xl mx-auto mb-3" />
                <span className="font-semibold text-lg">Family-owned</span>
              </div>
              <div className="text-center">
                <FiShield className="text-3xl mx-auto mb-3" />
                <span className="font-semibold text-lg">Quality First</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Why Choose Us */}
      <div className="bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4 py-24">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Why Choose Us</h2>
            <div className="w-20 h-1 bg-lime-500 mx-auto"></div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-10 max-w-5xl mx-auto">
            {[
              {
                icon: FiShield,
                title: "Premium Quality",
                description: "Finest authentic Indian products from trusted suppliers.",
                color: "lime"
              },
              {
                icon: FiTruck,
                title: "Reliable Service",
                description: "Consistent stock availability and on-time delivery.",
                color: "blue"
              },
              {
                icon: FiAward,
                title: "Competitive Pricing",
                description: "Wholesale pricing for healthy profit margins.",
                color: "orange"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                className="text-center p-6 rounded-xl bg-gray-50 dark:bg-gray-700/50 hover:shadow-lg transition-all duration-300"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <div className={`${
                  feature.color === 'lime' ? 'bg-lime-100 dark:bg-lime-900/30' :
                  feature.color === 'blue' ? 'bg-blue-100 dark:bg-blue-900/30' :
                  feature.color === 'orange' ? 'bg-orange-100 dark:bg-orange-900/30' :
                  'bg-green-100 dark:bg-green-900/30'
                } w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4`}>
                  <feature.icon className={`h-7 w-7 ${
                    feature.color === 'lime' ? 'text-lime-600 dark:text-lime-400' :
                    feature.color === 'blue' ? 'text-blue-600 dark:text-blue-400' :
                    feature.color === 'orange' ? 'text-orange-600 dark:text-orange-400' :
                    'text-green-600 dark:text-green-400'
                  }`} />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="container mx-auto px-4 py-24">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">Get In Touch</h2>
          <div className="w-20 h-1 bg-lime-500 mx-auto mb-12"></div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6">
              <div className="bg-lime-100 dark:bg-lime-900/30 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
                <FiMapPin className="h-6 w-6 text-lime-600 dark:text-lime-400" />
              </div>
              <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">Location</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                1162 Security Dr<br />
                Dallas, TX 75247
              </p>
            </div>
            
            <div className="p-6">
              <div className="bg-blue-100 dark:bg-blue-900/30 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
                <FiPhone className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">Phone</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                (214) 529-7974<br />
                Mon-Fri: 10 AM - 5 PM
              </p>
            </div>
            
            <div className="p-6">
              <div className="bg-orange-100 dark:bg-orange-900/30 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
                <FiMail className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">Email</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                shreejidallas1@gmail.com
              </p>
            </div>
          </div>

          <div className="mt-12">
            <Link 
              href="/contact" 
              className="inline-flex items-center bg-lime-500 text-white hover:bg-lime-600 px-8 py-4 rounded-lg font-semibold transition-colors text-lg"
            >
              Contact Us Today
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
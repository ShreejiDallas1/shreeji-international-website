'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { FiMapPin, FiPhone, FiMail, FiClock, FiSend } from 'react-icons/fi';
import Button from '@/components/Button';

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <section className="bg-lime-900 text-white pt-20 pb-32">
        <div className="container mx-auto px-4 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold mb-6"
          >
            Get in Touch
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-lime-100 max-w-2xl mx-auto"
          >
            Have questions about our wholesale products? We're here to help.
          </motion.p>
        </div>
      </section>

      <div className="container mx-auto px-4 -mt-10 pb-32 relative z-10">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Contact Info Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-1 space-y-6"
          >
            {/* Address */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
              <div className="w-12 h-12 bg-lime-100 dark:bg-lime-900/30 rounded-full flex items-center justify-center text-lime-600 dark:text-lime-400 mb-4">
                <FiMapPin className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Visit Us</h3>
              <p className="text-gray-600 dark:text-gray-300">
                1162 Security Dr<br />
                Dallas, TX 75247
              </p>
            </div>

            {/* Phone & Email */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
              <div className="w-12 h-12 bg-lime-100 dark:bg-lime-900/30 rounded-full flex items-center justify-center text-lime-600 dark:text-lime-400 mb-4">
                <FiPhone className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Call Us</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Mon-Fri from 8am to 5pm
              </p>
              <a href="tel:+12145297974" className="text-lime-600 dark:text-lime-400 font-medium hover:underline">
                (214) 529-7974
              </a>
            </div>

            {/* Email */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
              <div className="w-12 h-12 bg-lime-100 dark:bg-lime-900/30 rounded-full flex items-center justify-center text-lime-600 dark:text-lime-400 mb-4">
                <FiMail className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Email Us</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Send us your query anytime!
              </p>
              <a href="mailto:shreejidallas1@gmail.com" className="text-lime-600 dark:text-lime-400 font-medium hover:underline">
                shreejidallas1@gmail.com
              </a>
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2"
          >
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 border border-gray-100 dark:border-gray-700 h-full">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Send us a Message</h2>
              <form className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all"
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Subject
                  </label>
                  <select
                    id="subject"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all"
                  >
                    <option>Wholesale Inquiry</option>
                    <option>Product Information</option>
                    <option>Order Status</option>
                    <option>Other</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Message
                  </label>
                  <textarea
                    id="message"
                    rows={6}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all"
                    placeholder="How can we help you?"
                  ></textarea>
                </div>

                <Button
                  className="w-full md:w-auto px-8 py-3"
                  rightIcon={<FiSend />}
                >
                  Send Message
                </Button>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { FiUsers, FiAward, FiTruck, FiGlobe } from 'react-icons/fi';

export default function AboutPage() {
  const stats = [
    { label: 'Years of Experience', value: '15+' },
    { label: 'Products', value: '500+' },
    { label: 'Happy Clients', value: '1000+' },
    { label: 'Products Served', value: '10k+' },
  ];

  const values = [
    {
      icon: <FiAward className="h-8 w-8" />,
      title: 'Premium Quality',
      description: 'We source only the finest authentic ingredients directly from trusted suppliers in India.'
    },
    {
      icon: <FiUsers className="h-8 w-8" />,
      title: 'Customer First',
      description: 'Our dedicated team ensures personalized service and support for every wholesale partner.'
    },
    {
      icon: <FiTruck className="h-8 w-8" />,
      title: 'Reliable Logistics',
      description: 'Efficient supply chain management ensuring timely delivery of fresh products.'
    },
    {
      icon: <FiGlobe className="h-8 w-8" />,
      title: 'Authentic Taste',
      description: 'Bringing the true flavors of India to kitchens across the United States.'
    }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Hero Section */}
      <section className="relative py-20 bg-lime-900 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1596040033229-a9821ebd058d?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-20"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-lime-900/90 to-green-900/80"></div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl mx-auto text-center text-white"
          >
            <h1 className="text-5xl font-bold mb-6">Our Story</h1>
            <p className="text-xl text-lime-100 leading-relaxed">
              Bridging cultures through the language of food. Shreeji International is your premier partner for authentic Indian wholesale groceries.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative h-[500px] rounded-2xl overflow-hidden shadow-2xl"
            >
              <Image
                src="https://images.unsplash.com/photo-1532336414038-cf19250cce50?q=80&w=2070&auto=format&fit=crop"
                alt="Indian Spices"
                fill
                className="object-cover"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                Bringing Authenticity to Your Shelf
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6 text-lg leading-relaxed">
                Founded with a passion for quality and authenticity, Shreeji International has grown to become a leading distributor of Indian grocery products in the United States. We understand that food is more than just sustenance—it's a connection to heritage and culture.
              </p>
              <p className="text-gray-600 dark:text-gray-300 mb-8 text-lg leading-relaxed">
                Our mission is simple: to provide retailers and businesses with the highest quality Indian products at competitive wholesale prices, ensuring that the rich flavors of India are accessible to everyone.
              </p>

              <div className="grid grid-cols-2 gap-6">
                {stats.map((stat, index) => (
                  <div key={index} className="border-l-4 border-lime-500 pl-4">
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800/50">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Our Core Values</h2>
            <p className="text-gray-600 dark:text-gray-300">
              We believe in building lasting relationships based on trust, quality, and mutual growth.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 dark:border-gray-700"
              >
                <div className="w-14 h-14 bg-lime-100 dark:bg-lime-900/30 rounded-full flex items-center justify-center text-lime-600 dark:text-lime-400 mb-6">
                  {value.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{value.title}</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {value.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
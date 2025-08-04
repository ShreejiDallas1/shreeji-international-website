'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { collection, getDocs, query, where, limit, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import ProductCard from './ProductCard';
import SearchBar from './SearchBar';
import { FiArrowRight, FiStar, FiTruck, FiShield, FiUsers, FiTrendingUp, FiMapPin } from 'react-icons/fi';
import LoadingSpinner from './LoadingSpinner';
import { getCategoryInfo } from '@/data/categoryMappings';
import { useAppContext } from '@/lib/context';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
  image: string;
  stock: number;
  unit: string;
  featured?: boolean;
  brand?: string;
  minOrderQuantity?: number;
  createdAt: Date;
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
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5
    }
  }
};

export default function HomePage() {
  const { productsRefreshTrigger } = useAppContext();
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  // Removed currentTextIndex state - no longer using rotating text


  // Fetch featured products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const productsCollection = collection(db, 'products');
        
        // Fetch featured products
        const featuredQuery = query(
          productsCollection,
          where('featured', '==', true),
          limit(6)
        );
        const featuredSnapshot = await getDocs(featuredQuery);
        
        // Process featured products
        const featuredData: Product[] = [];
        featuredSnapshot.forEach((doc) => {
          const data = doc.data();
          featuredData.push({
            id: doc.id,
            name: data.name || 'Unnamed Product',
            description: data.description || 'No description available',
            price: typeof data.price === 'number' ? data.price : 0,
            category: data.category || 'Uncategorized',
            imageUrl: data.imageUrl || data.image || '',
            image: data.image || data.imageUrl || '',
            stock: typeof data.stock === 'number' ? data.stock : 0,
            unit: data.unit || '',
            brand: data.brand || '',
            featured: Boolean(data.featured),
            minOrderQuantity: typeof data.minOrderQuantity === 'number' ? data.minOrderQuantity : 1,
            createdAt: data.createdAt ? new Date(data.createdAt.seconds * 1000) : new Date()
          });
        });
        
        setFeaturedProducts(featuredData);
        
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
    fetchSquareCategories();
  }, [productsRefreshTrigger]);

  // Removed rotating text animation - now using static text

  // Get categories from Square instead of auto-generating them
  const fetchSquareCategories = async () => {
    try {
      console.log('📂 Fetching categories from Square...');
      
      const response = await fetch('/api/square/categories', {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      const data = await response.json();
      
      if (data.success && data.categories) {
        console.log('✅ Loaded categories from Square:', data.categories);
        setCategories(data.categories);
      } else {
        console.error('❌ Failed to load Square categories:', data.error);
        // Fallback to a simple default category
        setCategories([{
          name: 'All Products',
          emoji: '🛒',
          color: 'from-lime-500 to-green-600',
          productCount: 0,
          description: 'Browse all available products'
        }]);
      }
      
    } catch (error) {
      console.error('❌ Error fetching Square categories:', error);
      // Fallback to a simple default category
      setCategories([{
        name: 'All Products',
        emoji: '🛒',
        color: 'from-lime-500 to-green-600',
        productCount: 0,
        description: 'Browse all available products'
      }]);
    }
  };

  // Real categories from products with AI-generated emojis and colors
  const [categories, setCategories] = useState<Array<{
    id?: string;
    name: string;
    emoji: string;
    description: string;
    color: string;
    productCount: number;
  }>>([]);

  const features = useMemo(() => [
    {
      icon: <FiTruck className="h-8 w-8" />,
      title: 'Fast Delivery',
      description: 'Quick and reliable delivery across the region',
      color: 'text-blue-500'
    },
    {
      icon: <FiShield className="h-8 w-8" />,
      title: 'Quality Assured',
      description: 'Premium quality products with authenticity guarantee',
      color: 'text-green-500'
    },
    {
      icon: <FiUsers className="h-8 w-8" />,
      title: 'Wholesale Pricing',
      description: 'Competitive bulk pricing for retailers and businesses',
      color: 'text-purple-500'
    },
    {
      icon: <FiStar className="h-8 w-8" />,
      title: 'Trusted Brand',
      description: 'Serving customers with excellence for years',
      color: 'text-yellow-500'
    }
  ], []);

  if (loading) {
    return <LoadingSpinner size="lg" text="Loading amazing products..." />;
  }

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Hero Section */}
      <motion.section
        className="relative bg-gradient-to-r from-lime-600 via-green-600 to-emerald-700 text-white overflow-hidden"
        variants={itemVariants}
      >
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width=%2260%22%20height=%2260%22%20viewBox=%220%200%2060%2060%22%20xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg%20fill=%22none%22%20fill-rule=%22evenodd%22%3E%3Cg%20fill=%22%239C92AC%22%20fill-opacity=%220.05%22%3E%3Ccircle%20cx=%2230%22%20cy=%2230%22%20r=%224%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>
        
        <div className="relative container mx-auto px-4 py-28 lg:py-40">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              className="space-y-10"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="space-y-6">
                <motion.h1
                  className="text-5xl lg:text-7xl font-bold leading-tight"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <span className="block">Discover</span>
                  <span className="block bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                    Premium Indian Groceries
                  </span>
                </motion.h1>
                
                <motion.p
                  className="text-xl lg:text-2xl text-lime-100 leading-relaxed max-w-lg"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  Wholesale authentic Indian groceries and specialty foods. 
                  <span className="block mt-2 text-lg text-lime-200">
                    US Only • Premium Quality • Wholesale Pricing
                  </span>
                </motion.p>
              </div>
              
              <motion.div
                className="flex flex-col sm:flex-row gap-6 mt-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <Link
                  href="/products"
                  className="inline-flex items-center px-10 py-5 bg-white text-lime-700 font-bold rounded-full hover:bg-lime-50 transition-all duration-300 transform hover:scale-105 shadow-xl group text-lg"
                >
                  Shop Now
                  <FiArrowRight className="ml-3 group-hover:translate-x-1 transition-transform" />
                </Link>
                
              </motion.div>
            </motion.div>
            
            <motion.div
              className="relative"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <div className="relative z-10 bg-white/10 backdrop-blur-sm rounded-3xl p-10 border border-white/20">
                <SearchBar 
                  placeholder="Search for spices, grains, oils..." 
                  className="mb-6"
                  showTypingAnimation={true}
                />
                <h3 className="text-xl font-semibold mb-4">Popular Categories</h3>
                <div className="flex flex-wrap gap-2">
                  {categories.slice(0, 6).map((category) => (
                    <Link
                      key={category.name}
                      href={`/products?category=${category.name.toLowerCase().replace(/\s+/g, '-')}`}
                      className="px-4 py-2 bg-white/20 rounded-full text-sm hover:bg-white/30 transition-colors flex items-center space-x-2"
                    >
                      <span>{category.emoji}</span>
                      <span>{category.name}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Categories Section */}
      <motion.section
        className="py-24 bg-white dark:bg-gray-800"
        variants={itemVariants}
      >
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Product Categories
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Explore our wide range of authentic Indian grocery categories
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.length === 0 ? (
              // Categories coming soon placeholder
              <div className="col-span-full text-center py-16">
                <div className="text-6xl mb-6">📦</div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Categories Coming Soon!
                </h3>
                <p className="text-lg text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                  We're organizing our product categories to make shopping easier for you.
                </p>
              </div>
            ) : (
              categories.map((category, index) => (
              <motion.div
                key={category.name}
                className="group"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Link
                  href={`/products?category=${category.name.toLowerCase().replace(/\s+/g, '-')}`}
                  className={`block p-8 rounded-2xl bg-gradient-to-br ${category.color} text-white transform transition-all duration-300 hover:scale-105 hover:shadow-2xl`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-4xl">{category.emoji}</span>
                    <span className="text-sm font-medium bg-white/20 px-3 py-1 rounded-full">
                      {category.productCount}+
                    </span>
                  </div>
                  <h3 className="text-xl font-bold">{category.name}</h3>
                </Link>
              </motion.div>
              ))
            )}
          </div>
        </div>
      </motion.section>

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <motion.section
          className="py-24 bg-gray-50 dark:bg-gray-900"
          variants={itemVariants}
        >
          <div className="container mx-auto px-4">
            <motion.div
              className="text-center mb-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                Featured Products
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Our handpicked selection of premium products
              </p>
            </motion.div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </div>
            
            <motion.div
              className="text-center mt-12"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              <Link
                href="/products"
                className="inline-flex items-center px-8 py-4 bg-lime-600 text-white font-bold rounded-full hover:bg-lime-700 transition-all duration-300 transform hover:scale-105 shadow-lg group"
              >
                View All Products
                <FiArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </div>
        </motion.section>
      )}



      {/* Features Section */}
      <motion.section
        className="py-24 bg-gradient-to-r from-lime-600 to-green-600 text-white"
        variants={itemVariants}
      >
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              Why Choose Shreeji International?
            </h2>
            <p className="text-xl text-lime-100 max-w-2xl mx-auto">
              Your trusted partner for authentic Indian groceries
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                className="text-center group"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-6 group-hover:bg-white/30 transition-colors">
                  <div className="text-white">
                    {feature.icon}
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-4">{feature.title}</h3>
                <p className="text-lime-100">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section
        className="py-20 bg-gray-900 text-white"
        variants={itemVariants}
      >
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              Ready to Start Your Business?
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Join hundreds of retailers who trust Shreeji International for their grocery needs
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/products"
                className="inline-flex items-center px-8 py-4 bg-lime-600 text-white font-bold rounded-full hover:bg-lime-700 transition-all duration-300 transform hover:scale-105 shadow-lg group"
              >
                Browse Products
                <FiArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center px-8 py-4 border-2 border-white text-white font-bold rounded-full hover:bg-white hover:text-gray-900 transition-all duration-300 transform hover:scale-105"
              >
                Contact Us
              </Link>
            </div>
          </motion.div>
        </div>
      </motion.section>
    </motion.div>
  );
}
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

interface Stats {
  totalProducts: number;
  totalCategories: number;
  totalOrders: number;
  happyCustomers: number;
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
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [recentProducts, setRecentProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats>({
    totalProducts: 0,
    totalCategories: 0,
    totalOrders: 1250,
    happyCustomers: 500
  });

  // Fetch featured and recent products
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
        
        // Fetch recent products (fallback if no featured products)
        const recentQuery = query(
          productsCollection,
          orderBy('createdAt', 'desc'),
          limit(8)
        );
        const recentSnapshot = await getDocs(recentQuery);
        
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
        
        // Process recent products
        const recentData: Product[] = [];
        recentSnapshot.forEach((doc) => {
          const data = doc.data();
          recentData.push({
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
        setRecentProducts(recentData);
        
        // Calculate stats
        if (recentData && Array.isArray(recentData)) {
          const categories = new Set(recentData.map(p => p.category));
          setStats(prev => ({
            ...prev,
            totalProducts: recentData.length,
            totalCategories: categories.size
          }));
        }
        
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Memoize categories for better performance
  const categories = useMemo(() => [
    { name: 'Spices & Seasonings', icon: '🌶️', count: '50+', color: 'from-red-500 to-orange-500' },
    { name: 'Lentils & Pulses', icon: '🫘', count: '30+', color: 'from-yellow-500 to-amber-500' },
    { name: 'Rice & Grains', icon: '🌾', count: '25+', color: 'from-green-500 to-lime-500' },
    { name: 'Flour & Baking', icon: '🌾', count: '20+', color: 'from-blue-500 to-indigo-500' },
    { name: 'Oil & Ghee', icon: '🛢️', count: '15+', color: 'from-purple-500 to-pink-500' },
    { name: 'Snacks & Sweets', icon: '🍪', count: '40+', color: 'from-pink-500 to-red-500' }
  ], []);

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
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{ 
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` 
          }}></div>
        </div>
        
        <div className="relative container mx-auto px-4 py-24 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-6">
                <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
                  Premium
                  <span className="block bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                    Indian Groceries
                  </span>
                </h1>
                
                <p className="text-xl lg:text-2xl text-lime-100 leading-relaxed max-w-lg">
                  Wholesale authentic Indian spices, grains, and specialty foods for your business
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/products"
                  className="inline-flex items-center px-8 py-4 bg-white text-lime-700 font-bold rounded-full hover:bg-lime-50 transition-all duration-300 transform hover:scale-105 shadow-xl group"
                >
                  Shop Now
                  <FiArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
                
                <Link
                  href="/contact"
                  className="inline-flex items-center px-8 py-4 border-2 border-white text-white font-bold rounded-full hover:bg-white hover:text-lime-700 transition-all duration-300 transform hover:scale-105"
                >
                  Get Quote
                </Link>
              </div>
              
              {/* Stats */}
              <div className="grid grid-cols-2 gap-6 pt-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-300">{stats.totalProducts}+</div>
                  <div className="text-lime-200">Products</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-300">{stats.happyCustomers}+</div>
                  <div className="text-lime-200">Happy Customers</div>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="relative z-10 bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20">
                <SearchBar 
                  placeholder="Search for spices, grains, oils..." 
                  className="mb-6"
                />
                <h3 className="text-xl font-semibold mb-4">Quick Search</h3>
                <div className="flex flex-wrap gap-2">
                  {['Turmeric', 'Basmati Rice', 'Ghee', 'Lentils', 'Cardamom'].map((item) => (
                    <Link
                      key={item}
                      href={`/products?search=${item}`}
                      className="px-4 py-2 bg-white/20 rounded-full text-sm hover:bg-white/30 transition-colors"
                    >
                      {item}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Categories Section */}
      <motion.section
        className="py-20 bg-white dark:bg-gray-800"
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
            {categories.map((category, index) => (
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
                    <span className="text-4xl">{category.icon}</span>
                    <span className="text-sm font-medium bg-white/20 px-3 py-1 rounded-full">
                      {category.count}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold mb-2">{category.name}</h3>
                  <p className="text-white/80 text-sm">Premium quality products</p>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <motion.section
          className="py-20 bg-gray-50 dark:bg-gray-900"
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
              {featuredProducts && featuredProducts.map((product, index) => (
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

      {/* Recent Products */}
      <motion.section
        className="py-20 bg-white dark:bg-gray-800"
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
              Latest Arrivals
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Fresh stock of authentic Indian groceries
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {recentProducts && recentProducts.slice(0, 8).map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Features Section */}
      <motion.section
        className="py-20 bg-gradient-to-r from-lime-600 to-green-600 text-white"
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
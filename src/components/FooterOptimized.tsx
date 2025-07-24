'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { FiMail, FiPhone, FiMapPin, FiClock, FiFacebook, FiTwitter, FiInstagram, FiLinkedin } from 'react-icons/fi';

const FooterOptimized = () => {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { name: 'Home', href: '/' },
    { name: 'Products', href: '/products' },
    { name: 'About Us', href: '/about' },
    { name: 'Contact', href: '/contact' },

  ];

  const [categories, setCategories] = React.useState<Array<{name: string, href: string}>>([]);

  React.useEffect(() => {
    // Fetch dynamic categories from Firebase
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/generate-categories');
        const data = await response.json();
        if (data.categories) {
          const categoryLinks = data.categories.map((cat: any) => ({
            name: cat.name,
            href: `/products?category=${cat.name.toLowerCase().replace(/\s+/g, '-')}`
          }));
          setCategories(categoryLinks.slice(0, 5)); // Show only first 5 in footer
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        // Fallback to basic links
        setCategories([
          { name: 'All Products', href: '/products' },
          { name: 'Featured Products', href: '/products?featured=true' },
          { name: 'New Arrivals', href: '/products?sort=latest' }
        ]);
      }
    };
    
    fetchCategories();
  }, []);

  const businessInfo = [
    { name: 'Wholesale Pricing', href: '/wholesale' },
    { name: 'Bulk Orders', href: '/bulk-orders' },
    { name: 'Trade Accounts', href: '/trade' },
    { name: 'Shipping Info', href: '/shipping' },
    { name: 'Return Policy', href: '/returns' }
  ];

  const socialLinks = [
    { icon: FiFacebook, href: '#', label: 'Facebook' },
    { icon: FiTwitter, href: '#', label: 'Twitter' },
    { icon: FiInstagram, href: '#', label: 'Instagram' },
    { icon: FiLinkedin, href: '#', label: 'LinkedIn' }
  ];

  return (
    <footer className="bg-gray-900 text-white">
      {/* Main Footer Content */}
      <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900">
        <div className="container mx-auto px-4 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Company Info */}
            <motion.div
              className="space-y-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div>
                <Link href="/" className="inline-block mb-4">
                  <Image 
                    src="/images/ShreejiLogo.png" 
                    alt="Shreeji International" 
                    width={300} 
                    height={105}
                    className="h-24 w-auto"
                  />
                </Link>
                <p className="text-gray-300 text-sm leading-relaxed">
                  Premium wholesale Indian grocery supplier. Authentic spices, grains, and specialty foods for your business needs.
                </p>
              </div>
              
              {/* Social Links */}
              <div className="flex space-x-4">
                {socialLinks.map((social, index) => (
                  <motion.a
                    key={social.label}
                    href={social.href}
                    className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-lime-600 transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    aria-label={social.label}
                  >
                    <social.icon className="h-4 w-4" />
                  </motion.a>
                ))}
              </div>
            </motion.div>

            {/* Quick Links */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <h3 className="text-lg font-bold mb-6 text-lime-400">Quick Links</h3>
              <ul className="space-y-3">
                {quickLinks.map((link) => (
                  <li key={link.name}>
                    <Link 
                      href={link.href}
                      className="text-gray-300 hover:text-lime-400 transition-colors text-sm flex items-center group"
                    >
                      <span className="w-1 h-1 bg-lime-400 rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Product Categories */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h3 className="text-lg font-bold mb-6 text-lime-400">Categories</h3>
              <ul className="space-y-3">
                {categories.map((category) => (
                  <li key={category.name}>
                    <Link 
                      href={category.href}
                      className="text-gray-300 hover:text-lime-400 transition-colors text-sm flex items-center group"
                    >
                      <span className="w-1 h-1 bg-lime-400 rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                      {category.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <h3 className="text-lg font-bold mb-6 text-lime-400">Contact Info</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <FiMapPin className="h-5 w-5 text-lime-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-gray-300 text-sm">
                      1162 Security Dr<br />
                      Dallas, TX 75247<br />
                      United States
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <FiPhone className="h-5 w-5 text-lime-400 flex-shrink-0" />
                  <div>
                    <a href="tel:+12145297974" className="text-gray-300 hover:text-lime-400 transition-colors text-sm">
                      (214) 529-7974
                    </a>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <FiMail className="h-5 w-5 text-lime-400 flex-shrink-0" />
                  <div>
                    <a href="mailto:shreejidallas1@gmail.com" className="text-gray-300 hover:text-lime-400 transition-colors text-sm">
                      shreejidallas1@gmail.com
                    </a>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <FiClock className="h-5 w-5 text-lime-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-gray-300 text-sm">
                      Mon - Fri: 10:00 AM - 5:00 PM CST<br />
                      Closed weekends
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>



      {/* Bottom Bar */}
      <div className="bg-gray-900 border-t border-gray-800">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <motion.p
              className="text-gray-400 text-sm text-center md:text-left"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              © {currentYear} Shreeji International. All rights reserved.
            </motion.p>
            
            <motion.div
              className="flex space-x-6 mt-4 md:mt-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <Link href="/privacy" className="text-gray-400 hover:text-lime-400 transition-colors text-sm">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-gray-400 hover:text-lime-400 transition-colors text-sm">
                Terms of Service
              </Link>
              <Link href="/cookies" className="text-gray-400 hover:text-lime-400 transition-colors text-sm">
                Cookie Policy
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default FooterOptimized;
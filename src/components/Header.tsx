'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAppContext } from '@/lib/context';
import { useAdmin } from '@/hooks/useAdmin';
import { FiMenu, FiX, FiShoppingCart, FiUser, FiPackage, FiHome, FiInfo, FiPhone, FiHelpCircle, FiSettings, FiClock } from 'react-icons/fi';
import { motion } from 'framer-motion';
import ComingSoonModal from './ComingSoonModal';

const Header = () => {
  const [showComingSoon, setShowComingSoon] = React.useState(false);
  
  const { 
    user, 
    isMobileMenuOpen, 
    toggleMobileMenu, 
    closeMobileMenu,
    getItemCount,
    darkMode,
    toggleDarkMode,
    syncStatus,
    manualSync,
    isAdmin: isAdminContext
  } = useAppContext();
  
  const { isAdmin } = useAdmin();

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-gray-900 shadow-lg border-b border-gray-100 dark:border-gray-800 dark:text-white">
      <div className="bg-gradient-to-r from-lime-50 to-lime-100 dark:from-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center" onClick={closeMobileMenu}>
              <motion.div 
                className="relative"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className="absolute -inset-1 bg-gradient-to-r from-lime-400 to-lime-500 rounded-lg blur-md opacity-20"></div>
                <Image 
                  src="/images/ShreejiLogo.png" 
                  alt="Shreeji International" 
                  width={400} 
                  height={140}
                  className="h-20 w-auto relative"
                  priority
                />
              </motion.div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <NavLink href="/" label="Home" icon={<FiHome />} />
              <NavLink href="/about" label="About Us" icon={<FiInfo />} />
              <NavLink href="/products" label="Products" icon={<FiPackage />} />
              {/* {user && <NavLink href="/account/orders" label="My Orders" icon={<FiPackage />} />} */}
              <NavLink href="/contact" label="Contact" icon={<FiPhone />} />

              {isAdmin && (
                <NavLink href="/admin" label="Admin" icon={<FiSettings />} />
              )}
            </nav>

            {/* Admin Sync Status */}
            {isAdminContext && typeof syncStatus === 'object' && syncStatus !== null && 'isRunning' in syncStatus && (
              <div className="hidden md:flex items-center space-x-2 mr-4">
                {syncStatus.isRunning ? (
                  <div className="flex items-center space-x-2 text-lime-500">
                    <div className="animate-spin h-4 w-4 border-2 border-lime-500 border-t-transparent rounded-full"></div>
                    <span className="text-xs">Syncing...</span>
                  </div>
                ) : syncStatus.error ? (
                  <div className="flex items-center space-x-2 text-red-500">
                    <div className="h-2 w-2 bg-red-500 rounded-full"></div>
                    <span className="text-xs">Sync Error</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2 text-green-500">
                    <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-xs">Auto-Sync ON</span>
                  </div>
                )}
                <button
                  onClick={manualSync}
                  className="text-xs px-2 py-1 bg-lime-500 text-white rounded hover:bg-lime-600 transition-colors"
                  disabled={typeof syncStatus === 'object' && syncStatus !== null && 'isRunning' in syncStatus ? syncStatus.isRunning : false}
                >
                  Manual Sync
                </button>
              </div>
            )}

            {/* User Actions */}
            <div className="hidden md:flex items-center space-x-4">
              
              {/* Theme Toggle - Removed to prevent app breakage */}

              {/* Coming Soon Cart Button */}
              <button 
                onClick={() => setShowComingSoon(true)}
                className="relative p-2 text-gray-700 dark:text-gray-300 hover:text-amber-500 dark:hover:text-amber-400 transition-colors group"
                title="Shopping Coming Soon"
              >
                <div className="relative">
                  <FiShoppingCart className="h-6 w-6" />
                  <FiClock className="h-3 w-3 absolute -top-1 -right-1 text-amber-500" />
                </div>
                {getItemCount() > 0 && (
                  <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {getItemCount()}
                  </span>
                )}
                <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap mb-1">
                  Coming Soon
                </span>
              </button>

              {/* User Account */}
              {user ? (
                <Link 
                  href="/dashboard" 
                  className="flex items-center space-x-2 p-2 text-gray-700 dark:text-gray-300 hover:text-lime-500 dark:hover:text-lime-400 transition-colors"
                >
                  <FiUser className="h-6 w-6" />
                  <span className="hidden lg:inline">My Account</span>
                </Link>
              ) : (
                <Link 
                  href="/auth/login" 
                  className="bg-gradient-to-r from-lime-500 to-lime-600 hover:from-lime-600 hover:to-lime-700 text-white px-4 py-2 rounded-md transition-colors"
                >
                  Login
                </Link>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center space-x-2">
              
              {/* Coming Soon Cart Button */}
              <button 
                onClick={() => setShowComingSoon(true)}
                className="relative p-2 text-gray-700 dark:text-gray-300 hover:text-amber-500 dark:hover:text-amber-400 transition-colors"
                title="Shopping Coming Soon"
              >
                <div className="relative">
                  <FiShoppingCart className="h-6 w-6" />
                  <FiClock className="h-3 w-3 absolute -top-1 -right-1 text-amber-500" />
                </div>
                {getItemCount() > 0 && (
                  <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {getItemCount()}
                  </span>
                )}
              </button>
              
              {/* Menu Toggle */}
              <button 
                className="p-2 text-gray-700 dark:text-gray-300 hover:text-lime-500 dark:hover:text-lime-400 transition-colors"
                onClick={toggleMobileMenu}
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? (
                  <FiX className="h-6 w-6" />
                ) : (
                  <FiMenu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="md:hidden bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800"
        >
          <div className="container mx-auto px-4 py-4">
            <nav className="flex flex-col space-y-4">
              <MobileNavLink href="/" label="Home" icon={<FiHome />} onClick={closeMobileMenu} />
              <MobileNavLink href="/about" label="About Us" icon={<FiInfo />} onClick={closeMobileMenu} />
              <MobileNavLink href="/products" label="Products" icon={<FiPackage />} onClick={closeMobileMenu} />
              {/* {user && <MobileNavLink href="/account/orders" label="My Orders" icon={<FiPackage />} onClick={closeMobileMenu} />} */}
              <MobileNavLink href="/contact" label="Contact" icon={<FiPhone />} onClick={closeMobileMenu} />

              {isAdmin && (
                <MobileNavLink href="/admin" label="Admin" icon={<FiSettings />} onClick={closeMobileMenu} />
              )}
              
              {/* Theme Toggle removed - Dark mode only */}
              
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                {user ? (
                  <Link 
                    href="/dashboard" 
                    className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 p-3 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    onClick={closeMobileMenu}
                  >
                    <FiUser className="h-5 w-5" />
                    <span>My Account</span>
                  </Link>
                ) : (
                  <Link 
                    href="/auth/login" 
                    className="bg-gradient-to-r from-lime-500 to-lime-600 hover:from-lime-600 hover:to-lime-700 text-white px-4 py-3 rounded-md transition-colors flex items-center justify-center"
                    onClick={closeMobileMenu}
                  >
                    <FiUser className="h-5 w-5 mr-2" />
                    Login
                  </Link>
                )}
              </div>
            </nav>
          </div>
        </motion.div>
      )}
      
      {/* Coming Soon Modal */}
      <ComingSoonModal 
        isOpen={showComingSoon} 
        onClose={() => setShowComingSoon(false)}
        feature="Online Shopping"
      />
    </header>
  );
};

// Desktop Navigation Link
const NavLink = ({ href, label, icon }: { href: string; label: string; icon?: React.ReactNode }) => {
  return (
    <Link 
      href={href} 
      className="text-gray-800 dark:text-gray-200 hover:text-lime-600 dark:hover:text-lime-400 font-medium transition-colors relative group py-2 flex items-center"
    >
      {icon && <span className="mr-2">{icon}</span>}
      {label}
      <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-lime-500 transition-all duration-300 group-hover:w-full"></span>
    </Link>
  );
};

// Mobile Navigation Link
const MobileNavLink = ({ 
  href, 
  label, 
  icon,
  onClick 
}: { 
  href: string; 
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
}) => {
  return (
    <Link 
      href={href} 
      className="text-gray-800 dark:text-gray-200 hover:text-lime-600 dark:hover:text-lime-400 font-medium py-3 px-2 transition-colors border-b border-gray-100 dark:border-gray-800 flex items-center rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
      onClick={onClick}
    >
      {icon && <span className="mr-3 text-gray-500 dark:text-gray-400">{icon}</span>}
      {label}
      <span className="ml-auto text-gray-400 dark:text-gray-500">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </span>
    </Link>
  );
};

export default Header;

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import ProductImage from './ProductImage';
import Image from 'next/image';
import { FiEye } from 'react-icons/fi';
import { useAppContext } from '@/lib/context';
import { Product } from '@/hooks/useProducts';
import { motion } from 'framer-motion';
import { formatCurrency } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
  onAddToCart?: () => void;
  viewMode?: 'grid' | 'list';
}

const ProductCard: React.FC<ProductCardProps> = React.memo(({ product, onAddToCart, viewMode = 'grid' }) => {
  const { user } = useAppContext();
  
  // Get image URL
  const imageUrl = product.image || product.imageUrl || '';

  // Different layouts for grid vs list view
  if (viewMode === 'list') {
    return (
      <motion.div 
        className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 group min-h-[160px]"
        whileHover={{ y: -2 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex h-full">
          {/* Image Section - Better proportions for list view */}
          <div className="relative w-48 h-36 flex-shrink-0 overflow-hidden bg-gray-100 dark:bg-gray-700 rounded-l-xl">
            <Link href={`/products/${product.id}`} className="block relative h-full w-full">
              {imageUrl ? (
                <Image
                  src={imageUrl}
                  alt={product.name}
                  fill
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  unoptimized
                />
              ) : (
                <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                  <span className="text-gray-400">No Image</span>
                </div>
              )}
            </Link>
            
            {/* Stock Status for list view */}
            {(product.stock === 0 || product.stock < 0) && (
              <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
                <span className="bg-red-500 text-white px-2 py-1 rounded text-xs font-medium">
                  Out of Stock
                </span>
              </div>
            )}
          </div>
          
          {/* Content Section */}
          <div className="flex-1 p-6">
            <div className="flex justify-between items-start h-full">
              <div className="flex-1">
                <div className="flex items-center mb-3">
                  <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                    {product.category}
                  </span>
                  {product.featured && (
                    <span className="ml-2 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded">
                      FEATURED
                    </span>
                  )}
                </div>
                
                <Link href={`/products/${product.id}`} className="block">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2 group-hover:text-lime-600 dark:group-hover:text-lime-400 transition-colors line-clamp-2">
                    {product.name}
                  </h3>
                </Link>
                
                {product.brand && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                    {product.brand}
                  </p>
                )}
                
                <div className="flex items-center justify-between mt-auto">
                  <div>
                    {user ? (
                      <span className="text-xl font-bold text-orange-500 dark:text-orange-400">
                        {formatCurrency(product.price)}
                      </span>
                    ) : (
                      <Link href="/auth/login" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                        Login to see prices
                      </Link>
                    )}
                  </div>
                  
                  <div className="text-right">
                    <span className="text-xs text-gray-500 dark:text-gray-400 block">
                      Min: {product.minOrderQuantity || 5} {product.unit || 'units'}
                    </span>
                    {product.stock > 0 ? (
                      <span className="text-xs text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded mt-1 inline-block">
                        In Stock ({product.stock})
                      </span>
                    ) : (
                      <span className="text-xs text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 px-2 py-1 rounded mt-1 inline-block">
                        Out of Stock
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  // Grid view (default)
  return (
    <motion.div 
      className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 group"
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
    >
      <div className="relative h-56 w-full overflow-hidden bg-gray-100 dark:bg-gray-700">
        <Link href={`/products/${product.id}`} className="block relative h-full w-full">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={product.name}
              fill
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              unoptimized
            />
          ) : (
            <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
              <span className="text-gray-400">No Image</span>
            </div>
          )}
        </Link>
        
        {/* Overlay with quick actions */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
          <div className="flex gap-2">
            <button
              onClick={() => window.location.href = `/products/${product.id}`}
              className="p-3 rounded-full bg-lime-500 hover:bg-lime-600 text-white transition-colors shadow-lg backdrop-blur-sm"
              aria-label="View product"
            >
              <FiEye className="h-5 w-5" />
            </button>
          </div>
        </div>
        
        {/* Category Badge */}
        <div className="absolute top-3 left-3">
          <span className="bg-blue-100 text-blue-800 text-xs font-medium px-3 py-1 rounded-full">
            {product.category}
          </span>
        </div>
        
        {/* Stock Status */}
        {(product.stock === 0 || product.stock < 0) && (
          <div className="absolute top-0 right-0 bottom-0 left-0 bg-black bg-opacity-60 flex items-center justify-center z-20">
            <span className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-lg animate-pulse">
              Out of Stock
            </span>
          </div>
        )}
        
        {/* Featured Badge */}
        {product.featured && (
          <div className="absolute top-3 right-3">
            <span className="bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-md shadow-sm">
              FEATURED
            </span>
          </div>
        )}
      </div>
      
      <div className="p-5">
        <div className="flex items-center mb-2">
          <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">Wholesale</span>
          {product.stock > 0 ? (
            <span className="ml-2 text-xs text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded">
              In Stock ({product.stock} units)
            </span>
          ) : (
            <span className="ml-2 text-xs text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 px-2 py-1 rounded font-medium">
              Out of Stock
            </span>
          )}
        </div>
        
        <Link href={`/products/${product.id}`} className="block">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2 group-hover:text-lime-600 dark:group-hover:text-lime-400 transition-colors">
            {product.name}
          </h3>
        </Link>
        
        {product.brand && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
            {product.brand}
          </p>
        )}
        
        <div className="flex justify-between items-center mt-3">
          <div>
            {user ? (
              <span className="text-xl font-bold text-orange-500 dark:text-orange-400">
                {formatCurrency(product.price)}
              </span>
            ) : (
              <Link href="/auth/login" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                Login to see prices
              </Link>
            )}
          </div>
          
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Min. Order: {product.minOrderQuantity || 5} {product.unit || 'units'}
          </span>
        </div>
      </div>
    </motion.div>
  );
});

ProductCard.displayName = 'ProductCard';

export default ProductCard;
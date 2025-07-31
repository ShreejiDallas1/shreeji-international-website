'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAppContext } from '@/lib/context';
import SearchBar from '@/components/SearchBar';
import Button from '@/components/Button';
import { FiFilter, FiGrid, FiList, FiStar } from 'react-icons/fi';
import ProductCard from '@/components/ProductCard';
import LoadingSpinner from '@/components/LoadingSpinner';
import { motion, AnimatePresence } from 'framer-motion';

// Product type
type Product = {
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
};

// Optimized ProductsPage component
export default function ProductsPageOptimized() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get('category');
  const searchParam = searchParams.get('search');
  
  const { addToCart, productsRefreshTrigger } = useAppContext();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState(searchParam || '');
  const [selectedCategory, setSelectedCategory] = useState(categoryParam || '');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100]);
  const [maxPrice, setMaxPrice] = useState(100);
  const [sortBy, setSortBy] = useState('name-asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(24); // Increased for better performance with large datasets
  const [loadMoreMode, setLoadMoreMode] = useState(false); // Toggle between pagination and load more
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(searchQuery);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();
  
  // Debounced search for better performance with large datasets
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300); // 300ms delay
    
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);
  
  // Categories state
  const [categories, setCategories] = useState<{id: string, name: string, slug: string, count: number}[]>([]);
  
  // Memoized categories with performance optimization
  const memoizedCategories = useMemo(() => {
    const categoryMap = new Map();
    products.forEach(product => {
      const category = product.category;
      if (categoryMap.has(category)) {
        categoryMap.set(category, categoryMap.get(category) + 1);
      } else {
        categoryMap.set(category, 1);
      }
    });
    
    return Array.from(categoryMap.entries()).map(([name, count]) => ({
      id: name.toLowerCase().replace(/\s+/g, '-'),
      name,
      slug: name.toLowerCase().replace(/\s+/g, '-'),
      count
    }));
  }, [products]);

  // Optimized fetch function
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      console.log('🔄 Fetching products...', { categoryParam, searchParam });
      const productsCollection = collection(db, 'products');
      
      // Use simple query to avoid index issues
      const productsQuery = query(
        productsCollection,
        limit(100) // Limit initial load
      );
      
      const querySnapshot = await getDocs(productsQuery);
      const productsData: Product[] = [];
      
      querySnapshot.forEach((doc) => {
        try {
          const data = doc.data();
          productsData.push({
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
            featured: Boolean(data.featured) || false,
            minOrderQuantity: typeof data.minOrderQuantity === 'number' ? data.minOrderQuantity : 1,
            createdAt: data.createdAt ? new Date(data.createdAt.seconds * 1000) : new Date()
          });
        } catch (docError) {
          console.error('Error processing product document:', docError);
        }
      });
      
      setProducts(productsData);
      console.log(`✅ Loaded ${productsData.length} products`);
      
      // Debug: Show all categories in products
      const allCategories = [...new Set(productsData.map(p => p.category))];
      console.log('📊 All categories in products:', allCategories);
      
      // Set dynamic price range based on actual product prices (already in USD)
      if (productsData.length > 0) {
        const prices = productsData.map(p => p.price).filter(p => p > 0);
        if (prices.length > 0) {
          const minPrice = Math.min(...prices);
          const maxPriceFound = Math.max(...prices);
          const calculatedMax = Math.ceil(maxPriceFound * 1.1);
          setMaxPrice(calculatedMax);
          setPriceRange([minPrice, calculatedMax]);
        }
      }
      
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
      setFilteredProducts([]);
    } finally {
      setLoading(false);
    }
  }, []); // Remove memoizedCategories dependency to avoid infinite loop

  // Fetch products on mount and when refresh is triggered
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts, productsRefreshTrigger]);

  // Handle URL parameter changes
  useEffect(() => {
    if (categoryParam) {
      setSelectedCategory(categoryParam);
      console.log('🔗 URL category parameter changed:', categoryParam);
    }
    if (searchParam) {
      setSearchQuery(searchParam);
      console.log('🔗 URL search parameter changed:', searchParam);
    }
  }, [categoryParam, searchParam]);

  // Optimized filtering with debouncing and memoization
  const filteredAndSortedProducts = useMemo(() => {
    let result = [...products];
    
    // Filter by search query (using debounced search for better performance)
    if (debouncedSearchQuery) {
      const query = debouncedSearchQuery.toLowerCase();
      result = result.filter(product => 
        product.name.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query) ||
        product.brand?.toLowerCase().includes(query)
      );
    }
    
    // Filter by category
    if (selectedCategory) {
      result = result.filter(product => {
        const productCategory = product.category.toLowerCase().trim();
        const selectedCategoryLower = selectedCategory.toLowerCase().replace(/-/g, ' ').trim();
        
        // Try multiple matching strategies
        return productCategory === selectedCategoryLower ||
               productCategory.includes(selectedCategoryLower) ||
               selectedCategoryLower.includes(productCategory) ||
               product.category.toLowerCase().trim() === selectedCategory.toLowerCase().trim();
      });
      
      console.log(`🔍 Filtering by category: "${selectedCategory}" found ${result.length} products`);
      console.log('🔍 First few products after filtering:', result.slice(0, 3).map(p => ({ name: p.name, category: p.category })));
    }
    
    // Filter by price range (prices are already in USD)
    result = result.filter(product => 
      product.price >= priceRange[0] && product.price <= priceRange[1]
    );
    
    // Sort products
    switch (sortBy) {
      case 'name-asc':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-desc':
        result.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'price-asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'featured':
        result.sort((a, b) => {
          if (a.featured && !b.featured) return -1;
          if (!a.featured && b.featured) return 1;
          return a.name.localeCompare(b.name);
        });
        break;
      default:
        break;
    }
    
    return result;
  }, [products, debouncedSearchQuery, selectedCategory, priceRange, sortBy]);

  // Pagination
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * productsPerPage;
    return filteredAndSortedProducts.slice(startIndex, startIndex + productsPerPage);
  }, [filteredAndSortedProducts, currentPage, productsPerPage]);

  const totalPages = Math.ceil(filteredAndSortedProducts.length / productsPerPage);

  // Handle add to cart
  const handleAddToCart = useCallback((product: Product) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.imageUrl || product.image || '/placeholder-product.svg'
    });
  }, [addToCart]);

  if (loading) {
    return <LoadingSpinner size="lg" text="Loading products..." />;
  }

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
            <div>
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-2">
                Products
              </h1>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <p className="text-lg text-gray-600 dark:text-gray-300">
                  {filteredAndSortedProducts.length} of {products.length} products
                  {selectedCategory && ` in ${selectedCategory}`}
                  {searchQuery && ` for "${searchQuery}"`}
                  {totalPages > 1 && ` • Page ${currentPage} of ${totalPages}`}
                </p>
                {products.length > 50 && (
                  <div className="flex items-center mt-2 sm:mt-0 text-sm text-green-600 dark:text-green-400">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                    Optimized for {products.length}+ products
                  </div>
                )}
              </div>
            </div>
            
            {/* View Toggle */}
            <div className="flex items-center gap-4 mt-4 lg:mt-0">
              <div className="flex border rounded-lg overflow-hidden bg-white dark:bg-gray-800">
                <button 
                  className={`p-3 ${viewMode === 'grid' ? 'bg-lime-500 text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                  onClick={() => setViewMode('grid')}
                  aria-label="Grid view"
                >
                  <FiGrid />
                </button>
                <button 
                  className={`p-3 ${viewMode === 'list' ? 'bg-lime-500 text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                  onClick={() => setViewMode('list')}
                  aria-label="List view"
                >
                  <FiList />
                </button>
              </div>
              
              <Button 
                variant="outline" 
                onClick={() => setShowFilters(!showFilters)}
                rightIcon={<FiFilter />}
                className="whitespace-nowrap"
              >
                Filters
              </Button>
            </div>
          </div>
          
          {/* Search Bar */}
          <SearchBar 
            placeholder="Search products..." 
            value={searchQuery}
            onChange={setSearchQuery}
            className="max-w-2xl"
          />
        </motion.div>
        
        {/* Filters Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 mb-8"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Categories Filter */}
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <div className="w-2 h-2 bg-lime-500 rounded-full mr-2"></div>
                    Categories
                  </h3>
                  <div className="space-y-3 max-h-48 overflow-y-auto">
                    <label className="flex items-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded-md transition-colors">
                      <input 
                        type="radio" 
                        name="category" 
                        checked={selectedCategory === ''}
                        onChange={() => setSelectedCategory('')}
                        className="w-4 h-4 text-lime-600 bg-gray-100 border-gray-300 focus:ring-lime-500"
                      />
                      <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">
                        All Categories ({products.length})
                      </span>
                    </label>
                    {memoizedCategories.map(category => (
                      <label key={category.id} className="flex items-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded-md transition-colors">
                        <input 
                          type="radio" 
                          name="category" 
                          checked={selectedCategory === category.slug}
                          onChange={() => setSelectedCategory(category.slug)}
                          className="w-4 h-4 text-lime-600 bg-gray-100 border-gray-300 focus:ring-lime-500"
                        />
                        <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">
                          {category.name} ({category.count})
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
                
                {/* Price Range Filter */}
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                    Price Range
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        placeholder="Min"
                        value={priceRange[0]}
                        onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                        className="w-full p-2 border rounded-md text-sm dark:bg-gray-700 dark:border-gray-600"
                      />
                      <span className="text-gray-500">to</span>
                      <input
                        type="number"
                        placeholder="Max"
                        value={priceRange[1]}
                        onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                        className="w-full p-2 border rounded-md text-sm dark:bg-gray-700 dark:border-gray-600"
                      />
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Range: ${priceRange[0]} - ${priceRange[1]} USD
                    </div>
                  </div>
                </div>
                
                {/* Sort Options */}
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                    Sort By
                  </h3>
                  <label htmlFor="sort-select" className="sr-only">Sort products by</label>
                  <select
                    id="sort-select"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full p-2 border rounded-md text-sm dark:bg-gray-700 dark:border-gray-600"
                    aria-label="Sort products by"
                  >
                    <option value="name-asc">Name (A-Z)</option>
                    <option value="name-desc">Name (Z-A)</option>
                    <option value="price-asc">Price (Low to High)</option>
                    <option value="price-desc">Price (High to Low)</option>
                    <option value="featured">Featured First</option>
                  </select>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Products Grid/List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {paginatedProducts.length > 0 ? (
            <>
              <div className={
                viewMode === 'grid' 
                  ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6'
                  : 'space-y-4'
              }>
                <AnimatePresence mode="popLayout">
                  {paginatedProducts.map((product, index) => (
                    <motion.div
                      key={product.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ 
                        duration: 0.2,
                        delay: Math.min(index * 0.02, 0.5) // Cap delay for large datasets
                      }}
                    >
                      <ProductCard 
                        product={product}
                        onAddToCart={() => handleAddToCart(product)}
                        viewMode={viewMode}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <motion.div
                  className="flex justify-center items-center space-x-2 mt-12"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  
                  {/* Smart pagination for large datasets */}
                  {(() => {
                    const maxVisiblePages = 7;
                    const pages = [];
                    
                    if (totalPages <= maxVisiblePages) {
                      // Show all pages if total is small
                      for (let i = 1; i <= totalPages; i++) {
                        pages.push(i);
                      }
                    } else {
                      // Smart pagination for large datasets
                      if (currentPage <= 4) {
                        // Show first pages + ellipsis + last
                        pages.push(1, 2, 3, 4, 5, '...', totalPages);
                      } else if (currentPage >= totalPages - 3) {
                        // Show first + ellipsis + last pages
                        pages.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
                      } else {
                        // Show first + ellipsis + current area + ellipsis + last
                        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
                      }
                    }
                    
                    return pages.map((page, index) => (
                      page === '...' ? (
                        <span key={`ellipsis-${index}`} className="px-3 py-2 text-gray-500">...</span>
                      ) : (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page as number)}
                          className={`px-3 py-2 rounded-md transition-colors ${
                            currentPage === page
                              ? 'bg-lime-500 text-white'
                              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                          }`}
                        >
                          {page}
                        </button>
                      )
                    ));
                  })()}
                  
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </motion.div>
              )}
            </>
          ) : (
            <motion.div
              className="text-center py-16"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="max-w-md mx-auto">
                {products.length === 0 ? (
                  // No products at all - Coming Soon
                  <>
                    <div className="text-6xl mb-6">🚀</div>
                    <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                      Products Coming Soon!
                    </h3>
                    <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
                      We're working hard to bring you the best wholesale Indian grocery products. 
                      Our catalog will be available very soon!
                    </p>
                    <div className="bg-gradient-to-r from-lime-50 to-green-50 dark:from-lime-900/20 dark:to-green-900/20 p-6 rounded-xl border border-lime-200 dark:border-lime-800">
                      <h4 className="font-semibold text-lime-800 dark:text-lime-300 mb-2">
                        What to expect:
                      </h4>
                      <ul className="text-sm text-lime-700 dark:text-lime-400 space-y-1">
                        <li>• Premium quality Indian groceries</li>
                        <li>• Wholesale pricing for businesses</li>
                        <li>• Fast nationwide shipping</li>
                        <li>• 100+ products across all categories</li>
                      </ul>
                    </div>
                  </>
                ) : (
                  // Products exist but filtered out
                  <>
                    <div className="text-6xl mb-4">📦</div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      No products found
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                      Try adjusting your search criteria or browse all categories
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <Button onClick={() => {
                        setSearchQuery('');
                        setSelectedCategory('');
                        setPriceRange([0, maxPrice]);
                      }}>
                        Clear Filters
                      </Button>
                      <Button variant="outline" onClick={() => window.location.href = '/products'}>
                        View All Products
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}
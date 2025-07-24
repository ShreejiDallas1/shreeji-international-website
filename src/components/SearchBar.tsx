'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FiSearch, FiX } from 'react-icons/fi';
import { collection, getDocs, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface SearchBarProps {
  placeholder?: string;
  className?: string;
  initialValue?: string;
  value?: string;
  onChange?: (value: string) => void;
  showTypingAnimation?: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = 'Search products...',
  className = '',
  initialValue = '',
  value,
  onChange,
  showTypingAnimation = false,
}) => {
  const [searchQuery, setSearchQuery] = useState(initialValue);
  const [realProducts, setRealProducts] = useState<string[]>([]);
  const [currentPlaceholder, setCurrentPlaceholder] = useState(placeholder);
  const [isTyping, setIsTyping] = useState(false);
  const router = useRouter();

  // Fetch real product names for typing animation
  useEffect(() => {
    if (showTypingAnimation) {
      const fetchProducts = async () => {
        try {
          const productsRef = collection(db, 'products');
          const productsSnapshot = await getDocs(productsRef);
          
          const productNames = productsSnapshot.docs
            .map(doc => doc.data().name)
            .filter(name => name && name.length > 0)
            .slice(0, 10); // Get first 10 real products
          
          setRealProducts(productNames);
        } catch (error) {
          console.error('Error fetching products for animation:', error);
        }
      };
      
      fetchProducts();
    }
  }, [showTypingAnimation]);

  // Typing animation effect
  useEffect(() => {
    if (!showTypingAnimation || realProducts.length === 0) return;

    let currentIndex = 0;
    let currentText = '';
    let isDeleting = false;
    let timeoutId: NodeJS.Timeout;

    const typeText = () => {
      const currentProduct = realProducts[currentIndex];
      const targetText = `Search for "${currentProduct}"...`;
      
      if (!isDeleting) {
        // Typing
        currentText = targetText.substring(0, currentText.length + 1);
        setCurrentPlaceholder(currentText);
        
        if (currentText === targetText) {
          // Pause before deleting
          timeoutId = setTimeout(() => {
            isDeleting = true;
            typeText();
          }, 2000);
          return;
        }
      } else {
        // Deleting
        currentText = targetText.substring(0, currentText.length - 1);
        setCurrentPlaceholder(currentText);
        
        if (currentText === 'Search for "...') {
          // Move to next product
          isDeleting = false;
          currentIndex = (currentIndex + 1) % realProducts.length;
        }
      }
      
      // Continue typing/deleting
      const speed = isDeleting ? 50 : 100;
      timeoutId = setTimeout(typeText, speed);
    };

    const startAnimation = () => {
      setIsTyping(true);
      typeText();
    };

    // Start after a delay
    timeoutId = setTimeout(startAnimation, 1000);

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [realProducts, showTypingAnimation]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = value !== undefined ? value : searchQuery;
    if (query.trim()) {
      router.push(`/products?search=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    if (onChange) {
      onChange(newValue);
    } else {
      setSearchQuery(newValue);
    }
  };

  const handleClear = () => {
    if (onChange) {
      onChange('');
    } else {
      setSearchQuery('');
    }
  };

  const currentValue = value !== undefined ? value : searchQuery;

  return (
    <form 
      onSubmit={handleSubmit} 
      className={`relative flex items-center ${className}`}
    >
      <input
        type="text"
        value={currentValue}
        onChange={handleChange}
        placeholder={showTypingAnimation ? currentPlaceholder : placeholder}
        className="w-full px-4 py-3 pl-12 pr-12 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all shadow-sm"
      />
      <FiSearch className="absolute left-4 text-gray-400 h-5 w-5" />
      
      {currentValue && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-12 text-gray-400 hover:text-gray-600 p-1"
          aria-label="Clear search"
        >
          <FiX className="h-4 w-4" />
        </button>
      )}
      
      <button
        type="submit"
        className="absolute right-3 bg-lime-500 hover:bg-lime-600 text-white p-2 rounded-md transition-colors active:scale-95 transform"
        aria-label="Search"
      >
        <FiSearch className="h-4 w-4" />
      </button>
    </form>
  );
};

export default SearchBar;
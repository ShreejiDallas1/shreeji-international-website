'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useCart, CartItem } from '@/hooks/useCart';
// import { useAutoSync } from '@/hooks/useAutoSync'; // DISABLED

type AppContextType = {
  // Auth
  user: ReturnType<typeof useAuth>['user'];
  loading: boolean;
  signInWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<{ success: boolean; error?: string }>;
  
  // Cart
  cart: CartItem[];
  addToCart: (product: Omit<CartItem, 'quantity'>) => { success: boolean; error?: string };
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getItemCount: () => number;
  
  // UI State
  isMobileMenuOpen: boolean;
  toggleMobileMenu: () => void;
  closeMobileMenu: () => void;
  
  // Theme
  darkMode: boolean;
  toggleDarkMode: () => void;
  
  // Auto Sync
  syncStatus: string | { isRunning: boolean; successCount: number; error?: string };
  manualSync: () => void;
  isAdmin: boolean;
  
  // Products refresh trigger
  productsRefreshTrigger: number;
  triggerProductsRefresh: () => void;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const auth = useAuth();
  const cartHook = useCart();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(true); // Force dark mode only
  const [productsRefreshTrigger, setProductsRefreshTrigger] = useState(0);
  
  // Check if user is admin (you can modify this logic as needed)
  const isAdmin = auth.user?.email === 'admin@shreejimalta.com' || 
                  auth.user?.email === 'krishsorthrex@gmail.com' ||
                  false;
  
  // Auto-sync is completely disabled - only manual Square sync allowed
  // const autoSync = useAutoSync(300, false); // DISABLED

  useEffect(() => {
    // Wait for auth and cart to initialize
    if (!auth.loading && !cartHook.loading) {
      setLoading(false);
    }
  }, [auth.loading, cartHook.loading]);

  useEffect(() => {
    // Force dark mode only - light mode removed due to app breakage
    setDarkMode(true);
    document.documentElement.classList.add('dark');
    localStorage.setItem('theme', 'dark');
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(prev => !prev);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };
  
  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('theme', newDarkMode ? 'dark' : 'light');
    
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const triggerProductsRefresh = () => {
    setProductsRefreshTrigger(prev => prev + 1);
  };

  const value: AppContextType = {
    // Auth
    user: auth.user,
    loading,
    signInWithGoogle: auth.signInWithGoogle,
    login: auth.login,
    register: auth.register,
    logout: auth.logout,
    
    // Cart
    cart: cartHook.cart,
    addToCart: cartHook.addToCart,
    removeFromCart: cartHook.removeFromCart,
    updateQuantity: cartHook.updateQuantity,
    clearCart: cartHook.clearCart,
    getCartTotal: cartHook.getCartTotal,
    getItemCount: cartHook.getItemCount,
    
    // UI State
    isMobileMenuOpen,
    toggleMobileMenu,
    closeMobileMenu,
    
    // Theme
    darkMode,
    toggleDarkMode,
    
    // Auto Sync - DISABLED
    syncStatus: 'disabled',
    manualSync: () => console.log('Auto-sync disabled - use Square admin panel'),
    isAdmin,
    
    // Products refresh
    productsRefreshTrigger,
    triggerProductsRefresh,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}

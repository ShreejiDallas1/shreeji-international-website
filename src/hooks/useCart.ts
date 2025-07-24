'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { useAuth } from './useAuth';

export type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
};

export type CartResult = {
  success: boolean;
  error?: string;
};

export function useCart() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Load cart from localStorage or Firestore
  useEffect(() => {
    const loadCart = async () => {
      setLoading(true);
      try {
        if (user) {
          // Load from Firestore if user is logged in
          const cartDoc = await getDoc(doc(db, 'carts', user.uid));
          if (cartDoc.exists()) {
            setCart(cartDoc.data().items || []);
          } else {
            // Initialize empty cart in Firestore
            await setDoc(doc(db, 'carts', user.uid), { items: [] });
            setCart([]);
          }
        } else {
          // Load from localStorage if user is not logged in
          const savedCart = localStorage.getItem('cart');
          if (savedCart) {
            setCart(JSON.parse(savedCart));
          }
        }
      } catch (error) {
        console.error('Error loading cart:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCart();
  }, [user]);

  // Save cart to localStorage or Firestore whenever it changes
  useEffect(() => {
    if (loading) return;

    const saveCart = async () => {
      try {
        if (user) {
          // Save to Firestore if user is logged in
          // Use setDoc with merge option to create document if it doesn't exist
          await setDoc(doc(db, 'carts', user.uid), {
            items: cart
          }, { merge: true });
        } else {
          // Save to localStorage if user is not logged in
          localStorage.setItem('cart', JSON.stringify(cart));
        }
      } catch (error) {
        console.error('Error saving cart:', error);
      }
    };

    saveCart();
  }, [cart, user, loading]);

  const addToCart = (product: Omit<CartItem, 'quantity'>): CartResult => {
    // Require authentication to add items to cart
    if (!user) {
      // Return an error or redirect to login
      console.error('Authentication required to add items to cart');
      // You can handle this error in the UI where this hook is used
      return { success: false, error: 'Please sign in to add items to your cart' };
    }
    
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      
      if (existingItem) {
        // Increase quantity if item already exists
        return prevCart.map(item => 
          item.id === product.id 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      } else {
        // Add new item with quantity 1
        return [...prevCart, { ...product, quantity: 1 }];
      }
    });
    
    return { success: true };
  };

  const removeFromCart = (productId: string) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCart(prevCart => 
      prevCart.map(item => 
        item.id === productId 
          ? { ...item, quantity } 
          : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getItemCount = () => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  };

  return {
    cart,
    loading,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getItemCount,
  };
}
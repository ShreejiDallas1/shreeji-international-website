'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FiTrash2, FiShoppingCart, FiArrowRight, FiPlus, FiMinus, FiTruck, FiShield, FiPercent } from 'react-icons/fi';
import { useAppContext } from '@/lib/context';
import ProductImage from '@/components/ProductImage';
import Button from '@/components/Button';
import { motion } from 'framer-motion';
import ComingSoonModal from '@/components/ComingSoonModal';
import ComingSoonBanner from '@/components/ComingSoonBanner';

export default function CartPage() {
  const router = useRouter();
  const { cart, removeFromCart, updateQuantity, getCartTotal, clearCart, user } = useAppContext();
  const [isUpdating, setIsUpdating] = useState(false);
  const [showComingSoon, setShowComingSoon] = useState(false);
  
  // Handle quantity change
  const handleQuantityChange = (productId: string, newQuantity: number) => {
    setIsUpdating(true);
    updateQuantity(productId, newQuantity);
    setTimeout(() => setIsUpdating(false), 500);
  };
  
  // Handle remove item
  const handleRemoveItem = (productId: string) => {
    setIsUpdating(true);
    removeFromCart(productId);
    setTimeout(() => setIsUpdating(false), 500);
  };
  
  // Handle proceed to checkout - Show coming soon modal
  const handleCheckout = () => {
    setShowComingSoon(true);
  };
  
  // Empty cart view
  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-900">
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="max-w-md mx-auto">
            <div className="flex justify-center mb-6">
              <div className="w-24 h-24 rounded-full bg-gray-700 flex items-center justify-center">
                <FiShoppingCart className="h-12 w-12 text-gray-400" />
              </div>
            </div>
            <h1 className="text-2xl font-bold mb-4 text-white">Your cart is empty</h1>
            <p className="text-gray-300 mb-8">
              Looks like you haven&apos;t added any products to your cart yet.
            </p>
            <Button variant="primary" size="lg">
              <Link href="/products">Start Shopping</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Your Shopping Cart</h1>
          <p className="text-gray-300">US Only • Fast Delivery</p>
          
          {/* Coming Soon Banner */}
          <ComingSoonBanner className="mt-4" />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden border border-gray-700">
              <div className="p-6 border-b border-gray-700 bg-gray-700">
                <h2 className="text-xl font-semibold text-white">
                  {cart.length} {cart.length === 1 ? 'Item' : 'Items'}
                </h2>
              </div>
            
            <ul className="divide-y divide-gray-700">
              {cart.map((item) => (
                <motion.li 
                  key={item.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="p-4 sm:p-6"
                >
                  <div className="flex flex-col sm:flex-row items-center">
                    {/* Product Image */}
                    <div className="w-full sm:w-24 h-24 mb-4 sm:mb-0 relative">
                      <ProductImage
                        src={item.image || "/images/placeholder.svg"}
                        alt={item.name}
                        width={96}
                        height={96}
                        className="w-full h-full object-contain rounded-lg"
                      />
                    </div>
                    
                    {/* Product Details */}
                    <div className="flex-1 sm:ml-6 text-center sm:text-left">
                      <Link 
                        href={`/products/${item.id}`}
                        className="text-lg font-medium text-white hover:text-lime-400"
                      >
                        {item.name}
                      </Link>
                      <p className="mt-1 text-lime-400 font-semibold">${item.price.toFixed(2)}</p>
                    </div>
                    
                    {/* Quantity Controls */}
                    <div className="flex items-center mt-4 sm:mt-0">
                      <button 
                        className="bg-gray-600 hover:bg-gray-500 text-white p-2 rounded-l-md border border-gray-500 transition-colors disabled:opacity-50"
                        onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                        disabled={isUpdating || item.quantity <= 1}
                        aria-label={`Decrease quantity for ${item.name}`}
                        title={`Decrease quantity for ${item.name}`}
                      >
                        <FiMinus className="h-4 w-4" />
                      </button>
                      <label htmlFor={`quantity-${item.id}`} className="sr-only">
                        Quantity for {item.name}
                      </label>
                      <input
                        type="number"
                        id={`quantity-${item.id}`}
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value) || 1)}
                        className="w-16 text-center border-y border-gray-500 p-2 bg-gray-700 text-white font-medium"
                        disabled={isUpdating}
                        aria-label={`Quantity for ${item.name}`}
                      />
                      <button 
                        className="bg-gray-600 hover:bg-gray-500 text-white p-2 rounded-r-md border border-gray-500 transition-colors disabled:opacity-50"
                        onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                        disabled={isUpdating}
                        aria-label={`Increase quantity for ${item.name}`}
                        title={`Increase quantity for ${item.name}`}
                      >
                        <FiPlus className="h-4 w-4" />
                      </button>
                    </div>
                    
                    {/* Item Total & Remove */}
                    <div className="mt-4 sm:mt-0 sm:ml-6 flex flex-col items-center sm:items-end">
                      <p className="text-lg font-bold text-white">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                      <button 
                        className="mt-2 text-red-400 hover:text-red-300 flex items-center transition-colors disabled:opacity-50 text-sm font-medium"
                        onClick={() => handleRemoveItem(item.id)}
                        disabled={isUpdating}
                      >
                        <FiTrash2 className="h-4 w-4 mr-1" />
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>
                </motion.li>
              ))}
            </ul>
            
            <div className="p-6 border-t border-gray-700 bg-gray-700 flex flex-col sm:flex-row justify-between gap-4">
              <Button 
                variant="outline" 
                size="md"
                onClick={() => clearCart()}
                className="text-red-600 border-red-300 hover:bg-red-50"
              >
                Clear Cart
              </Button>
              <Button 
                variant="outline" 
                size="md"
                className="text-lime-600 border-lime-300 hover:bg-lime-50"
              >
                <Link href="/products">
                  Continue Shopping
                </Link>
              </Button>
            </div>
          </div>
        </div>
        
          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800 rounded-lg shadow-lg p-6 sticky top-24 border border-gray-700">
              <h2 className="text-xl font-bold text-white mb-6">Order Summary</h2>
            
              <div className="space-y-4">
                <div className="flex justify-between py-2">
                  <span className="text-gray-300 font-medium">Subtotal ({cart.length} items)</span>
                  <span className="font-bold text-white">${getCartTotal().toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between py-2">
                  <span className="text-gray-300 font-medium">Shipping</span>
                  <div className="text-right">
                    <span className="font-bold text-white">$12.99</span>
                  </div>
                </div>
                
                <div className="flex justify-between py-2">
                  <span className="text-gray-300 font-medium">Tax</span>
                  <span className="font-medium text-gray-400">Calculated at checkout</span>
                </div>
              

              
                <div className="border-t border-gray-700 pt-4 flex justify-between">
                  <span className="text-xl font-bold text-white">Estimated Total</span>
                  <span className="text-xl font-bold text-lime-400">
                    ${(getCartTotal() + 12.99).toFixed(2)}
                  </span>
                </div>
              </div>
            
            {/* Security & Trust Icons */}
            <div className="mt-4 p-4 bg-gray-700 rounded-lg border border-gray-700">
              <div className="flex items-center justify-center space-x-4 text-sm text-gray-300">
                <div className="flex items-center">
                  <FiShield className="h-4 w-4 mr-1 text-lime-400" />
                  <span>Secure Checkout</span>
                </div>
                <div className="flex items-center">
                  <FiTruck className="h-4 w-4 mr-1 text-lime-400" />
                  <span>Fast Delivery</span>
                </div>
              </div>
            </div>
            
            <div className="mt-6">
              <Button 
                variant="primary" 
                size="lg"
                className="w-full"
                rightIcon={<FiArrowRight />}
                onClick={handleCheckout}
              >
                {user ? 'Proceed to Checkout' : 'Sign in to Checkout'}
              </Button>
              
              {!user && (
                <p className="text-sm text-gray-400 mt-2 text-center">
                  You&apos;ll need to sign in before completing your purchase.
                </p>
              )}
              
              <div className="mt-4 text-center">
                <span className="text-xs text-gray-400">US Only • Wholesale Orders Welcome</span>
              </div>
            </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Coming Soon Modal */}
      <ComingSoonModal 
        isOpen={showComingSoon} 
        onClose={() => setShowComingSoon(false)}
        feature="Online Shopping"
      />
    </div>
  );
}
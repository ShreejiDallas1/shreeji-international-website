// Global type definitions for the application

// Square Payment System
declare global {
  interface Window {
    Square?: {
      payments: (appId: string, locationId: string) => Promise<{
        card: () => Promise<any>;
      }>;
    };
  }
}

// Payment callback types
type PaymentSuccessCallback = (result: {
  token: string;
  details: any;
  billingContact?: any;
  shippingContact?: any;
}) => void;

type PaymentErrorCallback = (error: {
  message: string;
  details?: any;
  field?: string;
  type?: string;
}) => void;

// Common API response types
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp?: string;
}

// Product types
interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  inStock: boolean;
  sku?: string;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
}

// Cart types
interface CartItem extends Product {
  quantity: number;
}

// User types
interface User {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  emailVerified: boolean;
}

// Order types
interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shippingAddress: Address;
  billingAddress: Address;
  paymentMethod: string;
  createdAt: string;
  updatedAt: string;
}

// Address types
interface Address {
  name: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone?: string;
}

// Shipping types
interface ShippingOption {
  id: string;
  name: string;
  description: string;
  price: number;
  estimatedDays: string;
  carrier: string;
}

// Export all types
export type {
  PaymentSuccessCallback,
  PaymentErrorCallback,
  ApiResponse,
  Product,
  CartItem,
  User,
  Order,
  Address,
  ShippingOption
};
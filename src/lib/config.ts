// Feature Configuration for Shreeji International
// Centralized configuration for enabling/disabling features

export const FEATURE_FLAGS = {
  // Inventory Management
  GOOGLE_SHEETS_SYNC: false,  // Deactivated - keeping code but not using
  SQUARE_INVENTORY: true,     // Primary inventory system
  
  // Shipping Features
  FREE_SHIPPING: false,       // Removed for now
  USPS_API: false,           // Future implementation
  
  // Payment Features
  SQUARE_PAYMENTS: true,      // Primary payment system
  
  // Other Features
  AI_ASSISTANT: true,
  EMAIL_NOTIFICATIONS: false, // Future implementation
  ANALYTICS: false           // Future implementation
} as const;

// Inventory source configuration
export const INVENTORY_CONFIG = {
  PRIMARY_SOURCE: 'square' as 'square' | 'sheets',
  FALLBACK_SOURCE: 'firestore' as 'firestore' | 'none',
  SYNC_INTERVAL: 30 * 60 * 1000, // 30 minutes in milliseconds
  AUTO_SYNC: true
} as const;

// Shipping configuration
export const SHIPPING_CONFIG = {
  ORIGIN_ADDRESS: {
    street: '1162 Security Drive',
    city: 'Dallas',
    state: 'TX',
    zipCode: '75207',
    country: 'US'
  },
  DEFAULT_WEIGHT: 1, // pounds
  MIN_WEIGHT: 1,     // pounds
  FREE_SHIPPING_THRESHOLD: null, // Disabled
  CARRIERS: ['USPS'] as const
} as const;

// Business configuration
export const BUSINESS_CONFIG = {
  NAME: 'Shreeji International LLC',
  TYPE: 'B2B Wholesale',
  LOCATION: 'Dallas, TX',
  PHONE: '(214) 529-7974',
  EMAIL: 'shreejidallas1@gmail.com',
  ADDRESS: '1162 Security Drive, Dallas, TX 75207',
  BUSINESS_HOURS: 'Monday-Friday, 10 AM - 5 PM',
  MARKET: 'United States',
  SPECIALIZATION: 'Authentic Indian groceries and specialty foods'
} as const;

// API Configuration
export const API_CONFIG = {
  SYNC_API_KEY: process.env.SYNC_API_KEY || 'shreeji_sync_api_2024',
  RATE_LIMIT: {
    REQUESTS_PER_MINUTE: 60,
    BURST_LIMIT: 10
  }
} as const;

// Helper functions
export const isFeatureEnabled = (feature: keyof typeof FEATURE_FLAGS): boolean => {
  return FEATURE_FLAGS[feature];
};

export const getInventorySource = (): string => {
  return INVENTORY_CONFIG.PRIMARY_SOURCE;
};

export const shouldUseGoogleSheets = (): boolean => {
  return isFeatureEnabled('GOOGLE_SHEETS_SYNC');
};

export const shouldUseSquareInventory = (): boolean => {
  return isFeatureEnabled('SQUARE_INVENTORY');
};

export const isFreeShippingEnabled = (): boolean => {
  return isFeatureEnabled('FREE_SHIPPING');
};
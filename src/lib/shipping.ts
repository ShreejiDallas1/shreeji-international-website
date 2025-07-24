// Legacy Shipping Integration - Use shipping-new.ts instead
// Dallas, TX - Shreeji International LLC location

interface ShippingAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country?: string;
}

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  weight?: number; // in pounds
  dimensions?: {
    length: number;
    width: number; 
    height: number;
  };
}

interface ShippingItem {
  id: string;
  name: string;
  weight: number;
  value: number;
  quantity: number;
}

interface ShippingRate {
  carrier: string;
  service: string;
  cost: number;
  deliveryDays: string;
  description: string;
}

interface ShippingRates {
  ground: ShippingRate;
  express: ShippingRate;
  overnight: ShippingRate;
}

// Your warehouse location in Dallas, TX
const WAREHOUSE_ADDRESS: ShippingAddress = {
  street: '1162 Security Drive',
  city: 'Dallas',
  state: 'TX',
  zipCode: '75207',
  country: 'US'
};

export class UPSShippingService {
  private static readonly UPS_API_KEY = process.env.UPS_API_KEY;
  private static readonly UPS_SECRET = process.env.UPS_SECRET;
  private static readonly UPS_BASE_URL = process.env.UPS_ENVIRONMENT === 'production' 
    ? 'https://onlinetools.ups.com/api' 
    : 'https://wwwcie.ups.com/api';

  // Calculate shipping rates
  static async calculateShipping(
    destination: ShippingAddress,
    items: ShippingItem[]
  ): Promise<ShippingRates> {
    try {
      // Calculate total weight and dimensions
      const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
      const totalValue = items.reduce((sum, item) => sum + item.value, 0);
      
      // For now, use simplified shipping calculation
      // You can integrate with actual UPS API later
      const distance = this.calculateDistance(WAREHOUSE_ADDRESS, destination);
      const baseRate = this.calculateBaseRate(totalWeight, distance);
      
      const groundCost = Math.max(baseRate, 8.99);
      const expressCost = Math.max(baseRate * 1.5, 15.99);
      const overnightCost = Math.max(baseRate * 2.5, 25.99);
      
      return {
        ground: {
          service: 'Ground Shipping',
          cost: groundCost,
          deliveryDays: '5-7 business days',
          description: 'Standard ground shipping',
          carrier: 'UPS'
        },
        express: {
          service: 'Express Shipping',
          cost: expressCost,
          deliveryDays: '2-3 business days',
          description: 'Expedited shipping',
          carrier: 'UPS'
        },
        overnight: {
          service: 'Overnight Shipping',
          cost: overnightCost,
          deliveryDays: '1 business day',
          description: 'Next day delivery',
          carrier: 'UPS'
        }
      };
    } catch (error) {
      console.error('Error calculating shipping:', error);
      // Fallback rates
      return {
        ground: {
          service: 'Ground Shipping',
          cost: 12.99,
          deliveryDays: '5-7 business days',
          description: 'Standard ground shipping',
          carrier: 'UPS'
        },
        express: {
          service: 'Express Shipping',
          cost: 19.99,
          deliveryDays: '2-3 business days',
          description: 'Expedited shipping',
          carrier: 'UPS'
        },
        overnight: {
          service: 'Overnight Shipping',
          cost: 29.99,
          deliveryDays: '1 business day',
          description: 'Next day delivery',
          carrier: 'UPS'
        }
      };
    }
  }

  // Simplified distance calculation (you can use Google Maps API for accuracy)
  private static calculateDistance(from: ShippingAddress, to: ShippingAddress): number {
    // Zone-based shipping calculation
    const stateZones = {
      'TX': 1, // Local
      'OK': 1, 'AR': 1, 'LA': 1, 'NM': 1, // Zone 1
      'KS': 2, 'MO': 2, 'MS': 2, 'AL': 2, 'TN': 2, // Zone 2
      'CO': 3, 'NE': 3, 'IA': 3, 'WI': 3, 'IL': 3, // Zone 3
      'CA': 4, 'NY': 4, 'FL': 4, 'WA': 4, 'OR': 4, // Zone 4
    };
    
    return stateZones[to.state as keyof typeof stateZones] || 4;
  }

  private static calculateBaseRate(weight: number, zone: number): number {
    const baseRate = 5.99;
    const weightMultiplier = Math.max(1, Math.ceil(weight / 5)); // $1 per 5 lbs
    const zoneMultiplier = zone * 2; // $2 per zone
    
    return baseRate + weightMultiplier + zoneMultiplier;
  }

  // Get shipping label (placeholder for actual UPS integration)
  static async createShippingLabel(
    destination: ShippingAddress,
    items: ShippingItem[],
    service: 'ground' | 'express' | 'overnight'
  ) {
    // This would integrate with actual UPS API to create shipping labels
    // For now, return mock data
    return {
      trackingNumber: `1Z${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      labelUrl: null, // Would be actual label URL
      cost: await this.calculateShipping(destination, items).then(rates => rates[service]),
    };
  }

  // Track package
  static async trackPackage(trackingNumber: string) {
    // This would integrate with UPS tracking API
    return {
      trackingNumber,
      status: 'In Transit',
      estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      events: [
        {
          date: new Date().toISOString(),
          status: 'Package shipped from Dallas, TX',
          location: 'Dallas, TX'
        }
      ]
    };
  }
}

// Helper function to estimate package weight based on products
export function estimatePackageWeight(cartItems: any[]): number {
  // Estimate weight based on product types
  const weightEstimates = {
    'Food': 2, // 2 lbs average for food items
    'Stationary': 0.5, // 0.5 lbs for stationary items
    'Clothing': 1, // 1 lb for clothing
    'Electronics': 3, // 3 lbs for electronics
    'Default': 1.5 // Default weight
  };

  return cartItems.reduce((total, item) => {
    const categoryWeight = weightEstimates[item.category as keyof typeof weightEstimates] || weightEstimates.Default;
    return total + (categoryWeight * item.quantity);
  }, 0);
}

// Helper function to estimate package dimensions
export function estimatePackageDimensions(cartItems: any[]): {length: number, width: number, height: number} {
  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  
  // Estimate box size based on item count
  if (itemCount <= 3) {
    return { length: 12, width: 9, height: 6 }; // Small box
  } else if (itemCount <= 8) {
    return { length: 16, width: 12, height: 8 }; // Medium box
  } else {
    return { length: 20, width: 16, height: 12 }; // Large box
  }
}
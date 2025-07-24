import { NextRequest, NextResponse } from 'next/server';
// Use simplified shipping calculation for now
interface ShippingAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  weight?: number;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { destination, cartItems } = body;
    
    console.log('🚚 Calculating shipping for:', destination);
    console.log('📦 Cart items:', cartItems.length);
    
    // Validate input
    if (!destination || !cartItems || cartItems.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Missing destination or cart items' },
        { status: 400 }
      );
    }

    // Convert to proper types
    const shippingAddress: ShippingAddress = {
      street: destination.address || destination.street,
      city: destination.city,
      state: destination.state,
      zipCode: destination.zipCode,
      country: destination.country || 'US'
    };

    const items: CartItem[] = cartItems.map((item: any) => ({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      weight: item.weight || 1, // Default 1 lb
      dimensions: item.dimensions
    }));

    const cartTotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    console.log(`💰 Cart total: $${cartTotal}`);
    
    // Simple shipping calculation
    const totalWeight = items.reduce((sum, item) => sum + (item.weight || 1) * item.quantity, 0);
    const baseShipping = 8.99;
    const weightMultiplier = Math.max(1, Math.ceil(totalWeight / 5)); // $8.99 per 5lbs
    
    const groundCost = baseShipping * weightMultiplier;
    const expressCost = groundCost * 1.5;
    const overnightCost = groundCost * 2.5;
    
    const rates = {
      ground: {
        service: 'Standard Shipping',
        cost: Math.max(groundCost, 8.99),
        estimatedDays: '3-5 business days',
        carrier: 'UPS'
      },
      express: {
        service: 'Express Shipping',
        cost: Math.max(expressCost, 15.99),
        estimatedDays: '2 business days',
        carrier: 'UPS'
      },
      overnight: {
        service: 'Overnight Shipping',
        cost: Math.max(overnightCost, 29.99),
        estimatedDays: '1 business day',
        carrier: 'UPS'
      }
    };
    
    console.log('✅ Calculated shipping rates:', rates);
    
    return NextResponse.json({
      success: true,
      rates,
      cartTotal
    });
    
  } catch (error) {
    console.error('❌ Error calculating shipping:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to calculate shipping rates',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
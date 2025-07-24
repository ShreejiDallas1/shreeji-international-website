import { NextRequest, NextResponse } from 'next/server';
import { SquareInventoryManager } from '@/lib/square-inventory';
import { shouldUseGoogleSheets } from '@/lib/config';

export async function GET(request: NextRequest) {
  try {
    // Check for API key for security
    const apiKey = request.nextUrl.searchParams.get('key');
    const validApiKey = process.env.SYNC_API_KEY || 'shreeji_sync_api_2024';
    
    if (!apiKey || apiKey !== validApiKey) {
      return NextResponse.json(
        { error: 'Unauthorized: Invalid API key' },
        { status: 401 }
      );
    }
    
    // Initialize database with products
    let productCount;
    if (shouldUseGoogleSheets()) {
      // Google Sheets sync (deactivated)
      const { syncProductsToFirestore } = await import('@/lib/googleSheets');
      productCount = await syncProductsToFirestore();
    } else {
      // Square sync (primary)
      console.log('🔄 Initializing database with Square inventory...');
      const result = await SquareInventoryManager.syncToFirestore();
      productCount = result.synced;
    }
    
    return NextResponse.json(
      { success: true, message: `Successfully initialized database with ${productCount} products` },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error('Error in init-db API:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Failed to initialize database';
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

// This can also be called via POST
export async function POST(request: NextRequest) {
  return GET(request);
}
import { NextRequest, NextResponse } from 'next/server';
import { SquareInventoryManager } from '@/lib/square-inventory';
import { shouldUseGoogleSheets } from '@/lib/config';

// Cron job endpoint for scheduled syncing
export async function GET(request: NextRequest) {
  try {
    console.log('⏰ Scheduled sync triggered at:', new Date().toISOString());
    
    // Verify cron job authorization (Vercel cron header)
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      console.log('❌ Unauthorized cron request');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Perform sync based on configuration
    let result;
    if (shouldUseGoogleSheets()) {
      // Google Sheets sync (deactivated)
      const { syncProductsFromSheet } = await import('@/lib/googleSheets');
      result = await syncProductsFromSheet();
    } else {
      // Square sync (primary)
      console.log('🔄 Starting scheduled Square inventory sync...');
      result = await SquareInventoryManager.syncToFirestore();
    }
    
    console.log('✅ Scheduled sync completed successfully');
    
    return NextResponse.json({
      success: true,
      message: 'Scheduled sync completed',
      result,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Scheduled sync failed:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

// Also allow POST for flexibility
export async function POST(request: NextRequest) {
  return GET(request);
}
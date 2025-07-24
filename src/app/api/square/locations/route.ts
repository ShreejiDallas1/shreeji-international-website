import { NextResponse } from 'next/server';
// Use our simple service instead of direct squareup client
import { squareService } from '@/lib/square-simple';

export async function GET() {
  try {
    console.log('🏢 Fetching Square locations...');
    
    const response = await squareService.makeRequest('/locations', 'GET');

    if (response.locations && response.locations.length > 0) {
      const locations = response.locations.map((location: any) => ({
        id: location.id,
        name: location.name,
        address: location.address,
        status: location.status,
        businessName: location.business_name,
        capabilities: location.capabilities
      }));

      console.log(`✅ Found ${locations.length} Square locations`);
      return NextResponse.json({ success: true, locations });
    } else {
      console.log('⚠️ No locations found');
      return NextResponse.json({ 
        success: false, 
        error: 'No locations found',
        locations: []
      }, { status: 404 });
    }
  } catch (error: any) {
    console.error('❌ Error fetching locations:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch locations', 
        details: error.message 
      },
      { status: 500 }
    );
  }
}
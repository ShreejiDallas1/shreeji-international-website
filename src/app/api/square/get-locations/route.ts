import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.log('🏢 Fetching Square locations...');
    
    const accessToken = process.env.SQUARE_ACCESS_TOKEN;
    const environment = process.env.NEXT_PUBLIC_SQUARE_ENVIRONMENT || 'sandbox';
    
    if (!accessToken) {
      return NextResponse.json({
        success: false,
        error: 'Missing Square access token'
      });
    }
    
    const baseUrl = environment === 'production' 
      ? 'https://connect.squareup.com/v2'
      : 'https://connect.squareupsandbox.com/v2';
    
    const response = await fetch(`${baseUrl}/locations`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Square-Version': '2023-10-18'
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(`Square API Error: ${response.status} - ${JSON.stringify(errorData)}`);
    }
    
    const data = await response.json();
    
    console.log('📍 Square locations found:', data.locations?.length || 0);
    
    return NextResponse.json({
      success: true,
      locations: data.locations || [],
      message: `Found ${data.locations?.length || 0} locations`,
      currentLocationId: process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID,
      environment
    });
    
  } catch (error) {
    console.error('❌ Error fetching Square locations:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      currentLocationId: process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID,
      environment: process.env.NEXT_PUBLIC_SQUARE_ENVIRONMENT
    });
  }
}
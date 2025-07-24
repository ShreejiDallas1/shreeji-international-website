import { NextResponse } from 'next/server';

export async function GET() {
  const config = {
    hasApplicationId: !!process.env.NEXT_PUBLIC_SQUARE_APPLICATION_ID,
    hasAccessToken: !!process.env.SQUARE_ACCESS_TOKEN,
    hasLocationId: !!process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID,
    environment: process.env.NEXT_PUBLIC_SQUARE_ENVIRONMENT || 'sandbox',
    applicationIdLength: process.env.NEXT_PUBLIC_SQUARE_APPLICATION_ID?.length || 0,
    accessTokenLength: process.env.SQUARE_ACCESS_TOKEN?.length || 0,
    locationIdLength: process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID?.length || 0,
  };

  console.log('🔧 Square Configuration Check:', config);

  return NextResponse.json({
    success: true,
    config,
    isConfigured: config.hasApplicationId && config.hasAccessToken && config.hasLocationId,
    message: config.hasApplicationId && config.hasAccessToken && config.hasLocationId 
      ? 'Square is properly configured' 
      : 'Square configuration is incomplete'
  });
}
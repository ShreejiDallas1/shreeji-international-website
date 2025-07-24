import { NextRequest, NextResponse } from 'next/server';
import { squareService } from '@/lib/square-simple';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ imageId: string }> }
) {
  try {
    const { imageId } = await params;
    
    if (!imageId) {
      return NextResponse.json(
        { error: 'Image ID is required' },
        { status: 400 }
      );
    }

    // Get image data from Square
    const imageData = await squareService.getImage(imageId);
    
    if (!imageData || !imageData.url) {
      // Return placeholder if image not found
      return NextResponse.redirect(new URL('/images/placeholder.svg', request.url));
    }

    // Fetch the actual image and proxy it
    try {
      const imageResponse = await fetch(imageData.url);
      if (!imageResponse.ok) {
        return NextResponse.redirect(new URL('/images/placeholder.svg', request.url));
      }

      const imageBuffer = await imageResponse.arrayBuffer();
      const contentType = imageResponse.headers.get('content-type') || 'image/jpeg';

      return new NextResponse(imageBuffer, {
        status: 200,
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=31536000, immutable',
          'Content-Length': imageBuffer.byteLength.toString(),
        },
      });
    } catch (fetchError) {
      console.error('❌ Error fetching image from Square URL:', fetchError);
      return NextResponse.redirect(new URL('/images/placeholder.svg', request.url));
    }
    
  } catch (error) {
    console.error('❌ Error fetching Square image:', error);
    // Return placeholder on error
    return NextResponse.redirect(new URL('/images/placeholder.svg', request.url));
  }
}
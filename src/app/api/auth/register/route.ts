import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Import SecurityManager only on server side
    const { SecurityManager } = await import('@/lib/security');
    const result = await SecurityManager.secureRegister(email, password);
    
    return NextResponse.json(result);

  } catch (error: any) {
    console.error('Register API error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
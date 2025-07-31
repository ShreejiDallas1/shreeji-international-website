import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { email, code, newPassword } = await request.json();

    if (!email || !code || !newPassword) {
      return NextResponse.json(
        { success: false, error: 'Email, code, and new password are required' },
        { status: 400 }
      );
    }

    // Import SecurityManager only on server side
    const { SecurityManager } = await import('@/lib/security');
    const result = await SecurityManager.resetPasswordWithCode(email, code, newPassword);
    
    return NextResponse.json(result);

  } catch (error: any) {
    console.error('Reset password API error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
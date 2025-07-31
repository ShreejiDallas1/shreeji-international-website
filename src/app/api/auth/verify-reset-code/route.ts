import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { email, code } = await request.json();

    if (!email || !code) {
      return NextResponse.json(
        { success: false, error: 'Email and code are required' },
        { status: 400 }
      );
    }

    // Verify code using simple email service
    const { SimpleEmailService } = await import('@/lib/email-service-simple');
    const result = await SimpleEmailService.verifyCode(email, code);
    
    return NextResponse.json(result);

  } catch (error: any) {
    console.error('Verify reset code API error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
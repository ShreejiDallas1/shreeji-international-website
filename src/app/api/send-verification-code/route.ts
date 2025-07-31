import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid email address' },
        { status: 400 }
      );
    }

    // Send verification code using simple email service
    const { SimpleEmailService } = await import('@/lib/email-service-simple');
    const result = await SimpleEmailService.sendVerificationCodeServer(email);
    
    return NextResponse.json(result);

  } catch (error: any) {
    console.error('Send verification code API error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Send verification code API',
    method: 'POST',
    body: {
      email: 'string (required) - Email address to send verification code to'
    }
  });
}
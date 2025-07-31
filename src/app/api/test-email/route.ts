import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { email, type } = await request.json();

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      );
    }

    let result;

    if (type === 'config-test') {
      // Test email configuration
      const { default: EmailSender } = await import('@/lib/email-sender');
      result = await EmailSender.testEmailConfig();
    } else if (type === 'send-test') {
      // Send test email
      const { default: EmailSender } = await import('@/lib/email-sender');
      result = await EmailSender.sendTestEmail(email);
    } else if (type === 'verification-code') {
      // Send verification code using server-side method
      const { EmailService } = await import('@/lib/email-service');
      result = await EmailService.sendVerificationCodeServer(email);
    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid test type' },
        { status: 400 }
      );
    }

    return NextResponse.json(result);

  } catch (error: any) {
    console.error('Email test API error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Email test API',
    endpoints: {
      'POST /api/test-email': {
        description: 'Test email functionality',
        body: {
          email: 'string (required)',
          type: 'config-test | send-test | verification-code'
        }
      }
    }
  });
}
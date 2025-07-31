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

    console.log('🧪 Testing email sending directly...');
    
    // Import EmailSender directly
    const { EmailSender } = await import('@/lib/email-sender');
    
    // Generate a test code
    const testCode = '12345678';
    
    console.log(`📧 Attempting to send test email to: ${email}`);
    console.log(`📧 Test verification code: ${testCode}`);
    
    // Send the email directly
    const result = await EmailSender.sendVerificationCode(email, testCode);
    
    console.log('📧 Email sending result:', result);
    
    return NextResponse.json({
      success: result.success,
      message: result.success ? 'Test email sent successfully!' : result.error,
      messageId: result.messageId,
      testCode: testCode // Include test code for development
    });

  } catch (error: any) {
    console.error('❌ Test email API error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Test email direct API',
    method: 'POST',
    body: {
      email: 'string (required) - Email address to send test email to'
    }
  });
}
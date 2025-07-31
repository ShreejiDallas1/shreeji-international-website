import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { email, useRealEmail = false } = await request.json();

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      );
    }

    console.log('🚀 FORCE SENDING EMAIL - BYPASSING DEVELOPMENT MODE');
    
    // Import EmailSender
    const { EmailSender } = await import('@/lib/email-sender');
    
    // Generate a test code
    const testCode = Math.floor(10000000 + Math.random() * 90000000).toString();
    
    console.log(`📧 Force sending email to: ${email}`);
    console.log(`📧 Verification code: ${testCode}`);
    
    if (useRealEmail) {
      // Try to send real email
      try {
        const result = await EmailSender.sendVerificationCode(email, testCode);
        
        return NextResponse.json({
          success: result.success,
          message: result.success ? 'Real email sent successfully!' : result.error,
          messageId: result.messageId,
          testCode: testCode,
          mode: 'REAL_EMAIL'
        });
      } catch (error: any) {
        throw error;
      }
    } else {
      // Just simulate email sending
      console.log('📧 [SIMULATED] Email sent successfully!');
      console.log('📧 [SIMULATED] In a real scenario, this would be sent to:', email);
      console.log('📧 [SIMULATED] Verification code would be:', testCode);
      
      return NextResponse.json({
        success: true,
        message: 'Email simulated successfully! Check console for details.',
        messageId: 'simulated-' + Date.now(),
        testCode: testCode,
        mode: 'SIMULATED'
      });
    }

  } catch (error: any) {
    console.error('❌ Force send email error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Force send email API - FOR TESTING ONLY',
    method: 'POST',
    body: {
      email: 'string (required) - Email address',
      useRealEmail: 'boolean (optional) - Set to true to attempt real email sending'
    },
    warning: 'This endpoint bypasses development mode restrictions'
  });
}
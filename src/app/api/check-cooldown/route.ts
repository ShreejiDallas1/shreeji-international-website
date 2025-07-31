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

    // Check cooldown using simple email service
    const { SimpleEmailService } = await import('@/lib/email-service-simple');
    const cooldownResult = await SimpleEmailService.checkCooldown(email);
    
    return NextResponse.json({
      success: true,
      inCooldown: cooldownResult.inCooldown,
      remainingSeconds: cooldownResult.remainingSeconds || 0
    });

  } catch (error: any) {
    console.error('Check cooldown API error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Check cooldown API',
    method: 'POST',
    body: {
      email: 'string (required) - Email address to check cooldown for'
    }
  });
}
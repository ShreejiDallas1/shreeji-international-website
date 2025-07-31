import { NextRequest, NextResponse } from 'next/server';

// Rate limiting storage (in production, use Redis or similar)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const limit = rateLimitStore.get(ip);
  
  if (!limit || now > limit.resetTime) {
    // Reset or create new limit
    rateLimitStore.set(ip, { count: 1, resetTime: now + 15 * 60 * 1000 }); // 15 minutes
    return false;
  }
  
  if (limit.count >= 5) { // Max 5 attempts per 15 minutes
    return true;
  }
  
  limit.count++;
  return false;
}

function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export async function POST(request: NextRequest) {
  try {
    const { action, email, code, newPassword } = await request.json();
    
    // Get client IP for rate limiting
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    
    // Rate limiting check
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Too many attempts. Please try again later.' 
        },
        { status: 429 }
      );
    }

    switch (action) {
      case 'send-reset-email':
        return await handleSendResetEmail(email);
      
      case 'verify-reset-code':
        return await handleVerifyResetCode(code);
      
      case 'confirm-password-reset':
        return await handleConfirmPasswordReset(code, newPassword);
      
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Password reset API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function handleSendResetEmail(email: string) {
  try {
    // Validate email format
    if (!validateEmail(email)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // For security, we return success regardless of whether user exists
    // This prevents email enumeration attacks
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Send reset email error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to send reset email' },
      { status: 500 }
    );
  }
}

async function handleVerifyResetCode(code: string) {
  try {
    if (!code) {
      return NextResponse.json(
        { success: false, error: 'Reset code is required' },
        { status: 400 }
      );
    }

    // This is handled client-side with Firebase
    return NextResponse.json({ 
      success: true, 
      message: 'Code verification handled client-side' 
    });
  } catch (error) {
    console.error('Verify reset code error:', error);
    return NextResponse.json(
      { success: false, error: 'Invalid or expired reset code' },
      { status: 400 }
    );
  }
}

async function handleConfirmPasswordReset(code: string, newPassword: string) {
  try {
    if (!code || !newPassword) {
      return NextResponse.json(
        { success: false, error: 'Reset code and new password are required' },
        { status: 400 }
      );
    }

    // Validate password strength
    const passwordValidation = validatePasswordStrength(newPassword);
    if (!passwordValidation.isValid) {
      return NextResponse.json(
        { success: false, error: passwordValidation.error },
        { status: 400 }
      );
    }

    // This is handled client-side with Firebase
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Confirm password reset error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to reset password' },
      { status: 500 }
    );
  }
}

function validatePasswordStrength(password: string): { isValid: boolean; error?: string } {
  if (password.length < 8) {
    return { isValid: false, error: 'Password must be at least 8 characters long' };
  }
  
  if (!/[A-Z]/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one uppercase letter' };
  }
  
  if (!/[a-z]/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one lowercase letter' };
  }
  
  if (!/[0-9]/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one number' };
  }
  
  if (!/[^A-Za-z0-9]/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one special character' };
  }
  
  // Check for common weak passwords
  const commonPasswords = [
    'password', '12345678', 'qwerty123', 'abc123456', 'password123',
    'admin123', 'welcome123', 'letmein123', 'monkey123', '123456789'
  ];
  
  if (commonPasswords.includes(password.toLowerCase())) {
    return { isValid: false, error: 'Password is too common. Please choose a stronger password' };
  }
  
  return { isValid: true };
}

// Handle GET requests (not allowed)
export async function GET() {
  return NextResponse.json(
    { success: false, error: 'Method not allowed' },
    { status: 405 }
  );
}
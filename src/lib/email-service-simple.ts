// Simple email service using EmailJS (no server setup required)
import { db } from './firebase';
import { doc, setDoc, getDoc, deleteDoc } from 'firebase/firestore';

interface VerificationCode {
  code: string;
  email: string;
  expiresAt: Date;
  attempts: number;
  createdAt: Date;
  lastSentAt?: Date;
}

export class SimpleEmailService {
  // Generate random 8-digit verification code
  static generateVerificationCode(): string {
    return Math.floor(10000000 + Math.random() * 90000000).toString();
  }

  // Store verification code in Firestore
  static async storeVerificationCode(email: string, code: string): Promise<void> {
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15); // 15 minutes expiry
    const now = new Date();

    const verificationData: VerificationCode = {
      code,
      email,
      expiresAt,
      attempts: 0,
      createdAt: now,
      lastSentAt: now
    };

    await setDoc(doc(db, 'verification_codes', email), verificationData);
  }

  // Check if email is in cooldown period
  static async checkCooldown(email: string): Promise<{
    inCooldown: boolean;
    remainingSeconds?: number;
  }> {
    try {
      const docRef = doc(db, 'verification_codes', email);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return { inCooldown: false };
      }

      const data = docSnap.data() as VerificationCode;
      if (!data.lastSentAt) {
        return { inCooldown: false };
      }

      const now = new Date();
      const lastSent = data.lastSentAt.toDate ? data.lastSentAt.toDate() : new Date(data.lastSentAt);
      const timeDiff = now.getTime() - lastSent.getTime();
      const cooldownPeriod = 30 * 1000; // 30 seconds

      if (timeDiff < cooldownPeriod) {
        const remainingSeconds = Math.ceil((cooldownPeriod - timeDiff) / 1000);
        return { inCooldown: true, remainingSeconds };
      }

      return { inCooldown: false };
    } catch (error) {
      console.error('Error checking cooldown:', error);
      return { inCooldown: false };
    }
  }

  // Send email using Resend API (free tier available)
  static async sendEmailWithResend(email: string, code: string): Promise<{
    success: boolean;
    error?: string;
    messageId?: string;
  }> {
    try {
      // Check if we have Resend API key
      const resendApiKey = process.env.RESEND_API_KEY;
      
      if (!resendApiKey || resendApiKey === 'your-resend-api-key') {
        // Fallback to console logging for development
        console.log('📧 [DEVELOPMENT MODE] No Resend API key found');
        console.log('📧 [SIMULATED EMAIL] Sending verification code email');
        console.log('📧 To:', email);
        console.log('📧 Code:', code);
        console.log('📧 Subject: Your Shreeji International Verification Code');
        console.log('📧 Email Content:');
        console.log(`
=== EMAIL CONTENT ===
To: ${email}
Subject: Your Shreeji International Verification Code

Hello,

Your verification code for Shreeji International is:

${code}

This code will expire in 15 minutes.

If you didn't request this code, please ignore this email.

Best regards,
Shreeji International Team
=== END EMAIL ===
        `);

        return {
          success: true,
          messageId: 'dev-mode-' + Date.now()
        };
      }

      // Use Resend API to send real email
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Shreeji International <noreply@shreejimalta.com>',
          to: [email],
          subject: 'Your Shreeji International Verification Code',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #2563eb; margin: 0;">Shreeji International</h1>
                <p style="color: #6b7280; margin: 5px 0;">Wholesale Indian Grocery</p>
              </div>
              
              <div style="background: #f8fafc; border-radius: 8px; padding: 30px; text-align: center;">
                <h2 style="color: #1f2937; margin-bottom: 20px;">Your Verification Code</h2>
                <div style="background: white; border: 2px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 20px 0;">
                  <span style="font-size: 32px; font-weight: bold; color: #2563eb; letter-spacing: 4px;">${code}</span>
                </div>
                <p style="color: #6b7280; margin: 20px 0;">This code will expire in 15 minutes.</p>
              </div>
              
              <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center;">
                <p style="color: #9ca3af; font-size: 14px;">
                  If you didn't request this code, please ignore this email.
                </p>
                <p style="color: #9ca3af; font-size: 14px;">
                  Best regards,<br>
                  Shreeji International Team
                </p>
              </div>
            </div>
          `,
          text: `
Your verification code for Shreeji International is: ${code}

This code will expire in 15 minutes.

If you didn't request this code, please ignore this email.

Best regards,
Shreeji International Team
          `
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to send email');
      }

      const data = await response.json();
      console.log('✅ Email sent successfully via Resend!');
      
      return {
        success: true,
        messageId: data.id
      };

    } catch (error: any) {
      console.error('❌ Email sending failed:', error);
      return {
        success: false,
        error: error.message || 'Failed to send email'
      };
    }
  }

  // Server-side method for sending verification code
  static async sendVerificationCodeServer(email: string): Promise<{
    success: boolean;
    error?: string;
    remainingCooldown?: number;
  }> {
    try {
      // Check cooldown first
      const cooldownCheck = await this.checkCooldown(email);
      if (cooldownCheck.inCooldown) {
        return {
          success: false,
          error: `Please wait ${cooldownCheck.remainingSeconds} seconds before requesting another code`,
          remainingCooldown: cooldownCheck.remainingSeconds
        };
      }

      const code = this.generateVerificationCode();
      
      // Store the code in Firestore first
      await this.storeVerificationCode(email, code);

      console.log(`📧 Sending verification code to ${email}: ${code}`);
      
      // Send the actual email
      const emailResult = await this.sendEmailWithResend(email, code);
      
      if (!emailResult.success) {
        // If email fails, clean up the stored code
        try {
          await deleteDoc(doc(db, 'verification_codes', email));
        } catch (cleanupError) {
          console.error('Failed to cleanup verification code after email failure:', cleanupError);
        }
        
        return {
          success: false,
          error: emailResult.error || 'Failed to send verification email. Please try again.'
        };
      }

      console.log('✅ Verification code sent successfully!');
      return { success: true };

    } catch (error) {
      console.error('Error sending verification code:', error);
      return {
        success: false,
        error: 'Failed to send verification code. Please try again.'
      };
    }
  }

  // Verify the code entered by user
  static async verifyCode(email: string, enteredCode: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      const docRef = doc(db, 'verification_codes', email);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return {
          success: false,
          error: 'No verification code found. Please request a new one.'
        };
      }

      const data = docSnap.data() as VerificationCode;

      // Check if code has expired
      const now = new Date();
      const expiresAt = data.expiresAt.toDate ? data.expiresAt.toDate() : new Date(data.expiresAt);
      
      if (now > expiresAt) {
        // Clean up expired code
        await deleteDoc(docRef);
        return {
          success: false,
          error: 'Verification code has expired. Please request a new one.'
        };
      }

      // Check if too many attempts
      if (data.attempts >= 5) {
        await deleteDoc(docRef);
        return {
          success: false,
          error: 'Too many failed attempts. Please request a new verification code.'
        };
      }

      // Check if code matches
      if (data.code !== enteredCode) {
        // Increment attempts
        await setDoc(docRef, {
          ...data,
          attempts: data.attempts + 1
        });

        return {
          success: false,
          error: `Invalid verification code. ${4 - data.attempts} attempts remaining.`
        };
      }

      // Code is valid - clean up
      await deleteDoc(docRef);
      
      return {
        success: true
      };

    } catch (error) {
      console.error('Error verifying code:', error);
      return {
        success: false,
        error: 'Failed to verify code. Please try again.'
      };
    }
  }
}
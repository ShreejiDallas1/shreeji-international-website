// Custom email service for sending verification codes
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

export class EmailService {
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
      if (new Date() > data.expiresAt) {
        await deleteDoc(docRef);
        return {
          success: false,
          error: 'Verification code has expired. Please request a new one.'
        };
      }

      // Check attempts limit
      if (data.attempts >= 3) {
        await deleteDoc(docRef);
        return {
          success: false,
          error: 'Too many failed attempts. Please request a new verification code.'
        };
      }

      // Check if code matches
      if (data.code !== enteredCode) {
        // Increment attempts
        await setDoc(docRef, { ...data, attempts: data.attempts + 1 });
        return {
          success: false,
          error: `Invalid verification code. ${2 - data.attempts} attempts remaining.`
        };
      }

      // Code is valid - clean up
      await deleteDoc(docRef);
      return { success: true };

    } catch (error) {
      console.error('Error verifying code:', error);
      return {
        success: false,
        error: 'Failed to verify code. Please try again.'
      };
    }
  }

  // Send verification code via email (client-side method that calls API)
  static async sendVerificationCode(email: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      // Call the API route to send the email
      const response = await fetch('/api/send-verification-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email })
      });

      const result = await response.json();
      return result;

    } catch (error) {
      console.error('Error sending verification code:', error);
      return {
        success: false,
        error: 'Failed to send verification code. Please try again.'
      };
    }
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

  // Server-side method for sending verification code (used in API routes)
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
      
      // Import EmailSender only on server side
      const { EmailSender } = await import('./email-sender');
      
      // Send the actual email
      const emailResult = await EmailSender.sendVerificationCode(email, code);
      
      if (!emailResult.success) {
        // If email fails, we should clean up the stored code
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



  // Clean up expired codes (should be run periodically)
  static async cleanupExpiredCodes(): Promise<void> {
    try {
      // This would typically be done with a cloud function or cron job
      console.log('Cleaning up expired verification codes...');
      // Implementation would query and delete expired codes
    } catch (error) {
      console.error('Error cleaning up expired codes:', error);
    }
  }
}

export default EmailService;
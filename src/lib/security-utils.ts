// Client-safe security utilities (no server-side dependencies)

// Security configuration
const SECURITY_CONFIG = {
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION: 15 * 60 * 1000, // 15 minutes
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_MAX_LENGTH: 128,
  REQUIRE_UPPERCASE: true,
  REQUIRE_LOWERCASE: true,
  REQUIRE_NUMBERS: true,
  REQUIRE_SPECIAL_CHARS: true,
};

// Password strength validation
export interface PasswordStrength {
  score: number; // 0-4 (0 = very weak, 4 = very strong)
  feedback: string[];
  isValid: boolean;
  requirements: {
    length: boolean;
    uppercase: boolean;
    lowercase: boolean;
    numbers: boolean;
    specialChars: boolean;
  };
}

export class SecurityUtils {
  // Validate password strength
  static validatePasswordStrength(password: string): PasswordStrength {
    const feedback: string[] = [];
    const requirements = {
      length: password.length >= SECURITY_CONFIG.PASSWORD_MIN_LENGTH,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      numbers: /\d/.test(password),
      specialChars: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
    };

    let score = 0;

    // Check length
    if (!requirements.length) {
      feedback.push(`Password must be at least ${SECURITY_CONFIG.PASSWORD_MIN_LENGTH} characters long`);
    } else {
      score += 1;
    }

    // Check uppercase
    if (SECURITY_CONFIG.REQUIRE_UPPERCASE && !requirements.uppercase) {
      feedback.push('Password must contain at least one uppercase letter');
    } else if (requirements.uppercase) {
      score += 1;
    }

    // Check lowercase
    if (SECURITY_CONFIG.REQUIRE_LOWERCASE && !requirements.lowercase) {
      feedback.push('Password must contain at least one lowercase letter');
    } else if (requirements.lowercase) {
      score += 1;
    }

    // Check numbers
    if (SECURITY_CONFIG.REQUIRE_NUMBERS && !requirements.numbers) {
      feedback.push('Password must contain at least one number');
    } else if (requirements.numbers) {
      score += 1;
    }

    // Check special characters
    if (SECURITY_CONFIG.REQUIRE_SPECIAL_CHARS && !requirements.specialChars) {
      feedback.push('Password must contain at least one special character');
    } else if (requirements.specialChars) {
      score += 1;
    }

    // Check for common weak passwords
    const commonPasswords = [
      'password', '123456', '123456789', 'qwerty', 'abc123',
      'password123', 'admin', 'letmein', 'welcome', 'monkey'
    ];
    
    if (commonPasswords.includes(password.toLowerCase())) {
      feedback.push('This password is too common and easily guessed');
      score = Math.max(0, score - 2);
    }

    // Check for repeated characters
    if (/(.)\1{2,}/.test(password)) {
      feedback.push('Avoid using repeated characters');
      score = Math.max(0, score - 1);
    }

    // Check for sequential characters
    if (/(?:abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz|123|234|345|456|567|678|789)/i.test(password)) {
      feedback.push('Avoid using sequential characters');
      score = Math.max(0, score - 1);
    }

    const isValid = Object.values(requirements).every(req => req) && feedback.length === 0;

    return {
      score: Math.min(4, score),
      feedback,
      isValid,
      requirements,
    };
  }

  // Rate limiting (client-side simulation - in production use server-side)
  private static failedAttempts: Map<string, { count: number; lastAttempt: number }> = new Map();

  static recordFailedAttempt(identifier: string): void {
    const now = Date.now();
    const existing = this.failedAttempts.get(identifier);

    if (existing) {
      // Reset count if lockout period has passed
      if (now - existing.lastAttempt > SECURITY_CONFIG.LOCKOUT_DURATION) {
        this.failedAttempts.set(identifier, { count: 1, lastAttempt: now });
      } else {
        this.failedAttempts.set(identifier, { 
          count: existing.count + 1, 
          lastAttempt: now 
        });
      }
    } else {
      this.failedAttempts.set(identifier, { count: 1, lastAttempt: now });
    }
  }

  static isRateLimited(identifier: string): boolean {
    const now = Date.now();
    const existing = this.failedAttempts.get(identifier);

    if (!existing) {
      return false;
    }

    // Check if lockout period has passed
    if (now - existing.lastAttempt > SECURITY_CONFIG.LOCKOUT_DURATION) {
      this.failedAttempts.delete(identifier);
      return false;
    }

    return existing.count >= SECURITY_CONFIG.MAX_LOGIN_ATTEMPTS;
  }

  static clearFailedAttempts(identifier: string): void {
    this.failedAttempts.delete(identifier);
  }

  static getRemainingLockoutTime(identifier: string): number {
    const existing = this.failedAttempts.get(identifier);
    if (!existing || !this.isRateLimited(identifier)) {
      return 0;
    }

    const elapsed = Date.now() - existing.lastAttempt;
    return Math.max(0, SECURITY_CONFIG.LOCKOUT_DURATION - elapsed);
  }

  // Generate secure random string
  static generateSecureToken(length: number = 32): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    
    if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
      // Use crypto.getRandomValues in browser
      const array = new Uint8Array(length);
      window.crypto.getRandomValues(array);
      for (let i = 0; i < length; i++) {
        result += chars[array[i] % chars.length];
      }
    } else {
      // Fallback for server-side or older browsers
      for (let i = 0; i < length; i++) {
        result += chars[Math.floor(Math.random() * chars.length)];
      }
    }
    
    return result;
  }

  // Validate email format
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Check if password meets minimum requirements
  static meetsMinimumRequirements(password: string): boolean {
    return this.validatePasswordStrength(password).isValid;
  }
}

export default SecurityUtils;
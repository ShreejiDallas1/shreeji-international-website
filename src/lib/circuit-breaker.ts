// Circuit breaker to prevent resource exhaustion
import { VERCEL_LIMITS, SAFETY_THRESHOLDS, checkUsageSafety } from './resource-limits';

class CircuitBreaker {
  private static instance: CircuitBreaker;
  private isOpen = false;
  private lastCheck = 0;
  private checkInterval = 60000; // Check every minute
  
  static getInstance(): CircuitBreaker {
    if (!CircuitBreaker.instance) {
      CircuitBreaker.instance = new CircuitBreaker();
    }
    return CircuitBreaker.instance;
  }
  
  // Check if circuit breaker should be triggered
  shouldBlock(resourceType: keyof typeof VERCEL_LIMITS, currentUsage: number): boolean {
    const now = Date.now();
    
    // Only check periodically to avoid overhead
    if (now - this.lastCheck < this.checkInterval) {
      return this.isOpen;
    }
    
    this.lastCheck = now;
    const limit = VERCEL_LIMITS[resourceType];
    const safety = checkUsageSafety(currentUsage, limit);
    
    // Open circuit breaker if usage is critical
    if (safety.status === 'emergency' || safety.status === 'critical') {
      this.isOpen = true;
      console.error(`🚨 CIRCUIT BREAKER ACTIVATED: ${resourceType} usage at ${safety.percentage.toFixed(1)}%`);
      return true;
    }
    
    // Close circuit breaker if usage is back to safe levels
    if (safety.status === 'safe' && this.isOpen) {
      this.isOpen = false;
      console.log(`✅ Circuit breaker reset: ${resourceType} usage back to safe levels`);
    }
    
    return this.isOpen;
  }
  
  // Get fallback response when circuit breaker is open
  getFallbackResponse(resourceType: string) {
    return {
      success: false,
      error: 'Service temporarily unavailable due to resource limits',
      message: `${resourceType} usage is too high. Please try again later.`,
      retryAfter: Math.ceil(this.checkInterval / 1000), // seconds
      circuitBreakerActive: true
    };
  }
  
  // Manual reset (for admin use)
  reset() {
    this.isOpen = false;
    this.lastCheck = 0;
    console.log('🔄 Circuit breaker manually reset');
  }
  
  // Get current status
  getStatus() {
    return {
      isOpen: this.isOpen,
      lastCheck: new Date(this.lastCheck),
      nextCheck: new Date(this.lastCheck + this.checkInterval)
    };
  }
}

// Middleware function to check circuit breaker
export function checkCircuitBreaker(
  resourceType: keyof typeof VERCEL_LIMITS,
  currentUsage: number
): { blocked: boolean; response?: any } {
  try {
    const breaker = CircuitBreaker.getInstance();
    
    if (breaker.shouldBlock(resourceType, currentUsage)) {
      return {
        blocked: true,
        response: breaker.getFallbackResponse(resourceType)
      };
    }
    
    return { blocked: false };
  } catch (error) {
    // Fail safe - don't block if circuit breaker fails
    console.warn('Circuit breaker check failed:', error);
    return { blocked: false };
  }
}

// Export singleton instance
export const circuitBreaker = CircuitBreaker.getInstance();
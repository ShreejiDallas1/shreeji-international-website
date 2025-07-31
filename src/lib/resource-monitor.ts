// Resource usage monitoring for Vercel limits
export class ResourceMonitor {
  private static instance: ResourceMonitor;
  private requestCount = 0;
  private dataTransfer = 0;
  private functionCalls = 0;
  
  static getInstance(): ResourceMonitor {
    if (!ResourceMonitor.instance) {
      ResourceMonitor.instance = new ResourceMonitor();
    }
    return ResourceMonitor.instance;
  }
  
  // Track edge requests
  trackRequest(size: number = 0) {
    this.requestCount++;
    this.dataTransfer += size;
    
    // Log warning if approaching limits (80% threshold)
    if (this.requestCount > 800000) { // 80% of 1M
      console.warn('⚠️ Approaching edge request limit:', this.requestCount);
    }
    
    if (this.dataTransfer > 80000000000) { // 80% of 100GB in bytes
      console.warn('⚠️ Approaching data transfer limit:', this.dataTransfer);
    }
  }
  
  // Track function invocations
  trackFunction() {
    this.functionCalls++;
    
    if (this.functionCalls > 800000) { // 80% of 1M
      console.warn('⚠️ Approaching function invocation limit:', this.functionCalls);
    }
  }
  
  // Get current usage stats
  getStats() {
    return {
      requests: this.requestCount,
      dataTransfer: this.dataTransfer,
      functions: this.functionCalls,
      requestsPercent: (this.requestCount / 1000000) * 100,
      dataPercent: (this.dataTransfer / 100000000000) * 100,
      functionsPercent: (this.functionCalls / 1000000) * 100
    };
  }
  
  // Reset counters (for testing)
  reset() {
    this.requestCount = 0;
    this.dataTransfer = 0;
    this.functionCalls = 0;
  }
}

// Middleware to track requests
export function trackRequest(size: number = 0) {
  try {
    if (typeof window === 'undefined') { // Server-side only
      ResourceMonitor.getInstance().trackRequest(size);
    }
  } catch (error) {
    // Silently fail during build to prevent build errors
    console.warn('Resource tracking failed:', error);
  }
}

export function trackFunction() {
  try {
    if (typeof window === 'undefined') { // Server-side only
      ResourceMonitor.getInstance().trackFunction();
    }
  } catch (error) {
    // Silently fail during build to prevent build errors
    console.warn('Function tracking failed:', error);
  }
}
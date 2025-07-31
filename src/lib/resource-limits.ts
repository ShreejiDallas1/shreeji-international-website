// Vercel resource limits and safety thresholds
export const VERCEL_LIMITS = {
  // Monthly limits (Hobby plan)
  EDGE_REQUESTS: 1_000_000,
  FUNCTION_INVOCATIONS: 1_000_000,
  FAST_DATA_TRANSFER: 100 * 1024 * 1024 * 1024, // 100 GB in bytes
  FAST_ORIGIN_TRANSFER: 10 * 1024 * 1024 * 1024, // 10 GB in bytes
  ISR_READS: 1_000_000,
  ISR_WRITES: 200_000,
  FLUID_ACTIVE_CPU: 4 * 60 * 60, // 4 hours in seconds
  FLUID_PROVISIONED_MEMORY: 360, // GB-Hours
  EDGE_REQUEST_CPU_DURATION: 1 * 60 * 60, // 1 hour in seconds
} as const;

// Safety thresholds (percentage of limit to trigger warnings)
export const SAFETY_THRESHOLDS = {
  WARNING: 70, // 70% usage
  CRITICAL: 85, // 85% usage
  EMERGENCY: 95, // 95% usage
} as const;

// Calculate safe daily usage to last 30 days
export const DAILY_SAFE_LIMITS = {
  EDGE_REQUESTS: Math.floor(VERCEL_LIMITS.EDGE_REQUESTS * 0.8 / 30), // 26,667 per day
  FUNCTION_INVOCATIONS: Math.floor(VERCEL_LIMITS.FUNCTION_INVOCATIONS * 0.8 / 30), // 26,667 per day
  FAST_DATA_TRANSFER: Math.floor(VERCEL_LIMITS.FAST_DATA_TRANSFER * 0.8 / 30), // ~2.7 GB per day
  ISR_READS: Math.floor(VERCEL_LIMITS.ISR_READS * 0.8 / 30), // 26,667 per day
} as const;

// Current usage patterns (based on provided data)
export const CURRENT_USAGE = {
  EDGE_REQUESTS: 1900,
  FUNCTION_INVOCATIONS: 125,
  FAST_DATA_TRANSFER: 60.1 * 1024 * 1024, // 60.1 MB in bytes
  FAST_ORIGIN_TRANSFER: 2.82 * 1024 * 1024, // 2.82 MB in bytes
  ISR_READS: 186,
  FLUID_ACTIVE_CPU: 18, // 18 seconds
  FLUID_PROVISIONED_MEMORY: 0.03, // GB-Hours
} as const;

// Projected monthly usage based on current patterns
export const MONTHLY_PROJECTION = {
  EDGE_REQUESTS: CURRENT_USAGE.EDGE_REQUESTS * 30, // ~57K
  FUNCTION_INVOCATIONS: CURRENT_USAGE.FUNCTION_INVOCATIONS * 30, // ~3.8K
  FAST_DATA_TRANSFER: CURRENT_USAGE.FAST_DATA_TRANSFER * 30, // ~1.8 GB
  ISR_READS: CURRENT_USAGE.ISR_READS * 30, // ~5.6K
} as const;

// Check if usage is within safe limits
export function checkUsageSafety(currentUsage: number, limit: number): {
  status: 'safe' | 'warning' | 'critical' | 'emergency';
  percentage: number;
  message: string;
} {
  const percentage = (currentUsage / limit) * 100;
  
  if (percentage >= SAFETY_THRESHOLDS.EMERGENCY) {
    return {
      status: 'emergency',
      percentage,
      message: 'EMERGENCY: Usage above 95% - immediate action required!'
    };
  } else if (percentage >= SAFETY_THRESHOLDS.CRITICAL) {
    return {
      status: 'critical',
      percentage,
      message: 'CRITICAL: Usage above 85% - optimize immediately!'
    };
  } else if (percentage >= SAFETY_THRESHOLDS.WARNING) {
    return {
      status: 'warning',
      percentage,
      message: 'WARNING: Usage above 70% - monitor closely'
    };
  } else {
    return {
      status: 'safe',
      percentage,
      message: 'Safe usage levels'
    };
  }
}

// Get optimization recommendations based on usage
export function getOptimizationRecommendations(usage: typeof CURRENT_USAGE) {
  const recommendations: string[] = [];
  
  // Edge requests optimization
  const edgeStatus = checkUsageSafety(usage.EDGE_REQUESTS, DAILY_SAFE_LIMITS.EDGE_REQUESTS);
  if (edgeStatus.status !== 'safe') {
    recommendations.push('Increase caching duration for static content');
    recommendations.push('Implement more aggressive CDN caching');
  }
  
  // Function invocations optimization
  const functionStatus = checkUsageSafety(usage.FUNCTION_INVOCATIONS, DAILY_SAFE_LIMITS.FUNCTION_INVOCATIONS);
  if (functionStatus.status !== 'safe') {
    recommendations.push('Move more pages to static generation');
    recommendations.push('Implement client-side caching for API calls');
    recommendations.push('Use ISR instead of server-side rendering');
  }
  
  // Data transfer optimization
  const dataStatus = checkUsageSafety(usage.FAST_DATA_TRANSFER, DAILY_SAFE_LIMITS.FAST_DATA_TRANSFER);
  if (dataStatus.status !== 'safe') {
    recommendations.push('Optimize image sizes and formats');
    recommendations.push('Enable compression for API responses');
    recommendations.push('Implement lazy loading for all media');
  }
  
  return recommendations;
}
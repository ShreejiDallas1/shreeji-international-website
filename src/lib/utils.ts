// Utility functions for the application

// Format currency with proper formatting
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

// Format Square money (cents) to dollar display
export function formatSquareMoney(amountInCents: number): string {
  return formatCurrency(amountInCents / 100);
}

// Format large numbers with commas
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(num);
}

// Format percentage
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}

// Calculate discount percentage
export function calculateDiscountPercentage(originalPrice: number, discountedPrice: number): number {
  if (originalPrice <= 0) return 0;
  return ((originalPrice - discountedPrice) / originalPrice) * 100;
}

// Format date for display
export function formatDate(date: Date | string): string {
  const dateObject = typeof date === 'string' ? new Date(date) : date;
  return dateObject.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

// Format date and time
export function formatDateTime(date: Date | string): string {
  const dateObject = typeof date === 'string' ? new Date(date) : date;
  return dateObject.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// Convert weight to display format
export function formatWeight(weightInPounds: number): string {
  if (weightInPounds < 1) {
    return `${Math.round(weightInPounds * 16)} oz`;
  }
  return `${weightInPounds.toFixed(1)} lbs`;
}

// Format shipping time
export function formatShippingTime(days: number): string {
  if (days === 1) return '1 business day';
  if (days <= 5) return `${days} business days`;
  return `${days} days`;
}

// Generate SKU from product name
export function generateSKU(productName: string, index?: number): string {
  const cleaned = productName
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .trim()
    .toUpperCase()
    .split(' ')
    .map(word => word.substring(0, 3))
    .join('');
  
  const suffix = index ? `-${index.toString().padStart(3, '0')}` : '';
  return `${cleaned}${suffix}`;
}

// Validate email format
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Validate phone number format
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
  return phoneRegex.test(phone);
}

// Format phone number for display
export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  return phone;
}

// Generate random ID
export function generateId(length: number = 8): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Truncate text with ellipsis
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

// Calculate shipping cost based on weight and distance
export function calculateShippingCost(weight: number, distance: number): number {
  const baseRate = 8.99;
  const weightRate = Math.max(0, (weight - 1) * 2.50);
  const distanceRate = Math.max(0, (distance - 100) * 0.05);
  
  return Math.round((baseRate + weightRate + distanceRate) * 100) / 100;
}

// Safe JSON parse
export function safeJsonParse<T>(json: string, defaultValue: T): T {
  try {
    return JSON.parse(json) as T;
  } catch {
    return defaultValue;
  }
}

// Debounce function for search inputs
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

// Class name utility (simple version of clsx)
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

export default {
  formatCurrency,
  formatSquareMoney,
  formatNumber,
  formatPercentage,
  calculateDiscountPercentage,
  formatDate,
  formatDateTime,
  formatWeight,
  formatShippingTime,
  generateSKU,
  isValidEmail,
  isValidPhone,
  formatPhoneNumber,
  generateId,
  truncateText,
  calculateShippingCost,
  safeJsonParse,
  debounce,
  cn
};
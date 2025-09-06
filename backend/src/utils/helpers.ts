// Utility functions for the Coffee & Tea E-commerce application

/**
 * Generate a URL-friendly slug from a string
 * @param text - The text to convert to slug
 * @returns URL-friendly slug
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Validate email format
 * @param email - Email to validate
 * @returns True if valid email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate phone number format (Vietnamese)
 * @param phone - Phone number to validate
 * @returns True if valid phone format
 */
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^(\+84|0)[1-9][0-9]{8,9}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
}

/**
 * Format price for display
 * @param price - Price in VND
 * @returns Formatted price string
 */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(price);
}

/**
 * Calculate sale discount percentage
 * @param basePrice - Original price
 * @param salePrice - Sale price
 * @returns Discount percentage
 */
export function calculateDiscountPercentage(basePrice: number, salePrice: number): number {
  if (basePrice <= 0 || salePrice >= basePrice) return 0;
  return Math.round(((basePrice - salePrice) / basePrice) * 100);
}

/**
 * Validate business rules for products
 * @param data - Product data to validate
 * @returns Validation errors array
 */
export function validateBusinessRules(data: any): string[] {
  const errors: string[] = [];

  // Coffee specific validations
  if (data.category === 'coffee') {
    if (data.roastLevel && !['light', 'medium', 'medium-dark', 'dark'].includes(data.roastLevel)) {
      errors.push('Invalid roast level for coffee product');
    }
    
    if (data.grindSize && !['whole-bean', 'coarse', 'medium', 'fine', 'extra-fine'].includes(data.grindSize)) {
      errors.push('Invalid grind size for coffee product');
    }
  }

  // Tea specific validations
  if (data.category === 'tea') {
    if (data.teaType && !['black', 'green', 'white', 'oolong', 'pu-erh', 'herbal'].includes(data.teaType)) {
      errors.push('Invalid tea type');
    }
  }

  return errors;
}

/**
 * Generate random string for tokens
 * @param length - Length of the random string
 * @returns Random string
 */
export function generateRandomString(length: number = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Convert string to proper case
 * @param str - String to convert
 * @returns Proper case string
 */
export function toProperCase(str: string): string {
  return str.replace(/\w\S*/g, (txt) => 
    txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
}

/**
 * Sanitize search query
 * @param query - Search query to sanitize
 * @returns Sanitized query
 */
export function sanitizeSearchQuery(query: string): string {
  return query
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .substring(0, 100); // Limit length
}

/**
 * Calculate shipping cost based on weight and distance
 * @param weight - Package weight in grams
 * @param distance - Distance in km (optional)
 * @returns Shipping cost in VND
 */
export function calculateShippingCost(weight: number, distance: number = 50): number {
  const baseRate = 20000; // 20,000 VND base
  const weightRate = weight > 1000 ? (weight - 1000) * 0.01 : 0; // Additional cost for weight > 1kg
  const distanceRate = distance > 50 ? (distance - 50) * 100 : 0; // Additional cost for distance > 50km
  
  return Math.round(baseRate + weightRate + distanceRate);
}

/**
 * Validate product SKU format
 * @param sku - SKU to validate
 * @returns True if valid SKU format
 */
export function isValidSKU(sku: string): boolean {
  // SKU should be 3-20 characters, alphanumeric with hyphens allowed
  const skuRegex = /^[A-Z0-9-]{3,20}$/;
  return skuRegex.test(sku);
}

/**
 * Generate product SKU based on category and name
 * @param category - Product category
 * @param name - Product name
 * @returns Generated SKU
 */
export function generateProductSKU(category: string, name: string): string {
  const categoryCode = category.substring(0, 3).toUpperCase();
  const nameCode = name
    .replace(/[^a-zA-Z0-9]/g, '')
    .substring(0, 8)
    .toUpperCase();
  const timestamp = Date.now().toString().slice(-6);
  
  return `${categoryCode}-${nameCode}-${timestamp}`;
}

/**
 * Check if a value is empty (null, undefined, empty string, empty array)
 * @param value - Value to check
 * @returns True if empty
 */
export function isEmpty(value: any): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
}

/**
 * Deep clone an object
 * @param obj - Object to clone
 * @returns Cloned object
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime()) as any;
  if (obj instanceof Array) return obj.map(item => deepClone(item)) as any;
  
  const cloned = {} as T;
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      cloned[key] = deepClone(obj[key]);
    }
  }
  return cloned;
}

/**
 * Debounce function to limit rapid function calls
 * @param func - Function to debounce
 * @param delay - Delay in milliseconds
 * @returns Debounced function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(null, args), delay);
  };
}

/**
 * Retry async function with exponential backoff
 * @param fn - Async function to retry
 * @param maxRetries - Maximum number of retries
 * @param baseDelay - Base delay in milliseconds
 * @returns Promise that resolves with function result
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxRetries) throw error;
      
      const delay = baseDelay * Math.pow(2, attempt - 1);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  throw new Error('Max retries exceeded');
}

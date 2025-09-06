// Error handling utilities for Coffee & Tea E-commerce application

/**
 * Custom application error class
 */
export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;
  public code?: string;
  public details?: any;

  constructor(
    message: string, 
    statusCode: number = 500, 
    code?: string, 
    details?: any
  ) {
    super(message);
    
    this.statusCode = statusCode;
    this.isOperational = true;
    this.code = code || 'UNKNOWN_ERROR';
    this.details = details || undefined;
    
    Object.setPrototypeOf(this, AppError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Validation error for form/input validation
 */
export class ValidationError extends AppError {
  public validationErrors: ValidationErrorDetail[];

  constructor(message: string, validationErrors: ValidationErrorDetail[] = []) {
    super(message, 400, 'VALIDATION_ERROR');
    this.validationErrors = validationErrors;
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

/**
 * Authentication error
 */
export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication failed') {
    super(message, 401, 'AUTHENTICATION_ERROR');
    Object.setPrototypeOf(this, AuthenticationError.prototype);
  }
}

/**
 * Authorization error
 */
export class AuthorizationError extends AppError {
  constructor(message: string = 'Access denied') {
    super(message, 403, 'AUTHORIZATION_ERROR');
    Object.setPrototypeOf(this, AuthorizationError.prototype);
  }
}

/**
 * Not found error
 */
export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource') {
    super(`${resource} not found`, 404, 'NOT_FOUND_ERROR');
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

/**
 * Conflict error (e.g., duplicate resources)
 */
export class ConflictError extends AppError {
  constructor(message: string = 'Resource conflict') {
    super(message, 409, 'CONFLICT_ERROR');
    Object.setPrototypeOf(this, ConflictError.prototype);
  }
}

/**
 * Business logic error
 */
export class BusinessLogicError extends AppError {
  constructor(message: string) {
    super(message, 422, 'BUSINESS_LOGIC_ERROR');
    Object.setPrototypeOf(this, BusinessLogicError.prototype);
  }
}

/**
 * Rate limit error
 */
export class RateLimitError extends AppError {
  constructor(message: string = 'Too many requests') {
    super(message, 429, 'RATE_LIMIT_ERROR');
    Object.setPrototypeOf(this, RateLimitError.prototype);
  }
}

/**
 * External service error
 */
export class ExternalServiceError extends AppError {
  constructor(service: string, message?: string) {
    super(message || `External service ${service} is unavailable`, 503, 'EXTERNAL_SERVICE_ERROR');
    Object.setPrototypeOf(this, ExternalServiceError.prototype);
  }
}

/**
 * Database error
 */
export class DatabaseError extends AppError {
  constructor(message: string = 'Database operation failed') {
    super(message, 500, 'DATABASE_ERROR');
    Object.setPrototypeOf(this, DatabaseError.prototype);
  }
}

/**
 * Validation error detail interface
 */
export interface ValidationErrorDetail {
  field: string;
  message: string;
  code: string;
  value?: any;
}

/**
 * Error response interface
 */
export interface ErrorResponse {
  success: false;
  error: {
    message: string;
    code?: string;
    statusCode: number;
    details?: any;
    validationErrors?: ValidationErrorDetail[];
    timestamp: string;
    path?: string;
  };
}

/**
 * Common error codes used throughout the application
 */
export const ErrorCodes = {
  // Authentication & Authorization
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  TOKEN_INVALID: 'TOKEN_INVALID',
  ACCESS_DENIED: 'ACCESS_DENIED',
  ACCOUNT_LOCKED: 'ACCOUNT_LOCKED',
  ACCOUNT_NOT_VERIFIED: 'ACCOUNT_NOT_VERIFIED',

  // Validation
  REQUIRED_FIELD: 'REQUIRED_FIELD',
  INVALID_FORMAT: 'INVALID_FORMAT',
  INVALID_EMAIL: 'INVALID_EMAIL',
  INVALID_PHONE: 'INVALID_PHONE',
  PASSWORD_TOO_WEAK: 'PASSWORD_TOO_WEAK',
  INVALID_DATE: 'INVALID_DATE',
  INVALID_ENUM_VALUE: 'INVALID_ENUM_VALUE',

  // Business Logic
  INSUFFICIENT_STOCK: 'INSUFFICIENT_STOCK',
  PRODUCT_NOT_AVAILABLE: 'PRODUCT_NOT_AVAILABLE',
  INVALID_QUANTITY: 'INVALID_QUANTITY',
  MINIMUM_ORDER_NOT_MET: 'MINIMUM_ORDER_NOT_MET',
  INVALID_DISCOUNT_CODE: 'INVALID_DISCOUNT_CODE',
  EXPIRED_DISCOUNT_CODE: 'EXPIRED_DISCOUNT_CODE',

  // Product Management
  DUPLICATE_SKU: 'DUPLICATE_SKU',
  DUPLICATE_SLUG: 'DUPLICATE_SLUG',
  INVALID_PRICE: 'INVALID_PRICE',
  INVALID_CATEGORY: 'INVALID_CATEGORY',
  INVALID_BRAND: 'INVALID_BRAND',
  PRODUCT_HAS_ORDERS: 'PRODUCT_HAS_ORDERS',

  // File Upload
  FILE_TOO_LARGE: 'FILE_TOO_LARGE',
  INVALID_FILE_TYPE: 'INVALID_FILE_TYPE',
  UPLOAD_FAILED: 'UPLOAD_FAILED',

  // External Services
  PAYMENT_FAILED: 'PAYMENT_FAILED',
  SHIPPING_SERVICE_ERROR: 'SHIPPING_SERVICE_ERROR',
  EMAIL_SERVICE_ERROR: 'EMAIL_SERVICE_ERROR',

  // Database
  CONNECTION_FAILED: 'CONNECTION_FAILED',
  TRANSACTION_FAILED: 'TRANSACTION_FAILED',
  CONSTRAINT_VIOLATION: 'CONSTRAINT_VIOLATION',

  // General
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED'
} as const;

/**
 * Convert Prisma errors to application errors
 */
export function handlePrismaError(error: any): AppError {
  if (error.code === 'P2002') {
    // Unique constraint violation
    const target = error.meta?.target;
    const field = Array.isArray(target) ? target[0] : target;
    return new ConflictError(`${field} already exists`);
  }
  
  if (error.code === 'P2025') {
    // Record not found
    return new NotFoundError('Record');
  }
  
  if (error.code === 'P2003') {
    // Foreign key constraint violation
    return new ValidationError('Invalid reference to related record');
  }
  
  if (error.code === 'P2014') {
    // Invalid ID
    return new ValidationError('Invalid ID format');
  }

  // Default to database error
  return new DatabaseError(`Database operation failed: ${error.message}`);
}

/**
 * Create validation error details
 */
export function createValidationErrors(errors: { [key: string]: string }): ValidationErrorDetail[] {
  return Object.entries(errors).map(([field, message]) => ({
    field,
    message,
    code: ErrorCodes.REQUIRED_FIELD
  }));
}

/**
 * Format error response for API
 */
export function formatErrorResponse(error: AppError, path?: string): ErrorResponse {
  const response: ErrorResponse = {
    success: false,
    error: {
      message: error.message,
      statusCode: error.statusCode,
      timestamp: new Date().toISOString()
    }
  };

  if (error.code) {
    response.error.code = error.code;
  }

  if (path) {
    response.error.path = path;
  }

  if (error instanceof ValidationError) {
    response.error.validationErrors = error.validationErrors;
  }

  if (error.details) {
    response.error.details = error.details;
  }

  return response;
}

/**
 * Log error with context
 */
export function logError(error: Error, context?: any): void {
  console.error('Error occurred:', {
    message: error.message,
    stack: error.stack,
    context,
    timestamp: new Date().toISOString()
  });
}

/**
 * Check if error is operational (known error vs programming error)
 */
export function isOperationalError(error: Error): boolean {
  if (error instanceof AppError) {
    return error.isOperational;
  }
  return false;
}

/**
 * Safe async error handler
 */
export function safeAsync<T>(
  fn: () => Promise<T>
): Promise<{ data?: T; error?: Error }> {
  return fn()
    .then(data => ({ data }))
    .catch(error => ({ error }));
}

/**
 * Wrap async function with error handling
 */
export function withErrorHandling<T extends any[], R>(
  fn: (...args: T) => Promise<R>
) {
  return async (...args: T): Promise<R> => {
    try {
      return await fn(...args);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      
      // Convert unknown errors to AppError
      if (error instanceof Error) {
        throw new AppError(error.message, 500, ErrorCodes.INTERNAL_SERVER_ERROR);
      }
      
      throw new AppError('An unexpected error occurred', 500, ErrorCodes.INTERNAL_SERVER_ERROR);
    }
  };
}

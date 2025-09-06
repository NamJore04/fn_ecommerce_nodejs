// API Response Middleware - Coffee & Tea E-commerce
// Standardizes API response format across all endpoints

import { Request, Response, NextFunction } from 'express';

// ============================================
// RESPONSE INTERFACE
// ============================================

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    requestId?: string;
    timestamp: string;
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

// ============================================
// RESPONSE HELPER FUNCTIONS
// ============================================

/**
 * Send success response
 */
export const sendSuccess = <T>(
  res: Response,
  data?: T,
  message?: string,
  statusCode: number = 200,
  meta?: any
): void => {
  const response: ApiResponse<T> = {
    success: true,
    ...(message && { message }),
    ...(data !== undefined && { data }),
    meta: {
      requestId: res.locals.requestId,
      timestamp: new Date().toISOString(),
      ...meta
    }
  };

  res.status(statusCode).json(response);
};

/**
 * Send error response
 */
export const sendError = (
  res: Response,
  message: string,
  code: string = 'INTERNAL_ERROR',
  statusCode: number = 500,
  details?: any
): void => {
  const response: ApiResponse = {
    success: false,
    error: {
      code,
      message,
      details
    },
    meta: {
      requestId: res.locals.requestId,
      timestamp: new Date().toISOString()
    }
  };

  res.status(statusCode).json(response);
};

/**
 * Send validation error response
 */
export const sendValidationError = (
  res: Response,
  errors: any,
  message: string = 'Validation failed'
): void => {
  sendError(res, message, 'VALIDATION_ERROR', 400, errors);
};

/**
 * Send not found response
 */
export const sendNotFound = (
  res: Response,
  resource: string = 'Resource'
): void => {
  sendError(res, `${resource} not found`, 'NOT_FOUND', 404);
};

/**
 * Send unauthorized response
 */
export const sendUnauthorized = (
  res: Response,
  message: string = 'Unauthorized access'
): void => {
  sendError(res, message, 'UNAUTHORIZED', 401);
};

/**
 * Send forbidden response
 */
export const sendForbidden = (
  res: Response,
  message: string = 'Access forbidden'
): void => {
  sendError(res, message, 'FORBIDDEN', 403);
};

// ============================================
// RESPONSE MIDDLEWARE
// ============================================

/**
 * Middleware to add response helpers to res object
 */
export const responseMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  // Add request ID from previous middleware
  res.locals.requestId = req.requestId || generateRequestId();

  // Add helper functions to response object
  res.sendSuccess = <T>(data?: T, message?: string, statusCode?: number, meta?: any) => {
    sendSuccess(res, data, message, statusCode, meta);
  };

  res.sendError = (message: string, code?: string, statusCode?: number, details?: any) => {
    sendError(res, message, code, statusCode, details);
  };

  res.sendValidationError = (errors: any, message?: string) => {
    sendValidationError(res, errors, message);
  };

  res.sendNotFound = (resource?: string) => {
    sendNotFound(res, resource);
  };

  res.sendUnauthorized = (message?: string) => {
    sendUnauthorized(res, message);
  };

  res.sendForbidden = (message?: string) => {
    sendForbidden(res, message);
  };

  next();
};

// ============================================
// PAGINATION HELPER
// ============================================

export interface PaginationParams {
  page: number;
  limit: number;
  offset: number;
}

export const parsePagination = (req: Request): PaginationParams => {
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 10));
  const offset = (page - 1) * limit;

  return { page, limit, offset };
};

export const createPaginationMeta = (
  page: number,
  limit: number,
  total: number
) => {
  return {
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Generate unique request ID
 */
const generateRequestId = (): string => {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Sanitize error for client response
 */
export const sanitizeError = (error: any) => {
  // Don't expose internal details in production
  if (process.env.NODE_ENV === 'production') {
    return {
      message: error.message || 'An error occurred'
    };
  }

  return {
    message: error.message,
    stack: error.stack,
    code: error.code
  };
};

// ============================================
// TYPE EXTENSIONS
// ============================================

declare global {
  namespace Express {
    interface Request {
      requestId?: string;
    }
    
    interface Response {
      sendSuccess: <T>(data?: T, message?: string, statusCode?: number, meta?: any) => void;
      sendError: (message: string, code?: string, statusCode?: number, details?: any) => void;
      sendValidationError: (errors: any, message?: string) => void;
      sendNotFound: (resource?: string) => void;
      sendUnauthorized: (message?: string) => void;
      sendForbidden: (message?: string) => void;
    }
  }
}

export default responseMiddleware;

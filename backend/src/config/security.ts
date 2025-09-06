import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import { redisClient, prisma } from './database';

// ============================================
// SECURITY MIDDLEWARE CONFIGURATION
// ============================================

/**
 * CORS Configuration
 * Handles Cross-Origin Resource Sharing with security in mind
 */
export const corsOptions = {
  origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      process.env.CORS_ORIGIN || 'http://localhost:3000',
      'http://localhost:3000',
      'https://localhost:3000',
      process.env.FRONTEND_URL,
      process.env.ADMIN_URL
    ].filter(Boolean);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'), false);
    }
  },
  credentials: process.env.CORS_CREDENTIALS === 'true',
  optionsSuccessStatus: 200, // For legacy browser support
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'Cache-Control',
    'X-User-ID'
  ],
  exposedHeaders: ['X-Total-Count', 'X-Page-Count']
};

/**
 * Helmet Security Configuration
 * Sets various HTTP headers for security
 */
export const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:", "http:"],
      scriptSrc: ["'self'"],
      objectSrc: ["'none'"],
    },
  },
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true
  }
});

/**
 * Compression Configuration
 * Compresses responses to reduce bandwidth
 */
export const compressionConfig = compression({
  level: 6,
  threshold: 1024,
  filter: (req: Request, res: Response) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  }
});

// ============================================
// RATE LIMITING CONFIGURATION
// ============================================

/**
 * Redis-based rate limiting store
 */
class RedisStore {
  private prefix: string;
  private expiry: number;

  constructor(prefix = 'rl:', expiry = 900) {
    this.prefix = prefix;
    this.expiry = expiry;
  }

  async increment(key: string): Promise<{ totalHits: number; resetTime: Date }> {
    const redisKey = `${this.prefix}${key}`;
    
    try {
      const current = await redisClient.incr(redisKey);
      
      if (current === 1) {
        await redisClient.expire(redisKey, this.expiry);
      }
      
      const ttl = await redisClient.ttl(redisKey);
      const resetTime = new Date(Date.now() + ttl * 1000);
      
      return {
        totalHits: current,
        resetTime
      };
    } catch (error) {
      console.error('Redis rate limiting error:', error);
      // Fallback to allow request if Redis is down
      return {
        totalHits: 1,
        resetTime: new Date(Date.now() + this.expiry * 1000)
      };
    }
  }

  async decrement(key: string): Promise<void> {
    try {
      await redisClient.decr(`${this.prefix}${key}`);
    } catch (error) {
      console.error('Redis rate limiting decrement error:', error);
    }
  }

  async resetKey(key: string): Promise<void> {
    try {
      await redisClient.del(`${this.prefix}${key}`);
    } catch (error) {
      console.error('Redis rate limiting reset error:', error);
    }
  }
}

/**
 * General API rate limiter
 */
export const apiRateLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  store: new RedisStore('api:', 900) as any,
  keyGenerator: (req: Request): string => {
    return req.ip || req.connection.remoteAddress || 'unknown';
  }
});

/**
 * Strict rate limiter for authentication endpoints
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: {
    error: 'Too many authentication attempts, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  store: new RedisStore('auth:', 900) as any,
  skipSuccessfulRequests: true // Don't count successful requests
});

/**
 * Password reset rate limiter
 */
export const passwordResetRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Limit each IP to 3 password reset requests per hour
  message: {
    error: 'Too many password reset attempts, please try again later.',
    retryAfter: '1 hour'
  },
  standardHeaders: true,
  legacyHeaders: false,
  store: new RedisStore('pwd_reset:', 3600) as any
});

/**
 * Order creation rate limiter
 */
export const orderRateLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 3, // Limit each user to 3 orders per 5 minutes
  message: {
    error: 'Too many orders created, please wait before placing another order.',
    retryAfter: '5 minutes'
  },
  keyGenerator: (req: Request): string => {
    // Use user ID if authenticated, otherwise IP
    return req.user?.id || req.ip || 'unknown';
  },
  store: new RedisStore('order:', 300) as any
});

// ============================================
// SECURITY UTILITIES
// ============================================

/**
 * Input sanitization middleware
 */
export const sanitizeInput = (req: Request, res: Response, next: NextFunction): void => {
  const sanitize = (obj: any): any => {
    if (typeof obj === 'string') {
      // Remove potential script tags and dangerous characters
      return obj
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+\s*=/gi, '')
        .trim();
    }
    
    if (Array.isArray(obj)) {
      return obj.map(sanitize);
    }
    
    if (obj && typeof obj === 'object') {
      const sanitized: any = {};
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          sanitized[key] = sanitize(obj[key]);
        }
      }
      return sanitized;
    }
    
    return obj;
  };

  if (req.body) {
    req.body = sanitize(req.body);
  }
  
  if (req.query) {
    req.query = sanitize(req.query);
  }
  
  if (req.params) {
    req.params = sanitize(req.params);
  }

  next();
};

/**
 * Request ID middleware for tracing
 */
export const requestId = (req: Request, res: Response, next: NextFunction): void => {
  const requestId = req.headers['x-request-id'] as string || 
                   `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  req.requestId = requestId;
  res.setHeader('X-Request-ID', requestId);
  
  next();
};

/**
 * Security headers middleware
 */
export const securityHeaders = (req: Request, res: Response, next: NextFunction): void => {
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');
  
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // Enable XSS filtering
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Referrer Policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Feature Policy
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  
  next();
};

/**
 * User context middleware for RLS
 */
export const setUserContext = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  if (req.user?.id) {
    try {
      // Set user context for Row Level Security
      await prisma.$executeRaw`SELECT set_config('app.current_user_id', ${req.user.id}, true)`;
    } catch (error) {
      console.error('Failed to set user context:', error);
    }
  }
  
  next();
};

// ============================================
// ERROR HANDLING MIDDLEWARE
// ============================================

/**
 * Global error handler
 */
export const globalErrorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error(`Error ${req.requestId}:`, error);

  // Prisma errors
  if (error.code && error.code.startsWith('P')) {
    const prismaError = handlePrismaError(error);
    res.status(prismaError.status).json({
      success: false,
      error: {
        code: prismaError.code,
        message: prismaError.message,
        requestId: req.requestId
      }
    });
    return;
  }

  // Validation errors
  if (error.name === 'ValidationError' || error.name === 'ZodError') {
    res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details: error.errors || error.issues,
        requestId: req.requestId
      }
    });
    return;
  }

  // JWT errors
  if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
    res.status(401).json({
      success: false,
      error: {
        code: 'AUTHENTICATION_ERROR',
        message: 'Invalid or expired token',
        requestId: req.requestId
      }
    });
    return;
  }

  // Default error
  const status = error.status || error.statusCode || 500;
  const message = process.env.NODE_ENV === 'production' 
    ? 'Internal server error' 
    : error.message;

  res.status(status).json({
    success: false,
    error: {
      code: error.code || 'INTERNAL_ERROR',
      message,
      requestId: req.requestId
    }
  });
};

/**
 * Handle Prisma-specific errors
 */
function handlePrismaError(error: any): { status: number; code: string; message: string } {
  switch (error.code) {
    case 'P2002':
      return {
        status: 409,
        code: 'DUPLICATE_ERROR',
        message: 'A record with this information already exists'
      };
    case 'P2025':
      return {
        status: 404,
        code: 'NOT_FOUND',
        message: 'Record not found'
      };
    case 'P2003':
      return {
        status: 400,
        code: 'FOREIGN_KEY_ERROR',
        message: 'Related record not found'
      };
    default:
      return {
        status: 500,
        code: 'DATABASE_ERROR',
        message: 'Database operation failed'
      };
  }
}

// ============================================
// HEALTH CHECK MIDDLEWARE
// ============================================

/**
 * Health check endpoint
 */
export const healthCheck = async (req: Request, res: Response): Promise<void> => {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    version: process.env.npm_package_version || '1.0.0',
    services: {
      database: 'unknown',
      redis: 'unknown'
    }
  };

  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`;
    health.services.database = 'healthy';
  } catch (error) {
    health.services.database = 'unhealthy';
    health.status = 'degraded';
  }

  try {
    // Check Redis connection
    await redisClient.ping();
    health.services.redis = 'healthy';
  } catch (error) {
    health.services.redis = 'unhealthy';
    health.status = 'degraded';
  }

  const statusCode = health.status === 'ok' ? 200 : 503;
  res.status(statusCode).json(health);
};

// Type augmentation for Request object
declare global {
  namespace Express {
    interface Request {
      requestId?: string;
      user?: {
        id: string;
        email: string;
        role?: string;
      };
    }
  }
}

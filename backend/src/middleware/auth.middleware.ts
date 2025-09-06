import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { verifyAccessToken, extractTokenFromHeader } from '../config/jwt';
import { AuthenticatedRequest } from '../types/auth.types';

// ============================================
// PRISMA CLIENT INITIALIZATION
// ============================================

const prisma = new PrismaClient();

// ============================================
// AUTHENTICATION MIDDLEWARE
// ============================================

/**
 * Middleware to authenticate JWT tokens
 */
export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Extract token from Authorization header
    const token = extractTokenFromHeader(req.headers.authorization);
    
    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Access token is required',
        error: 'MISSING_TOKEN'
      });
      return;
    }

    // Verify token
    const payload = verifyAccessToken(token);
    
    // Get user from database to ensure they still exist and are active
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
        emailVerified: true,
        accountLocked: true,
      }
    });

    if (!user) {
      res.status(401).json({
        success: false,
        message: 'User not found',
        error: 'USER_NOT_FOUND'
      });
      return;
    }

    if (!user.isActive) {
      res.status(401).json({
        success: false,
        message: 'Account is inactive',
        error: 'ACCOUNT_INACTIVE'
      });
      return;
    }

    if (user.accountLocked) {
      res.status(401).json({
        success: false,
        message: 'Account is locked',
        error: 'ACCOUNT_LOCKED'
      });
      return;
    }

    // Add user info to request
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    next();

  } catch (error: any) {
    if (error.message === 'Access token expired') {
      res.status(401).json({
        success: false,
        message: 'Access token expired',
        error: 'TOKEN_EXPIRED'
      });
      return;
    }

    if (error.message === 'Invalid access token') {
      res.status(401).json({
        success: false,
        message: 'Invalid access token',
        error: 'INVALID_TOKEN'
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: 'Authentication failed',
      error: 'AUTH_ERROR'
    });
  }
};

// ============================================
// AUTHORIZATION MIDDLEWARE
// ============================================

/**
 * Middleware to check user roles
 */
export const requireRole = (allowedRoles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
        error: 'NOT_AUTHENTICATED'
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role || '')) {
      res.status(403).json({
        success: false,
        message: 'Insufficient permissions',
        error: 'INSUFFICIENT_PERMISSIONS'
      });
      return;
    }

    next();
  };
};

/**
 * Middleware to require admin role
 */
export const requireAdmin = requireRole(['ADMIN', 'SUPER_ADMIN']);

/**
 * Middleware to require staff role or higher
 */
export const requireStaff = requireRole(['STAFF', 'ADMIN', 'SUPER_ADMIN']);

/**
 * Middleware to require super admin role
 */
export const requireSuperAdmin = requireRole(['SUPER_ADMIN']);

// ============================================
// EMAIL VERIFICATION MIDDLEWARE
// ============================================

/**
 * Middleware to check if email is verified
 */
export const requireEmailVerified = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
        error: 'NOT_AUTHENTICATED'
      });
      return;
    }

    // Get user's email verification status
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { emailVerified: true }
    });

    if (!user || !user.emailVerified) {
      res.status(403).json({
        success: false,
        message: 'Email verification required',
        error: 'EMAIL_NOT_VERIFIED'
      });
      return;
    }

    next();

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Verification check failed',
      error: 'VERIFICATION_ERROR'
    });
  }
};

// ============================================
// OPTIONAL AUTHENTICATION MIDDLEWARE
// ============================================

/**
 * Middleware to optionally authenticate user (doesn't fail if no token)
 */
export const optionalAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Extract token from Authorization header
    const token = extractTokenFromHeader(req.headers.authorization);
    
    if (!token) {
      // No token provided, continue without authentication
      next();
      return;
    }

    // Verify token
    const payload = verifyAccessToken(token);
    
    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
        accountLocked: true,
      }
    });

    if (user && user.isActive && !user.accountLocked) {
      // Add user info to request if valid
      req.user = {
        id: user.id,
        email: user.email,
        role: user.role,
      };
    }

    next();

  } catch (error) {
    // On error, continue without authentication
    next();
  }
};

// ============================================
// RATE LIMITING HELPER
// ============================================

/**
 * Middleware to check if user can perform action (for rate limiting)
 */
export const checkUserLimits = (action: string, limit: number = 100, windowMs: number = 60000) => {
  const attempts = new Map<string, { count: number; resetTime: number }>();

  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    const identifier = req.user?.id || req.ip || 'anonymous';
    const now = Date.now();
    const userAttempts = attempts.get(identifier);

    if (!userAttempts || now > userAttempts.resetTime) {
      // Reset or initialize attempts
      attempts.set(identifier, { count: 1, resetTime: now + windowMs });
      next();
      return;
    }

    if (userAttempts.count >= limit) {
      res.status(429).json({
        success: false,
        message: `Too many ${action} attempts. Please try again later.`,
        error: 'RATE_LIMIT_EXCEEDED',
        retryAfter: Math.ceil((userAttempts.resetTime - now) / 1000)
      });
      return;
    }

    // Increment attempts
    userAttempts.count++;
    next();
  };
};

// ============================================
// EXPORT ALIASES FOR COMPATIBILITY
// ============================================

// Export alias for backwards compatibility
export const authMiddleware = authenticateToken;
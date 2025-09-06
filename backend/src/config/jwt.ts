import jwt, { SignOptions } from 'jsonwebtoken';
import { User } from '@prisma/client';

// ============================================
// JWT CONFIGURATION & CONSTANTS
// ============================================

export const JWT_CONFIG = {
  // JWT Secrets
  ACCESS_TOKEN_SECRET: process.env.JWT_SECRET || 'coffee_tea_access_secret_2024',
  REFRESH_TOKEN_SECRET: process.env.JWT_REFRESH_SECRET || 'coffee_tea_refresh_secret_2024',
  
  // Token Expiration
  ACCESS_TOKEN_EXPIRES_IN: '15m', // 15 minutes
  REFRESH_TOKEN_EXPIRES_IN: '7d', // 7 days
  
  // Issuer and Audience
  ISSUER: 'coffee-tea-ecommerce',
  AUDIENCE: 'coffee-tea-users',
  
  // Algorithm
  ALGORITHM: 'HS256' as const,
} as const;

// ============================================
// JWT PAYLOAD INTERFACES
// ============================================

export interface JWTAccessPayload {
  sub: string; // User ID
  email: string;
  role: string;
  iat: number;
  exp: number;
  iss: string;
  aud: string;
}

export interface JWTRefreshPayload {
  sub: string; // User ID
  type: 'refresh';
  iat: number;
  exp: number;
  iss: string;
  aud: string;
}

// ============================================
// JWT TOKEN GENERATION
// ============================================

/**
 * Generate access token for authenticated user
 */
export function generateAccessToken(user: User): string {
  const payload: Omit<JWTAccessPayload, 'iat' | 'exp'> = {
    sub: user.id,
    email: user.email,
    role: user.role,
    iss: JWT_CONFIG.ISSUER,
    aud: JWT_CONFIG.AUDIENCE,
  };

  const options: SignOptions = {
    expiresIn: JWT_CONFIG.ACCESS_TOKEN_EXPIRES_IN,
    algorithm: JWT_CONFIG.ALGORITHM,
  };

  return jwt.sign(payload, JWT_CONFIG.ACCESS_TOKEN_SECRET, options);
}

/**
 * Generate refresh token for token renewal
 */
export function generateRefreshToken(userId: string): string {
  const payload: Omit<JWTRefreshPayload, 'iat' | 'exp'> = {
    sub: userId,
    type: 'refresh',
    iss: JWT_CONFIG.ISSUER,
    aud: JWT_CONFIG.AUDIENCE,
  };

  const options: SignOptions = {
    expiresIn: JWT_CONFIG.REFRESH_TOKEN_EXPIRES_IN,
    algorithm: JWT_CONFIG.ALGORITHM,
  };

  return jwt.sign(payload, JWT_CONFIG.REFRESH_TOKEN_SECRET, options);
}

/**
 * Generate both access and refresh tokens
 */
export function generateTokenPair(user: User): {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
} {
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user.id);
  
  // Calculate expiration time in seconds
  const expiresIn = jwt.decode(accessToken) as JWTAccessPayload;
  const expirationTime = expiresIn.exp - Math.floor(Date.now() / 1000);

  return {
    accessToken,
    refreshToken,
    expiresIn: expirationTime,
  };
}

// ============================================
// JWT TOKEN VERIFICATION
// ============================================

/**
 * Verify and decode access token
 */
export function verifyAccessToken(token: string): JWTAccessPayload {
  try {
    return jwt.verify(token, JWT_CONFIG.ACCESS_TOKEN_SECRET, {
      algorithms: [JWT_CONFIG.ALGORITHM],
      issuer: JWT_CONFIG.ISSUER,
      audience: JWT_CONFIG.AUDIENCE,
    }) as JWTAccessPayload;
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid access token');
    }
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Access token expired');
    }
    throw new Error('Token verification failed');
  }
}

/**
 * Verify and decode refresh token
 */
export function verifyRefreshToken(token: string): JWTRefreshPayload {
  try {
    return jwt.verify(token, JWT_CONFIG.REFRESH_TOKEN_SECRET, {
      algorithms: [JWT_CONFIG.ALGORITHM],
      issuer: JWT_CONFIG.ISSUER,
      audience: JWT_CONFIG.AUDIENCE,
    }) as JWTRefreshPayload;
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid refresh token');
    }
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Refresh token expired');
    }
    throw new Error('Refresh token verification failed');
  }
}

// ============================================
// JWT UTILITY FUNCTIONS
// ============================================

/**
 * Extract token from Authorization header
 */
export function extractTokenFromHeader(authHeader: string | undefined): string | null {
  if (!authHeader) {
    return null;
  }

  const [scheme, token] = authHeader.split(' ');
  
  if (scheme !== 'Bearer' || !token) {
    return null;
  }

  return token;
}

/**
 * Decode token without verification (for debugging)
 */
export function decodeToken(token: string): any {
  try {
    return jwt.decode(token);
  } catch (error) {
    return null;
  }
}

/**
 * Check if token is expired without verification
 */
export function isTokenExpired(token: string): boolean {
  try {
    const decoded = jwt.decode(token) as { exp: number };
    if (!decoded || !decoded.exp) {
      return true;
    }
    
    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp < currentTime;
  } catch (error) {
    return true;
  }
}
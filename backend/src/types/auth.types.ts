import { Request } from 'express';

// ============================================
// AUTHENTICATION TYPES & INTERFACES
// ============================================

// ============================================
// ERROR HANDLING
// ============================================

export class AuthError extends Error {
  public readonly code: string;
  
  constructor(message: string, code: string) {
    super(message);
    this.name = 'AuthError';
    this.code = code;
  }
}

// ============================================
// REQUEST/RESPONSE INTERFACES
// ============================================

export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  role?: 'CUSTOMER' | 'ADMIN' | 'STAFF' | 'SUPER_ADMIN';
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface AuthResult {
  success: boolean;
  message: string;
  data?: {
    user: {
      id: string;
      email: string;
      fullName: string;
      role: string;
      emailVerified: boolean;
      loyaltyPoints: number;
      loyaltyTier: string;
    };
    tokens: {
      accessToken: string;
      refreshToken: string;
      expiresIn: number;
    };
    emailVerificationToken?: string;
  };
}

// ============================================
// USER PROFILE TYPES
// ============================================

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  dateOfBirth?: Date;
  gender?: string;
  role: string;
  emailVerified: boolean;
  loyaltyPoints: number;
  loyaltyTier: string;
  preferences?: any;
  createdAt: Date;
  lastLoginAt?: Date;
}

// ============================================
// MIDDLEWARE TYPES
// ============================================

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role?: string;
  };
}

// ============================================
// SOCIAL AUTH TYPES
// ============================================

export interface SocialAuthProfile {
  provider: 'google' | 'facebook';
  providerId: string;
  email: string;
  fullName: string;
  avatar?: string;
}

export interface SocialAuthResult {
  success: boolean;
  isNewUser: boolean;
  user: UserProfile;
  tokens: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  };
}

// ============================================
// VALIDATION TYPES
// ============================================

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

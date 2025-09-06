import { PrismaClient, User } from '@prisma/client';
import { hashPassword, verifyPassword, validatePassword, generatePasswordResetToken, generateEmailVerificationToken, hashToken, verifyToken } from '../utils/password';
import { generateTokenPair, verifyRefreshToken } from '../config/jwt';
import { AuthError, AuthResult, LoginRequest, RegisterRequest, RefreshTokenRequest, ResetPasswordRequest, ChangePasswordRequest } from '../types/auth.types';

// ============================================
// PRISMA CLIENT INITIALIZATION
// ============================================

const prisma = new PrismaClient();

// ============================================
// AUTHENTICATION SERVICE CLASS
// ============================================

export class AuthService {
  
  // ============================================
  // USER REGISTRATION
  // ============================================

  /**
   * Register a new user account
   */
  async register(data: RegisterRequest): Promise<AuthResult> {
    try {
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: data.email.toLowerCase() }
      });

      if (existingUser) {
        throw new AuthError('User with this email already exists', 'EMAIL_EXISTS');
      }

      // Validate password strength
      const passwordValidation = validatePassword(data.password);
      if (!passwordValidation.isValid) {
        throw new AuthError(`Password validation failed: ${passwordValidation.errors.join(', ')}`, 'WEAK_PASSWORD');
      }

      // Hash password
      const passwordHash = await hashPassword(data.password);

      // Generate email verification token
      const emailVerification = generateEmailVerificationToken();

      // Create user
      const user = await prisma.user.create({
        data: {
          email: data.email.toLowerCase(),
          passwordHash,
          fullName: data.fullName,
          phone: data.phone || null,
          role: data.role || 'CUSTOMER',
          emailVerified: false,
          emailVerificationToken: emailVerification.hashedToken,
          emailVerificationExpires: emailVerification.expiresAt,
        }
      });

      // Generate tokens
      const tokens = generateTokenPair(user);

      return {
        success: true,
        message: 'User registered successfully. Please verify your email.',
        data: {
          user: {
            id: user.id,
            email: user.email,
            fullName: user.fullName,
            role: user.role,
            emailVerified: user.emailVerified,
            loyaltyPoints: user.loyaltyPoints,
            loyaltyTier: user.loyaltyTier,
          },
          tokens,
          emailVerificationToken: emailVerification.token, // Send this via email
        }
      };

    } catch (error) {
      if (error instanceof AuthError) {
        throw error;
      }
      throw new AuthError('Registration failed', 'REGISTRATION_ERROR');
    }
  }

  // ============================================
  // USER LOGIN
  // ============================================

  /**
   * Authenticate user login
   */
  async login(data: LoginRequest): Promise<AuthResult> {
    try {
      // Find user by email
      const user = await prisma.user.findUnique({
        where: { email: data.email.toLowerCase() }
      });

      if (!user || !user.passwordHash) {
        throw new AuthError('Invalid email or password', 'INVALID_CREDENTIALS');
      }

      // Verify password
      const isPasswordValid = await verifyPassword(data.password, user.passwordHash);
      if (!isPasswordValid) {
        throw new AuthError('Invalid email or password', 'INVALID_CREDENTIALS');
      }

      // Check if account is locked
      if (user.accountLocked && user.lockExpires && user.lockExpires > new Date()) {
        const lockTimeRemaining = Math.ceil((user.lockExpires.getTime() - Date.now()) / (1000 * 60));
        throw new AuthError(`Account is locked. Try again in ${lockTimeRemaining} minutes.`, 'ACCOUNT_LOCKED');
      }

      // Reset failed login attempts and unlock account if needed
      if (user.failedLoginAttempts > 0 || user.accountLocked) {
        await prisma.user.update({
          where: { id: user.id },
          data: {
            failedLoginAttempts: 0,
            accountLocked: false,
            lockExpires: null,
            lastLoginAt: new Date(),
          }
        });
      } else {
        // Update last login
        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() }
        });
      }

      // Generate tokens
      const tokens = generateTokenPair(user);

      return {
        success: true,
        message: 'Login successful',
        data: {
          user: {
            id: user.id,
            email: user.email,
            fullName: user.fullName,
            role: user.role,
            emailVerified: user.emailVerified,
            loyaltyPoints: user.loyaltyPoints,
            loyaltyTier: user.loyaltyTier,
          },
          tokens
        }
      };

    } catch (error) {
      if (error instanceof AuthError) {
        // Handle failed login attempts
        if (data.email) {
          await this.handleFailedLoginAttempt(data.email.toLowerCase());
        }
        throw error;
      }
      throw new AuthError('Login failed', 'LOGIN_ERROR');
    }
  }

  // ============================================
  // TOKEN REFRESH
  // ============================================

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(data: RefreshTokenRequest): Promise<AuthResult> {
    try {
      // Verify refresh token
      const payload = verifyRefreshToken(data.refreshToken);

      // Find user
      const user = await prisma.user.findUnique({
        where: { id: payload.sub }
      });

      if (!user) {
        throw new AuthError('User not found', 'USER_NOT_FOUND');
      }

      // Check if account is active
      if (user.accountLocked) {
        throw new AuthError('Account is locked', 'ACCOUNT_LOCKED');
      }

      // Generate new tokens
      const tokens = generateTokenPair(user);

      return {
        success: true,
        message: 'Token refreshed successfully',
        data: {
          user: {
            id: user.id,
            email: user.email,
            fullName: user.fullName,
            role: user.role,
            emailVerified: user.emailVerified,
            loyaltyPoints: user.loyaltyPoints,
            loyaltyTier: user.loyaltyTier,
          },
          tokens
        }
      };

    } catch (error) {
      if (error instanceof AuthError) {
        throw error;
      }
      throw new AuthError('Token refresh failed', 'TOKEN_REFRESH_ERROR');
    }
  }

  // ============================================
  // PASSWORD RESET
  // ============================================

  /**
   * Request password reset
   */
  async requestPasswordReset(email: string): Promise<{ success: boolean; message: string; resetToken?: string }> {
    try {
      const user = await prisma.user.findUnique({
        where: { email: email.toLowerCase() }
      });

      if (!user) {
        // Don't reveal if email exists
        return {
          success: true,
          message: 'If an account with this email exists, a password reset link has been sent.'
        };
      }

      // Generate reset token
      const resetToken = generatePasswordResetToken();

      // Update user with reset token
      await prisma.user.update({
        where: { id: user.id },
        data: {
          passwordResetToken: resetToken.hashedToken,
          passwordResetExpires: resetToken.expiresAt,
        }
      });

      return {
        success: true,
        message: 'Password reset instructions have been sent to your email.',
        resetToken: resetToken.token // Send this via email
      };

    } catch (error) {
      throw new AuthError('Password reset request failed', 'RESET_REQUEST_ERROR');
    }
  }

  /**
   * Reset password with token
   */
  async resetPassword(data: ResetPasswordRequest): Promise<{ success: boolean; message: string }> {
    try {
      // Validate new password
      const passwordValidation = validatePassword(data.newPassword);
      if (!passwordValidation.isValid) {
        throw new AuthError(`Password validation failed: ${passwordValidation.errors.join(', ')}`, 'WEAK_PASSWORD');
      }

      // Hash the token to find user
      const hashedToken = hashToken(data.token);

      // Find user with valid reset token
      const user = await prisma.user.findFirst({
        where: {
          passwordResetToken: hashedToken,
          passwordResetExpires: { gt: new Date() }
        }
      });

      if (!user) {
        throw new AuthError('Invalid or expired password reset token', 'INVALID_TOKEN');
      }

      // Hash new password
      const passwordHash = await hashPassword(data.newPassword);

      // Update user password and clear reset token
      await prisma.user.update({
        where: { id: user.id },
        data: {
          passwordHash,
          passwordResetToken: null,
          passwordResetExpires: null,
          failedLoginAttempts: 0,
          accountLocked: false,
          lockExpires: null,
        }
      });

      return {
        success: true,
        message: 'Password has been reset successfully.'
      };

    } catch (error) {
      if (error instanceof AuthError) {
        throw error;
      }
      throw new AuthError('Password reset failed', 'RESET_ERROR');
    }
  }

  // ============================================
  // PASSWORD CHANGE
  // ============================================

  /**
   * Change password for authenticated user
   */
  async changePassword(userId: string, data: ChangePasswordRequest): Promise<{ success: boolean; message: string }> {
    try {
      // Find user
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user || !user.passwordHash) {
        throw new AuthError('User not found', 'USER_NOT_FOUND');
      }

      // Verify current password
      const isCurrentPasswordValid = await verifyPassword(data.currentPassword, user.passwordHash);
      if (!isCurrentPasswordValid) {
        throw new AuthError('Current password is incorrect', 'INVALID_CURRENT_PASSWORD');
      }

      // Validate new password
      const passwordValidation = validatePassword(data.newPassword);
      if (!passwordValidation.isValid) {
        throw new AuthError(`Password validation failed: ${passwordValidation.errors.join(', ')}`, 'WEAK_PASSWORD');
      }

      // Check if new password is different from current
      const isSamePassword = await verifyPassword(data.newPassword, user.passwordHash);
      if (isSamePassword) {
        throw new AuthError('New password must be different from current password', 'SAME_PASSWORD');
      }

      // Hash new password
      const passwordHash = await hashPassword(data.newPassword);

      // Update password
      await prisma.user.update({
        where: { id: userId },
        data: { passwordHash }
      });

      return {
        success: true,
        message: 'Password changed successfully.'
      };

    } catch (error) {
      if (error instanceof AuthError) {
        throw error;
      }
      throw new AuthError('Password change failed', 'CHANGE_PASSWORD_ERROR');
    }
  }

  // ============================================
  // EMAIL VERIFICATION
  // ============================================

  /**
   * Verify email with token
   */
  async verifyEmail(token: string): Promise<{ success: boolean; message: string }> {
    try {
      // Hash the token to find user
      const hashedToken = hashToken(token);

      // Find user with valid verification token
      const user = await prisma.user.findFirst({
        where: {
          emailVerificationToken: hashedToken,
          emailVerificationExpires: { gt: new Date() }
        }
      });

      if (!user) {
        throw new AuthError('Invalid or expired email verification token', 'INVALID_TOKEN');
      }

      // Update user as verified
      await prisma.user.update({
        where: { id: user.id },
        data: {
          emailVerified: true,
          emailVerificationToken: null,
          emailVerificationExpires: null,
        }
      });

      return {
        success: true,
        message: 'Email verified successfully.'
      };

    } catch (error) {
      if (error instanceof AuthError) {
        throw error;
      }
      throw new AuthError('Email verification failed', 'VERIFICATION_ERROR');
    }
  }

  // ============================================
  // UTILITY METHODS
  // ============================================

  /**
   * Handle failed login attempts
   */
  private async handleFailedLoginAttempt(email: string): Promise<void> {
    try {
      const user = await prisma.user.findUnique({
        where: { email }
      });

      if (!user) return;

      const failedAttempts = (user.failedLoginAttempts || 0) + 1;
      const maxAttempts = 5;
      const lockDuration = 30; // minutes

      const updateData: any = {
        failedLoginAttempts: failedAttempts
      };

      // Lock account after max attempts
      if (failedAttempts >= maxAttempts) {
        updateData.accountLocked = true;
        updateData.lockExpires = new Date(Date.now() + lockDuration * 60 * 1000);
      }

      await prisma.user.update({
        where: { id: user.id },
        data: updateData
      });

    } catch (error) {
      // Log error but don't throw to avoid masking original auth error
      console.error('Failed to handle login attempt:', error);
    }
  }

  /**
   * Get user profile by ID
   */
  async getUserProfile(userId: string): Promise<any> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          fullName: true,
          phone: true,
          dateOfBirth: true,
          gender: true,
          role: true,
          emailVerified: true,
          loyaltyPoints: true,
          loyaltyTier: true,
          preferences: true,
          createdAt: true,
          lastLoginAt: true,
        }
      });

      if (!user) {
        throw new AuthError('User not found', 'USER_NOT_FOUND');
      }

      return user;

    } catch (error) {
      if (error instanceof AuthError) {
        throw error;
      }
      throw new AuthError('Failed to get user profile', 'PROFILE_ERROR');
    }
  }
}

// ============================================
// EXPORT SINGLETON INSTANCE
// ============================================

export const authService = new AuthService();
// Auth Routes - Coffee & Tea E-commerce
// RESTful API endpoints for authentication and user management

import { Router } from 'express';
import { AuthService } from '../services/auth.service';
import { authenticateToken } from '../middleware/auth.middleware';
import { 
  RegisterRequest,
  LoginRequest,
  RefreshTokenRequest,
  ResetPasswordRequest,
  ChangePasswordRequest
} from '../types/auth.types';

const router = Router();
const authService = new AuthService();

// ================================
// PUBLIC AUTHENTICATION ENDPOINTS
// ================================

/**
 * @route   POST /api/auth/register
 * @desc    Register new user
 * @access  Public
 */
router.post('/register', async (req, res) => {
  try {
    const registerData: RegisterRequest = req.body;
    
    // Validate required fields
    if (!registerData.email || !registerData.password || !registerData.fullName) {
      return res.status(400).json({
        success: false,
        message: 'Email, password, and full name are required',
        error: 'MISSING_REQUIRED_FIELDS'
      });
    }

    const result = await authService.register(registerData);
    
    return res.status(201).json(result);

  } catch (error: any) {
<<<<<<< HEAD
    console.error('Registration error:', error);
=======
    // Only log errors in non-test environments
    if (process.env.NODE_ENV !== 'test') {
      console.error('Registration error:', error);
    }
>>>>>>> e0366de708e308e3f8f2d024af0ae5c307cac571
    
    if (error.code === 'EMAIL_EXISTS') {
      return res.status(409).json({
        success: false,
        message: 'Email already registered',
        error: 'EMAIL_EXISTS'
      });
    }

    if (error.code === 'WEAK_PASSWORD') {
      return res.status(400).json({
        success: false,
        message: error.message,
        error: 'INVALID_PASSWORD'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: 'REGISTRATION_ERROR'
    });
  }
});

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login', async (req, res) => {
  try {
    const loginData: LoginRequest = req.body;
    
    // Validate required fields
    if (!loginData.email || !loginData.password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
        error: 'MISSING_CREDENTIALS'
      });
    }

    const result = await authService.login(loginData);
    
    return res.json(result);

  } catch (error: any) {
<<<<<<< HEAD
    console.error('Login error:', error);
=======
    // Only log errors in non-test environments
    if (process.env.NODE_ENV !== 'test') {
      console.error('Login error:', error);
    }
>>>>>>> e0366de708e308e3f8f2d024af0ae5c307cac571
    
    if (error.code === 'INVALID_CREDENTIALS') {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
        error: 'INVALID_CREDENTIALS'
      });
    }

    if (error.code === 'ACCOUNT_LOCKED') {
      return res.status(423).json({
        success: false,
        message: 'Account is locked due to too many failed attempts',
        error: 'ACCOUNT_LOCKED'
      });
    }

    if (error.code === 'ACCOUNT_INACTIVE') {
      return res.status(403).json({
        success: false,
        message: 'Account is inactive',
        error: 'ACCOUNT_INACTIVE'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Login failed',
      error: 'LOGIN_ERROR'
    });
  }
});

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh access token
 * @access  Public
 */
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken }: RefreshTokenRequest = req.body;
    
    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token is required',
        error: 'MISSING_REFRESH_TOKEN'
      });
    }

    const result = await authService.refreshToken({ refreshToken });
    
    return res.json(result);

  } catch (error: any) {
    console.error('Token refresh error:', error);
    
    if (error.code === 'INVALID_TOKEN') {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token',
        error: 'INVALID_REFRESH_TOKEN'
      });
    }

    if (error.code === 'TOKEN_EXPIRED') {
      return res.status(401).json({
        success: false,
        message: 'Refresh token expired',
        error: 'REFRESH_TOKEN_EXPIRED'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Token refresh failed',
      error: 'REFRESH_ERROR'
    });
  }
});

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Request password reset
 * @access  Public
 */
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required',
        error: 'MISSING_EMAIL'
      });
    }

    const result = await authService.requestPasswordReset(email);
    
    return res.json(result);

  } catch (error: any) {
    console.error('Password reset request error:', error);
    
    // Don't reveal if email exists or not
    return res.json({
      success: true,
      message: 'If the email exists, a password reset link has been sent'
    });
  }
});

/**
 * @route   POST /api/auth/reset-password
 * @desc    Reset password with token
 * @access  Public
 */
router.post('/reset-password', async (req, res) => {
  try {
    const resetData: ResetPasswordRequest = req.body;
    
    if (!resetData.token || !resetData.newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Reset token and new password are required',
        error: 'MISSING_REQUIRED_FIELDS'
      });
    }

    const result = await authService.resetPassword(resetData);
    
    return res.json(result);

  } catch (error: any) {
    console.error('Password reset error:', error);
    
    if (error.code === 'INVALID_TOKEN') {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token',
        error: 'INVALID_RESET_TOKEN'
      });
    }

    if (error.code === 'WEAK_PASSWORD') {
      return res.status(400).json({
        success: false,
        message: error.message,
        error: 'INVALID_PASSWORD'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Password reset failed',
      error: 'RESET_ERROR'
    });
  }
});

/**
 * @route   POST /api/auth/verify-email
 * @desc    Verify email address
 * @access  Public
 */
router.post('/verify-email', async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Verification token is required',
        error: 'MISSING_TOKEN'
      });
    }

    const result = await authService.verifyEmail(token);
    
    return res.json(result);

  } catch (error: any) {
    console.error('Email verification error:', error);
    
    if (error.code === 'INVALID_TOKEN') {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification token',
        error: 'INVALID_VERIFICATION_TOKEN'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Email verification failed',
      error: 'VERIFICATION_ERROR'
    });
  }
});

// ================================
// PROTECTED AUTHENTICATION ENDPOINTS
// ================================

/**
 * @route   GET /api/auth/profile
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const userId = req.user!.id;
    const userProfile = await authService.getUserProfile(userId);
    
    return res.json({
      success: true,
      data: userProfile
    });

  } catch (error: any) {
    console.error('Get profile error:', error);
    
    return res.status(500).json({
      success: false,
      message: 'Failed to get user profile',
      error: 'PROFILE_ERROR'
    });
  }
});

/**
 * @route   POST /api/auth/change-password
 * @desc    Change user password
 * @access  Private
 */
router.post('/change-password', authenticateToken, async (req, res) => {
  try {
    const userId = req.user!.id;
    const changePasswordData: ChangePasswordRequest = req.body;
    
    if (!changePasswordData.currentPassword || !changePasswordData.newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required',
        error: 'MISSING_REQUIRED_FIELDS'
      });
    }

    const result = await authService.changePassword(userId, changePasswordData);
    
    return res.json(result);

  } catch (error: any) {
    console.error('Change password error:', error);
    
    if (error.code === 'INVALID_PASSWORD') {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect',
        error: 'INVALID_CURRENT_PASSWORD'
      });
    }

    if (error.code === 'WEAK_PASSWORD') {
      return res.status(400).json({
        success: false,
        message: error.message,
        error: 'INVALID_NEW_PASSWORD'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Password change failed',
      error: 'CHANGE_PASSWORD_ERROR'
    });
  }
});

export default router;

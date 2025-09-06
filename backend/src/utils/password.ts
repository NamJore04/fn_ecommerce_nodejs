import bcrypt from 'bcryptjs';
import crypto from 'crypto';

// ============================================
// PASSWORD CONFIGURATION
// ============================================

const PASSWORD_CONFIG = {
  // Bcrypt configuration
  SALT_ROUNDS: parseInt(process.env.BCRYPT_SALT_ROUNDS || '12'),
  
  // Password requirements
  MIN_LENGTH: 8,
  MAX_LENGTH: 128,
  
  // Password reset token expiration (1 hour)
  RESET_TOKEN_EXPIRES_IN: 60 * 60 * 1000, // 1 hour in milliseconds
  
  // Email verification token expiration (24 hours)
  VERIFICATION_TOKEN_EXPIRES_IN: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
} as const;

// ============================================
// PASSWORD VALIDATION
// ============================================

export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
  strength: 'weak' | 'medium' | 'strong' | 'very_strong';
  score: number; // 0-100
}

/**
 * Validate password strength and requirements
 */
export function validatePassword(password: string): PasswordValidationResult {
  const errors: string[] = [];
  let score = 0;

  // Length check
  if (password.length < PASSWORD_CONFIG.MIN_LENGTH) {
    errors.push(`Password must be at least ${PASSWORD_CONFIG.MIN_LENGTH} characters long`);
  } else if (password.length >= PASSWORD_CONFIG.MIN_LENGTH) {
    score += 25; // Base score for minimum length
  }

  if (password.length > PASSWORD_CONFIG.MAX_LENGTH) {
    errors.push(`Password must not exceed ${PASSWORD_CONFIG.MAX_LENGTH} characters`);
  }

  // Character variety checks
  const hasLowercase = /[a-z]/.test(password);
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChars = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

  if (!hasLowercase) {
    errors.push('Password must contain at least one lowercase letter');
  } else {
    score += 15;
  }

  if (!hasUppercase) {
    errors.push('Password must contain at least one uppercase letter');
  } else {
    score += 15;
  }

  if (!hasNumbers) {
    errors.push('Password must contain at least one number');
  } else {
    score += 15;
  }

  if (!hasSpecialChars) {
    errors.push('Password must contain at least one special character');
  } else {
    score += 20;
  }

  // Additional strength bonuses
  if (password.length >= 12) score += 5; // Bonus for longer passwords
  if (password.length >= 16) score += 5; // Extra bonus for very long passwords

  // Common password checks (simplified)
  const commonPasswords = ['password', '123456', 'qwerty', 'admin', 'letmein'];
  if (commonPasswords.some(common => password.toLowerCase().includes(common))) {
    errors.push('Password contains common words that are easily guessed');
    score = Math.max(0, score - 30);
  }

  // Determine strength
  let strength: PasswordValidationResult['strength'];
  if (score < 30) strength = 'weak';
  else if (score < 60) strength = 'medium';
  else if (score < 80) strength = 'strong';
  else strength = 'very_strong';

  return {
    isValid: errors.length === 0,
    errors,
    strength,
    score: Math.min(100, score)
  };
}

// ============================================
// PASSWORD HASHING & VERIFICATION
// ============================================

/**
 * Hash password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  try {
    const salt = await bcrypt.genSalt(PASSWORD_CONFIG.SALT_ROUNDS);
    return await bcrypt.hash(password, salt);
  } catch (error) {
    throw new Error('Failed to hash password');
  }
}

/**
 * Verify password against hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  try {
    return await bcrypt.compare(password, hash);
  } catch (error) {
    return false;
  }
}

/**
 * Check if password hash needs rehashing (for security updates)
 */
export function needsRehashing(hash: string): boolean {
  try {
    const rounds = bcrypt.getRounds(hash);
    return rounds < PASSWORD_CONFIG.SALT_ROUNDS;
  } catch (error) {
    return true; // If we can't determine rounds, assume it needs rehashing
  }
}

// ============================================
// TOKEN GENERATION FOR RESET & VERIFICATION
// ============================================

/**
 * Generate secure random token for password reset
 */
export function generatePasswordResetToken(): {
  token: string;
  hashedToken: string;
  expiresAt: Date;
} {
  const token = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  const expiresAt = new Date(Date.now() + PASSWORD_CONFIG.RESET_TOKEN_EXPIRES_IN);

  return {
    token,
    hashedToken,
    expiresAt
  };
}

/**
 * Generate secure random token for email verification
 */
export function generateEmailVerificationToken(): {
  token: string;
  hashedToken: string;
  expiresAt: Date;
} {
  const token = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  const expiresAt = new Date(Date.now() + PASSWORD_CONFIG.VERIFICATION_TOKEN_EXPIRES_IN);

  return {
    token,
    hashedToken,
    expiresAt
  };
}

/**
 * Hash token for secure storage
 */
export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * Verify token against hashed version
 */
export function verifyToken(token: string, hashedToken: string): boolean {
  const hash = crypto.createHash('sha256').update(token).digest('hex');
  return hash === hashedToken;
}

// ============================================
// PASSWORD GENERATOR (for temporary passwords)
// ============================================

/**
 * Generate secure temporary password
 */
export function generateTemporaryPassword(length: number = 12): string {
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*';
  
  const allChars = lowercase + uppercase + numbers + symbols;
  
  let password = '';
  
  // Ensure at least one character from each category
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += symbols[Math.floor(Math.random() * symbols.length)];
  
  // Fill the rest randomly
  for (let i = 4; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }
  
  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('');
}

// ============================================
// EXPORTS
// ============================================

export {
  PASSWORD_CONFIG
};
import { describe, beforeAll, afterAll, beforeEach, it, expect } from '@jest/globals';
import { Express } from 'express';
import { User, UserRole } from '@prisma/client';
import { createTestApp, setupTestDatabase, cleanupTestDatabase } from '../helpers/testApp';
import { createTestHelpers } from '../helpers/testHelpers';
import { cleanTestData, createTestUsers, TEST_PASSWORD } from '../fixtures/testData';

/**
 * Authentication Integration Tests
 * Tests all authentication endpoints and authorization flows
 */
describe('Authentication Integration Tests', () => {
  let app: Express;
  let helpers: ReturnType<typeof createTestHelpers>;
  let testUsers: { customer: User; admin: User; staff: User };

  beforeAll(async () => {
    // Setup test environment
    app = createTestApp();
    helpers = createTestHelpers(app);
    await setupTestDatabase();
  });

  afterAll(async () => {
    await cleanupTestDatabase();
  });

  beforeEach(async () => {
    // Clean and setup test data before each test
    await cleanTestData();
    testUsers = await createTestUsers();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new customer successfully', async () => {
      const newUser = {
        email: helpers.db.generateTestEmail('newcustomer'),
        password: TEST_PASSWORD,
        fullName: 'New Customer',
        phone: '0123456789'
      };

      const response = await helpers.api.post('/api/auth/register', newUser);
      const body = helpers.api.expectSuccess(response, 201);

      expect(body.data).toHaveProperty('user');
      expect(body.data).toHaveProperty('tokens');
      expect(body.data.user.email).toBe(newUser.email);
      expect(body.data.user.role).toBe(UserRole.CUSTOMER);
      expect(body.data.user).not.toHaveProperty('passwordHash');
    });

    it('should validate required fields', async () => {
      const invalidUser = {
        email: 'invalid-email',
        password: '123' // Too short
      };

      const response = await helpers.api.post('/api/auth/register', invalidUser);
      helpers.api.expectValidationError(response);
    });

    it('should prevent duplicate email registration', async () => {
      const duplicateUser = {
        email: testUsers.customer.email,
        password: TEST_PASSWORD,
        fullName: 'Duplicate User'
      };

      const response = await helpers.api.post('/api/auth/register', duplicateUser);
      helpers.api.expectError(response, 409, 'Email already registered'); // API returns 409 for conflict
    });

    it('should enforce password strength requirements', async () => {
      const weakPasswordUser = {
        email: helpers.db.generateTestEmail('weak'),
        password: 'weak',
        fullName: 'Weak Password User'
      };

      const response = await helpers.api.post('/api/auth/register', weakPasswordUser);
      helpers.api.expectValidationError(response);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login customer with valid credentials', async () => {
      const loginData = {
        email: testUsers.customer.email,
        password: TEST_PASSWORD
      };

      const response = await helpers.api.post('/api/auth/login', loginData);
      const body = helpers.api.expectSuccess(response);

      expect(body.data).toHaveProperty('user');
      expect(body.data).toHaveProperty('tokens');
      expect(body.data.user.id).toBe(testUsers.customer.id);
      expect(body.data.tokens).toHaveProperty('accessToken');
      expect(body.data.tokens).toHaveProperty('refreshToken');
    });

    it('should login admin with valid credentials', async () => {
      const loginData = {
        email: testUsers.admin.email,
        password: TEST_PASSWORD
      };

      const response = await helpers.api.post('/api/auth/login', loginData);
      const body = helpers.api.expectSuccess(response);

      expect(body.data.user.role).toBe(UserRole.ADMIN);
    });

    it('should reject invalid email', async () => {
      const loginData = {
        email: 'nonexistent@test.com',
        password: TEST_PASSWORD
      };

      const response = await helpers.api.post('/api/auth/login', loginData);
      helpers.api.expectError(response, 401, 'Invalid email or password'); // Match actual API message
    });

    it('should reject invalid password', async () => {
      const loginData = {
        email: testUsers.customer.email,
        password: 'wrongpassword'
      };

      const response = await helpers.api.post('/api/auth/login', loginData);
      helpers.api.expectError(response, 401, 'Invalid email or password'); // Match actual API message
    });

    it('should validate required fields', async () => {
      const response = await helpers.api.post('/api/auth/login', {});
      helpers.api.expectValidationError(response);
    });
  });

  describe('GET /api/auth/profile', () => {
    it('should return customer profile when authenticated', async () => {
      // First login to get fresh token and ensure user exists
      const loginResponse = await helpers.api.post('/api/auth/login', {
        email: testUsers.customer.email,
        password: TEST_PASSWORD
      });
      const loginBody = helpers.api.expectSuccess(loginResponse);
      
      const response = await helpers.api.request()
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${loginBody.data.tokens.accessToken}`)
        .expect('Content-Type', /json/);
      
      const body = helpers.api.expectSuccess(response);

      expect(body.data.id).toBe(testUsers.customer.id);
      expect(body.data.email).toBe(testUsers.customer.email);
      expect(body.data.role).toBe(UserRole.CUSTOMER);
      expect(body.data).not.toHaveProperty('passwordHash');
    });

    it('should return admin profile when authenticated', async () => {
      // First login to get fresh token
      const loginResponse = await helpers.api.post('/api/auth/login', {
        email: testUsers.admin.email,
        password: TEST_PASSWORD
      });
      const loginBody = helpers.api.expectSuccess(loginResponse);
      
      const response = await helpers.api.request()
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${loginBody.data.tokens.accessToken}`)
        .expect('Content-Type', /json/);
      
      const body = helpers.api.expectSuccess(response);

      expect(body.data.role).toBe(UserRole.ADMIN);
    });

    it('should reject unauthenticated request', async () => {
      const response = await helpers.api.get('/api/auth/profile');
      helpers.api.expectUnauthorized(response);
    });
  });

  describe('Authorization & Role-Based Access', () => {
    it('should allow customer to access customer endpoints', async () => {
      // First login to get valid token
      const loginResponse = await helpers.api.post('/api/auth/login', {
        email: testUsers.customer.email,
        password: TEST_PASSWORD
      });
      const loginBody = helpers.api.expectSuccess(loginResponse);
      
      // Test customer accessing their cart
      const response = await helpers.api.request()
        .get('/api/cart')
        .set('Authorization', `Bearer ${loginBody.data.tokens.accessToken}`)
        .expect('Content-Type', /json/);
      
      // Should not throw unauthorized error
      expect(response.status).not.toBe(401);
      expect(response.status).not.toBe(403);
    });

    it('should allow admin to access admin endpoints', async () => {
      // Test admin accessing categories management (POST requires admin)
      const newCategory = {
        name: 'Test Admin Category',
        slug: helpers.db.generateTestSlug('admin-cat'),
        description: 'Category created by admin'
      };

      const response = await helpers.api.authenticatedPost('/api/categories', testUsers.admin, newCategory);
      // Should not throw forbidden error
      expect(response.status).not.toBe(403);
    });

    it('should prevent customer from accessing admin endpoints', async () => {
      // First login to get valid token  
      const loginResponse = await helpers.api.post('/api/auth/login', {
        email: testUsers.customer.email,
        password: TEST_PASSWORD
      });
      const loginBody = helpers.api.expectSuccess(loginResponse);
      
      const newCategory = {
        name: 'Test Unauthorized Category',
        slug: helpers.db.generateTestSlug('unauth-cat'),
        description: 'Category creation should fail'
      };

      const response = await helpers.api.request()
        .post('/api/categories')
        .set('Authorization', `Bearer ${loginBody.data.tokens.accessToken}`)
        .send(newCategory)
        .expect('Content-Type', /json/);
        
      helpers.api.expectForbidden(response);
    });

    it('should allow staff to access staff-level endpoints', async () => {
      // Test staff accessing orders (staff can view orders)
      const response = await helpers.api.authenticatedGet('/api/orders', testUsers.staff);
      // Should not throw forbidden error for staff
      expect(response.status).not.toBe(403);
    });
  });

  describe('JWT Token Security', () => {
    it('should reject expired tokens', async () => {
      // Note: This would require mocking JWT expiration or using short-lived tokens
      // For now, we test with invalid token format
      const response = await helpers.api.request()
        .get('/api/auth/profile')
        .set('Authorization', 'Bearer invalid-token')
        .expect('Content-Type', /json/);

      helpers.api.expectUnauthorized(response);
    });

    it('should reject malformed tokens', async () => {
      const response = await helpers.api.request()
        .get('/api/auth/profile')
        .set('Authorization', 'Bearer malformed.token.here')
        .expect('Content-Type', /json/);

      helpers.api.expectUnauthorized(response);
    });

    it('should reject missing authorization header', async () => {
      const response = await helpers.api.get('/api/auth/profile');
      helpers.api.expectUnauthorized(response);
    });

    it('should reject empty authorization header', async () => {
      const response = await helpers.api.request()
        .get('/api/auth/profile')
        .set('Authorization', '')
        .expect('Content-Type', /json/);

      helpers.api.expectUnauthorized(response);
    });

    it('should reject wrong authorization scheme', async () => {
      const response = await helpers.api.request()
        .get('/api/auth/profile')
        .set('Authorization', 'Basic sometoken')
        .expect('Content-Type', /json/);

      helpers.api.expectUnauthorized(response);
    });
  });

  describe('Security Measures', () => {
    it('should not expose sensitive information in error messages', async () => {
      const response = await helpers.api.post('/api/auth/login', {
        email: testUsers.customer.email,
        password: 'wrongpassword'
      });

      const body = helpers.api.expectError(response, 401);
      // Should not indicate specifically whether email exists or password is wrong
      // "Invalid email or password" is acceptable as it doesn't reveal specifics
      expect(body.message).not.toContain('user not found');
      expect(body.message).not.toContain('password is incorrect');
      expect(body.message).not.toContain('email does not exist');
    });

    it('should sanitize user data in responses', async () => {
      const response = await helpers.api.post('/api/auth/login', {
        email: testUsers.customer.email,
        password: TEST_PASSWORD
      });

      const body = helpers.api.expectSuccess(response);
      expect(body.data.user).not.toHaveProperty('passwordHash');
      expect(body.data.user).not.toHaveProperty('emailVerificationToken');
      expect(body.data.user).not.toHaveProperty('passwordResetToken');
    });

    it('should handle SQL injection attempts safely', async () => {
      const maliciousLogin = {
        email: "admin@test.com'; DROP TABLE users; --",
        password: TEST_PASSWORD
      };

      const response = await helpers.api.post('/api/auth/login', maliciousLogin);
      // Should handle gracefully without exposing database errors
      expect(response.status).toBe(401);
    });
  });

  describe('Performance Tests', () => {
    it('should login within acceptable time', async () => {
      const loginData = {
        email: testUsers.customer.email,
        password: TEST_PASSWORD
      };

      await helpers.perf.measureAsync(async () => {
        const response = await helpers.api.post('/api/auth/login', loginData);
        helpers.api.expectSuccess(response);
      }, 2000); // Should complete within 2 seconds
    });

    it('should get profile within acceptable time', async () => {
      await helpers.perf.measureAsync(async () => {
        // First login to get valid token
        const loginResponse = await helpers.api.post('/api/auth/login', {
          email: testUsers.customer.email,
          password: TEST_PASSWORD
        });
        const loginBody = helpers.api.expectSuccess(loginResponse);
        
        const response = await helpers.api.request()
          .get('/api/auth/profile')
          .set('Authorization', `Bearer ${loginBody.data.tokens.accessToken}`)
          .expect('Content-Type', /json/);
          
        helpers.api.expectSuccess(response);
      }, 1000); // Should complete within 1 second
    });
  });
});

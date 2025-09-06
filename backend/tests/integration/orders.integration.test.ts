import { describe, beforeAll, afterAll, beforeEach, it, expect } from '@jest/globals';
import { Express } from 'express';
import { User, Order, PrismaClient } from '@prisma/client';
import request from 'supertest';
import { createTestApp, setupTestDatabase, cleanupTestDatabase } from '../helpers/testApp';
import { createTestHelpers } from '../helpers/testHelpers';
import { 
  cleanTestData, 
  createTestUsers, 
  createTestProductsAndCategories,
  createTestOrder,
  testProducts,
  TEST_PASSWORD
} from '../fixtures/testData';

const prisma = new PrismaClient();

/**
 * Order Management Integration Tests
 * Tests order creation, tracking, status updates, and authorization
 */
describe('Order Management Integration Tests', () => {
  let app: Express;
  let helpers: ReturnType<typeof createTestHelpers>;
  let testUsers: { customer: User; admin: User; staff: User };
  let testOrder: Order;

  beforeAll(async () => {
    app = createTestApp();
    helpers = createTestHelpers(app);
    await setupTestDatabase();
  });

  afterAll(async () => {
    await cleanupTestDatabase();
  });

  beforeEach(async () => {
    await cleanTestData();
    testUsers = await createTestUsers();
    await createTestProductsAndCategories();
    testOrder = await createTestOrder(testUsers.customer.id, testProducts[0]!.id);
  });

  describe('POST /api/orders', () => {
    it('should create new order for authenticated customer', async () => {
      // Login as customer
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUsers.customer.email,
          password: TEST_PASSWORD
        });
      const loginBody = helpers.api.expectSuccess(loginResponse);
      const token = loginBody.data.tokens.accessToken;

      // First, add items to cart
      const cartItemData = {
        productId: testProducts[1]!.id, // Use different product to avoid conflicts
        quantity: 2
      };

      const cartResponse = await request(app)
        .post('/api/cart/add')
        .set('Authorization', `Bearer ${token}`)
        .send(cartItemData);
      
      console.log('Cart add response:', cartResponse.status, cartResponse.body);
      
      // Check cart status
      const cartCheck = await request(app)
        .get('/api/cart')
        .set('Authorization', `Bearer ${token}`);
      
      console.log('Cart check:', cartCheck.status, cartCheck.body);

      // Then create order from cart
      const orderData = {
        shippingAddress: {
          fullName: 'Test Customer',
          phone: '0123456789',
          address: '123 Test Street',
          city: 'Test City',
          state: 'Test State',
          postalCode: '12345',
          country: 'Vietnam'
        },
        paymentMethod: 'CASH_ON_DELIVERY',
        customerNotes: 'Please deliver in the morning'
      };

      const response = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${token}`)
        .send(orderData);
      
      if (response.status !== 201) {
        console.log('Order creation failed:', response.status, response.body);
      }
      
      const body = helpers.api.expectSuccess(response, 201);

      expect(body.data).toHaveProperty('id');
      expect(body.data).toHaveProperty('orderNumber');
      expect(body.data.userId).toBe(testUsers.customer.id);
      expect(body.data.status).toBe('PENDING');
      expect(body.data.paymentStatus).toBe('PENDING');
      expect(body.data.items).toHaveLength(1);
      expect(body.data.items[0].quantity).toBe(2);
    });

    it('should calculate order totals correctly', async () => {
      // Login as customer using proven pattern
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUsers.customer.email,
          password: TEST_PASSWORD
        });
      const loginBody = helpers.api.expectSuccess(loginResponse);
      const token = loginBody.data.tokens.accessToken;

      // Clear cart first to avoid conflicts
      await request(app)
        .delete('/api/cart/clear')
        .set('Authorization', `Bearer ${token}`);

      // Add multiple items to cart
      await request(app)
        .post('/api/cart/add')
        .set('Authorization', `Bearer ${token}`)
        .send({
          productId: testProducts[0]!.id,
          quantity: 2
        });

      await request(app)
        .post('/api/cart/add')
        .set('Authorization', `Bearer ${token}`)
        .send({
          productId: testProducts[1]!.id,
          quantity: 1
        });

      // Create order from cart
      const orderData = {
        shippingAddress: {
          fullName: 'Test Customer',
          phone: '0123456789',
          address: '123 Test Street',
          city: 'Test City',
          state: 'Test State',
          postalCode: '12345',
          country: 'Vietnam'
        },
        paymentMethod: 'CASH_ON_DELIVERY'
      };

      const response = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${token}`)
        .send(orderData);
      const body = helpers.api.expectSuccess(response, 201);

      const expectedSubtotal = (19.99 * 2) + (12.99 * 1);
      expect(parseFloat(body.data.subtotal)).toBe(expectedSubtotal);
      expect(parseFloat(body.data.totalAmount)).toBeGreaterThan(expectedSubtotal); // Includes tax/shipping
    });

    it('should reject unauthenticated order creation', async () => {
      const orderData = {
        items: [{ productId: testProducts[0]!.id, quantity: 1, unitPrice: 19.99 }],
        shippingAddress: {},
        paymentMethod: 'CASH_ON_DELIVERY'
      };

      const response = await helpers.api.post('/api/orders', orderData);
      helpers.api.expectUnauthorized(response);
    });

    it('should validate required fields', async () => {
      const invalidOrderData = {
        items: [], // Empty items array
        shippingAddress: {
          fullName: '', // Missing required field
        }
      };

      // Login as customer using proven pattern
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUsers.customer.email,
          password: TEST_PASSWORD
        });
      const loginBody = helpers.api.expectSuccess(loginResponse);

      const response = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${loginBody.data.tokens.accessToken}`)
        .send(invalidOrderData);
      helpers.api.expectValidationError(response);
    });

    it('should validate product availability', async () => {
      // Login as customer using proven pattern
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUsers.customer.email,
          password: TEST_PASSWORD
        });
      const loginBody = helpers.api.expectSuccess(loginResponse);
      const token = loginBody.data.tokens.accessToken;

      // Add items with excessive quantity to cart
      const cartResponse = await request(app)
        .post('/api/cart/add')
        .set('Authorization', `Bearer ${token}`)
        .send({
          productId: testProducts[0]!.id,
          quantity: 15 // Exceeds maxQuantityPerItem (10)
        });

      // Should get quantity limit error from cart service
      if (cartResponse.status === 400) {
        // Quantity limit exceeded by cart service
        expect(cartResponse.body.message).toContain('Maximum quantity');
        return;
      }

      // If cart allowed it, try to create order
      const orderData = {
        shippingAddress: {
          fullName: 'Test Customer',
          phone: '0123456789',
          address: '123 Test Street',
          city: 'Test City',
          state: 'Test State',
          postalCode: '12345',
          country: 'Vietnam'
        },
        paymentMethod: 'CASH_ON_DELIVERY'
      };

      const response = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${token}`)
        .send(orderData);
      helpers.api.expectError(response, 400);
    });
  });

  describe('GET /api/orders', () => {
    it('should return customer orders for authenticated customer', async () => {
      // Login as customer using proven pattern
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUsers.customer.email,
          password: TEST_PASSWORD
        });
      const loginBody = helpers.api.expectSuccess(loginResponse);

      const response = await request(app)
        .get('/api/orders')
        .set('Authorization', `Bearer ${loginBody.data.tokens.accessToken}`);
      const body = helpers.api.expectSuccess(response);

      expect(Array.isArray(body.data)).toBe(true);
      expect(body.data.length).toBeGreaterThan(0);

      // Verify all orders belong to the customer
      body.data.forEach((order: any) => {
        expect(order.userId).toBe(testUsers.customer.id);
      });
    });

    it('should allow admin to view all orders', async () => {
      // Login as admin using proven pattern
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUsers.admin.email,
          password: TEST_PASSWORD
        });
      const loginBody = helpers.api.expectSuccess(loginResponse);

      const response = await request(app)
        .get('/api/orders')
        .set('Authorization', `Bearer ${loginBody.data.tokens.accessToken}`);
      const body = helpers.api.expectSuccess(response);

      expect(Array.isArray(body.data)).toBe(true);
    });

    it('should allow staff to view all orders', async () => {
      // Login as staff using proven pattern
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUsers.staff.email,
          password: TEST_PASSWORD
        });
      const loginBody = helpers.api.expectSuccess(loginResponse);

      const response = await request(app)
        .get('/api/orders')
        .set('Authorization', `Bearer ${loginBody.data.tokens.accessToken}`);
      const body = helpers.api.expectSuccess(response);

      expect(Array.isArray(body.data)).toBe(true);
    });

    it('should support order status filtering', async () => {
      // Login as customer using proven pattern
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUsers.customer.email,
          password: TEST_PASSWORD
        });
      const loginBody = helpers.api.expectSuccess(loginResponse);

      const response = await request(app)
        .get('/api/orders?status=PENDING')
        .set('Authorization', `Bearer ${loginBody.data.tokens.accessToken}`);
      const body = helpers.api.expectSuccess(response);

      body.data.forEach((order: any) => {
        expect(order.status).toBe('PENDING');
      });
    });

    it('should support pagination', async () => {
      // Login as customer using proven pattern
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUsers.customer.email,
          password: TEST_PASSWORD
        });
      const loginBody = helpers.api.expectSuccess(loginResponse);

      const response = await request(app)
        .get('/api/orders?page=1&limit=1')
        .set('Authorization', `Bearer ${loginBody.data.tokens.accessToken}`);
      const body = helpers.api.expectSuccess(response);

      expect(Array.isArray(body.data)).toBe(true);
    });

    it('should reject unauthenticated access', async () => {
      const response = await helpers.api.get('/api/orders');
      helpers.api.expectUnauthorized(response);
    });
  });

  describe('GET /api/orders/:id', () => {
    it('should return order details for order owner', async () => {
      // Login as customer using proven pattern
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUsers.customer.email,
          password: TEST_PASSWORD
        });
      const loginBody = helpers.api.expectSuccess(loginResponse);

      const response = await request(app)
        .get(`/api/orders/${testOrder.id}`)
        .set('Authorization', `Bearer ${loginBody.data.tokens.accessToken}`);
      const body = helpers.api.expectSuccess(response);

      expect(body.data.id).toBe(testOrder.id);
      expect(body.data.orderNumber).toBe(testOrder.orderNumber);
      expect(body.data.userId).toBe(testUsers.customer.id);
      expect(body.data).toHaveProperty('items');
      expect(body.data).toHaveProperty('shippingAddress');
    });

    it('should allow admin to view any order', async () => {
      // Login as admin using proven pattern
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUsers.admin.email,
          password: TEST_PASSWORD
        });
      const loginBody = helpers.api.expectSuccess(loginResponse);

      const response = await request(app)
        .get(`/api/orders/${testOrder.id}`)
        .set('Authorization', `Bearer ${loginBody.data.tokens.accessToken}`);
      const body = helpers.api.expectSuccess(response);

      expect(body.data.id).toBe(testOrder.id);
    });

    it('should allow staff to view any order', async () => {
      // Login as staff using proven pattern
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUsers.staff.email,
          password: TEST_PASSWORD
        });
      const loginBody = helpers.api.expectSuccess(loginResponse);

      const response = await request(app)
        .get(`/api/orders/${testOrder.id}`)
        .set('Authorization', `Bearer ${loginBody.data.tokens.accessToken}`);
      const body = helpers.api.expectSuccess(response);

      expect(body.data.id).toBe(testOrder.id);
    });

    it('should prevent customer from viewing other customer orders', async () => {
      // Create another customer with unique ID
      const uniqueId = `22222222-3333-4444-5555-${Date.now().toString().slice(-12)}`; // Ensure uniqueness
      const anotherCustomer = await prisma.user.create({
        data: {
          id: uniqueId,
          email: `anothercustomer-${Date.now()}@test.com`,
          fullName: 'Another Customer',
          role: 'CUSTOMER',
          passwordHash: testUsers.customer.passwordHash || 'dummy-hash', // Use existing hash
          emailVerified: true,
          isActive: true
        }
      });

      const anotherOrder = await createTestOrder(anotherCustomer.id, testProducts[0]!.id);

      // Login as original customer using proven pattern
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUsers.customer.email,
          password: TEST_PASSWORD
        });
      const loginBody = helpers.api.expectSuccess(loginResponse);

      console.log('DEBUG Access Control:');
      console.log('- Customer ID trying to access:', loginBody.data.user.id);
      console.log('- Customer role:', loginBody.data.user.role);
      console.log('- Order belongs to:', anotherOrder.userId);
      console.log('- Order ID:', anotherOrder.id);

      const response = await request(app)
        .get(`/api/orders/${anotherOrder.id}`)
        .set('Authorization', `Bearer ${loginBody.data.tokens.accessToken}`);
      
      console.log('- Response status:', response.status);
      console.log('- Response body:', JSON.stringify(response.body, null, 2));
      
      helpers.api.expectForbidden(response);
    });

    it('should return 404 for non-existent order', async () => {
      // Login as admin using proven pattern
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUsers.admin.email,
          password: TEST_PASSWORD
        });
      const loginBody = helpers.api.expectSuccess(loginResponse);

      const response = await request(app)
        .get('/api/orders/99999999-9999-9999-9999-999999999999')
        .set('Authorization', `Bearer ${loginBody.data.tokens.accessToken}`);
      helpers.api.expectNotFound(response);
    });
  });

  describe('GET /api/orders/track/:orderNumber', () => {
    it('should return order tracking information', async () => {
      const response = await helpers.api.get(`/api/orders/track/${testOrder.orderNumber}`);
      const body = helpers.api.expectSuccess(response);

      expect(body.data).toHaveProperty('orderNumber', testOrder.orderNumber);
      expect(body.data).toHaveProperty('status');
      expect(body.data).toHaveProperty('statusHistory');
      expect(Array.isArray(body.data.statusHistory)).toBe(true);
    });

    it('should return 404 for invalid order number', async () => {
      const response = await helpers.api.get('/api/orders/track/INVALID-ORDER');
      helpers.api.expectNotFound(response);
    });

    it('should not require authentication for tracking', async () => {
      // Public endpoint for order tracking
      const response = await helpers.api.get(`/api/orders/track/${testOrder.orderNumber}`);
      expect(response.status).not.toBe(401);
    });
  });

  describe('PUT /api/orders/:id/status (Admin/Staff Only)', () => {
    it('should allow admin to update order status', async () => {
      const statusUpdate = {
        status: 'CONFIRMED',
        adminNotes: 'Order confirmed by admin'
      };

      // Login as admin using proven pattern
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUsers.admin.email,
          password: TEST_PASSWORD
        });
      const loginBody = helpers.api.expectSuccess(loginResponse);

      const response = await request(app)
        .put(`/api/orders/${testOrder.id}/status`)
        .set('Authorization', `Bearer ${loginBody.data.tokens.accessToken}`)
        .send(statusUpdate);
      const body = helpers.api.expectSuccess(response);

      expect(body.data.status).toBe('CONFIRMED');
      expect(body.data.adminNotes).toBe(statusUpdate.adminNotes);
    });

    it('should allow staff to update order status', async () => {
      const statusUpdate = {
        status: 'CONFIRMED', // PENDING can only go to CONFIRMED or CANCELLED
        adminNotes: 'Order confirmed by staff'
      };

      // Login as staff using proven pattern
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUsers.staff.email,
          password: TEST_PASSWORD
        });
      const loginBody = helpers.api.expectSuccess(loginResponse);

      const response = await request(app)
        .put(`/api/orders/${testOrder.id}/status`)
        .set('Authorization', `Bearer ${loginBody.data.tokens.accessToken}`)
        .send(statusUpdate);
      const body = helpers.api.expectSuccess(response);

      expect(body.data.status).toBe('CONFIRMED');
    });

    it('should reject customer attempt to update order status', async () => {
      const statusUpdate = { status: 'CONFIRMED' };

      // Login as customer using proven pattern
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUsers.customer.email,
          password: TEST_PASSWORD
        });
      const loginBody = helpers.api.expectSuccess(loginResponse);

      const response = await request(app)
        .put(`/api/orders/${testOrder.id}/status`)
        .set('Authorization', `Bearer ${loginBody.data.tokens.accessToken}`)
        .send(statusUpdate);
      helpers.api.expectForbidden(response);
    });

    it('should validate order status transitions', async () => {
      const invalidUpdate = { status: 'INVALID_STATUS' };

      // Login as admin using proven pattern
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUsers.admin.email,
          password: TEST_PASSWORD
        });
      const loginBody = helpers.api.expectSuccess(loginResponse);

      const response = await request(app)
        .put(`/api/orders/${testOrder.id}/status`)
        .set('Authorization', `Bearer ${loginBody.data.tokens.accessToken}`)
        .send(invalidUpdate);
      helpers.api.expectValidationError(response);
    });
  });

  describe('PUT /api/orders/:id/cancel', () => {
    it('should allow customer to cancel their own order', async () => {
      // Login as customer using proven pattern
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUsers.customer.email,
          password: TEST_PASSWORD
        });
      const loginBody = helpers.api.expectSuccess(loginResponse);

      const response = await request(app)
        .put(`/api/orders/${testOrder.id}/cancel`)
        .set('Authorization', `Bearer ${loginBody.data.tokens.accessToken}`);
      const body = helpers.api.expectSuccess(response);

      expect(body.data.status).toBe('CANCELLED');
    });

    it('should prevent cancellation of already processed orders', async () => {
      // First update order to CONFIRMED, then PROCESSING using proven pattern
      const adminLoginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUsers.admin.email,
          password: TEST_PASSWORD
        });
      const adminLoginBody = helpers.api.expectSuccess(adminLoginResponse);

      // PENDING -> CONFIRMED
      await request(app)
        .put(`/api/orders/${testOrder.id}/status`)
        .set('Authorization', `Bearer ${adminLoginBody.data.tokens.accessToken}`)
        .send({ status: 'CONFIRMED' });

      // CONFIRMED -> PROCESSING
      await request(app)
        .put(`/api/orders/${testOrder.id}/status`)
        .set('Authorization', `Bearer ${adminLoginBody.data.tokens.accessToken}`)
        .send({ status: 'PROCESSING' });

      // Then try to cancel as customer using proven pattern
      const customerLoginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUsers.customer.email,
          password: TEST_PASSWORD
        });
      const customerLoginBody = helpers.api.expectSuccess(customerLoginResponse);

      const response = await request(app)
        .put(`/api/orders/${testOrder.id}/cancel`)
        .set('Authorization', `Bearer ${customerLoginBody.data.tokens.accessToken}`);
      helpers.api.expectError(response, 400, 'cannot be cancelled');
    });

    it('should prevent customer from cancelling other customer orders', async () => {
      // Create another customer with unique ID
      const uniqueId = `33333333-4444-5555-6666-${Date.now().toString().slice(-12)}`;
      const anotherCustomer = await prisma.user.create({
        data: {
          id: uniqueId,
          email: `anothercustomer-cancel-${Date.now()}@test.com`,
          fullName: 'Another Customer for Cancel Test',
          role: 'CUSTOMER',
          passwordHash: testUsers.customer.passwordHash || 'dummy-hash',
          emailVerified: true,
          isActive: true
        }
      });
      
      const anotherOrder = await createTestOrder(anotherCustomer.id, testProducts[0]!.id);

      // Login as original customer using proven pattern
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUsers.customer.email,
          password: TEST_PASSWORD
        });
      const loginBody = helpers.api.expectSuccess(loginResponse);

      const response = await request(app)
        .put(`/api/orders/${anotherOrder.id}/cancel`)
        .set('Authorization', `Bearer ${loginBody.data.tokens.accessToken}`);
      helpers.api.expectForbidden(response);
    });

    it('should allow admin to cancel any order', async () => {
      // Login as admin using proven pattern
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUsers.admin.email,
          password: TEST_PASSWORD
        });
      const loginBody = helpers.api.expectSuccess(loginResponse);

      const response = await request(app)
        .put(`/api/orders/${testOrder.id}/cancel`)
        .set('Authorization', `Bearer ${loginBody.data.tokens.accessToken}`);
      const body = helpers.api.expectSuccess(response);

      expect(body.data.status).toBe('CANCELLED');
    });
  });

  describe('Performance & Concurrency Tests', () => {
    it('should handle order creation within acceptable time', async () => {
      const orderData = {
        shippingAddress: {
          fullName: 'Performance Test',
          phone: '0123456789',
          address: '123 Test Street',
          city: 'Test City',
          state: 'Test State',
          postalCode: '12345',
          country: 'Vietnam'
        },
        paymentMethod: 'CASH_ON_DELIVERY'
      };

      await helpers.perf.measureAsync(async () => {
        // Login using proven pattern
        const loginResponse = await request(app)
          .post('/api/auth/login')
          .send({
            email: testUsers.customer.email,
            password: TEST_PASSWORD
          });
        const loginBody = helpers.api.expectSuccess(loginResponse);

        // Clear cart first to avoid conflicts
        await request(app)
          .delete('/api/cart/clear')
          .set('Authorization', `Bearer ${loginBody.data.tokens.accessToken}`);

        // Add item to cart first
        await request(app)
          .post('/api/cart/add')
          .set('Authorization', `Bearer ${loginBody.data.tokens.accessToken}`)
          .send({
            productId: testProducts[0]!.id,
            quantity: 1
          });

        const response = await request(app)
          .post('/api/orders')
          .set('Authorization', `Bearer ${loginBody.data.tokens.accessToken}`)
          .send(orderData);
        helpers.api.expectSuccess(response, 201);
      }, 3000); // Order creation may take longer due to calculations
    });

    it('should handle concurrent order retrievals', async () => {
      // Login using proven pattern
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUsers.customer.email,
          password: TEST_PASSWORD
        });
      const loginBody = helpers.api.expectSuccess(loginResponse);

      const concurrentRequests = Array(5).fill(null).map(() => 
        request(app)
          .get('/api/orders')
          .set('Authorization', `Bearer ${loginBody.data.tokens.accessToken}`)
      );

      const responses = await Promise.all(concurrentRequests);
      responses.forEach(response => {
        helpers.api.expectSuccess(response);
      });
    });

    it('should handle order tracking lookup efficiently', async () => {
      await helpers.perf.measureAsync(async () => {
        const response = await helpers.api.get(`/api/orders/track/${testOrder.orderNumber}`);
        helpers.api.expectSuccess(response);
      }, 1000);
    });
  });
});

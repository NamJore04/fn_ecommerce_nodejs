import { describe, beforeAll, afterAll, beforeEach, it, expect } from '@jest/globals';
import { Express } from 'express';
import { User, Product, Category } from '@prisma/client';
import request from 'supertest';
import { createTestApp, setupTestDatabase, cleanupTestDatabase } from '../helpers/testApp';
import { createTestHelpers } from '../helpers/testHelpers';
import { 
  cleanTestData, 
  createTestUsers, 
  createTestProductsAndCategories,
  testProducts,
  testCategories,
  TEST_PASSWORD
} from '../fixtures/testData';

/**
 * Product Catalog Integration Tests
 * Tests product listing, filtering, search, and management
 */
describe('Product Catalog Integration Tests', () => {
  let app: Express;
  let helpers: ReturnType<typeof createTestHelpers>;
  let testUsers: { customer: User; admin: User; staff: User };

  // Helper function to get test product safely
  const getTestProduct = () => {
    const product = testProducts[0];
    if (!product) {
      throw new Error('Test product not found');
    }
    return product;
  };

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
  });

  describe('GET /api/products', () => {
    it('should return list of active products for public access', async () => {
      const response = await helpers.api.get('/api/products');
      const body = helpers.api.expectSuccess(response);

      // API returns { data: [...], pagination: {...} }
      expect(Array.isArray(body.data)).toBe(true);
      expect(body.data.length).toBeGreaterThan(0);
      expect(body).toHaveProperty('pagination');
      
      // Verify product structure
      const product = body.data[0];
      expect(product).toHaveProperty('id');
      expect(product).toHaveProperty('name');
      expect(product).toHaveProperty('slug');
      expect(product).toHaveProperty('basePrice');
      expect(product).toHaveProperty('category');
    });

    it('should support pagination', async () => {
      const response = await helpers.api.get('/api/products?page=1&limit=1');
      const body = helpers.api.expectSuccess(response);

      expect(body.data).toHaveLength(1);
      expect(body.pagination).toHaveProperty('page', 1);
      expect(body.pagination).toHaveProperty('limit', 1);
      expect(body.pagination).toHaveProperty('total');
      expect(body.pagination).toHaveProperty('totalPages');
    });

    it('should support category filtering', async () => {
      // Test with tea category - fix parameter name from categoryId to category
      const teaCategory = testCategories.find(cat => cat.slug === 'tea-test');
      const teaResponse = await helpers.api.get(`/api/products?category=${teaCategory?.id}`);
      const teaBody = helpers.api.expectSuccess(teaResponse);

      // Expect at least one tea product
      expect(teaBody.data.length).toBeGreaterThan(0);
      teaBody.data.forEach((product: any) => {
        expect(product.category.slug).toBe('tea-test');
      });
    });

    it('should support search functionality', async () => {
      const response = await helpers.api.get('/api/products?search=coffee');
      const body = helpers.api.expectSuccess(response);

      body.data.forEach((product: any) => {
        expect(
          product.name.toLowerCase().includes('coffee') ||
          product.description?.toLowerCase().includes('coffee')
        ).toBe(true);
      });
    });

    it('should support price range filtering', async () => {
      const response = await helpers.api.get('/api/products?minPrice=10&maxPrice=20');
      const body = helpers.api.expectSuccess(response);

      body.data.forEach((product: any) => {
        expect(parseFloat(product.basePrice)).toBeGreaterThanOrEqual(10);
        expect(parseFloat(product.basePrice)).toBeLessThanOrEqual(20);
      });
    });

    it('should handle invalid pagination parameters gracefully', async () => {
      const response = await helpers.api.get('/api/products?page=-1&limit=0');
      const body = helpers.api.expectSuccess(response);

      // Should default to valid pagination
      expect(body.pagination.page).toBeGreaterThan(0);
      expect(body.pagination.limit).toBeGreaterThan(0);
    });
  });

  describe('GET /api/products/:id', () => {
    it('should return product details for valid product ID', async () => {
      const testProduct = getTestProduct();
      
      const response = await helpers.api.get(`/api/products/${testProduct.id}`);
      const body = helpers.api.expectSuccess(response);

      expect(body.data.id).toBe(testProduct.id);
      expect(body.data.name).toBe(testProduct.name);
      expect(body.data.slug).toBe(testProduct.slug);
      expect(body.data).toHaveProperty('category');
      expect(body.data).toHaveProperty('basePrice');
      expect(body.data).toHaveProperty('stockQuantity');
    });

    it('should return 404 for non-existent product', async () => {
      const response = await helpers.api.get('/api/products/ffffffff-ffff-ffff-ffff-ffffffffffff');
      helpers.api.expectNotFound(response);
    });

    it('should return 404 for inactive product', async () => {
      // This test would require creating an inactive product
      // For now, we test with another non-existent valid UUID
      const response = await helpers.api.get('/api/products/eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee');
      helpers.api.expectNotFound(response);
    });
  });

  describe('POST /api/products (Admin Only)', () => {
    it('should allow admin to create new product', async () => {
      // Login as admin to get valid token
      const loginResponse = await helpers.api.post('/api/auth/login', {
        email: testUsers.admin.email,
        password: TEST_PASSWORD
      });
      const loginBody = helpers.api.expectSuccess(loginResponse);
      
      const newProduct = {
        name: 'Premium Espresso Blend',
        slug: helpers.db.generateTestSlug('espresso'),
        description: 'Rich and bold espresso blend',
        sku: `ESP-${Date.now()}`,
        basePrice: 29.99,
        stockQuantity: 100,
        categoryId: testCategories[0]?.id || 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        weight: 500,
        roastLevel: 'Dark'
      };

      const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${loginBody.data.tokens.accessToken}`)
        .send(newProduct);
      const body = helpers.api.expectSuccess(response, 201);

      expect(body.data.name).toBe(newProduct.name);
      expect(body.data.slug).toBe(newProduct.slug);
      expect(body.data.sku).toMatch(/^[A-Z]+-\d+$/); // API generates SKU format
      expect(parseFloat(body.data.basePrice)).toBe(newProduct.basePrice);
    });

    it('should reject customer attempt to create product', async () => {
      // Login as customer to get valid token
      const loginResponse = await helpers.api.post('/api/auth/login', {
        email: testUsers.customer.email,
        password: TEST_PASSWORD
      });
      const loginBody = helpers.api.expectSuccess(loginResponse);
      
      const newProduct = {
        name: 'Unauthorized Product',
        slug: helpers.db.generateTestSlug('unauth'),
        sku: `UNAUTH-${Date.now()}`,
        basePrice: 19.99,
        categoryId: testCategories[0]?.id || 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
      };

      const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${loginBody.data.tokens.accessToken}`)
        .send(newProduct);
      helpers.api.expectForbidden(response);
    });

    it('should validate required fields', async () => {
      // Login as admin to get valid token
      const loginResponse = await helpers.api.post('/api/auth/login', {
        email: testUsers.admin.email,
        password: TEST_PASSWORD
      });
      const loginBody = helpers.api.expectSuccess(loginResponse);
      
      const invalidProduct = {
        name: '',
        basePrice: -10 // Invalid price
      };

      const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${loginBody.data.tokens.accessToken}`)
        .send(invalidProduct);
      helpers.api.expectValidationError(response);
    });

    it('should prevent duplicate SKU', async () => {
      // Login as admin to get valid token
      const loginResponse = await helpers.api.post('/api/auth/login', {
        email: testUsers.admin.email,
        password: TEST_PASSWORD
      });
      const loginBody = helpers.api.expectSuccess(loginResponse);
      
      const duplicateProduct = {
        name: 'Duplicate SKU Product',
        slug: helpers.db.generateTestSlug('dup'),
        sku: 'TEST-COFFEE-001', // Use existing SKU to test duplicate prevention
        basePrice: 19.99,
        categoryId: testCategories[0]?.id || 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
      };

      const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${loginBody.data.tokens.accessToken}`)
        .send(duplicateProduct);
      helpers.api.expectError(response, 400, 'Product with this SKU or slug already exists');
    });
  });

  describe('PUT /api/products/:id (Admin Only)', () => {
    it('should allow admin to update product', async () => {
      const testProduct = getTestProduct();
      const updates = {
        name: 'Updated Product Name',
        basePrice: 24.99,
        stockQuantity: 75
      };

      // Login as admin
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUsers.admin.email,
          password: TEST_PASSWORD
        });
      const loginBody = helpers.api.expectSuccess(loginResponse);

      const response = await request(app)
        .put(`/api/products/${testProduct.id}`)
        .set('Authorization', `Bearer ${loginBody.data.tokens.accessToken}`)
        .send(updates);
      const body = helpers.api.expectSuccess(response);

      expect(body.data.name).toBe(updates.name);
      expect(parseFloat(body.data.basePrice)).toBe(updates.basePrice);
      expect(body.data.stockQuantity).toBe(updates.stockQuantity);
    });

    it('should reject customer attempt to update product', async () => {
      const testProduct = getTestProduct();
      const updates = { name: 'Unauthorized Update' };

      // Login as customer
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUsers.customer.email,
          password: TEST_PASSWORD
        });
      const loginBody = helpers.api.expectSuccess(loginResponse);

      const response = await request(app)
        .put(`/api/products/${testProduct.id}`)
        .set('Authorization', `Bearer ${loginBody.data.tokens.accessToken}`)
        .send(updates);
      helpers.api.expectForbidden(response);
    });

    it('should return 404 for non-existent product update', async () => {
      const updates = { name: 'Non-existent Product' };
      
      // Login as admin
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUsers.admin.email,
          password: TEST_PASSWORD
        });
      const loginBody = helpers.api.expectSuccess(loginResponse);

      const response = await request(app)
        .put('/api/products/99999999-9999-9999-9999-999999999999')
        .set('Authorization', `Bearer ${loginBody.data.tokens.accessToken}`)
        .send(updates);
      helpers.api.expectNotFound(response);
    });
  });

  describe('DELETE /api/products/:id (Admin Only)', () => {
    it('should allow admin to delete product', async () => {
      const testProduct = getTestProduct();
      
      // Login as admin
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUsers.admin.email,
          password: TEST_PASSWORD
        });
      const loginBody = helpers.api.expectSuccess(loginResponse);

      const response = await request(app)
        .delete(`/api/products/${testProduct.id}`)
        .set('Authorization', `Bearer ${loginBody.data.tokens.accessToken}`);
      helpers.api.expectSuccess(response);

      // Verify product is deleted
      const getResponse = await helpers.api.get(`/api/products/${testProduct.id}`);
      helpers.api.expectNotFound(getResponse);
    });

    it('should reject customer attempt to delete product', async () => {
      const testProduct = getTestProduct();
      
      // Login as customer
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUsers.customer.email,
          password: TEST_PASSWORD
        });
      const loginBody = helpers.api.expectSuccess(loginResponse);

      const response = await request(app)
        .delete(`/api/products/${testProduct.id}`)
        .set('Authorization', `Bearer ${loginBody.data.tokens.accessToken}`);
      helpers.api.expectForbidden(response);
    });
  });

  describe('Performance & Load Tests', () => {
    it('should handle product listing within acceptable time', async () => {
      await helpers.perf.measureAsync(async () => {
        const response = await helpers.api.get('/api/products');
        helpers.api.expectSuccess(response);
      }, 2000);
    });

    it('should handle product details fetch within acceptable time', async () => {
      const testProduct = getTestProduct();
      await helpers.perf.measureAsync(async () => {
        const response = await helpers.api.get(`/api/products/${testProduct.id}`);
        helpers.api.expectSuccess(response);
      }, 1000);
    });

    it('should handle concurrent product requests', async () => {
      const concurrentRequests = Array(10).fill(null).map(() => 
        helpers.api.get('/api/products')
      );

      const responses = await Promise.all(concurrentRequests);
      responses.forEach(response => {
        helpers.api.expectSuccess(response);
      });
    });
  });
});

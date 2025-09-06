import request from 'supertest';
import { Express } from 'express';
import { User } from '@prisma/client';
import { getAuthHeader } from '../fixtures/testData';

/**
 * Test helper functions for API testing
 */

export class ApiTestHelper {
  constructor(private app: Express) {}

  /**
   * Get raw request object for custom requests
   */
  request() {
    return request(this.app);
  }

  /**
   * Make authenticated GET request
   */
  async authenticatedGet(endpoint: string, user: User) {
    return request(this.app)
      .get(endpoint)
      .set(getAuthHeader(user))
      .expect('Content-Type', /json/);
  }

  /**
   * Make authenticated POST request with token
   */
  async authenticatedPostWithToken(endpoint: string, token: string, data: any = {}) {
    return request(this.app)
      .post(endpoint)
      .set('Authorization', `Bearer ${token}`)
      .send(data)
      .expect('Content-Type', /json/);
  }

  /**
   * Make authenticated GET request with token
   */
  async authenticatedGetWithToken(endpoint: string, token: string) {
    return request(this.app)
      .get(endpoint)
      .set('Authorization', `Bearer ${token}`)
      .expect('Content-Type', /json/);
  }

  /**
   * Make authenticated PUT request with token
   */
  async authenticatedPutWithToken(endpoint: string, token: string, data: any = {}) {
    return request(this.app)
      .put(endpoint)
      .set('Authorization', `Bearer ${token}`)
      .send(data)
      .expect('Content-Type', /json/);
  }

  /**
   * Make authenticated POST request
   */
  async authenticatedPost(endpoint: string, user: User, data: any = {}) {
    return request(this.app)
      .post(endpoint)
      .set(getAuthHeader(user))
      .send(data)
      .expect('Content-Type', /json/);
  }

  /**
   * Make authenticated PUT request
   */
  async authenticatedPut(endpoint: string, user: User, data: any = {}) {
    return request(this.app)
      .put(endpoint)
      .set(getAuthHeader(user))
      .send(data)
      .expect('Content-Type', /json/);
  }

  /**
   * Make authenticated DELETE request
   */
  async authenticatedDelete(endpoint: string, user: User) {
    return request(this.app)
      .delete(endpoint)
      .set(getAuthHeader(user))
      .expect('Content-Type', /json/);
  }

  /**
   * Make unauthenticated GET request
   */
  async get(endpoint: string) {
    return request(this.app)
      .get(endpoint)
      .expect('Content-Type', /json/);
  }

  /**
   * Make unauthenticated POST request
   */
  async post(endpoint: string, data: any = {}) {
    return request(this.app)
      .post(endpoint)
      .send(data)
      .expect('Content-Type', /json/);
  }

  /**
   * Expect successful response
   */
  expectSuccess(response: request.Response, expectedStatusCode: number = 200) {
    expect(response.status).toBe(expectedStatusCode);
    expect(response.body).toHaveProperty('success', true);
    return response.body;
  }

  /**
   * Expect error response
   */
  expectError(response: request.Response, expectedStatusCode: number, expectedMessage?: string) {
    expect(response.status).toBe(expectedStatusCode);
    expect(response.body).toHaveProperty('success', false);
    if (expectedMessage) {
      expect(response.body.message).toContain(expectedMessage);
    }
    return response.body;
  }

  /**
   * Expect validation error - Updated for actual API response format
   */
  expectValidationError(response: request.Response, field?: string) {
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('success', false);
    // API returns 'message' but may or may not have 'error'
    expect(response.body).toHaveProperty('message');
    if (field) {
      expect(response.body.message).toContain(field);
    }
    return response.body;
  }

  /**
   * Expect unauthorized error
   */
  expectUnauthorized(response: request.Response) {
    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('success', false);
    return response.body;
  }

  /**
   * Expect forbidden error
   */
  expectForbidden(response: request.Response) {
    expect(response.status).toBe(403);
    expect(response.body).toHaveProperty('success', false);
    return response.body;
  }

  /**
   * Expect not found error
   */
  expectNotFound(response: request.Response) {
    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('success', false);
    return response.body;
  }
}

/**
 * Database test helper functions
 */
export class DatabaseTestHelper {
  /**
   * Wait for database operations to complete
   */
  async waitForDatabase(ms: number = 100): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Generate unique test email
   */
  generateTestEmail(prefix: string = 'test'): string {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 11)}@test.com`;
  }

  /**
   * Generate unique test slug
   */
  generateTestSlug(prefix: string = 'test'): string {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  }

  /**
   * Generate unique order number
   */
  generateOrderNumber(): string {
    return `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
  }
}

/**
 * Performance test helper
 */
export class PerformanceTestHelper {
  private startTime: number = 0;

  /**
   * Start performance measurement
   */
  start(): void {
    this.startTime = Date.now();
  }

  /**
   * End performance measurement and expect response time
   */
  expectResponseTime(maxMs: number): void {
    const elapsed = Date.now() - this.startTime;
    expect(elapsed).toBeLessThan(maxMs);
  }

  /**
   * Measure async operation performance
   */
  async measureAsync<T>(operation: () => Promise<T>, maxMs: number): Promise<T> {
    this.start();
    const result = await operation();
    this.expectResponseTime(maxMs);
    return result;
  }
}

/**
 * Create test helpers instance
 */
export function createTestHelpers(app: Express) {
  return {
    api: new ApiTestHelper(app),
    db: new DatabaseTestHelper(),
    perf: new PerformanceTestHelper()
  };
}

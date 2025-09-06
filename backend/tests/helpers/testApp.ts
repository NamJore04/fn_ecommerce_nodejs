import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { prisma } from '../../src/config/database';
import {
  corsOptions,
  apiRateLimiter,
  sanitizeInput,
  requestId,
  securityHeaders,
  globalErrorHandler
} from '../../src/config/security';
import responseMiddleware from '../../src/middleware/response.middleware';

// Import routes
import authRoutes from '../../src/routes/auth.routes';
import orderRoutes from '../../src/routes/order.routes';
import productRoutes from '../../src/routes/product.routes';
import cartRoutes from '../../src/routes/cart.routes';
import categoryRoutes from '../../src/routes/category.routes';

// Load test environment variables
dotenv.config({ path: '.env.test' });

/**
 * Create Express app configured for testing
 */
export function createTestApp(): express.Express {
  const app = express();

  // ============================================
  // BASIC MIDDLEWARE
  // ============================================
  
  // CORS
  app.use(cors(corsOptions));
  
  // Body parsing
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  
  // Security headers
  app.use(securityHeaders);
  
  // Request ID for tracking
  app.use(requestId);
  
  // Input sanitization (disabled rate limiting for tests)
  app.use(sanitizeInput);
  
  // Response formatting
  app.use(responseMiddleware);

  // ============================================
  // TEST HEALTH CHECK
  // ============================================
  
  app.get('/test-health', (req, res) => {
    res.json({
      success: true,
      message: 'Test app is healthy',
      timestamp: new Date().toISOString(),
      environment: 'test'
    });
  });

  // ============================================
  // API ROUTES
  // ============================================
  
  // Authentication routes
  app.use('/api/auth', authRoutes);
  
  // Product catalog routes
  app.use('/api/products', productRoutes);
  
  // Category management routes
  app.use('/api/categories', categoryRoutes);
  
  // Shopping cart routes
  app.use('/api/cart', cartRoutes);
  
  // Order management routes  
  app.use('/api/orders', orderRoutes);
  
  // Basic API info endpoint
  app.get('/api', (req, res) => {
    res.json({
      success: true,
      message: 'Coffee & Tea E-commerce Test API',
      version: '1.0.0-test',
      timestamp: new Date().toISOString(),
      environment: 'test'
    });
  });

  // ============================================
  // ERROR HANDLING
  // ============================================
  
  // 404 handler
  app.use('*', (req, res) => {
    res.status(404).json({
      success: false,
      message: 'API endpoint not found',
      path: req.originalUrl,
      method: req.method,
      timestamp: new Date().toISOString()
    });
  });
  
  // Global error handler
  app.use(globalErrorHandler);

  return app;
}

/**
 * Setup test database connection
 */
export async function setupTestDatabase(): Promise<void> {
  try {
    await prisma.$connect();
    console.log('✅ Test database connected');
  } catch (error) {
    console.error('❌ Test database connection failed:', error);
    throw error;
  }
}

/**
 * Cleanup test database connection
 */
export async function cleanupTestDatabase(): Promise<void> {
  try {
    await prisma.$disconnect();
    console.log('✅ Test database disconnected');
  } catch (error) {
    console.error('❌ Test database cleanup failed:', error);
  }
}

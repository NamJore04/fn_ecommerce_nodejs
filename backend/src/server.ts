import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { prisma, redisClient } from './config/database';
import {
  corsOptions,
  helmetConfig,
  compressionConfig,
  apiRateLimiter,
  sanitizeInput,
  requestId,
  securityHeaders,
  globalErrorHandler,
  healthCheck
} from './config/security';
import responseMiddleware from './middleware/response.middleware';

// Load environment variables
dotenv.config();

// ============================================
// EXPRESS APP SETUP
// ============================================

const app = express();
const PORT = process.env.PORT || 3001;

// ============================================
// BASIC MIDDLEWARE
// ============================================

// Request ID and logging
app.use(requestId);

// Security middleware
app.use(helmetConfig);
app.use('*', cors(corsOptions));
app.use(compressionConfig);
app.use(securityHeaders);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Input sanitization
app.use(sanitizeInput);

// Rate limiting
app.use('/api', apiRateLimiter);

// Response formatting
app.use(responseMiddleware);

// ============================================
// HEALTH CHECK ENDPOINT
// ============================================

app.get('/health', healthCheck);
app.get('/api/health', healthCheck);

// ============================================
// API ROUTES IMPORTS
// ============================================

import authRoutes from './routes/auth.routes';
import orderRoutes from './routes/order.routes';
import productRoutes from './routes/product.routes';
import cartRoutes from './routes/cart.routes';
import categoryRoutes from './routes/category.routes';

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
    message: 'Coffee & Tea E-commerce API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    availableEndpoints: {
      auth: '/api/auth/*',
      products: '/api/products/*',
      categories: '/api/categories/*',
      cart: '/api/cart/*',
      orders: '/api/orders/*',
      health: '/health, /api/health'
    }
  });
});

// API status endpoint
app.get('/api/status', (req, res) => {
  res.json({
    success: true,
    message: 'API is running successfully',
    database: 'connected',
    redis: 'connected',
    requestId: req.requestId
  });
});

// ============================================
// 404 HANDLER
// ============================================

app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.method} ${req.originalUrl} not found`,
      requestId: req.requestId
    }
  });
});

// ============================================
// GLOBAL ERROR HANDLER
// ============================================

app.use(globalErrorHandler);

// ============================================
// SERVER STARTUP
// ============================================

async function startServer() {
  try {
    // Connect to Redis if available
    if (redisClient) {
      console.log('🔄 Connecting to Redis...');
      await redisClient.connect();
      console.log('✅ Redis connected successfully');
    } else {
      console.log('⚠️ Redis client not configured - continuing without Redis');
    }

    // Test database connection
    console.log('🔄 Testing database connection...');
    await prisma.$connect();
    console.log('✅ Database connected successfully');

    // Start the server
    const server = app.listen(PORT, () => {
      console.log(`
🚀 Coffee & Tea API Server Started!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📍 Server URL: http://localhost:${PORT}
🔗 API Base: http://localhost:${PORT}/api
🏥 Health Check: http://localhost:${PORT}/health
🌍 Environment: ${process.env.NODE_ENV || 'development'}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      `);
    });

    // Graceful shutdown handling
    process.on('SIGTERM', async () => {
      console.log('📴 SIGTERM received, shutting down gracefully...');
      server.close(async () => {
        try {
          console.log('🛑 Shutting down database connections...');
          await prisma.$disconnect();
          if (redisClient) {
            await redisClient.quit();
          }
          console.log('✅ Prisma connection closed');
          process.exit(0);
        } catch (error) {
          console.error('❌ Error during shutdown:', error);
          process.exit(1);
        }
      });
    });

    process.on('SIGINT', async () => {
      console.log('📴 SIGINT received, shutting down gracefully...');
      server.close(async () => {
        try {
          console.log('🛑 Shutting down database connections...');
          await prisma.$disconnect();
          if (redisClient) {
            await redisClient.quit();
          }
          console.log('✅ Prisma connection closed');
          process.exit(0);
        } catch (error) {
          console.error('❌ Error during shutdown:', error);
          process.exit(1);
        }
      });
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer();

export default app;

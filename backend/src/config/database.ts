import { PrismaClient } from '@prisma/client';
import { createClient } from 'redis';

// ============================================
// PRISMA CLIENT CONFIGURATION WITH CONNECTION POOLING
// ============================================

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' 
    ? ['query', 'info', 'warn', 'error'] 
    : ['error']
});

// Prevent multiple instances in development
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// ============================================
// REDIS CLIENT CONFIGURATION (OPTIONAL)
// ============================================

const redisUrl = process.env.REDIS_URL;
const redisPassword = process.env.REDIS_PASSWORD;

let redisClient: any = null;

// Only create Redis client if REDIS_URL is provided
if (redisUrl) {
  const { createClient } = require('redis');
  
  redisClient = createClient({
    url: redisUrl,
    ...(redisPassword && { password: redisPassword }),
    
    // Connection settings
    socket: {
      connectTimeout: 60000,
      reconnectStrategy: (retries: number) => Math.min(retries * 50, 500)
    },
    
    // Security settings
    legacyMode: false,
  });

  // Redis Event Handlers
  redisClient.on('error', (err: Error) => {
    console.error('❌ Redis Client Error:', err);
  });

  redisClient.on('connect', () => {
    console.log('✅ Redis connected successfully');
  });

  redisClient.on('reconnecting', () => {
    console.log('🔄 Redis reconnecting...');
  });

  redisClient.on('ready', () => {
    console.log('🚀 Redis client ready');
  });
  
  console.log('🔄 Connecting to Redis...');
  redisClient.connect().catch((err: Error) => {
    console.error('❌ Failed to connect to Redis:', err);
  });
} else {
  console.log('⚠️ Redis disabled - REDIS_URL not configured');
}

// ============================================
// DATABASE CONNECTION UTILITIES
// ============================================

/**
 * Test database connection
 */
export async function testDatabaseConnection(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ PostgreSQL connection successful');
    return true;
  } catch (error) {
    console.error('❌ PostgreSQL connection failed:', error);
    return false;
  }
}

/**
 * Test Redis connection
 */
export async function testRedisConnection(): Promise<boolean> {
  try {
    if (!redisClient) {
      console.log('⚠️ Redis client not configured');
      return false;
    }
    
    if (!redisClient.isOpen) {
      await redisClient.connect();
    }
    await redisClient.ping();
    console.log('✅ Redis connection successful');
    return true;
  } catch (error) {
    console.error('❌ Redis connection failed:', error);
    return false;
  }
}

/**
 * Initialize all database connections
 */
export async function initializeConnections(): Promise<{
  postgres: boolean;
  redis: boolean;
}> {
  const results = {
    postgres: await testDatabaseConnection(),
    redis: await testRedisConnection()
  };
  
  if (results.postgres && results.redis) {
    console.log('🎉 All database connections initialized successfully');
  } else {
    console.error('⚠️ Some database connections failed to initialize');
  }
  
  return results;
}

// ============================================
// CONNECTION POOL MONITORING
// ============================================

/**
 * Get connection pool statistics
 */
export async function getConnectionPoolStats() {
  try {
    const result = await prisma.$queryRaw`
      SELECT 
        count(*) as total_connections,
        count(*) FILTER (WHERE state = 'active') as active_connections,
        count(*) FILTER (WHERE state = 'idle') as idle_connections
      FROM pg_stat_activity 
      WHERE datname = current_database()
    ` as any[];
    
    return result[0];
  } catch (error) {
    console.error('Failed to get connection pool stats:', error);
    return null;
  }
}

/**
 * Monitor database performance
 */
export async function getDatabaseStats() {
  try {
    const stats = await prisma.$queryRaw`
      SELECT 
        schemaname,
        tablename,
        attname,
        n_distinct,
        correlation
      FROM pg_stats 
      WHERE schemaname = 'public'
      ORDER BY tablename, attname
    ` as any[];
    
    return stats;
  } catch (error) {
    console.error('Failed to get database stats:', error);
    return null;
  }
}

// ============================================
// GRACEFUL SHUTDOWN HANDLERS
// ============================================

/**
 * Graceful shutdown for database connections
 */
export async function gracefulShutdown(): Promise<void> {
  console.log('🛑 Shutting down database connections...');
  
  try {
    // Close Prisma connection
    await prisma.$disconnect();
    console.log('✅ Prisma connection closed');
    
    // Close Redis connection
    if (redisClient.isOpen) {
      await redisClient.quit();
      console.log('✅ Redis connection closed');
    }
    
    console.log('🎉 All database connections closed successfully');
  } catch (error) {
    console.error('❌ Error during graceful shutdown:', error);
    process.exit(1);
  }
}

// Process event handlers for graceful shutdown
process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);
process.on('beforeExit', gracefulShutdown);

// Handle uncaught exceptions
process.on('uncaughtException', async (error) => {
  console.error('Uncaught Exception:', error);
  await gracefulShutdown();
  process.exit(1);
});

process.on('unhandledRejection', async (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  await gracefulShutdown();
  process.exit(1);
});

// ============================================
// EXPORT CONFIGURED CLIENTS
// ============================================

export { redisClient };
export default prisma;

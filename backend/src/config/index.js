/**
 * 🔧 Centralized Configuration Module
 * 
 * Tự động load environment variables theo NODE_ENV:
 * - local: .env.local
 * - docker: .env.docker  
 * - production: .env.production
 * 
 * Priority: .env.[NODE_ENV] > .env.local > .env
 */

require('dotenv-flow').config();

// Auto-detect environment if not set
const detectEnvironment = () => {
  // 1. Check explicit NODE_ENV
  if (process.env.NODE_ENV) {
    return process.env.NODE_ENV;
  }

  // 2. Check if running in Docker
  if (process.env.DOCKER_ENV === 'true' || process.env.KUBERNETES_SERVICE_HOST) {
    return 'docker';
  }

  // 3. Check MongoDB URI for hints
  if (process.env.MONGODB_URI && process.env.MONGODB_URI.includes('mongo:')) {
    return 'docker';
  }

  // 4. Default to local
  return 'local';
};

const ENV = detectEnvironment();

// Configuration object
const config = {
  // Environment
  env: ENV,
  isDevelopment: ENV === 'local' || ENV === 'development',
  isDocker: ENV === 'docker',
  isProduction: ENV === 'production',

  // Server
  server: {
    port: parseInt(process.env.PORT || '5000'),
    nodeEnv: process.env.NODE_ENV || 'development',
  },

  // Database
  database: {
    mongodb: {
      uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce',
      options: {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    },
    redis: {
      url: process.env.REDIS_URL || null,
    }
  },

  // JWT
  jwt: {
    secret: process.env.JWT_SECRET || 'fallback-jwt-secret-change-in-production',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret',
    expire: process.env.JWT_EXPIRE || '15m',
    refreshExpire: process.env.JWT_REFRESH_EXPIRE || '7d',
  },

  // Social Auth
  social: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    },
    facebook: {
      appId: process.env.FACEBOOK_APP_ID,
      appSecret: process.env.FACEBOOK_APP_SECRET,
    }
  },

  // Email
  email: {
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '587'),
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },

  // File Upload
  upload: {
    maxSize: parseInt(process.env.MAX_FILE_SIZE || '5242880'), // 5MB
    path: process.env.UPLOAD_PATH || './uploads',
  },

  // CORS
  cors: {
    clientUrl: process.env.CLIENT_URL || 'http://localhost:3000',
    origin: (() => {
      const origins = [];
      
      // Always add CLIENT_URL from environment
      const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
      origins.push(clientUrl);
      
      // Local development origins
      if (ENV === 'local' || ENV === 'development') {
        origins.push('http://localhost:3000');
        origins.push('http://127.0.0.1:3000');
        origins.push('http://localhost:5173'); // Vite dev server
      }
      
      // Docker environment origins
      if (ENV === 'docker') {
        origins.push('http://localhost');      // Nginx proxy
        origins.push('http://localhost:80');   // Explicit port
        origins.push('http://127.0.0.1');      // Alternative localhost
        origins.push('http://127.0.0.1:80');
      }
      
      // Production origins (add your domain here)
      if (ENV === 'production') {
        // Add production domains
        if (process.env.PRODUCTION_URL) {
          origins.push(process.env.PRODUCTION_URL);
        }
      }
      
      console.log('🔒 CORS allowed origins:', origins);
      return [...new Set(origins)]; // Remove duplicates
    })()
  },

  // Rate Limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 min
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  },

  // Auto Import Data
  autoImportData: process.env.AUTO_IMPORT_DATA === 'true',
};

// Validation warnings
if (config.isProduction) {
  if (config.jwt.secret.includes('fallback')) {
    console.warn('⚠️  WARNING: Using fallback JWT secret in production!');
  }
  if (!config.database.redis.url) {
    console.warn('⚠️  WARNING: Redis not configured in production!');
  }
}

// Log configuration (hide sensitive data)
console.log('\n╔════════════════════════════════════════════════════════════════════╗');
console.log('║                    🔧 CONFIGURATION LOADED                        ║');
console.log('╚════════════════════════════════════════════════════════════════════╝');
console.log(`📍 Environment: ${config.env.toUpperCase()}`);
console.log(`🔌 Port: ${config.server.port}`);
console.log(`🗄️  MongoDB: ${config.database.mongodb.uri.replace(/:[^:@]+@/, ':****@')}`);
console.log(`🔴 Redis: ${config.database.redis.url ? 'Enabled' : 'Disabled'}`);
console.log(`🌍 Client URL: ${config.cors.clientUrl}`);
console.log(`📥 Auto Import: ${config.autoImportData ? 'Enabled' : 'Disabled'}`);
console.log('════════════════════════════════════════════════════════════════════\n');

module.exports = config;

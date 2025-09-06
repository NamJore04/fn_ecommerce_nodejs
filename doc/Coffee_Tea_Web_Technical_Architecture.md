# TECHNICAL ARCHITECTURE - COFFEE & TEA E-COMMERCE

## 1. System Architecture Overview

### 1.1. High-Level Architecture Diagram
```mermaid
graph TB
    subgraph "Client Layer"
        WEB[Web Browser]
        MOBILE[Mobile App]
        ADMIN[Admin Dashboard]
    end
    
    subgraph "CDN & Load Balancer"
        CDN[CloudFlare CDN]
        LB[Load Balancer]
    end
    
    subgraph "Application Layer"
        NGINX[Nginx Reverse Proxy]
        
        subgraph "Node.js Application Servers"
            APP1[App Server 1]
            APP2[App Server 2]
            APP3[App Server 3]
        end
        
        subgraph "Real-time Services"
            WS[WebSocket Server]
            REDIS_PUB[Redis Pub/Sub]
        end
    end
    
    subgraph "Business Logic Layer"
        AUTH[Auth Service]
        PRODUCT[Product Service]
        ORDER[Order Service]
        CART[Cart Service]
        USER[User Service]
        PAYMENT[Payment Service]
        NOTIFICATION[Notification Service]
    end
    
    subgraph "Data Layer"
        POSTGRES[(PostgreSQL)]
        REDIS[(Redis Cache)]
        ELASTICSEARCH[(ElasticSearch)]
        S3[(File Storage)]
    end
    
    subgraph "External Services"
        EMAIL[Email Service]
        SMS[SMS Service]
        SOCIAL[Social Auth]
        ANALYTICS[Analytics]
    end
    
    %% Connections
    WEB --> CDN
    MOBILE --> CDN
    ADMIN --> CDN
    CDN --> LB
    LB --> NGINX
    
    NGINX --> APP1
    NGINX --> APP2
    NGINX --> APP3
    
    APP1 --> AUTH
    APP1 --> PRODUCT
    APP1 --> ORDER
    APP1 --> WS
    
    AUTH --> POSTGRES
    PRODUCT --> POSTGRES
    ORDER --> POSTGRES
    CART --> REDIS
    
    APP1 --> REDIS
    WS --> REDIS_PUB
    
    PRODUCT --> ELASTICSEARCH
    ORDER --> EMAIL
    NOTIFICATION --> SMS
    AUTH --> SOCIAL
```

### 1.2. Technology Stack

#### Frontend Technologies
- **Framework**: React 18+ hoặc Vue 3+
- **State Management**: Redux Toolkit / Vuex / Pinia
- **UI Library**: Tailwind CSS + Headless UI
- **Build Tool**: Vite
- **PWA**: Service Worker for offline capabilities
- **Testing**: Jest + React Testing Library

#### Backend Technologies
- **Runtime**: Node.js 18+
- **Framework**: Express.js 4+
- **Database**: PostgreSQL 15+
- **Cache**: Redis 7+
- **Search**: ElasticSearch 8+
- **File Storage**: AWS S3 / Cloudinary
- **Authentication**: JWT + Passport.js
- **Validation**: Joi / Yup
- **Testing**: Jest + Supertest

#### DevOps & Infrastructure
- **Containerization**: Docker + Docker Compose
- **Orchestration**: Kubernetes (optional)
- **CI/CD**: GitHub Actions
- **Monitoring**: Prometheus + Grafana
- **Logging**: Winston + ELK Stack
- **API Documentation**: Swagger/OpenAPI

## 2. Microservices Architecture (Bonus Feature)

### 2.1. Service Breakdown
```mermaid
graph TB
    subgraph "API Gateway"
        GATEWAY[Kong API Gateway]
    end
    
    subgraph "Core Services"
        AUTH_SVC[Authentication Service<br/>Port: 3001]
        USER_SVC[User Service<br/>Port: 3002]
        PRODUCT_SVC[Product Service<br/>Port: 3003]
        CART_SVC[Cart Service<br/>Port: 3004]
        ORDER_SVC[Order Service<br/>Port: 3005]
        PAYMENT_SVC[Payment Service<br/>Port: 3006]
        NOTIFICATION_SVC[Notification Service<br/>Port: 3007]
    end
    
    subgraph "Message Queue"
        RABBITMQ[RabbitMQ]
    end
    
    subgraph "Databases"
        AUTH_DB[(Auth DB)]
        USER_DB[(User DB)]
        PRODUCT_DB[(Product DB)]
        ORDER_DB[(Order DB)]
    end
    
    subgraph "Shared Services"
        REDIS_SHARED[(Redis Shared)]
        ELASTICSEARCH_SHARED[(ElasticSearch)]
    end
    
    GATEWAY --> AUTH_SVC
    GATEWAY --> USER_SVC
    GATEWAY --> PRODUCT_SVC
    GATEWAY --> CART_SVC
    GATEWAY --> ORDER_SVC
    
    AUTH_SVC --> AUTH_DB
    USER_SVC --> USER_DB
    PRODUCT_SVC --> PRODUCT_DB
    ORDER_SVC --> ORDER_DB
    
    CART_SVC --> REDIS_SHARED
    PRODUCT_SVC --> ELASTICSEARCH_SHARED
    
    ORDER_SVC --> RABBITMQ
    PAYMENT_SVC --> RABBITMQ
    NOTIFICATION_SVC --> RABBITMQ
```

### 2.2. Service Communication Patterns

#### Synchronous Communication
```javascript
// API Gateway routing configuration
const routes = {
  '/api/v1/auth/**': 'http://auth-service:3001',
  '/api/v1/users/**': 'http://user-service:3002', 
  '/api/v1/products/**': 'http://product-service:3003',
  '/api/v1/cart/**': 'http://cart-service:3004',
  '/api/v1/orders/**': 'http://order-service:3005'
};

// Service-to-service communication
const axios = require('axios');

class UserService {
  async validateUser(userId) {
    try {
      const response = await axios.get(`${USER_SERVICE_URL}/users/${userId}/validate`);
      return response.data;
    } catch (error) {
      throw new Error('User validation failed');
    }
  }
}
```

#### Asynchronous Communication
```javascript
// RabbitMQ event publishing
const amqp = require('amqplib');

class OrderService {
  async createOrder(orderData) {
    // Create order logic
    const order = await this.saveOrder(orderData);
    
    // Publish event
    await this.publishEvent('order.created', {
      orderId: order.id,
      userId: order.userId,
      total: order.total,
      items: order.items
    });
    
    return order;
  }
  
  async publishEvent(eventType, data) {
    const connection = await amqp.connect(RABBITMQ_URL);
    const channel = await connection.createChannel();
    
    await channel.assertExchange('coffee-tea-events', 'topic');
    channel.publish('coffee-tea-events', eventType, Buffer.from(JSON.stringify(data)));
    
    await connection.close();
  }
}

// Event consumption
class NotificationService {
  async consumeEvents() {
    const connection = await amqp.connect(RABBITMQ_URL);
    const channel = await connection.createChannel();
    
    await channel.assertExchange('coffee-tea-events', 'topic');
    const q = await channel.assertQueue('notification-queue');
    
    await channel.bindQueue(q.queue, 'coffee-tea-events', 'order.*');
    
    channel.consume(q.queue, async (msg) => {
      const eventType = msg.fields.routingKey;
      const data = JSON.parse(msg.content.toString());
      
      switch (eventType) {
        case 'order.created':
          await this.sendOrderConfirmation(data);
          break;
        case 'order.status.updated':
          await this.sendStatusUpdate(data);
          break;
      }
      
      channel.ack(msg);
    });
  }
}
```

## 3. Database Architecture

### 3.1. Database Per Service Pattern
```yaml
# Docker Compose for databases
version: '3.8'
services:
  auth-db:
    image: postgres:15
    environment:
      POSTGRES_DB: auth_service
      POSTGRES_USER: auth_user
      POSTGRES_PASSWORD: auth_pass
    volumes:
      - auth_data:/var/lib/postgresql/data
  
  user-db:
    image: postgres:15
    environment:
      POSTGRES_DB: user_service
      POSTGRES_USER: user_user
      POSTGRES_PASSWORD: user_pass
    volumes:
      - user_data:/var/lib/postgresql/data
  
  product-db:
    image: postgres:15
    environment:
      POSTGRES_DB: product_service
      POSTGRES_USER: product_user
      POSTGRES_PASSWORD: product_pass
    volumes:
      - product_data:/var/lib/postgresql/data
  
  order-db:
    image: postgres:15
    environment:
      POSTGRES_DB: order_service
      POSTGRES_USER: order_user
      POSTGRES_PASSWORD: order_pass
    volumes:
      - order_data:/var/lib/postgresql/data

volumes:
  auth_data:
  user_data:
  product_data:
  order_data:
```

### 3.2. Data Consistency Patterns

#### Saga Pattern for Distributed Transactions
```javascript
class OrderSaga {
  async processOrder(orderData) {
    const sagaTransaction = new SagaTransaction();
    
    try {
      // Step 1: Reserve inventory
      const reservationResult = await sagaTransaction.execute(
        () => this.productService.reserveInventory(orderData.items),
        () => this.productService.releaseInventory(orderData.items)
      );
      
      // Step 2: Process payment
      const paymentResult = await sagaTransaction.execute(
        () => this.paymentService.processPayment(orderData.payment),
        () => this.paymentService.refundPayment(paymentResult.transactionId)
      );
      
      // Step 3: Create order
      const orderResult = await sagaTransaction.execute(
        () => this.orderService.createOrder(orderData),
        () => this.orderService.cancelOrder(orderResult.orderId)
      );
      
      // Step 4: Update loyalty points
      await sagaTransaction.execute(
        () => this.userService.addLoyaltyPoints(orderData.userId, orderResult.pointsEarned),
        () => this.userService.deductLoyaltyPoints(orderData.userId, orderResult.pointsEarned)
      );
      
      await sagaTransaction.commit();
      return orderResult;
      
    } catch (error) {
      await sagaTransaction.rollback();
      throw error;
    }
  }
}
```

#### Event Sourcing for Order History
```javascript
class OrderEventStore {
  async appendEvent(orderId, eventType, eventData) {
    const event = {
      id: uuid(),
      orderId,
      eventType,
      eventData,
      timestamp: new Date(),
      version: await this.getNextVersion(orderId)
    };
    
    await this.db.query(
      'INSERT INTO order_events (id, order_id, event_type, event_data, timestamp, version) VALUES ($1, $2, $3, $4, $5, $6)',
      [event.id, event.orderId, event.eventType, JSON.stringify(event.eventData), event.timestamp, event.version]
    );
    
    return event;
  }
  
  async getOrderHistory(orderId) {
    const result = await this.db.query(
      'SELECT * FROM order_events WHERE order_id = $1 ORDER BY version ASC',
      [orderId]
    );
    
    return result.rows.map(row => ({
      ...row,
      eventData: JSON.parse(row.event_data)
    }));
  }
  
  async rebuildOrderState(orderId) {
    const events = await this.getOrderHistory(orderId);
    let orderState = {};
    
    for (const event of events) {
      orderState = this.applyEvent(orderState, event);
    }
    
    return orderState;
  }
}
```

## 4. Caching Strategy

### 4.1. Multi-Level Caching
```javascript
class CacheManager {
  constructor() {
    this.redis = new Redis(REDIS_URL);
    this.localCache = new NodeCache({ stdTTL: 300 }); // 5 minutes
  }
  
  async get(key) {
    // L1: Local cache
    const localValue = this.localCache.get(key);
    if (localValue) {
      return localValue;
    }
    
    // L2: Redis cache
    const redisValue = await this.redis.get(key);
    if (redisValue) {
      const parsed = JSON.parse(redisValue);
      this.localCache.set(key, parsed);
      return parsed;
    }
    
    return null;
  }
  
  async set(key, value, ttl = 3600) {
    // Set in both caches
    this.localCache.set(key, value, ttl);
    await this.redis.setex(key, ttl, JSON.stringify(value));
  }
  
  async invalidate(pattern) {
    // Invalidate local cache
    this.localCache.flushAll();
    
    // Invalidate Redis cache
    const keys = await this.redis.keys(pattern);
    if (keys.length > 0) {
      await this.redis.del(...keys);
    }
  }
}

// Cache strategies for different data types
class ProductCacheStrategy {
  constructor(cacheManager) {
    this.cache = cacheManager;
  }
  
  async getProduct(productId) {
    const cacheKey = `product:${productId}`;
    let product = await this.cache.get(cacheKey);
    
    if (!product) {
      product = await this.productService.getById(productId);
      await this.cache.set(cacheKey, product, 3600); // 1 hour
    }
    
    return product;
  }
  
  async getFeaturedProducts(category) {
    const cacheKey = `featured:${category}`;
    let products = await this.cache.get(cacheKey);
    
    if (!products) {
      products = await this.productService.getFeatured(category);
      await this.cache.set(cacheKey, products, 1800); // 30 minutes
    }
    
    return products;
  }
  
  async invalidateProductCache(productId) {
    await this.cache.invalidate(`product:${productId}*`);
    await this.cache.invalidate('featured:*');
    await this.cache.invalidate('search:*');
  }
}
```

### 4.2. Cache Warming and Preloading
```javascript
class CacheWarmer {
  constructor(cacheManager, productService) {
    this.cache = cacheManager;
    this.productService = productService;
  }
  
  async warmCache() {
    console.log('Starting cache warming...');
    
    // Warm featured products
    await this.warmFeaturedProducts();
    
    // Warm popular products
    await this.warmPopularProducts();
    
    // Warm categories
    await this.warmCategories();
    
    console.log('Cache warming completed');
  }
  
  async warmFeaturedProducts() {
    const categories = ['coffee-espresso', 'tea-beverages', 'food-snacks'];
    
    for (const category of categories) {
      const products = await this.productService.getFeatured(category);
      await this.cache.set(`featured:${category}`, products, 3600);
    }
  }
  
  async warmPopularProducts() {
    const popularProducts = await this.productService.getPopular(20);
    await this.cache.set('popular:products', popularProducts, 1800);
    
    // Warm individual product details
    for (const product of popularProducts) {
      const productDetails = await this.productService.getById(product.id);
      await this.cache.set(`product:${product.id}`, productDetails, 3600);
    }
  }
}

// Schedule cache warming
const cron = require('node-cron');

// Warm cache every hour
cron.schedule('0 * * * *', async () => {
  const warmer = new CacheWarmer(cacheManager, productService);
  await warmer.warmCache();
});
```

## 5. Security Architecture

### 5.1. Authentication & Authorization
```javascript
// JWT Token Strategy
class AuthService {
  generateTokens(user) {
    const accessToken = jwt.sign(
      { 
        userId: user.id, 
        email: user.email,
        role: user.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );
    
    const refreshToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );
    
    return { accessToken, refreshToken };
  }
  
  async verifyToken(token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      return decoded;
    } catch (error) {
      throw new Error('Invalid token');
    }
  }
}

// Role-based access control middleware
const authorize = (roles = []) => {
  return (req, res, next) => {
    const userRole = req.user?.role;
    
    if (!userRole || !roles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        error: { message: 'Access denied' }
      });
    }
    
    next();
  };
};

// Usage
app.get('/admin/dashboard', authenticate, authorize(['admin']), getDashboard);
app.post('/admin/products', authenticate, authorize(['admin']), createProduct);
```

### 5.2. Input Validation & Sanitization
```javascript
const Joi = require('joi');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss');

// Validation schemas
const productSchema = Joi.object({
  name: Joi.string().min(3).max(255).required(),
  description: Joi.string().min(10).max(2000).required(),
  basePrice: Joi.number().positive().required(),
  categoryId: Joi.string().uuid().required(),
  brandId: Joi.string().uuid().required(),
  variants: Joi.array().items(
    Joi.object({
      name: Joi.string().required(),
      type: Joi.string().required(),
      priceAdjustment: Joi.number().default(0),
      stock: Joi.number().integer().min(0).required()
    })
  ).min(2).required() // At least 2 variants required
});

// Validation middleware
const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input data',
          details: error.details.map(detail => ({
            field: detail.path.join('.'),
            message: detail.message
          }))
        }
      });
    }
    
    req.body = value;
    next();
  };
};

// Sanitization middleware
app.use(mongoSanitize());
app.use((req, res, next) => {
  if (req.body) {
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        req.body[key] = xss(req.body[key]);
      }
    });
  }
  next();
});
```

### 5.3. Rate Limiting & DDoS Protection
```javascript
const rateLimit = require('express-rate-limit');
const slowDown = require('express-slow-down');

// Different rate limits for different endpoints
const createAccountLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 accounts per hour
  message: 'Too many accounts created, try again later'
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 login attempts
  skipSuccessfulRequests: true
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // 100 requests per window
});

// Speed limiting for suspicious behavior
const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000,
  delayAfter: 50,
  delayMs: 500
});

// Apply limiters
app.post('/auth/register', createAccountLimiter, registerUser);
app.post('/auth/login', loginLimiter, loginUser);
app.use('/api', speedLimiter, apiLimiter);
```

## 6. Monitoring & Observability

### 6.1. Application Monitoring
```javascript
const prometheus = require('prom-client');

// Custom metrics
const httpRequestDuration = new prometheus.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status']
});

const activeConnections = new prometheus.Gauge({
  name: 'websocket_active_connections',
  help: 'Number of active WebSocket connections'
});

const orderCount = new prometheus.Counter({
  name: 'orders_total',
  help: 'Total number of orders created'
});

// Middleware to collect metrics
const metricsMiddleware = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    httpRequestDuration
      .labels(req.method, req.route?.path || req.path, res.statusCode)
      .observe(duration);
  });
  
  next();
};

app.use(metricsMiddleware);

// Health check endpoint
app.get('/health', async (req, res) => {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    services: {
      database: await checkDatabaseHealth(),
      redis: await checkRedisHealth(),
      elasticsearch: await checkElasticsearchHealth()
    }
  };
  
  const overallHealth = Object.values(health.services).every(service => service === 'healthy');
  
  res.status(overallHealth ? 200 : 503).json(health);
});
```

### 6.2. Logging Strategy
```javascript
const winston = require('winston');
const { ElasticsearchTransport } = require('winston-elasticsearch');

// Configure logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'coffee-tea-api' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    new ElasticsearchTransport({
      level: 'info',
      clientOpts: { node: process.env.ELASTICSEARCH_URL },
      index: 'coffee-tea-logs'
    })
  ]
});

// Request logging middleware
const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    
    logger.info('HTTP Request', {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      duration,
      userAgent: req.get('User-Agent'),
      ip: req.ip,
      userId: req.user?.id
    });
  });
  
  next();
};

// Error logging
const errorLogger = (error, req, res, next) => {
  logger.error('Application Error', {
    error: error.message,
    stack: error.stack,
    method: req.method,
    url: req.originalUrl,
    userId: req.user?.id,
    body: req.body
  });
  
  next(error);
};
```

## 7. CI/CD Pipeline (Bonus Feature)

### 7.1. GitHub Actions Workflow
```yaml
# .github/workflows/ci-cd.yml
name: CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: coffee_tea_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
      
      redis:
        image: redis:7
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run linting
      run: npm run lint
    
    - name: Run tests
      run: npm test
      env:
        NODE_ENV: test
        DATABASE_URL: postgresql://postgres:postgres@localhost:5432/coffee_tea_test
        REDIS_URL: redis://localhost:6379
    
    - name: Run integration tests
      run: npm run test:integration
    
    - name: Generate test coverage
      run: npm run test:coverage
    
    - name: Upload coverage to Codecov
      uses: codecov/codecov-action@v3

  build:
    needs: test
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Docker Buildx
      uses: docker/setup-buildx-action@v2
    
    - name: Login to Docker Hub
      uses: docker/login-action@v2
      with:
        username: ${{ secrets.DOCKER_USERNAME }}
        password: ${{ secrets.DOCKER_PASSWORD }}
    
    - name: Build and push Docker image
      uses: docker/build-push-action@v4
      with:
        context: .
        platforms: linux/amd64,linux/arm64
        push: true
        tags: |
          coffeetea/api:latest
          coffeetea/api:${{ github.sha }}
        cache-from: type=gha
        cache-to: type=gha,mode=max

  deploy:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
    - name: Deploy to production
      uses: appleboy/ssh-action@v0.1.7
      with:
        host: ${{ secrets.PROD_HOST }}
        username: ${{ secrets.PROD_USER }}
        key: ${{ secrets.PROD_SSH_KEY }}
        script: |
          cd /opt/coffee-tea-app
          docker-compose pull
          docker-compose up -d
          docker system prune -f
```

### 7.2. Docker Configuration
```dockerfile
# Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine AS runtime

# Create app directory
WORKDIR /app

# Install app dependencies
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copy app source
COPY . .

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Change ownership of the app directory
RUN chown -R nodejs:nodejs /app
USER nodejs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js

# Start the application
CMD ["npm", "start"]
```

```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://postgres:password@db:5432/coffee_tea
      - REDIS_URL=redis://redis:6379
    depends_on:
      - db
      - redis
    volumes:
      - ./logs:/app/logs
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - app
    restart: unless-stopped

  db:
    image: postgres:15
    environment:
      POSTGRES_DB: coffee_tea
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data
    restart: unless-stopped

  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.11.0
    environment:
      - discovery.type=single-node
      - xpack.security.enabled=false
    volumes:
      - elasticsearch_data:/usr/share/elasticsearch/data
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
  elasticsearch_data:
```

Architecture này đảm bảo:
- **High Availability**: Load balancing và redundancy
- **Scalability**: Horizontal scaling capabilities
- **Security**: Multi-layer security measures
- **Observability**: Comprehensive monitoring và logging
- **DevOps Ready**: Automated CI/CD pipeline
- **Production Ready**: Docker containerization
- **Microservices Support**: Service-oriented architecture
- **Performance**: Optimized caching và database design

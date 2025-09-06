# DEPLOYMENT GUIDE - COFFEE & TEA E-COMMERCE

## 1. Deployment Options Overview

Dự án hỗ trợ 2 phương thức deployment theo yêu cầu NodeJS Final Project:

### Option 1: Public Cloud Hosting (Recommended)
- **Heroku**: Easy deployment, free tier available
- **Vercel**: Excellent for frontend, serverless functions
- **AWS**: Scalable, production-ready
- **Railway**: Modern alternative to Heroku
- **DigitalOcean**: VPS with good performance

### Option 2: Docker Compose (Local/Server)
- Containerized deployment
- Easy to reproduce across environments
- One-command deployment: `docker compose up -d`
- Includes all services (app, database, cache, etc.)

## 2. Public Cloud Deployment

### 2.1. Heroku Deployment

#### **Preparation Steps**
```bash
# 1. Install Heroku CLI
npm install -g heroku

# 2. Login to Heroku
heroku login

# 3. Create Heroku app
heroku create coffee-tea-ecommerce

# 4. Add PostgreSQL addon
heroku addons:create heroku-postgresql:mini

# 5. Add Redis addon
heroku addons:create heroku-redis:mini

# 6. Set environment variables
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your-super-secret-jwt-key-here
heroku config:set JWT_REFRESH_SECRET=your-refresh-secret-key-here
```

#### **Environment Variables Setup**
```bash
# Database (automatically set by Heroku PostgreSQL)
heroku config:set DATABASE_URL=postgresql://...

# Redis (automatically set by Heroku Redis)
heroku config:set REDIS_URL=redis://...

# Application settings
heroku config:set PORT=3000
heroku config:set SESSION_SECRET=your-session-secret
heroku config:set FRONTEND_URL=https://your-app.herokuapp.com

# Email service (using SendGrid)
heroku addons:create sendgrid:starter
heroku config:set EMAIL_FROM=noreply@your-app.com

# File upload (using Cloudinary)
heroku config:set CLOUDINARY_URL=cloudinary://...

# Social authentication
heroku config:set GOOGLE_CLIENT_ID=your-google-client-id
heroku config:set GOOGLE_CLIENT_SECRET=your-google-client-secret
heroku config:set FACEBOOK_APP_ID=your-facebook-app-id
heroku config:set FACEBOOK_APP_SECRET=your-facebook-app-secret

# Security
heroku config:set CORS_ORIGIN=https://your-app.herokuapp.com
heroku config:set RATE_LIMIT_WINDOW_MS=900000
heroku config:set RATE_LIMIT_MAX=100
```

#### **Heroku Configuration Files**

**package.json scripts:**
```json
{
  "scripts": {
    "start": "node server.js",
    "build": "npm run build:frontend && npm run build:backend",
    "build:frontend": "cd frontend && npm run build",
    "build:backend": "echo 'Backend build complete'",
    "heroku-postbuild": "npm run build",
    "migrate": "node scripts/migrate.js",
    "seed": "node scripts/seed.js"
  },
  "engines": {
    "node": "18.x",
    "npm": "9.x"
  }
}
```

**Procfile:**
```
web: npm start
worker: node workers/emailWorker.js
release: npm run migrate
```

**app.json (for Heroku Button):**
```json
{
  "name": "Coffee & Tea E-commerce",
  "description": "A full-featured e-commerce platform for coffee and tea products",
  "repository": "https://github.com/yourusername/coffee-tea-ecommerce",
  "logo": "https://your-logo-url.com/logo.png",
  "keywords": ["node", "express", "react", "postgresql", "ecommerce"],
  "image": "heroku/nodejs",
  "addons": [
    {
      "plan": "heroku-postgresql:mini"
    },
    {
      "plan": "heroku-redis:mini"
    },
    {
      "plan": "sendgrid:starter"
    }
  ],
  "env": {
    "NODE_ENV": {
      "description": "Node environment",
      "value": "production"
    },
    "JWT_SECRET": {
      "description": "Secret key for JWT tokens",
      "generator": "secret"
    },
    "JWT_REFRESH_SECRET": {
      "description": "Secret key for JWT refresh tokens",
      "generator": "secret"
    },
    "SESSION_SECRET": {
      "description": "Secret key for sessions",
      "generator": "secret"
    }
  },
  "scripts": {
    "postdeploy": "npm run seed"
  }
}
```

#### **Deployment Commands**
```bash
# Deploy to Heroku
git add .
git commit -m "Deploy to Heroku"
git push heroku main

# Run database migrations
heroku run npm run migrate

# Seed sample data
heroku run npm run seed

# View logs
heroku logs --tail

# Open app
heroku open
```

### 2.2. Vercel Deployment (Frontend + Serverless)

#### **Frontend Deployment**
```json
// vercel.json
{
  "version": 2,
  "builds": [
    {
      "src": "frontend/package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "https://your-backend-api.herokuapp.com/api/$1"
    },
    {
      "src": "/(.*)",
      "dest": "frontend/$1"
    }
  ],
  "env": {
    "VITE_API_URL": "https://your-backend-api.herokuapp.com/api/v1",
    "VITE_GOOGLE_CLIENT_ID": "@google_client_id",
    "VITE_FACEBOOK_APP_ID": "@facebook_app_id"
  }
}
```

#### **Environment Variables for Vercel**
```bash
# Using Vercel CLI
vercel env add VITE_API_URL production
vercel env add VITE_GOOGLE_CLIENT_ID production
vercel env add VITE_FACEBOOK_APP_ID production
```

### 2.3. AWS Deployment

#### **AWS Infrastructure Setup**
```yaml
# cloudformation-template.yml
AWSTemplateFormatVersion: '2010-09-09'
Description: 'Coffee & Tea E-commerce Infrastructure'

Resources:
  # VPC
  VPC:
    Type: AWS::EC2::VPC
    Properties:
      CidrBlock: 10.0.0.0/16
      EnableDnsHostnames: true
      EnableDnsSupport: true

  # Internet Gateway
  InternetGateway:
    Type: AWS::EC2::InternetGateway

  # Public Subnet
  PublicSubnet:
    Type: AWS::EC2::Subnet
    Properties:
      VpcId: !Ref VPC
      CidrBlock: 10.0.1.0/24
      AvailabilityZone: !Select [0, !GetAZs '']

  # RDS Database
  DatabaseSubnetGroup:
    Type: AWS::RDS::DBSubnetGroup
    Properties:
      DBSubnetGroupDescription: Subnet group for RDS database
      SubnetIds:
        - !Ref PublicSubnet
        - !Ref PrivateSubnet

  Database:
    Type: AWS::RDS::DBInstance
    Properties:
      DBInstanceIdentifier: coffee-tea-db
      DBInstanceClass: db.t3.micro
      Engine: postgres
      EngineVersion: '15.4'
      MasterUsername: postgres
      MasterUserPassword: !Ref DatabasePassword
      AllocatedStorage: 20
      DBSubnetGroupName: !Ref DatabaseSubnetGroup
      PubliclyAccessible: false

  # ElastiCache Redis
  RedisSubnetGroup:
    Type: AWS::ElastiCache::SubnetGroup
    Properties:
      Description: Subnet group for Redis
      SubnetIds:
        - !Ref PublicSubnet

  RedisCluster:
    Type: AWS::ElastiCache::CacheCluster
    Properties:
      CacheNodeType: cache.t3.micro
      Engine: redis
      NumCacheNodes: 1
      CacheSubnetGroupName: !Ref RedisSubnetGroup

  # ECS Cluster
  ECSCluster:
    Type: AWS::ECS::Cluster
    Properties:
      ClusterName: coffee-tea-cluster

  # Load Balancer
  LoadBalancer:
    Type: AWS::ElasticLoadBalancingV2::LoadBalancer
    Properties:
      Type: application
      Scheme: internet-facing
      Subnets:
        - !Ref PublicSubnet

Parameters:
  DatabasePassword:
    Type: String
    NoEcho: true
    Description: Password for RDS database
```

#### **ECS Task Definition**
```json
{
  "family": "coffee-tea-app",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "512",
  "executionRoleArn": "arn:aws:iam::account:role/ecsTaskExecutionRole",
  "containerDefinitions": [
    {
      "name": "coffee-tea-api",
      "image": "your-account.dkr.ecr.region.amazonaws.com/coffee-tea-api:latest",
      "portMappings": [
        {
          "containerPort": 3000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        },
        {
          "name": "PORT",
          "value": "3000"
        }
      ],
      "secrets": [
        {
          "name": "DATABASE_URL",
          "valueFrom": "arn:aws:secretsmanager:region:account:secret:coffee-tea-db"
        },
        {
          "name": "JWT_SECRET",
          "valueFrom": "arn:aws:secretsmanager:region:account:secret:jwt-secret"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/coffee-tea-app",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```

## 3. Docker Compose Deployment

### 3.1. Complete Docker Compose Setup

#### **docker-compose.yml**
```yaml
version: '3.8'

services:
  # Frontend Service
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - VITE_API_URL=http://localhost:5000/api/v1
    depends_on:
      - backend
    volumes:
      - frontend_node_modules:/app/node_modules
    restart: unless-stopped

  # Backend Service
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - PORT=5000
      - DATABASE_URL=postgresql://postgres:password@postgres:5432/coffee_tea_db
      - REDIS_URL=redis://redis:6379
      - JWT_SECRET=your-super-secret-jwt-key-for-production-change-this
      - JWT_REFRESH_SECRET=your-refresh-secret-key-for-production-change-this
      - EMAIL_HOST=mailhog
      - EMAIL_PORT=1025
      - EMAIL_FROM=noreply@coffeetea.local
      - CLOUDINARY_URL=cloudinary://your-cloudinary-url
      - CORS_ORIGIN=http://localhost:3000
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_started
    volumes:
      - backend_node_modules:/app/node_modules
      - ./logs:/app/logs
    restart: unless-stopped

  # Nginx Reverse Proxy
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/ssl:/etc/nginx/ssl:ro
      - ./logs/nginx:/var/log/nginx
    depends_on:
      - frontend
      - backend
    restart: unless-stopped

  # PostgreSQL Database
  postgres:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=coffee_tea_db
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
      - POSTGRES_INITDB_ARGS=--encoding=UTF-8 --lc-collate=C --lc-ctype=C
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./database/init.sql:/docker-entrypoint-initdb.d/01-init.sql:ro
      - ./database/seed.sql:/docker-entrypoint-initdb.d/02-seed.sql:ro
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5
    restart: unless-stopped

  # Redis Cache
  redis:
    image: redis:7-alpine
    command: redis-server --appendonly yes --requirepass redis_password
    volumes:
      - redis_data:/data
      - ./redis/redis.conf:/etc/redis/redis.conf:ro
    ports:
      - "6379:6379"
    healthcheck:
      test: ["CMD", "redis-cli", "--raw", "incr", "ping"]
      interval: 10s
      timeout: 3s
      retries: 5
    restart: unless-stopped

  # ElasticSearch (Bonus Feature)
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.11.0
    environment:
      - discovery.type=single-node
      - xpack.security.enabled=false
      - ES_JAVA_OPTS=-Xms512m -Xmx512m
    volumes:
      - elasticsearch_data:/usr/share/elasticsearch/data
    ports:
      - "9200:9200"
    healthcheck:
      test: ["CMD-SHELL", "curl -f http://localhost:9200/_cluster/health || exit 1"]
      interval: 30s
      timeout: 10s
      retries: 5
    restart: unless-stopped

  # MailHog (Email Testing)
  mailhog:
    image: mailhog/mailhog:latest
    ports:
      - "1025:1025"  # SMTP
      - "8025:8025"  # Web UI
    restart: unless-stopped

  # Prometheus (Monitoring)
  prometheus:
    image: prom/prometheus:latest
    ports:
      - "9090:9090"
    volumes:
      - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml:ro
      - prometheus_data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--web.console.libraries=/etc/prometheus/console_libraries'
      - '--web.console.templates=/etc/prometheus/consoles'
    restart: unless-stopped

  # Grafana (Dashboards)
  grafana:
    image: grafana/grafana:latest
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
    volumes:
      - grafana_data:/var/lib/grafana
      - ./monitoring/grafana/dashboards:/etc/grafana/provisioning/dashboards:ro
    depends_on:
      - prometheus
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
  elasticsearch_data:
  prometheus_data:
  grafana_data:
  frontend_node_modules:
  backend_node_modules:

networks:
  default:
    driver: bridge
```

### 3.2. Individual Dockerfiles

#### **Frontend Dockerfile**
```dockerfile
# frontend/Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

# Build application
RUN npm run build

# Production stage
FROM nginx:alpine AS production

# Copy built files
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Create non-root user
RUN addgroup -g 1001 -S nginx && \
    adduser -S nginx -u 1001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:80/ || exit 1

EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]
```

#### **Backend Dockerfile**
```dockerfile
# backend/Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

# Install dependencies first (for better caching)
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copy source code
COPY . .

# Production stage
FROM node:18-alpine AS production

WORKDIR /app

# Create app directory and user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copy dependencies and source
COPY --from=builder --chown=nodejs:nodejs /app .

# Create necessary directories
RUN mkdir -p logs uploads && \
    chown -R nodejs:nodejs logs uploads

# Switch to non-root user
USER nodejs

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js

EXPOSE 5000

CMD ["npm", "start"]
```

### 3.3. Nginx Configuration

#### **nginx/nginx.conf**
```nginx
events {
    worker_connections 1024;
}

http {
    upstream frontend {
        server frontend:3000;
    }

    upstream backend {
        server backend:5000;
    }

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=login:10m rate=1r/s;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/javascript
        application/json
        application/xml+rss;

    server {
        listen 80;
        server_name localhost;

        # Security headers
        add_header X-Frame-Options DENY;
        add_header X-Content-Type-Options nosniff;
        add_header X-XSS-Protection "1; mode=block";
        add_header Referrer-Policy strict-origin-when-cross-origin;

        # API routes
        location /api/ {
            limit_req zone=api burst=20 nodelay;
            
            proxy_pass http://backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            
            # Timeouts
            proxy_connect_timeout 60s;
            proxy_send_timeout 60s;
            proxy_read_timeout 60s;
        }

        # Login rate limiting
        location /api/v1/auth/login {
            limit_req zone=login burst=5 nodelay;
            proxy_pass http://backend;
        }

        # WebSocket support
        location /ws/ {
            proxy_pass http://backend;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
            proxy_set_header Host $host;
        }

        # Frontend routes
        location / {
            proxy_pass http://frontend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;

            # Handle client-side routing
            try_files $uri $uri/ /index.html;
        }

        # Static files caching
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
            access_log off;
        }

        # Health check
        location /health {
            access_log off;
            return 200 "healthy\n";
            add_header Content-Type text/plain;
        }
    }

    # HTTPS server (if SSL certificates are available)
    server {
        listen 443 ssl http2;
        server_name localhost;

        ssl_certificate /etc/nginx/ssl/cert.pem;
        ssl_certificate_key /etc/nginx/ssl/key.pem;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384;
        ssl_prefer_server_ciphers off;

        # Same location blocks as HTTP server
        # ... (copy from above)
    }
}
```

### 3.4. Database Initialization

#### **database/init.sql**
```sql
-- database/init.sql
-- Create database and extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Enable row level security
ALTER DATABASE coffee_tea_db SET row_security = on;

-- Create custom types
CREATE TYPE order_status AS ENUM ('pending', 'confirmed', 'preparing', 'shipping', 'delivered', 'cancelled');
CREATE TYPE user_role AS ENUM ('customer', 'admin');

-- Create indexes for performance
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_search 
ON products USING gin(to_tsvector('english', name || ' ' || description));

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_status_date 
ON orders(status, created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_category_active 
ON products(category_id, is_active) WHERE is_active = true;
```

#### **database/seed.sql**
```sql
-- database/seed.sql
-- Insert sample categories
INSERT INTO categories (id, name, slug, description) VALUES
('cat-1', 'Coffee & Espresso', 'coffee-espresso', 'All types of coffee and espresso drinks'),
('cat-2', 'Tea & Beverages', 'tea-beverages', 'Traditional teas and modern beverages'),
('cat-3', 'Food & Snacks', 'food-snacks', 'Delicious food items and snacks');

-- Insert sample brands
INSERT INTO brands (id, name, description) VALUES
('brand-1', 'House Blend', 'Our signature coffee blends'),
('brand-2', 'Premium Tea Co.', 'High quality tea selections'),
('brand-3', 'Artisan Bakery', 'Fresh baked goods daily');

-- Insert sample products
INSERT INTO products (id, name, slug, description, category_id, brand_id, base_price, images, is_active) VALUES
('prod-1', 'Vietnamese Drip Coffee', 'vietnamese-drip-coffee', 
 'Authentic Vietnamese coffee experience with rich, bold flavors that will awaken your senses. Made from premium Robusta beans sourced directly from the highlands of Vietnam.', 
 'cat-1', 'brand-1', 45000, 
 '["https://example.com/coffee1.jpg", "https://example.com/coffee2.jpg", "https://example.com/coffee3.jpg"]', 
 true),
('prod-2', 'Earl Grey Tea', 'earl-grey-tea',
 'Classic Earl Grey tea with bergamot oil, delivering a sophisticated and aromatic tea experience. Perfect for afternoon tea time with a hint of citrus.', 
 'cat-2', 'brand-2', 35000,
 '["https://example.com/tea1.jpg", "https://example.com/tea2.jpg", "https://example.com/tea3.jpg"]',
 true);

-- Insert product variants (ensuring each product has at least 2)
INSERT INTO product_variants (id, product_id, variant_name, variant_type, price_adjustment, stock_quantity, sku) VALUES
-- Vietnamese Coffee variants
('var-1', 'prod-1', 'Small', 'size', 0, 100, 'VDC-S-001'),
('var-2', 'prod-1', 'Medium', 'size', 5000, 80, 'VDC-M-001'),
('var-3', 'prod-1', 'Large', 'size', 10000, 60, 'VDC-L-001'),
('var-4', 'prod-1', 'Hot', 'preparation', 0, 200, 'VDC-HOT-001'),
('var-5', 'prod-1', 'Iced', 'preparation', 0, 150, 'VDC-ICE-001'),

-- Earl Grey variants
('var-6', 'prod-2', 'Small', 'size', 0, 120, 'EGT-S-001'),
('var-7', 'prod-2', 'Medium', 'size', 5000, 90, 'EGT-M-001');

-- Insert admin user
INSERT INTO admin_users (id, username, email, password_hash, full_name, is_active) VALUES
('admin-1', 'admin', 'admin@coffeetea.com', '$2b$12$hash_here_replace_with_actual_hash', 'System Administrator', true);

-- Insert discount codes
INSERT INTO discount_codes (id, code, type, value, usage_limit, used_count, is_active) VALUES
('disc-1', 'SAVE15', 'percentage', 15, 10, 0, true),
('disc-2', 'WELCOME10', 'percentage', 10, 100, 0, true),
('disc-3', 'FIXED20K', 'fixed', 20000, 50, 0, true);
```

## 4. Deployment Scripts

### 4.1. Automated Deployment Script

#### **scripts/deploy.sh**
```bash
#!/bin/bash

# Coffee & Tea E-commerce Deployment Script
set -e

echo "🚀 Starting Coffee & Tea E-commerce Deployment..."

# Configuration
DOCKER_COMPOSE_FILE="docker-compose.yml"
BACKUP_DIR="./backups"
LOG_FILE="./logs/deployment.log"

# Create necessary directories
mkdir -p logs backups

# Function to log messages
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
check_prerequisites() {
    log "🔍 Checking prerequisites..."
    
    if ! command_exists docker; then
        log "❌ Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    if ! command_exists docker-compose; then
        log "❌ Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    log "✅ Prerequisites check passed"
}

# Backup existing data
backup_data() {
    log "📦 Creating backup..."
    
    if [ -f "$DOCKER_COMPOSE_FILE" ]; then
        # Create backup of database
        docker-compose exec -T postgres pg_dump -U postgres coffee_tea_db > "$BACKUP_DIR/db_backup_$(date +%Y%m%d_%H%M%S).sql" 2>/dev/null || true
        
        # Backup uploads directory
        if [ -d "./uploads" ]; then
            tar -czf "$BACKUP_DIR/uploads_backup_$(date +%Y%m%d_%H%M%S).tar.gz" uploads/ 2>/dev/null || true
        fi
    fi
    
    log "✅ Backup completed"
}

# Pull latest images
pull_images() {
    log "⬇️  Pulling latest Docker images..."
    docker-compose pull
    log "✅ Images pulled successfully"
}

# Build and start services
deploy_services() {
    log "🏗️  Building and starting services..."
    
    # Build images
    docker-compose build --no-cache
    
    # Start services
    docker-compose up -d
    
    log "✅ Services deployed successfully"
}

# Wait for services to be healthy
wait_for_services() {
    log "⏳ Waiting for services to be healthy..."
    
    # Wait for database
    echo "Waiting for PostgreSQL..."
    until docker-compose exec postgres pg_isready -U postgres; do
        sleep 2
    done
    
    # Wait for backend API
    echo "Waiting for Backend API..."
    until curl -f http://localhost:5000/health >/dev/null 2>&1; do
        sleep 2
    done
    
    # Wait for frontend
    echo "Waiting for Frontend..."
    until curl -f http://localhost:3000 >/dev/null 2>&1; do
        sleep 2
    done
    
    log "✅ All services are healthy"
}

# Run database migrations
run_migrations() {
    log "🗃️  Running database migrations..."
    docker-compose exec backend npm run migrate || true
    log "✅ Migrations completed"
}

# Verify deployment
verify_deployment() {
    log "🔍 Verifying deployment..."
    
    # Check if all containers are running
    if [ "$(docker-compose ps -q | wc -l)" -eq "$(docker-compose ps -q --filter 'status=running' | wc -l)" ]; then
        log "✅ All containers are running"
    else
        log "❌ Some containers are not running"
        docker-compose ps
        exit 1
    fi
    
    # Check API health
    if curl -f http://localhost:5000/health >/dev/null 2>&1; then
        log "✅ Backend API is healthy"
    else
        log "❌ Backend API health check failed"
        exit 1
    fi
    
    # Check frontend
    if curl -f http://localhost:3000 >/dev/null 2>&1; then
        log "✅ Frontend is accessible"
    else
        log "❌ Frontend accessibility check failed"
        exit 1
    fi
    
    log "✅ Deployment verification passed"
}

# Main deployment function
main() {
    log "🚀 Coffee & Tea E-commerce Deployment Started"
    
    check_prerequisites
    backup_data
    pull_images
    deploy_services
    wait_for_services
    run_migrations
    verify_deployment
    
    log "🎉 Deployment completed successfully!"
    log "📱 Frontend: http://localhost:3000"
    log "🔧 Backend API: http://localhost:5000"
    log "📊 Grafana: http://localhost:3001 (admin/admin)"
    log "📧 MailHog: http://localhost:8025"
    log "👨‍💼 Admin Login: admin/admin"
}

# Handle script arguments
case "${1:-deploy}" in
    "deploy")
        main
        ;;
    "stop")
        log "🛑 Stopping services..."
        docker-compose down
        log "✅ Services stopped"
        ;;
    "restart")
        log "🔄 Restarting services..."
        docker-compose restart
        log "✅ Services restarted"
        ;;
    "logs")
        docker-compose logs -f
        ;;
    "status")
        docker-compose ps
        ;;
    "backup")
        backup_data
        ;;
    *)
        echo "Usage: $0 {deploy|stop|restart|logs|status|backup}"
        exit 1
        ;;
esac
```

### 4.2. Environment Setup Script

#### **scripts/setup-env.sh**
```bash
#!/bin/bash

# Environment Setup Script
set -e

echo "🔧 Setting up Coffee & Tea E-commerce environment..."

# Generate secure secrets
generate_secret() {
    openssl rand -base64 32
}

# Create environment files
create_env_files() {
    echo "📝 Creating environment files..."
    
    # Backend environment
    cat > backend/.env << EOF
# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/coffee_tea_db

# Redis
REDIS_URL=redis://localhost:6379

# JWT Secrets
JWT_SECRET=$(generate_secret)
JWT_REFRESH_SECRET=$(generate_secret)

# Session
SESSION_SECRET=$(generate_secret)

# Email (Development - using MailHog)
EMAIL_HOST=localhost
EMAIL_PORT=1025
EMAIL_FROM=noreply@coffeetea.local

# File Upload
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=5242880

# CORS
CORS_ORIGIN=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100

# Logging
LOG_LEVEL=info
LOG_FILE=./logs/app.log

# Social Authentication (replace with your credentials)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
FACEBOOK_APP_ID=your-facebook-app-id
FACEBOOK_APP_SECRET=your-facebook-app-secret

# Cloudinary (replace with your credentials)
CLOUDINARY_URL=cloudinary://api_key:api_secret@cloud_name
EOF

    # Frontend environment
    cat > frontend/.env << EOF
# API Configuration
VITE_API_URL=http://localhost:5000/api/v1
VITE_WS_URL=ws://localhost:5000

# Social Authentication
VITE_GOOGLE_CLIENT_ID=your-google-client-id
VITE_FACEBOOK_APP_ID=your-facebook-app-id

# Application
VITE_APP_NAME=Coffee & Tea E-commerce
VITE_APP_VERSION=1.0.0
EOF

    echo "✅ Environment files created"
}

# Setup SSL certificates (self-signed for development)
setup_ssl() {
    echo "🔐 Setting up SSL certificates..."
    
    mkdir -p nginx/ssl
    
    if [ ! -f nginx/ssl/cert.pem ]; then
        openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
            -keyout nginx/ssl/key.pem \
            -out nginx/ssl/cert.pem \
            -subj "/C=VN/ST=HCM/L=HoChiMinh/O=CoffeeTea/CN=localhost"
        
        echo "✅ SSL certificates generated"
    else
        echo "✅ SSL certificates already exist"
    fi
}

# Create necessary directories
create_directories() {
    echo "📁 Creating necessary directories..."
    
    mkdir -p logs uploads backend/uploads frontend/dist
    mkdir -p database monitoring/grafana/dashboards
    
    # Set permissions
    chmod 755 logs uploads backend/uploads
    
    echo "✅ Directories created"
}

# Download monitoring configurations
setup_monitoring() {
    echo "📊 Setting up monitoring configuration..."
    
    # Prometheus configuration
    cat > monitoring/prometheus.yml << EOF
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'coffee-tea-api'
    static_configs:
      - targets: ['backend:5000']
    metrics_path: '/metrics'
    scrape_interval: 5s

  - job_name: 'node-exporter'
    static_configs:
      - targets: ['node-exporter:9100']

  - job_name: 'postgres-exporter'
    static_configs:
      - targets: ['postgres-exporter:9187']
EOF

    # Grafana dashboard
    cat > monitoring/grafana/dashboards/coffee-tea-dashboard.json << 'EOF'
{
  "dashboard": {
    "title": "Coffee & Tea E-commerce Dashboard",
    "panels": [
      {
        "title": "API Response Time",
        "type": "graph",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, http_request_duration_seconds_bucket)"
          }
        ]
      },
      {
        "title": "Active Users",
        "type": "stat",
        "targets": [
          {
            "expr": "websocket_active_connections"
          }
        ]
      }
    ]
  }
}
EOF

    echo "✅ Monitoring configuration setup complete"
}

# Install dependencies
install_dependencies() {
    echo "📦 Installing dependencies..."
    
    if [ -f "backend/package.json" ]; then
        cd backend && npm install && cd ..
        echo "✅ Backend dependencies installed"
    fi
    
    if [ -f "frontend/package.json" ]; then
        cd frontend && npm install && cd ..
        echo "✅ Frontend dependencies installed"
    fi
}

# Main setup function
main() {
    echo "🚀 Starting environment setup..."
    
    create_directories
    create_env_files
    setup_ssl
    setup_monitoring
    install_dependencies
    
    echo "🎉 Environment setup completed!"
    echo ""
    echo "Next steps:"
    echo "1. Update social authentication credentials in .env files"
    echo "2. Update Cloudinary credentials if using file uploads"
    echo "3. Run: chmod +x scripts/deploy.sh"
    echo "4. Run: ./scripts/deploy.sh"
}

main
```

### 4.3. Health Check Script

#### **scripts/healthcheck.js**
```javascript
// scripts/healthcheck.js
const http = require('http');
const { Pool } = require('pg');

const config = {
  apiUrl: process.env.API_URL || 'http://localhost:5000',
  dbUrl: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/coffee_tea_db',
  timeout: 5000
};

async function checkApi() {
  return new Promise((resolve, reject) => {
    const req = http.get(`${config.apiUrl}/health`, { timeout: config.timeout }, (res) => {
      if (res.statusCode === 200) {
        resolve({ service: 'api', status: 'healthy' });
      } else {
        reject(new Error(`API health check failed with status ${res.statusCode}`));
      }
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('API health check timeout'));
    });

    req.on('error', (err) => {
      reject(new Error(`API health check error: ${err.message}`));
    });
  });
}

async function checkDatabase() {
  const pool = new Pool({
    connectionString: config.dbUrl,
    connectionTimeoutMillis: config.timeout
  });

  try {
    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();
    await pool.end();
    return { service: 'database', status: 'healthy' };
  } catch (error) {
    throw new Error(`Database health check failed: ${error.message}`);
  }
}

async function runHealthCheck() {
  const checks = [
    checkApi(),
    checkDatabase()
  ];

  try {
    const results = await Promise.all(checks);
    console.log('✅ All health checks passed');
    results.forEach(result => {
      console.log(`  ${result.service}: ${result.status}`);
    });
    process.exit(0);
  } catch (error) {
    console.error('❌ Health check failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  runHealthCheck();
}

module.exports = { checkApi, checkDatabase, runHealthCheck };
```

## 5. Production Deployment Checklist

### 5.1. Pre-Deployment Checklist
- [ ] All environment variables configured
- [ ] Database migrations tested
- [ ] SSL certificates configured
- [ ] Backup strategy implemented
- [ ] Monitoring tools setup
- [ ] Security headers configured
- [ ] Rate limiting enabled
- [ ] Error logging configured
- [ ] Health checks implemented
- [ ] Performance tested

### 5.2. Security Checklist
- [ ] JWT secrets are strong and unique
- [ ] Database credentials secured
- [ ] CORS properly configured
- [ ] Input validation enabled
- [ ] SQL injection protection
- [ ] XSS protection headers
- [ ] Rate limiting configured
- [ ] HTTPS enforced
- [ ] File upload restrictions
- [ ] Admin access secured

### 5.3. Post-Deployment Verification
- [ ] All services running
- [ ] Database connectivity
- [ ] API endpoints responding
- [ ] Frontend accessible
- [ ] Email service working
- [ ] File uploads working
- [ ] Payment integration (if applicable)
- [ ] Admin dashboard accessible
- [ ] Monitoring dashboards active
- [ ] Backup process verified

---

**Admin Credentials (Default):**
- Username: `admin`
- Password: `admin`
- Email: `admin@coffeetea.com`

**Important:** Change default credentials after first login!

**Public URLs (for submission):**
- Frontend: `https://your-app-name.herokuapp.com`
- API: `https://your-app-name.herokuapp.com/api/v1`
- Admin: `https://your-app-name.herokuapp.com/admin`

**Docker Commands:**
```bash
# Deploy
docker compose up -d

# Stop
docker compose down

# View logs
docker compose logs -f

# Status
docker compose ps
```

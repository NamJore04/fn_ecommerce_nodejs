# DATABASE SETUP & CONFIGURATION GUIDE

## 🗄️ PostgreSQL Database Setup

### Prerequisites
- PostgreSQL 15.4+ installed locally or cloud instance
- Node.js 18.17+ with npm
- Database administration tool (pgAdmin, DBeaver, or psql CLI)

---

## 📋 STEP-BY-STEP SETUP

### 1. Local PostgreSQL Installation

#### Windows Setup:
```powershell
# Download PostgreSQL from official website
# https://www.postgresql.org/download/windows/

# Or use Chocolatey
choco install postgresql --params '/Password:your_password'

# Or use Scoop
scoop install postgresql
```

#### Alternative: Docker Setup (Recommended for Development)
```powershell
# Create docker-compose.yml
docker-compose up -d

# Check container status
docker-compose ps
```

### 2. Database Configuration

#### Environment Variables (.env.local)
```bash
# Database Configuration
DATABASE_URL="postgresql://coffee_user:secure_password@localhost:5432/coffee_tea_db"
DB_HOST="localhost"
DB_PORT="5432"
DB_NAME="coffee_tea_db"
DB_USER="coffee_user"
DB_PASSWORD="secure_password"

# Connection Pool Settings
DB_POOL_MIN=2
DB_POOL_MAX=10
DB_POOL_IDLE_TIMEOUT=30000

# Redis Cache Configuration
REDIS_URL="redis://localhost:6379"
REDIS_HOST="localhost"
REDIS_PORT="6379"
REDIS_PASSWORD=""
```

#### Database Creation Script
```sql
-- Connect as postgres superuser
-- CREATE DATABASE AND USER

-- Create database
CREATE DATABASE coffee_tea_db;

-- Create user with secure password
CREATE USER coffee_user WITH ENCRYPTED PASSWORD 'secure_password';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE coffee_tea_db TO coffee_user;

-- Connect to the database
\c coffee_tea_db

-- Grant schema privileges
GRANT ALL ON SCHEMA public TO coffee_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO coffee_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO coffee_user;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
```

---

## 🛠️ PRISMA ORM SETUP

### 1. Initialize Prisma
```bash
npm install prisma @prisma/client
npx prisma init
```

### 2. Prisma Schema Configuration
```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// Core Models
model User {
  id            String   @id @default(uuid()) @db.Uuid
  email         String   @unique @db.VarChar(255)
  passwordHash  String?  @map("password_hash") @db.VarChar(255)
  fullName      String   @map("full_name") @db.VarChar(255)
  phone         String?  @db.VarChar(20)
  loyaltyPoints Int      @default(0) @map("loyalty_points")
  socialAuth    Json?    @map("social_auth")
  isActive      Boolean  @default(true) @map("is_active")
  createdAt     DateTime @default(now()) @map("created_at") @db.Timestamp()
  updatedAt     DateTime @updatedAt @map("updated_at") @db.Timestamp()

  // Relations
  addresses UserAddress[]
  orders    Order[]
  cartItems CartItem[]
  reviews   ProductReview[]

  @@map("users")
}

model Category {
  id          String   @id @default(uuid()) @db.Uuid
  name        String   @unique @db.VarChar(100)
  slug        String   @unique @db.VarChar(100)
  description String?  @db.Text
  imageUrl    String?  @map("image_url") @db.VarChar(500)
  isActive    Boolean  @default(true) @map("is_active")
  sortOrder   Int      @default(0) @map("sort_order")
  createdAt   DateTime @default(now()) @map("created_at") @db.Timestamp()

  // Relations
  products Product[]

  @@map("categories")
}

model Product {
  id            String  @id @default(uuid()) @db.Uuid
  name          String  @db.VarChar(255)
  slug          String  @unique @db.VarChar(255)
  description   String? @db.Text
  shortDesc     String? @map("short_desc") @db.VarChar(500)
  sku           String  @unique @db.VarChar(100)
  basePrice     Decimal @map("base_price") @db.Decimal(10, 2)
  comparePrice  Decimal? @map("compare_price") @db.Decimal(10, 2)
  stockQuantity Int     @default(0) @map("stock_quantity")
  
  // Product Images (JSON array)
  images        Json?   @db.Json
  
  // Product Tags & Metadata
  tags          String[] @db.VarChar(50)
  metaTitle     String?  @map("meta_title") @db.VarChar(255)
  metaDesc      String?  @map("meta_desc") @db.VarChar(500)
  
  // Product Status
  isActive      Boolean  @default(true) @map("is_active")
  isFeatured    Boolean  @default(false) @map("is_featured")
  
  // Timestamps
  createdAt     DateTime @default(now()) @map("created_at") @db.Timestamp()
  updatedAt     DateTime @updatedAt @map("updated_at") @db.Timestamp()

  // Foreign Keys
  categoryId    String   @map("category_id") @db.Uuid

  // Relations
  category      Category @relation(fields: [categoryId], references: [id])
  variants      ProductVariant[]
  cartItems     CartItem[]
  orderItems    OrderItem[]
  reviews       ProductReview[]

  @@map("products")
}

model ProductVariant {
  id              String  @id @default(uuid()) @db.Uuid
  productId       String  @map("product_id") @db.Uuid
  variantName     String  @map("variant_name") @db.VarChar(100)
  variantType     String  @map("variant_type") @db.VarChar(50)
  priceAdjustment Decimal @default(0) @map("price_adjustment") @db.Decimal(10, 2)
  stockQuantity   Int     @default(0) @map("stock_quantity")
  sku             String  @unique @db.VarChar(100)
  isActive        Boolean @default(true) @map("is_active")

  // Relations
  product         Product @relation(fields: [productId], references: [id], onDelete: Cascade)
  cartItems       CartItem[]
  orderItems      OrderItem[]

  @@map("product_variants")
}

model Order {
  id              String      @id @default(uuid()) @db.Uuid
  orderNumber     String      @unique @map("order_number") @db.VarChar(50)
  userId          String      @map("user_id") @db.Uuid
  status          OrderStatus @default(PENDING)
  
  // Pricing
  subtotal        Decimal     @db.Decimal(10, 2)
  taxAmount       Decimal     @default(0) @map("tax_amount") @db.Decimal(10, 2)
  shippingAmount  Decimal     @default(0) @map("shipping_amount") @db.Decimal(10, 2)
  discountAmount  Decimal     @default(0) @map("discount_amount") @db.Decimal(10, 2)
  totalAmount     Decimal     @map("total_amount") @db.Decimal(10, 2)
  
  // Shipping Information
  shippingAddress Json        @map("shipping_address") @db.Json
  billingAddress  Json?       @map("billing_address") @db.Json
  
  // Payment Information
  paymentMethod   String?     @map("payment_method") @db.VarChar(50)
  paymentStatus   PaymentStatus @default(PENDING) @map("payment_status")
  paymentId       String?     @map("payment_id") @db.VarChar(255)
  
  // Timestamps
  createdAt       DateTime    @default(now()) @map("created_at") @db.Timestamp()
  updatedAt       DateTime    @updatedAt @map("updated_at") @db.Timestamp()
  
  // Relations
  user            User @relation(fields: [userId], references: [id])
  items           OrderItem[]

  @@map("orders")
}

model OrderItem {
  id              String          @id @default(uuid()) @db.Uuid
  orderId         String          @map("order_id") @db.Uuid
  productId       String          @map("product_id") @db.Uuid
  variantId       String?         @map("variant_id") @db.Uuid
  quantity        Int
  unitPrice       Decimal         @map("unit_price") @db.Decimal(10, 2)
  totalPrice      Decimal         @map("total_price") @db.Decimal(10, 2)
  
  // Relations
  order           Order @relation(fields: [orderId], references: [id], onDelete: Cascade)
  product         Product @relation(fields: [productId], references: [id])
  variant         ProductVariant? @relation(fields: [variantId], references: [id])

  @@map("order_items")
}

model CartItem {
  id         String          @id @default(uuid()) @db.Uuid
  userId     String          @map("user_id") @db.Uuid
  productId  String          @map("product_id") @db.Uuid
  variantId  String?         @map("variant_id") @db.Uuid
  quantity   Int
  createdAt  DateTime        @default(now()) @map("created_at") @db.Timestamp()
  updatedAt  DateTime        @updatedAt @map("updated_at") @db.Timestamp()

  // Relations
  user       User @relation(fields: [userId], references: [id], onDelete: Cascade)
  product    Product @relation(fields: [productId], references: [id], onDelete: Cascade)
  variant    ProductVariant? @relation(fields: [variantId], references: [id])

  @@unique([userId, productId, variantId])
  @@map("cart_items")
}

model UserAddress {
  id          String  @id @default(uuid()) @db.Uuid
  userId      String  @map("user_id") @db.Uuid
  type        String  @db.VarChar(20) // 'shipping', 'billing'
  fullName    String  @map("full_name") @db.VarChar(255)
  company     String? @db.VarChar(255)
  address1    String  @map("address_1") @db.VarChar(255)
  address2    String? @map("address_2") @db.VarChar(255)
  city        String  @db.VarChar(100)
  state       String  @db.VarChar(100)
  postalCode  String  @map("postal_code") @db.VarChar(20)
  country     String  @db.VarChar(100)
  phone       String? @db.VarChar(20)
  isDefault   Boolean @default(false) @map("is_default")

  // Relations
  user        User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("user_addresses")
}

model ProductReview {
  id        String   @id @default(uuid()) @db.Uuid
  productId String   @map("product_id") @db.Uuid
  userId    String   @map("user_id") @db.Uuid
  rating    Int      @db.SmallInt // 1-5 stars
  title     String?  @db.VarChar(255)
  comment   String?  @db.Text
  isVerified Boolean @default(false) @map("is_verified")
  createdAt DateTime @default(now()) @map("created_at") @db.Timestamp()

  // Relations
  product   Product @relation(fields: [productId], references: [id], onDelete: Cascade)
  user      User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([productId, userId])
  @@map("product_reviews")
}

// Enums
enum OrderStatus {
  PENDING
  CONFIRMED
  PROCESSING
  SHIPPED
  DELIVERED
  CANCELLED
  REFUNDED
}

enum PaymentStatus {
  PENDING
  PAID
  FAILED
  REFUNDED
  CANCELLED
}
```

### 3. Database Migration Commands
```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma db push

# Reset database (development only)
npx prisma db reset

# Seed database
npx prisma db seed
```

---

## 🔧 CONNECTION POOL CONFIGURATION

### Database Connection Service
```typescript
// src/config/database.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});
```

---

## 🗃️ REDIS CACHE SETUP

### Redis Configuration
```typescript
// src/config/redis.ts
import { createClient } from 'redis';

const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
  socket: {
    connectTimeout: 60000,
    lazyConnect: true,
  },
  retry_delay: 100,
});

redisClient.on('error', (err) => {
  console.error('Redis Client Error:', err);
});

redisClient.on('connect', () => {
  console.log('✅ Redis connected successfully');
});

export { redisClient };
```

---

## ✅ VERIFICATION CHECKLIST

- [ ] PostgreSQL 15+ installed and running
- [ ] Database `coffee_tea_db` created
- [ ] User `coffee_user` created with proper permissions
- [ ] UUID extensions enabled
- [ ] Prisma schema configured
- [ ] Environment variables set
- [ ] Database connection tested
- [ ] Redis cache configured
- [ ] Connection pooling configured

---

## 🚀 NEXT STEPS

1. ✅ **Database Setup Complete**
2. 🔄 **Environment Configuration** (In Progress)
3. ⏳ **Authentication Module Setup**
4. ⏳ **API Endpoints Development**

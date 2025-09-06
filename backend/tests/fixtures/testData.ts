import { PrismaClient, User, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

/**
 * Test data fixtures and helper functions
 */

// Test users data
export const testUsers = {
  customer: {
    id: '11111111-2222-3333-4444-555555555555',
    email: 'customer@test.com',
    fullName: 'Test Customer',
    passwordHash: '', // Will be generated
    role: UserRole.CUSTOMER,
    emailVerified: true,
    isActive: true
  },
  admin: {
    id: '22222222-3333-4444-5555-666666666666',
    email: 'admin@test.com',
    fullName: 'Test Admin',
    passwordHash: '', // Will be generated
    role: UserRole.ADMIN,
    emailVerified: true,
    isActive: true
  },
  staff: {
    id: '33333333-4444-5555-6666-777777777777',
    email: 'staff@test.com',
    fullName: 'Test Staff',
    passwordHash: '', // Will be generated
    role: UserRole.STAFF,
    emailVerified: true,
    isActive: true
  }
} as const;

export const TEST_PASSWORD = 'SecureTest123@';

/**
 * Create test users with hashed passwords
 */
export async function createTestUsers(): Promise<{
  customer: User;
  admin: User;
  staff: User;
}> {
  const hashedPassword = await bcrypt.hash(TEST_PASSWORD, 12);
  
  // Update test users with hashed password
  const usersData = Object.values(testUsers).map(user => ({
    ...user,
    passwordHash: hashedPassword
  }));

  // Create users in database
  await prisma.user.createMany({
    data: usersData,
    skipDuplicates: true
  });

  // Fetch created users
  const customer = await prisma.user.findUnique({ where: { id: testUsers.customer.id } });
  const admin = await prisma.user.findUnique({ where: { id: testUsers.admin.id } });
  const staff = await prisma.user.findUnique({ where: { id: testUsers.staff.id } });

  if (!customer || !admin || !staff) {
    throw new Error('Failed to create test users');
  }

  return { customer, admin, staff };
}

/**
 * Generate JWT token for test user
 */
export function generateTestToken(user: User): string {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      role: user.role,
      iss: 'coffee-tea-ecommerce',
      aud: 'coffee-tea-users',
    },
    process.env.JWT_SECRET || 'coffee_tea_access_secret_2024',
    { expiresIn: '1h' }
  );
}

/**
 * Create authorization header for API tests
 */
export function getAuthHeader(user: User): Record<string, string> {
  const token = generateTestToken(user);
  return {
    Authorization: `Bearer ${token}`
  };
}

/**
 * Test categories data
 */
export const testCategories = [
  {
    id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    name: 'Coffee Test',
    slug: 'coffee-test',
    description: 'Coffee category for testing',
    isActive: true
  },
  {
    id: 'b2c3d4e5-f607-8901-bcde-f23456789012',
    name: 'Tea Test',
    slug: 'tea-test',
    description: 'Tea category for testing',
    isActive: true
  }
];

/**
 * Test products data
 */
export const testProducts = [
  {
    id: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
    name: 'Test Coffee Product',
    slug: 'test-coffee-product',
    description: 'A test coffee product',
    sku: 'TEST-COFFEE-001',
    basePrice: 19.99,
    stockQuantity: 50,
    categoryId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    isActive: true,
    weight: 250
  },
  {
    id: 'bbbbbbbb-cccc-dddd-eeee-ffffffffffff',
    name: 'Test Tea Product',
    slug: 'test-tea-product',
    description: 'A test tea product',
    sku: 'TEST-TEA-001',
    basePrice: 12.99,
    stockQuantity: 30,
    categoryId: 'b2c3d4e5-f607-8901-bcde-f23456789012',
    isActive: true,
    weight: 100
  }
];

/**
 * Create test products and categories
 */
export async function createTestProductsAndCategories() {
  // Create categories
  await prisma.category.createMany({
    data: testCategories,
    skipDuplicates: true
  });

  // Create products
  await prisma.product.createMany({
    data: testProducts,
    skipDuplicates: true
  });
}

/**
 * Clean test data
 */
export async function cleanTestData(): Promise<void> {
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.productReview.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();
}

/**
 * Create a test order
 */
export async function createTestOrder(userId: string, productId: string) {
  const order = await prisma.order.create({
    data: {
      userId,
      orderNumber: `ORD-${Date.now()}`,
      subtotal: 19.99,
      taxAmount: 2.00,
      shippingAmount: 5.00,
      totalAmount: 26.99,
      status: 'PENDING',
      paymentMethod: 'CASH_ON_DELIVERY',
      paymentStatus: 'PENDING',
      shippingAddress: {
        fullName: 'Test Customer',
        phone: '0123456789',
        address: '123 Test Street',
        city: 'Test City',
        state: 'Test State',
        postalCode: '12345',
        country: 'Vietnam'
      },
      items: {
        create: [{
          productId,
          productName: 'Test Coffee Product',
          sku: 'TEST-COFFEE-001',
          quantity: 1,
          unitPrice: 19.99,
          totalPrice: 19.99
        }]
      }
    },
    include: {
      items: true
    }
  });

  return order;
}

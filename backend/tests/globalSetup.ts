import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

// Load test environment variables
dotenv.config({ path: '.env.test' });

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || process.env.TEST_DATABASE_URL || 'postgresql://postgres:password@localhost:5432/coffee_tea_test'
    }
  }
});

/**
 * Global test setup
 * Runs once before all tests
 */
export default async (): Promise<void> => {
  console.log('🧪 Setting up test environment...');
  
  try {
    // Connect to test database
    await prisma.$connect();
    console.log('✅ Connected to test database');
    
    // Reset test database to clean state
    await resetTestDatabase();
    console.log('✅ Test database reset complete');
    
    // Seed test data
    await seedTestData();
    console.log('✅ Test data seeded');
    
  } catch (error) {
    console.error('❌ Test setup failed:', error);
    process.exit(1);
  }
};

/**
 * Reset test database to clean state
 */
async function resetTestDatabase(): Promise<void> {
  // Delete all data in reverse order of dependencies
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
 * Seed essential test data
 */
async function seedTestData(): Promise<void> {
  // Create test categories
  await prisma.category.createMany({
    data: [
      {
        id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        name: 'Coffee',
        slug: 'coffee',
        description: 'Premium coffee products',
        isActive: true
      },
      {
        id: 'b2c3d4e5-f607-8901-bcde-f23456789012',
        name: 'Tea',
        slug: 'tea',
        description: 'Premium tea products',
        isActive: true
      }
    ]
  });

  // Create test products
  await prisma.product.createMany({
    data: [
      {
        id: 'cccccccc-dddd-eeee-ffff-000000000001',
        name: 'Arabica Premium',
        slug: 'arabica-premium',
        description: 'Premium arabica coffee beans',
        sku: 'ARB-PREM-001',
        basePrice: 25.99,
        stockQuantity: 100,
        categoryId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        isActive: true,
        weight: 500
      },
      {
        id: 'dddddddd-eeee-ffff-0000-111111111111',
        name: 'Earl Grey Premium',
        slug: 'earl-grey-premium',
        description: 'Premium Earl Grey tea',
        sku: 'EG-PREM-001',
        basePrice: 15.99,
        stockQuantity: 50,
        categoryId: 'b2c3d4e5-f607-8901-bcde-f23456789012',
        isActive: true,
        weight: 100
      }
    ]
  });

  console.log('✅ Test categories and products created');
}

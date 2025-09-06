// Quick Database Test Script
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testDatabaseQueries() {
  console.log('🧪 Testing Database Queries...\n');

  try {
    // Test 1: Count categories
    const categoryCount = await prisma.category.count();
    console.log(`📂 Categories: ${categoryCount}`);

    // Test 2: Count products  
    const productCount = await prisma.product.count();
    console.log(`☕ Products: ${productCount}`);

    // Test 3: Count users
    const userCount = await prisma.user.count();
    console.log(`👥 Users: ${userCount}`);

    // Test 4: Count orders
    const orderCount = await prisma.order.count();
    console.log(`📦 Orders: ${orderCount}`);

    // Test 5: Get a sample product with details
    console.log('\n🔍 Sample Product Details:');
    const sampleProduct = await prisma.product.findFirst({
      include: {
        category: true,
        variants: true,
        reviews: true
      }
    });

    if (sampleProduct) {
      console.log(`   Name: ${sampleProduct.name}`);
      console.log(`   Category: ${sampleProduct.category.name}`);
      console.log(`   Price: $${sampleProduct.basePrice}`);
      console.log(`   Variants: ${sampleProduct.variants.length}`);
      console.log(`   Reviews: ${sampleProduct.reviews.length}`);
    }

    // Test 6: Get sample user with orders
    console.log('\n👤 Sample User with Orders:');
    const sampleUser = await prisma.user.findFirst({
      include: {
        orders: true,
        addresses: true
      }
    });

    if (sampleUser) {
      console.log(`   Name: ${sampleUser.fullName}`);
      console.log(`   Email: ${sampleUser.email}`);
      console.log(`   Orders: ${sampleUser.orders.length}`);
      console.log(`   Addresses: ${sampleUser.addresses.length}`);
    }

    console.log('\n✅ All database tests passed!');

  } catch (error) {
    console.error('❌ Database test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testDatabaseQueries();

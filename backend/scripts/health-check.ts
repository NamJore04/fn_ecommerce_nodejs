import { PrismaClient } from '@prisma/client';
import { createClient } from 'redis';

const prisma = new PrismaClient();

async function checkDatabaseHealth() {
  console.log('🔍 Checking database health...\n');

  // Test PostgreSQL connection
  try {
    console.log('📊 Testing PostgreSQL connection...');
    await prisma.$connect();
    
    // Test basic query
    const result = await prisma.$queryRaw`SELECT version()`;
    console.log('✅ PostgreSQL: Connected successfully');
    console.log(`   Version: ${JSON.stringify(result)}\n`);
    
    // Check if tables exist
    console.log('🔍 Checking database tables...');
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `;
    
    console.log(`✅ Found ${(tables as any[]).length} tables:`);
    (tables as any[]).forEach((table: any) => {
      console.log(`   - ${table.table_name}`);
    });
    console.log();

    // Check sample data
    console.log('📋 Checking sample data...');
    const userCount = await prisma.user.count();
    const productCount = await prisma.product.count();
    const categoryCount = await prisma.category.count();
    const orderCount = await prisma.order.count();

    console.log(`✅ Data summary:`);
    console.log(`   - Users: ${userCount}`);
    console.log(`   - Products: ${productCount}`);
    console.log(`   - Categories: ${categoryCount}`);
    console.log(`   - Orders: ${orderCount}\n`);

  } catch (error) {
    console.log('❌ PostgreSQL: Connection failed');
    console.log(`   Error: ${error}\n`);
    return false;
  }

  // Test Redis connection (optional)
  try {
    console.log('🔴 Testing Redis connection...');
    const redisClient = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379'
    });
    
    await redisClient.connect();
    await redisClient.ping();
    console.log('✅ Redis: Connected successfully');
    
    // Test set/get
    await redisClient.set('health_check', 'ok');
    const testValue = await redisClient.get('health_check');
    console.log(`   Test value: ${testValue}`);
    
    await redisClient.quit();
    console.log();
    
  } catch (error) {
    console.log('⚠️  Redis: Connection failed (optional service)');
    console.log(`   Error: ${error}`);
    console.log('   Note: Redis is optional for basic functionality\n');
  }

  return true;
}

async function main() {
  console.log('================================');
  console.log('🏥 COFFEE & TEA DATABASE HEALTH CHECK');
  console.log('================================\n');

  const isHealthy = await checkDatabaseHealth();

  if (isHealthy) {
    console.log('✅ Database is healthy and ready!');
    console.log('🚀 You can now start the server with: npm run dev\n');
  } else {
    console.log('❌ Database health check failed');
    console.log('Please check the setup and try again\n');
    process.exit(1);
  }

  await prisma.$disconnect();
}

main().catch((error) => {
  console.error('❌ Health check error:', error);
  process.exit(1);
});

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Global test teardown
 * Runs once after all tests
 */
export default async (): Promise<void> => {
  console.log('🧪 Cleaning up test environment...');
  
  try {
    // Disconnect from test database
    await prisma.$disconnect();
    console.log('✅ Disconnected from test database');
    
  } catch (error) {
    console.error('❌ Test teardown failed:', error);
  }
};

import { jest } from '@jest/globals';

// Extend Jest timeout for all tests
jest.setTimeout(30000);

// Mock console methods in test environment
const originalConsole = { ...console };

beforeAll(() => {
  // Suppress console logs during tests unless debugging
  if (process.env.NODE_ENV === 'test' && !process.env.DEBUG_TESTS) {
    console.log = jest.fn();
    console.info = jest.fn();
    console.warn = jest.fn();
  }
});

afterAll(() => {
  // Restore console methods
  console.log = originalConsole.log;
  console.info = originalConsole.info;
  console.warn = originalConsole.warn;
});

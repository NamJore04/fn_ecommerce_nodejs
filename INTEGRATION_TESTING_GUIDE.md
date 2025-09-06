# Integration Testing Guide - Coffee & Tea E-commerce Platform

## 🎯 Overview

This document provides comprehensive guidance for running and maintaining integration tests for the Coffee & Tea E-commerce Platform. The testing suite covers full system integration, authentication flows, business logic, and end-to-end user workflows.

## 📋 Test Suite Structure

```
backend/tests/
├── fixtures/           # Test data and helper data
│   └── testData.ts     # User, product, order test fixtures
├── helpers/            # Test utility functions
│   ├── testApp.ts      # Express app factory for testing
│   └── testHelpers.ts  # API, database, and performance helpers
├── integration/        # Integration test suites
│   ├── auth.integration.test.ts     # Authentication & authorization
│   ├── products.integration.test.ts # Product catalog functionality
│   └── orders.integration.test.ts   # Order management workflow
├── e2e/               # End-to-end workflow tests
│   └── complete-workflows.e2e.test.ts # Full user journeys
├── unit/              # Unit tests (for future expansion)
├── globalSetup.ts     # Test environment setup
├── globalTeardown.ts  # Test environment cleanup
└── setup.ts           # Jest configuration setup
```

## 🚀 Quick Start

### Prerequisites

1. **PostgreSQL Database**: Ensure PostgreSQL is running and accessible
2. **Test Database**: Create a separate test database
3. **Environment**: Copy `.env.test` with appropriate test configurations
4. **Dependencies**: All npm packages installed

### Running Tests

```bash
# Run all integration tests
npm run test

# Run specific test suites
npm run test:auth        # Authentication tests
npm run test:products    # Product catalog tests
npm run test:orders      # Order management tests
npm run test:workflows   # End-to-end workflow tests

# Run integration tests only
npm run test:integration

# Run with coverage report
npm run test:coverage

# Watch mode for development
npm run test:watch
```

### Windows Users

```cmd
# Run comprehensive test suite
.\scripts\run-integration-tests.bat

# Or individual npm commands
npm run test:auth
npm run test:products
npm run test:orders
npm run test:workflows
```

### Linux/Mac Users

```bash
# Run comprehensive test suite
chmod +x scripts/run-integration-tests.sh
./scripts/run-integration-tests.sh

# Or individual npm commands
npm run test:auth
npm run test:products
npm run test:orders
npm run test:workflows
```

## 🧪 Test Categories

### 1. Authentication Integration Tests (`auth.integration.test.ts`)

**Coverage:**
- User registration with validation
- Login/logout functionality
- JWT token security and authorization
- Role-based access control (Customer, Admin, Staff)
- Password security and strength validation
- Security measures and input sanitization

**Key Test Scenarios:**
- ✅ Customer registration and login flow
- ✅ Admin and staff authentication
- ✅ Token validation and expiration handling
- ✅ Permission-based endpoint access
- ✅ Security vulnerability protection
- ✅ Performance benchmarks for auth operations

### 2. Product Catalog Integration Tests (`products.integration.test.ts`)

**Coverage:**
- Product listing with pagination and filtering
- Product search and category filtering
- Product creation, update, and deletion (Admin)
- Stock management and availability
- Data validation and constraints

**Key Test Scenarios:**
- ✅ Public product browsing functionality
- ✅ Advanced filtering (category, price, search)
- ✅ Admin product management operations
- ✅ Authorization checks for CRUD operations
- ✅ Data validation and error handling
- ✅ Concurrent request handling

### 3. Order Management Integration Tests (`orders.integration.test.ts`)

**Coverage:**
- Order creation and validation
- Order status tracking and updates
- Payment method handling
- Shipping address management
- Order history and customer access
- Admin order management

**Key Test Scenarios:**
- ✅ Complete order creation workflow
- ✅ Order total calculations and validation
- ✅ Stock availability verification
- ✅ Order tracking functionality
- ✅ Status updates by admin/staff
- ✅ Customer order cancellation
- ✅ Cross-user order access prevention

### 4. End-to-End Workflow Tests (`complete-workflows.e2e.test.ts`)

**Coverage:**
- Complete customer journey (registration → purchase)
- Admin management workflows
- Cross-module data consistency
- Error handling and recovery
- Complex business scenarios

**Key Test Scenarios:**
- ✅ Full customer journey from registration to order completion
- ✅ Cart management and order creation
- ✅ Admin product and order management workflow
- ✅ Data consistency across all modules
- ✅ Error recovery and graceful degradation

## 🔧 Test Configuration

### Environment Variables (`.env.test`)

```env
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/coffee_tea_test"
NODE_ENV="test"

# JWT Configuration
JWT_SECRET="test-jwt-secret-key-for-testing-only"
JWT_REFRESH_SECRET="test-jwt-refresh-secret-key-for-testing-only"

# Performance
TEST_TIMEOUT="30000"
DEBUG_TESTS="false"
```

### Jest Configuration (`jest.config.js`)

- **Test Environment**: Node.js
- **Test Patterns**: `**/*.test.ts`, `**/*.spec.ts`
- **Setup/Teardown**: Global database setup and cleanup
- **Coverage**: Comprehensive coverage reporting
- **Timeout**: 30 seconds for complex workflows

## 📊 Test Data Management

### Test Fixtures

The testing suite uses predefined test data:

```typescript
// Test Users
- Customer: customer@test.com
- Admin: admin@test.com  
- Staff: staff@test.com

// Test Products
- Coffee products with realistic pricing
- Tea products with category associations
- Stock quantities for availability testing

// Test Categories
- Coffee and Tea categories
- Active/inactive status testing
```

### Data Isolation

- **Setup**: Each test gets fresh, isolated data
- **Cleanup**: Automatic cleanup between tests
- **No Pollution**: Tests don't affect each other
- **Realistic Data**: Production-like data scenarios

## 🎯 Testing Best Practices

### 1. Test Structure

```typescript
describe('Feature Name', () => {
  beforeEach(async () => {
    // Setup clean test environment
    await cleanTestData();
    testUsers = await createTestUsers();
  });

  it('should perform specific functionality', async () => {
    // Arrange: Setup test data
    const testData = { /* ... */ };
    
    // Act: Execute the functionality
    const response = await helpers.api.post('/api/endpoint', testData);
    
    // Assert: Verify results
    helpers.api.expectSuccess(response, 201);
    expect(response.body.data).toHaveProperty('expectedField');
  });
});
```

### 2. Helper Functions

```typescript
// API Testing
helpers.api.authenticatedPost('/api/orders', user, orderData);
helpers.api.expectSuccess(response, 201);
helpers.api.expectValidationError(response);

// Performance Testing
await helpers.perf.measureAsync(async () => {
  const response = await api.call();
}, 2000); // Max 2 seconds

// Database Helpers
helpers.db.generateTestEmail('prefix');
helpers.db.generateTestSlug('prefix');
```

### 3. Error Testing

```typescript
// Test validation errors
const response = await helpers.api.post('/api/endpoint', invalidData);
helpers.api.expectValidationError(response, 'fieldName');

// Test authorization errors
const response = await helpers.api.authenticatedPost('/api/admin-endpoint', customer);
helpers.api.expectForbidden(response);

// Test not found errors
const response = await helpers.api.get('/api/nonexistent/123');
helpers.api.expectNotFound(response);
```

## 📈 Performance Benchmarks

### Response Time Expectations

- **Authentication**: < 2 seconds
- **Product Listing**: < 2 seconds
- **Product Details**: < 1 second
- **Order Creation**: < 3 seconds
- **Order Tracking**: < 1 second

### Concurrency Testing

- **Concurrent Users**: 10 simultaneous requests
- **Data Consistency**: No race conditions
- **Error Handling**: Graceful degradation

## 🔍 Debugging Tests

### Enable Debug Mode

```bash
# Enable detailed test logging
DEBUG_TESTS=true npm run test:auth

# Run specific test with verbose output
npm run test -- --verbose auth.integration.test.ts
```

### Common Issues

1. **Database Connection**:
   ```bash
   # Verify database is running
   npx prisma db pull
   
   # Reset test database
   npm run db:test:setup
   ```

2. **Port Conflicts**:
   ```bash
   # Check if port 3001 is available
   netstat -an | grep 3001
   ```

3. **Test Data Issues**:
   ```bash
   # Clean and recreate test data
   npm run db:migrate:reset
   npm run db:test:setup
   ```

## 📋 Test Coverage Report

Run comprehensive coverage analysis:

```bash
npm run test:coverage
```

**Coverage Targets:**
- **Statements**: > 90%
- **Branches**: > 85%
- **Functions**: > 90%
- **Lines**: > 90%

**Coverage Includes:**
- All API endpoints
- Authentication middleware
- Business logic validation
- Error handling paths
- Authorization checks

## 🚀 Continuous Integration

### Pre-deployment Checklist

```bash
# 1. Run full test suite
npm run test

# 2. Check test coverage
npm run test:coverage

# 3. Run integration tests
./scripts/run-integration-tests.sh

# 4. Verify all tests pass
# Total Test Suites: 4
# Passed: 4
# Failed: 0
```

### CI/CD Pipeline Integration

```yaml
# Example GitHub Actions workflow
test:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v2
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '18'
    - name: Install dependencies
      run: npm install
    - name: Run integration tests
      run: ./scripts/run-integration-tests.sh
```

## 📚 Additional Resources

### Related Documentation

- [API Specification](../doc/Coffee_Tea_Web_API_Specification.md)
- [Database Design](../doc/Coffee_Tea_Web_Database_Design.md)
- [Technical Architecture](../doc/Coffee_Tea_Web_Technical_Architecture.md)

### Memory Bank Context

- [Auth Module Context](../memory-bank/auth-module-bank/module-context.md)
- [Product Module Context](../memory-bank/product-module-bank/module-context.md)
- [Order Module Context](../memory-bank/order-module-bank/module-context.md)

---

**Last Updated**: September 3, 2025  
**Test Suite Version**: 1.0.0  
**Coverage**: Authentication, Products, Orders, E2E Workflows  
**Status**: ✅ Production Ready

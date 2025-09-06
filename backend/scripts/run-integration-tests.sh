#!/bin/bash

# Coffee & Tea E-commerce API - Test Runner Script
# Runs comprehensive integration tests

echo "🧪 Starting Coffee & Tea E-commerce API Integration Tests"
echo "=================================================="

# Set test environment
export NODE_ENV=test

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Check if database is running
print_status "Checking database connection..."
if ! npx prisma db pull > /dev/null 2>&1; then
    print_error "Database connection failed. Please ensure PostgreSQL is running."
    exit 1
fi
print_success "Database connection verified"

# Setup test database
print_status "Setting up test database..."
if npm run db:test:setup > /dev/null 2>&1; then
    print_success "Test database setup complete"
else
    print_error "Failed to setup test database"
    exit 1
fi

# Function to run test suite
run_test_suite() {
    local test_name="$1"
    local test_command="$2"
    
    print_status "Running $test_name..."
    if eval "$test_command"; then
        print_success "$test_name passed"
        return 0
    else
        print_error "$test_name failed"
        return 1
    fi
}

# Test execution tracking
total_tests=0
passed_tests=0
failed_tests=0

# Authentication Integration Tests
total_tests=$((total_tests + 1))
if run_test_suite "Authentication Integration Tests" "npm run test:auth"; then
    passed_tests=$((passed_tests + 1))
else
    failed_tests=$((failed_tests + 1))
fi

echo ""

# Product Catalog Integration Tests
total_tests=$((total_tests + 1))
if run_test_suite "Product Catalog Integration Tests" "npm run test:products"; then
    passed_tests=$((passed_tests + 1))
else
    failed_tests=$((failed_tests + 1))
fi

echo ""

# Order Management Integration Tests
total_tests=$((total_tests + 1))
if run_test_suite "Order Management Integration Tests" "npm run test:orders"; then
    passed_tests=$((passed_tests + 1))
else
    failed_tests=$((failed_tests + 1))
fi

echo ""

# End-to-End Workflow Tests
total_tests=$((total_tests + 1))
if run_test_suite "End-to-End Workflow Tests" "npm run test:workflows"; then
    passed_tests=$((passed_tests + 1))
else
    failed_tests=$((failed_tests + 1))
fi

echo ""
echo "=================================================="
echo "🧪 Test Summary"
echo "=================================================="
echo -e "Total Test Suites: ${BLUE}$total_tests${NC}"
echo -e "Passed: ${GREEN}$passed_tests${NC}"
echo -e "Failed: ${RED}$failed_tests${NC}"

if [ $failed_tests -eq 0 ]; then
    echo ""
    print_success "All integration tests passed! ✅"
    echo ""
    print_status "Running full test coverage report..."
    npm run test:coverage
    echo ""
    print_success "Integration testing complete. System is ready for production! 🚀"
    exit 0
else
    echo ""
    print_error "Some tests failed. Please review the output above."
    exit 1
fi

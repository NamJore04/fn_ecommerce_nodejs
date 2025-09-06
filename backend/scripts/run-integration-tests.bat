@echo off
REM Coffee & Tea E-commerce API - Windows Test Runner Script
REM Runs comprehensive integration tests on Windows

echo 🧪 Starting Coffee & Tea E-commerce API Integration Tests
echo ==================================================

REM Set test environment
set NODE_ENV=test

echo [INFO] Checking database connection...
npx prisma db pull >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Database connection failed. Please ensure PostgreSQL is running.
    exit /b 1
)
echo [SUCCESS] Database connection verified

echo [INFO] Setting up test database...
call npm run db:test:setup >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Failed to setup test database
    exit /b 1
)
echo [SUCCESS] Test database setup complete

set total_tests=0
set passed_tests=0
set failed_tests=0

echo.
echo [INFO] Running Authentication Integration Tests...
call npm run test:auth
if %errorlevel% equ 0 (
    echo [SUCCESS] Authentication Integration Tests passed
    set /a passed_tests+=1
) else (
    echo [ERROR] Authentication Integration Tests failed
    set /a failed_tests+=1
)
set /a total_tests+=1

echo.
echo [INFO] Running Product Catalog Integration Tests...
call npm run test:products
if %errorlevel% equ 0 (
    echo [SUCCESS] Product Catalog Integration Tests passed
    set /a passed_tests+=1
) else (
    echo [ERROR] Product Catalog Integration Tests failed
    set /a failed_tests+=1
)
set /a total_tests+=1

echo.
echo [INFO] Running Order Management Integration Tests...
call npm run test:orders
if %errorlevel% equ 0 (
    echo [SUCCESS] Order Management Integration Tests passed
    set /a passed_tests+=1
) else (
    echo [ERROR] Order Management Integration Tests failed
    set /a failed_tests+=1
)
set /a total_tests+=1

echo.
echo [INFO] Running End-to-End Workflow Tests...
call npm run test:workflows
if %errorlevel% equ 0 (
    echo [SUCCESS] End-to-End Workflow Tests passed
    set /a passed_tests+=1
) else (
    echo [ERROR] End-to-End Workflow Tests failed
    set /a failed_tests+=1
)
set /a total_tests+=1

echo.
echo ==================================================
echo 🧪 Test Summary
echo ==================================================
echo Total Test Suites: %total_tests%
echo Passed: %passed_tests%
echo Failed: %failed_tests%

if %failed_tests% equ 0 (
    echo.
    echo [SUCCESS] All integration tests passed! ✅
    echo.
    echo [INFO] Running full test coverage report...
    call npm run test:coverage
    echo.
    echo [SUCCESS] Integration testing complete. System is ready for production! 🚀
    exit /b 0
) else (
    echo.
    echo [ERROR] Some tests failed. Please review the output above.
    exit /b 1
)

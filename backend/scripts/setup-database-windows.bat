@echo off
echo ================================
echo COFFEE & TEA DATABASE SETUP
echo ================================
echo.

REM Check if PostgreSQL is installed
where psql >nul 2>nul
if errorlevel 1 (
    echo ERROR: PostgreSQL is not installed or not in PATH
    echo Please install PostgreSQL first: https://www.postgresql.org/download/windows/
    pause
    exit /b 1
)

echo ✅ PostgreSQL found
echo.

REM Set database variables
set DB_NAME=coffee_tea_db
set DB_USER=postgres
set DB_HOST=localhost
set DB_PORT=5432

echo 🔄 Creating database: %DB_NAME%
echo.

REM Try to create database
psql -U %DB_USER% -h %DB_HOST% -p %DB_PORT% -c "CREATE DATABASE %DB_NAME%;" 2>nul
if errorlevel 1 (
    echo ⚠️  Database might already exist or connection failed
    echo Trying to connect to existing database...
) else (
    echo ✅ Database created successfully
)

echo.
echo 🔄 Testing database connection...
psql -U %DB_USER% -h %DB_HOST% -p %DB_PORT% -d %DB_NAME% -c "SELECT version();" >nul 2>nul
if errorlevel 1 (
    echo ❌ Failed to connect to database
    echo Please check:
    echo   1. PostgreSQL service is running
    echo   2. Username/password is correct
    echo   3. Database exists
    pause
    exit /b 1
) else (
    echo ✅ Database connection successful
)

echo.
echo 🔄 Setting up Prisma...
call npm run db:generate
if errorlevel 1 (
    echo ❌ Failed to generate Prisma client
    pause
    exit /b 1
)

echo.
echo 🔄 Pushing schema to database...
call npm run db:push
if errorlevel 1 (
    echo ❌ Failed to push schema
    pause
    exit /b 1
)

echo.
echo 🔄 Seeding database with initial data...
call npm run db:seed
if errorlevel 1 (
    echo ❌ Failed to seed database
    pause
    exit /b 1
)

echo.
echo ================================
echo ✅ DATABASE SETUP COMPLETE!
echo ================================
echo.
echo Database: %DB_NAME%
echo Host: %DB_HOST%:%DB_PORT%
echo.
echo Next steps:
echo   1. Run: npm run dev
echo   2. Test: http://localhost:3001/health
echo   3. Admin: npm run db:studio
echo.
pause

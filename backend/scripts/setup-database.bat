@echo off
REM Coffee & Tea E-commerce Database Setup Script for Windows
REM This script sets up the PostgreSQL database with proper security and optimization

echo 🚀 Starting Coffee & Tea Database Setup...

REM Load environment variables from .env.local if it exists
if exist .env.local (
    echo 📝 Loading environment variables from .env.local...
    for /f "delims=" %%i in (.env.local) do (
        echo %%i | findstr /v "^#" > nul && set %%i
    )
)

REM Set default values if not set in environment
if not defined DB_HOST set DB_HOST=localhost
if not defined DB_PORT set DB_PORT=5432
if not defined DB_NAME set DB_NAME=coffee_tea_db
if not defined DB_USER set DB_USER=coffee_user
if not defined DB_PASSWORD set DB_PASSWORD=secure_password

echo.
echo 📋 Database Configuration:
echo   Host: %DB_HOST%
echo   Port: %DB_PORT%
echo   Database: %DB_NAME%
echo   User: %DB_USER%
echo.

REM Check if PostgreSQL is running
echo 🔍 Checking PostgreSQL connection...
pg_isready -h %DB_HOST% -p %DB_PORT% -U postgres >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ PostgreSQL is not running or not accessible
    echo 🐳 Attempting to start PostgreSQL via Docker...
    
    where docker-compose >nul 2>&1
    if %errorlevel% equ 0 (
        docker-compose up -d postgres
        timeout /t 10 /nobreak >nul
        
        pg_isready -h %DB_HOST% -p %DB_PORT% -U postgres >nul 2>&1
        if %errorlevel% neq 0 (
            echo ❌ Failed to start PostgreSQL. Please ensure PostgreSQL is installed and running.
            pause
            exit /b 1
        )
    ) else (
        echo ❌ Docker Compose not found. Please start PostgreSQL service manually.
        pause
        exit /b 1
    )
) else (
    echo ✅ PostgreSQL is running
)

echo.
echo 🗄️ Setting up database and user...

REM Create database if it doesn't exist
psql -h %DB_HOST% -p %DB_PORT% -U postgres -lqt | findstr /c:"%DB_NAME%" >nul
if %errorlevel% neq 0 (
    echo 📝 Creating database '%DB_NAME%'...
    psql -h %DB_HOST% -p %DB_PORT% -U postgres -c "CREATE DATABASE %DB_NAME%;"
    if %errorlevel% equ 0 (
        echo ✅ Database '%DB_NAME%' created
    ) else (
        echo ❌ Failed to create database
        pause
        exit /b 1
    )
) else (
    echo ✅ Database '%DB_NAME%' already exists
)

REM Create user if it doesn't exist
psql -h %DB_HOST% -p %DB_PORT% -U postgres -t -c "SELECT 1 FROM pg_roles WHERE rolname='%DB_USER%'" | findstr "1" >nul
if %errorlevel% neq 0 (
    echo 👤 Creating user '%DB_USER%'...
    psql -h %DB_HOST% -p %DB_PORT% -U postgres -c "CREATE USER %DB_USER% WITH ENCRYPTED PASSWORD '%DB_PASSWORD%';"
    if %errorlevel% equ 0 (
        echo ✅ User '%DB_USER%' created
    ) else (
        echo ❌ Failed to create user
        pause
        exit /b 1
    )
) else (
    echo ✅ User '%DB_USER%' already exists
)

REM Grant privileges
echo 🔐 Setting up permissions...
psql -h %DB_HOST% -p %DB_PORT% -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE %DB_NAME% TO %DB_USER%;"
psql -h %DB_HOST% -p %DB_PORT% -U postgres -d %DB_NAME% -c "GRANT ALL ON SCHEMA public TO %DB_USER%;"
psql -h %DB_HOST% -p %DB_PORT% -U postgres -d %DB_NAME% -c "GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO %DB_USER%;"
psql -h %DB_HOST% -p %DB_PORT% -U postgres -d %DB_NAME% -c "GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO %DB_USER%;"

REM Enable extensions and apply initial setup
echo 🔧 Applying database setup...
psql -h %DB_HOST% -p %DB_PORT% -U postgres -d %DB_NAME% -f prisma\migrations\001_initial_setup.sql

REM Generate Prisma client
echo 📦 Generating Prisma client...
call npx prisma generate
if %errorlevel% neq 0 (
    echo ❌ Failed to generate Prisma client
    pause
    exit /b 1
)

REM Push database schema
echo 🚀 Pushing database schema...
call npx prisma db push --force-reset
if %errorlevel% neq 0 (
    echo ❌ Failed to push database schema
    pause
    exit /b 1
)

REM Run migrations
echo 🌱 Running database migrations...
call npx prisma migrate deploy
if %errorlevel% neq 0 (
    echo ⚠️ Migration warnings (this is normal for initial setup)
)

REM Seed initial data
echo 🎯 Seeding initial data...
call npm run db:seed
if %errorlevel% neq 0 (
    echo ❌ Failed to seed database
    pause
    exit /b 1
)

REM Verify setup
echo 📊 Verifying database setup...
for /f %%i in ('psql -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -d %DB_NAME% -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE';"') do set TABLES_COUNT=%%i
for /f %%i in ('psql -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -d %DB_NAME% -t -c "SELECT COUNT(*) FROM users;"') do set USERS_COUNT=%%i
for /f %%i in ('psql -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -d %DB_NAME% -t -c "SELECT COUNT(*) FROM products;"') do set PRODUCTS_COUNT=%%i

echo ✅ Created %TABLES_COUNT% tables
echo ✅ Seeded %USERS_COUNT% users and %PRODUCTS_COUNT% products

echo.
echo 🎉 Database setup completed successfully!
echo.
echo 📋 Setup Summary:
echo   Database: %DB_NAME%
echo   User: %DB_USER%
echo   Tables created: %TABLES_COUNT%
echo   Sample users: %USERS_COUNT%
echo   Sample products: %PRODUCTS_COUNT%
echo.
echo 🔗 Connection URL:
echo   postgresql://%DB_USER%:%DB_PASSWORD%@%DB_HOST%:%DB_PORT%/%DB_NAME%
echo.
echo 🛠️ Next steps:
echo   1. Start the backend server: npm run dev
echo   2. Access pgAdmin: http://localhost:8080
echo   3. View Prisma Studio: npm run db:studio
echo.
pause

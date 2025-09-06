#!/bin/bash

# Coffee & Tea E-commerce Database Setup Script
# This script sets up the PostgreSQL database with proper security and optimization

set -e  # Exit on any error

echo "🚀 Starting Coffee & Tea Database Setup..."

# Load environment variables
if [ -f .env.local ]; then
    export $(grep -v '^#' .env.local | xargs)
fi

# Default values if not set in environment
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5432}
DB_NAME=${DB_NAME:-coffee_tea_db}
DB_USER=${DB_USER:-coffee_user}
DB_PASSWORD=${DB_PASSWORD:-secure_password}

echo "📋 Database Configuration:"
echo "  Host: $DB_HOST"
echo "  Port: $DB_PORT"
echo "  Database: $DB_NAME"
echo "  User: $DB_USER"

# Function to check if PostgreSQL is running
check_postgres() {
    echo "🔍 Checking PostgreSQL connection..."
    if pg_isready -h $DB_HOST -p $DB_PORT -U postgres > /dev/null 2>&1; then
        echo "✅ PostgreSQL is running"
        return 0
    else
        echo "❌ PostgreSQL is not running or not accessible"
        return 1
    fi
}

# Function to check if database exists
database_exists() {
    local db_name=$1
    psql -h $DB_HOST -p $DB_PORT -U postgres -lqt | cut -d \| -f 1 | grep -qw $db_name
}

# Function to check if user exists
user_exists() {
    local username=$1
    psql -h $DB_HOST -p $DB_PORT -U postgres -t -c "SELECT 1 FROM pg_roles WHERE rolname='$username'" | grep -q 1
}

# Check PostgreSQL connection
if ! check_postgres; then
    echo "🐳 Attempting to start PostgreSQL via Docker..."
    if command -v docker-compose &> /dev/null; then
        docker-compose up -d postgres
        sleep 10
        if ! check_postgres; then
            echo "❌ Failed to start PostgreSQL. Please ensure PostgreSQL is installed and running."
            exit 1
        fi
    else
        echo "❌ PostgreSQL is not running. Please start PostgreSQL service."
        exit 1
    fi
fi

echo "🗄️ Setting up database and user..."

# Create database if it doesn't exist
if ! database_exists $DB_NAME; then
    echo "📝 Creating database '$DB_NAME'..."
    psql -h $DB_HOST -p $DB_PORT -U postgres -c "CREATE DATABASE $DB_NAME;"
    echo "✅ Database '$DB_NAME' created"
else
    echo "✅ Database '$DB_NAME' already exists"
fi

# Create user if it doesn't exist
if ! user_exists $DB_USER; then
    echo "👤 Creating user '$DB_USER'..."
    psql -h $DB_HOST -p $DB_PORT -U postgres -c "CREATE USER $DB_USER WITH ENCRYPTED PASSWORD '$DB_PASSWORD';"
    echo "✅ User '$DB_USER' created"
else
    echo "✅ User '$DB_USER' already exists"
fi

# Grant privileges
echo "🔐 Setting up permissions..."
psql -h $DB_HOST -p $DB_PORT -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;"
psql -h $DB_HOST -p $DB_PORT -U postgres -d $DB_NAME -c "GRANT ALL ON SCHEMA public TO $DB_USER;"
psql -h $DB_HOST -p $DB_PORT -U postgres -d $DB_NAME -c "GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO $DB_USER;"
psql -h $DB_HOST -p $DB_PORT -U postgres -d $DB_NAME -c "GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO $DB_USER;"

# Enable extensions and apply initial setup
echo "🔧 Applying database setup..."
psql -h $DB_HOST -p $DB_PORT -U postgres -d $DB_NAME -f prisma/migrations/001_initial_setup.sql

echo "📦 Generating Prisma client..."
npx prisma generate

echo "🚀 Pushing database schema..."
npx prisma db push --force-reset

echo "🌱 Running database migrations..."
if npx prisma migrate status | grep -q "Database schema is up to date"; then
    echo "✅ Database schema is up to date"
else
    npx prisma migrate deploy
fi

echo "🎯 Seeding initial data..."
npm run db:seed

echo "📊 Verifying database setup..."
# Check if tables were created successfully
TABLES_COUNT=$(psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE';")
echo "✅ Created $TABLES_COUNT tables"

# Check if data was seeded
USERS_COUNT=$(psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -t -c "SELECT COUNT(*) FROM users;")
PRODUCTS_COUNT=$(psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -t -c "SELECT COUNT(*) FROM products;")
echo "✅ Seeded $USERS_COUNT users and $PRODUCTS_COUNT products"

echo "🎉 Database setup completed successfully!"
echo ""
echo "📋 Setup Summary:"
echo "  Database: $DB_NAME"
echo "  User: $DB_USER"
echo "  Tables created: $TABLES_COUNT"
echo "  Sample users: $USERS_COUNT"
echo "  Sample products: $PRODUCTS_COUNT"
echo ""
echo "🔗 Connection URL:"
echo "  postgresql://$DB_USER:$DB_PASSWORD@$DB_HOST:$DB_PORT/$DB_NAME"
echo ""
echo "🛠️ Next steps:"
echo "  1. Start the backend server: npm run dev"
echo "  2. Access pgAdmin: http://localhost:8080"
echo "  3. View Prisma Studio: npm run db:studio"

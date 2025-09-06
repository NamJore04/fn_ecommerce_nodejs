# 🚀 COFFEE & TEA E-COMMERCE - DEVELOPMENT ENVIRONMENT SETUP

## 📋 QUICK START GUIDE

### Prerequisites
- **Node.js**: 18.17+ 
- **npm**: 9.8+
- **Docker**: 20.10+ (optional but recommended)
- **Git**: Latest version

---

## ⚡ ONE-COMMAND SETUP

```powershell
# Clone and setup entire project
git clone <repository-url> coffee-tea-ecommerce
cd coffee-tea-ecommerce
npm run setup
```

---

## 🐳 DOCKER DEVELOPMENT ENVIRONMENT (RECOMMENDED)

### 1. Start Services
```powershell
# Start all infrastructure services
npm run docker:up

# Verify services are running
docker-compose ps
```

### 2. Service URLs
```
PostgreSQL:     localhost:5432
Redis:          localhost:6379
ElasticSearch:  localhost:9200
pgAdmin:        http://localhost:8080 (admin@coffeetea.com / admin123)
Redis Commander: http://localhost:8081
```

### 3. Application Development
```powershell
# Install dependencies
npm run install:all

# Setup database
npm run db:setup

# Start development servers
npm run dev
```

### 4. Access Applications
```
Backend API:    http://localhost:3001
Frontend App:   http://localhost:3000
```

---

## 💻 LOCAL DEVELOPMENT (WITHOUT DOCKER)

### 1. Install Dependencies
```powershell
# Install PostgreSQL 15+
# Download from: https://www.postgresql.org/download/

# Install Redis
# Download from: https://redis.io/download

# Install project dependencies
npm run install:all
```

### 2. Environment Configuration
```powershell
# Copy environment templates
cp backend/.env.example backend/.env.local
cp frontend/.env.example frontend/.env.local

# Edit configuration files with your settings
```

### 3. Database Setup
```powershell
# Create database and user
psql -U postgres
# Run commands from DATABASE_SETUP.md

# Run migrations
npm run db:migrate

# Seed initial data
npm run db:seed
```

### 4. Start Development
```powershell
# Start all services
npm run dev
```

---

## 📁 PROJECT STRUCTURE

```
coffee-tea-ecommerce/
├── backend/                 # Node.js + Express API
│   ├── src/
│   │   ├── controllers/     # Route controllers
│   │   ├── middleware/      # Custom middleware
│   │   ├── models/          # Prisma models
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic
│   │   ├── utils/           # Utility functions
│   │   └── config/          # Configuration files
│   ├── prisma/              # Database schema & migrations
│   ├── tests/               # Backend tests
│   └── package.json
├── frontend/                # Next.js React App
│   ├── src/
│   │   ├── app/             # Next.js 14 App Router
│   │   ├── components/      # Reusable components
│   │   ├── hooks/           # Custom React hooks
│   │   ├── lib/             # Utility libraries
│   │   ├── store/           # State management (Zustand)
│   │   └── types/           # TypeScript types
│   ├── public/              # Static assets
│   ├── tests/               # Frontend tests
│   └── package.json
├── doc/                     # Documentation
├── memory-bank/             # Project context & progress
├── docker-compose.yml       # Development services
├── package.json             # Root package.json
└── README.md
```

---

## 🛠️ DEVELOPMENT TOOLS & COMMANDS

### Package Management
```powershell
# Install all dependencies
npm run install:all

# Clean all node_modules
npm run clean

# Update dependencies
npm update
```

### Database Operations
```powershell
# Setup fresh database
npm run db:setup

# Run migrations
npm run db:migrate

# Seed test data
npm run db:seed

# Reset database (DANGER: Deletes all data)
npm run db:reset
```

### Development Servers
```powershell
# Start both frontend and backend
npm run dev

# Start only backend (port 3001)
npm run dev:backend

# Start only frontend (port 3000)
npm run dev:frontend
```

### Building & Production
```powershell
# Build both applications
npm run build

# Build backend only
npm run build:backend

# Build frontend only
npm run build:frontend

# Start production server
npm start
```

### Testing
```powershell
# Run all tests
npm test

# Run backend tests
npm run test:backend

# Run frontend tests
npm run test:frontend
```

### Code Quality
```powershell
# Lint all code
npm run lint

# Lint backend
npm run lint:backend

# Lint frontend
npm run lint:frontend

# Format code (automatically configured with husky)
git commit -m "Your commit message"
```

### Docker Operations
```powershell
# Start all services
npm run docker:up

# Stop all services
npm run docker:down

# View logs
npm run docker:logs

# Restart a specific service
docker-compose restart postgres
```

---

## 🔧 ENVIRONMENT VARIABLES

### Backend (.env.local)
```bash
# Application
NODE_ENV=development
PORT=3001
API_BASE_URL=http://localhost:3001

# Database
DATABASE_URL="postgresql://coffee_user:secure_password@localhost:5432/coffee_tea_db"
DB_POOL_MIN=2
DB_POOL_MAX=10

# Redis
REDIS_URL="redis://localhost:6379"

# JWT Authentication
JWT_SECRET="your-super-secret-jwt-key-min-32-chars"
JWT_REFRESH_SECRET="your-refresh-secret-key-min-32-chars"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"

# External APIs
GOOGLE_CLIENT_ID="your-google-oauth-client-id"
GOOGLE_CLIENT_SECRET="your-google-oauth-client-secret"
FACEBOOK_APP_ID="your-facebook-app-id"
FACEBOOK_APP_SECRET="your-facebook-app-secret"

# Email Service
EMAIL_PROVIDER="sendgrid"
SENDGRID_API_KEY="your-sendgrid-api-key"
EMAIL_FROM="noreply@coffeetea.com"

# File Upload
CLOUDINARY_CLOUD_NAME="your-cloudinary-cloud-name"
CLOUDINARY_API_KEY="your-cloudinary-api-key"
CLOUDINARY_API_SECRET="your-cloudinary-api-secret"
```

### Frontend (.env.local)
```bash
# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3001/api

# Authentication
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET="your-nextauth-secret-min-32-chars"

# External Services
NEXT_PUBLIC_GOOGLE_CLIENT_ID="your-google-oauth-client-id"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="your-stripe-publishable-key"

# Analytics (optional)
NEXT_PUBLIC_GA_MEASUREMENT_ID="your-google-analytics-id"
```

---

## 🧪 TESTING STRATEGY

### Backend Testing
```powershell
# Unit tests with Jest
npm run test:backend

# Integration tests
npm run test:backend:integration

# Test coverage
npm run test:backend:coverage
```

### Frontend Testing
```powershell
# Component tests with React Testing Library
npm run test:frontend

# E2E tests with Cypress
npm run test:frontend:e2e

# Visual regression tests
npm run test:frontend:visual
```

---

## 🚨 TROUBLESHOOTING

### Common Issues

#### Database Connection Error
```powershell
# Check if PostgreSQL is running
docker-compose ps postgres

# Restart PostgreSQL
docker-compose restart postgres

# Check logs
docker-compose logs postgres
```

#### Redis Connection Error
```powershell
# Check Redis status
docker-compose ps redis

# Test Redis connection
docker-compose exec redis redis-cli ping
```

#### Frontend Build Error
```powershell
# Clear Next.js cache
cd frontend && rm -rf .next

# Reinstall dependencies
npm run clean:frontend && npm run install:frontend
```

#### Backend TypeScript Error
```powershell
# Regenerate Prisma client
cd backend && npx prisma generate

# Check TypeScript
cd backend && npx tsc --noEmit
```

---

## 📊 PERFORMANCE MONITORING

### Development Tools
- **PostgreSQL**: pgAdmin at http://localhost:8080
- **Redis**: Redis Commander at http://localhost:8081
- **API Documentation**: http://localhost:3001/api/docs (when running)
- **Frontend**: Next.js dev tools in browser

### Production Monitoring
- **Database**: Connection pool monitoring
- **Cache**: Redis memory usage
- **Application**: Response times, error rates
- **Search**: ElasticSearch query performance

---

## ✅ VERIFICATION CHECKLIST

- [ ] Node.js 18.17+ installed
- [ ] Docker and Docker Compose working
- [ ] PostgreSQL database accessible
- [ ] Redis cache accessible
- [ ] Backend API responding at http://localhost:3001
- [ ] Frontend app accessible at http://localhost:3000
- [ ] Database migrations completed
- [ ] Seed data populated
- [ ] All tests passing
- [ ] Code linting passing

---

## 🚀 NEXT STEPS

1. ✅ **Development Environment Setup**
2. 🔄 **Authentication Module Development** (Next)
3. ⏳ **Product Management Implementation**
4. ⏳ **Frontend UI Development**

**Setup Complete!** 🎉 You're ready to start development!

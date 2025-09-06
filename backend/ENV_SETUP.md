# ENVIRONMENT SETUP FOR COFFEE & TEA PROJECT

## 🔧 QUICK SETUP

### 1. Copy và rename file:
```bash
copy .env.example .env
```

### 2. Cập nhật .env với thông tin database của bạn:
```env
# Thay đổi password cho phù hợp
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/coffee_tea_db"

# Redis (tùy chọn)
REDIS_URL="redis://localhost:6379"

# Development settings
NODE_ENV=development
PORT=3001
```

## 📋 ENVIRONMENT VARIABLES REFERENCE

### Required (Bắt buộc):
- `DATABASE_URL`: PostgreSQL connection string
- `NODE_ENV`: development/production
- `PORT`: Server port (default: 3001)

### Optional (Tùy chọn):
- `REDIS_URL`: Redis connection (for caching)
- `JWT_SECRET`: JWT signing secret
- `CORS_ORIGIN`: Frontend URL for CORS

## 🚨 COMMON DATABASE URLs

### Local PostgreSQL:
```env
# With postgres user
DATABASE_URL="postgresql://postgres:password@localhost:5432/coffee_tea_db"

# With custom user
DATABASE_URL="postgresql://coffee_user:secure_password@localhost:5432/coffee_tea_db"
```

### Docker PostgreSQL:
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/coffee_tea_db"
```

### Cloud PostgreSQL (Neon, Supabase, etc.):
```env
DATABASE_URL="postgresql://username:password@host:port/database?sslmode=require"
```

## ✅ VALIDATION

Sau khi setup .env, test bằng:
```bash
npm run db:health
```

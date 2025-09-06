# Coffee & Tea E-commerce Platform - Hướng dẫn chạy dự án

## 📖 Giới thiệu
Platform thương mại điện tử bán cà phê và trà được xây dựng với Next.js, TypeScript, và Node.js. Dự án bao gồm đầy đủ các tính năng: đăng ký/đăng nhập, quản lý sản phẩm, giỏ hàng, thanh toán và quản lý đơn hàng.

## 🛠️ Công nghệ sử dụng
- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express.js, TypeScript, Prisma ORM
- **Database**: PostgreSQL
- **Authentication**: JWT, bcrypt
- **UI Components**: Custom components với Tailwind CSS
- **State Management**: React Context API

## 📋 Yêu cầu hệ thống
- Node.js >= 18.0.0
- npm >= 8.0.0
- PostgreSQL >= 13.0
- Git

## 🚀 Hướng dẫn cài đặt và chạy dự án

### Bước 1: Clone dự án
```bash
<<<<<<< HEAD
git clone <repository-url>
=======
git clone https://github.com/NamJore04/coffee-and-tea-project.git
>>>>>>> e0366de708e308e3f8f2d024af0ae5c307cac571
cd coffee_and_tea
```

### Bước 2: Cài đặt PostgreSQL
1. **Tải và cài đặt PostgreSQL** từ [postgresql.org](https://www.postgresql.org/download/)
2. **Tạo database mới**:
   ```sql
   -- Mở PostgreSQL command line hoặc pgAdmin
   CREATE DATABASE coffee_tea_db;
   CREATE USER coffee_tea_user WITH PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE coffee_tea_db TO coffee_tea_user;
   ```

### Bước 3: Cấu hình Backend

#### 3.1. Cài đặt dependencies
```bash
cd backend
npm install
```

#### 3.2. Tạo file .env
Tạo file `.env` trong thư mục `backend/` với nội dung:
```env
# Database
DATABASE_URL="postgresql://coffee_tea_user:your_password@localhost:5432/coffee_tea_db"

# JWT Secrets
JWT_ACCESS_SECRET="coffee_tea_access_secret_2024"
JWT_REFRESH_SECRET="coffee_tea_refresh_secret_2024"
JWT_ACCESS_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"

# Server Configuration
PORT=3001
NODE_ENV=development

# Optional - Redis (để trống nếu không sử dụng)
REDIS_URL=""

# Email Configuration (tùy chọn)
EMAIL_FROM="noreply@coffeetea.com"
SENDGRID_API_KEY=""

# File Upload (tùy chọn)
CLOUDINARY_CLOUD_NAME=""
CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRET=""
```

#### 3.3. Setup Database
```bash
<<<<<<< HEAD
=======
# CD to backend
cd backend 

>>>>>>> e0366de708e308e3f8f2d024af0ae5c307cac571
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma db push

# Seed sample data
npm run db:seed
```

#### 3.4. Chạy Backend Server
```bash
npm run dev
```
✅ Backend sẽ chạy tại: `http://localhost:3001`

### Bước 4: Cấu hình Frontend

#### 4.1. Cài đặt dependencies
```bash
cd ../frontend
npm install
```

#### 4.2. Tạo file .env.local
Tạo file `.env.local` trong thư mục `frontend/` với nội dung:
```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001

# Environment
NODE_ENV=development
```

#### 4.3. Chạy Frontend Server
```bash
npm run dev
```
✅ Frontend sẽ chạy tại: `http://localhost:3000`

### Bước 5: Chạy đồng thời cả Frontend và Backend (Tùy chọn)
Từ thư mục gốc `coffee_and_tea/`:
```bash
npm run dev
```
Lệnh này sẽ chạy đồng thời backend (port 3001) và frontend (port 3000).

## 🔍 Kiểm tra dự án

### Kiểm tra Backend
1. Mở browser và truy cập: `http://localhost:3001/health`
2. Bạn sẽ thấy response JSON cho biết server đang hoạt động

### Kiểm tra Frontend
1. Mở browser và truy cập: `http://localhost:3000`
2. Bạn sẽ thấy trang chủ của Coffee & Tea E-commerce

### Kiểm tra API
```bash
# Test products API
curl http://localhost:3001/api/products

# Test categories API  
curl http://localhost:3001/api/categories
```

## 👤 Tài khoản test

Sau khi chạy `npm run db:seed`, bạn sẽ có các tài khoản test:

### Admin Account
- **Email**: admin@coffeetea.com
- **Password**: Admin123!
- **Role**: ADMIN

### Customer Account
- **Email**: customer@example.com  
- **Password**: Customer123!
- **Role**: CUSTOMER

## 📁 Cấu trúc dự án

```
coffee_and_tea/
├── backend/                 # Node.js API server
│   ├── src/
│   │   ├── routes/         # API endpoints (22 endpoints)
│   │   ├── services/       # Business logic
│   │   ├── middleware/     # Authentication, validation
│   │   └── types/          # TypeScript types
│   ├── prisma/             # Database schema & seeds
│   └── .env               # Backend environment variables
├── frontend/               # Next.js application
│   ├── src/
│   │   ├── app/           # Pages (Next.js App Router)
│   │   ├── components/    # Reusable components
│   │   ├── contexts/      # React contexts
│   │   ├── services/      # API client services
│   │   └── types/         # TypeScript types
│   └── .env.local         # Frontend environment variables
└── package.json           # Root package.json (chạy đồng thời)
```

## ⚡ Tính năng chính

### ✅ Đã hoàn thành (100%)
- **Authentication**: Đăng ký, đăng nhập, dashboard
- **Product Catalog**: Danh sách sản phẩm, chi tiết, tìm kiếm, lọc
- **Shopping Cart**: Thêm/xóa sản phẩm, cập nhật số lượng
- **Checkout**: Quy trình thanh toán đa bước
- **Order Management**: Lịch sử đơn hàng, theo dõi, hủy đơn
- **Categories**: Quản lý danh mục sản phẩm
- **Responsive Design**: Tương thích mobile và desktop

## 🔧 Scripts hữu ích

### Backend Scripts
```bash
cd backend

# Development
npm run dev                 # Chạy server development
npm run build              # Build production
npm run start              # Chạy production server

# Database
npm run db:generate        # Generate Prisma client
npm run db:push           # Push schema to database
npm run db:seed           # Seed sample data
npm run db:reset          # Reset và seed lại database
npm run db:studio         # Mở Prisma Studio GUI

# Testing
npm run test              # Chạy tests
npm run test:watch        # Chạy tests với watch mode
```

### Frontend Scripts
```bash
cd frontend

# Development
npm run dev               # Chạy development server
npm run build            # Build production
npm run start            # Chạy production server
npm run lint             # Check linting errors
```

## 🛠️ Troubleshooting

### Lỗi thường gặp

#### 1. Database connection error
```
Error: P1001: Can't reach database server
```
**Giải pháp**: 
- Kiểm tra PostgreSQL đã chạy
- Xác nhận DATABASE_URL trong .env đúng
- Kiểm tra user và password database

#### 2. Port đã được sử dụng
```
Error: Port 3000 is already in use
```
**Giải pháp**:
```bash
# Tìm và kill process đang sử dụng port
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Hoặc sử dụng port khác
npm run dev -- -p 3002
```

#### 3. Module not found errors
```
Error: Cannot find module
```
**Giải pháp**:
```bash
# Xóa node_modules và reinstall
rm -rf node_modules package-lock.json
npm install
```

#### 4. Prisma client errors
```
Error: Prisma Client is not generated
```
**Giải pháp**:
```bash
cd backend
npx prisma generate
npx prisma db push
```

## 📞 Hỗ trợ

Nếu gặp vấn đề khi chạy dự án:
1. Kiểm tra các requirements đã đầy đủ
2. Xem lại các bước cấu hình .env
3. Kiểm tra logs trong terminal
4. Đảm bảo PostgreSQL đang chạy
5. Verify ports 3000 và 3001 không bị occupied

## 🎯 URL quan trọng

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **API Health Check**: http://localhost:3001/health
- **Prisma Studio**: `npm run db:studio` (http://localhost:5555)

---

**Cập nhật**: September 4, 2025  
**Status**: Production Ready ✅

**Cập nhật**: September 4, 2025  
**Status**: Production Ready ✅

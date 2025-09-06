# HƯỚNG DẪN SETUP POSTGRESQL CHO COFFEE & TEA PROJECT

## 📥 BƯỚC 1: CÀI ĐẶT POSTGRESQL

### Option A: PostgreSQL Official (Khuyến nghị)
1. **Download PostgreSQL:**
   - Truy cập: https://www.postgresql.org/download/windows/
   - Download phiên bản 15+ cho Windows
   - Chạy file installer

2. **Cài đặt:**
   ```
   - Port: 5432 (mặc định)
   - Username: postgres
   - Password: (nhập password mạnh, ví dụ: password123)
   - Database: postgres (mặc định)
   ```

3. **Kiểm tra cài đặt:**
   ```bash
   # Mở Command Prompt/PowerShell
   psql --version
   ```

### Option B: Docker (Nếu có Docker)
```bash
# Pull PostgreSQL image
docker pull postgres:15

# Run PostgreSQL container
docker run --name coffee-tea-postgres -e POSTGRES_PASSWORD=password123 -p 5432:5432 -d postgres:15
```

## 📊 BƯỚC 2: TẠO DATABASE

### Cách 1: Sử dụng psql command line
```bash
# Kết nối với PostgreSQL
psql -U postgres -h localhost

# Tạo database
CREATE DATABASE coffee_tea_db;

# Tạo user riêng (tùy chọn)
CREATE USER coffee_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE coffee_tea_db TO coffee_user;

# Thoát psql
\q
```

### Cách 2: Sử dụng pgAdmin (GUI)
1. Mở pgAdmin (đã cài cùng PostgreSQL)
2. Connect to server: localhost:5432
3. Right-click "Databases" → Create → Database
4. Name: `coffee_tea_db`
5. Click Save

## 🔧 BƯỚC 3: CẤU HÌNH PROJECT

### Cập nhật file .env
```env
DATABASE_URL="postgresql://postgres:password123@localhost:5432/coffee_tea_db"
```

## ✅ BƯỚC 4: TEST KẾT NỐI

### Kiểm tra connection
```bash
cd backend
npm run db:generate
npm run db:push
```

### Nếu thành công, chạy seed data
```bash
npm run db:seed
```

## 🚨 XỬ LÝ LỖI THƯỜNG GẶP

### Lỗi: "database does not exist"
```bash
# Tạo database trước:
createdb -U postgres coffee_tea_db
```

### Lỗi: "role does not exist"
```bash
# Tạo user:
createuser -U postgres coffee_user
```

### Lỗi: "password authentication failed"
```bash
# Kiểm tra password trong .env file
# Hoặc reset password PostgreSQL
```

### Lỗi: "connection refused"
```bash
# Kiểm tra PostgreSQL service đang chạy
# Windows: Services → PostgreSQL
# Hoặc restart service
```

## 🎯 VERIFICATION CHECKLIST

- [ ] PostgreSQL installed và running
- [ ] Database `coffee_tea_db` được tạo
- [ ] Connection string đúng trong .env
- [ ] `npm run db:generate` thành công
- [ ] `npm run db:push` thành công  
- [ ] `npm run db:seed` thành công
- [ ] `npm run dev` server chạy được

## 📱 NEXT STEPS
Sau khi database hoạt động:
1. Test API endpoints
2. Kiểm tra data trong database
3. Tiến tới Phase 1.3: Authentication Module

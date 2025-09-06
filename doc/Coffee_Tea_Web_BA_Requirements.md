# TÀI LIỆU PHÂN TÍCH NGHIỆP VỤ (BA) - WEBSITE BÁN CÀ PHÊ VÀ THỨC UỐNG

## 1. TỔNG QUAN DỰ ÁN

### 1.1. Mô tả dự án
Website thương mại điện tử chuyên bán cà phê, trà, thức uống và các loại bánh kèm (bánh ngọt, bánh mặn), thức ăn nhanh. Dự án được phát triển bằng Node.js và tuân thủ hoàn toàn các yêu cầu trong NodeJS Final Project.

### 1.2. Mục tiêu
- Xây dựng website thương mại điện tử đầy đủ chức năng
- Hỗ trợ khách hàng mua hàng không cần đăng nhập
- Quản lý sản phẩm, đơn hàng và khách hàng hiệu quả
- Tích hợp hệ thống điểm thưởng và mã giảm giá
- Triển khai trên môi trường public hoặc Docker

### 1.3. Phạm vi dự án
- **Sản phẩm chính**: Cà phê (hạt, bột, phin, espresso)
- **Thức uống**: Trà, nước ép, sinh tố, đồ uống có cồn nhẹ
- **Bánh kèm**: Bánh ngọt (croissant, muffin, cookies), bánh mặn (sandwich, pizza mini)
- **Thức ăn nhanh**: Burger, hot dog, salad, snack

## 2. PHÂN TÍCH YÊU CẦU CHỨC NĂNG

### 2.1. Landing Page (Trang chủ) - 1.0 điểm
**Yêu cầu bắt buộc:**
- Hiển thị danh mục "New Products", "Best Sellers"
- Ít nhất 3 danh mục riêng biệt:
  - **Coffee & Espresso**: Các loại cà phê hạt, bột, phin
  - **Tea & Beverages**: Trà, nước ép, sinh tố
  - **Food & Snacks**: Bánh, thức ăn nhanh
- Cho phép mua hàng không cần đăng nhập
- Tự động tạo tài khoản khi khách hàng mua lần đầu
- Pre-fill địa chỉ mặc định khi đăng nhập

**Đặc tả kỹ thuật:**
- Responsive design cho mobile/tablet/desktop
- Load time < 3 giây
- SEO-friendly với meta tags
- Hiển thị 12-16 sản phẩm mỗi danh mục

### 2.2. User Management - 1.0 điểm
**2.2.1. Đăng ký và Đăng nhập (0.3 điểm)**
- Email, họ tên, địa chỉ giao hàng
- Validation email format và unique
- Hash password với bcrypt

**2.2.2. Social Media Authentication (0.3 điểm)**
- Google OAuth 2.0
- Facebook Login (tuỳ chọn)
- Tự động merge account nếu email trùng

**2.2.3. Profile Management (0.4 điểm)**
- Cập nhật thông tin cá nhân
- Đổi/khôi phục mật khẩu qua email
- Quản lý nhiều địa chỉ giao hàng

### 2.3. Product Management - 1.5 điểm
**2.3.1. Product Catalog (0.5 điểm)**
- Trang danh sách sản phẩm riêng (không phải trang chủ)
- Hiển thị: tên, giá, hình ảnh, mô tả ngắn
- Pagination: hiển thị số trang ngay cả khi chỉ có 1 trang
- Phân loại theo categories và tags

**2.3.2. Product Details (0.5 điểm)**
- Thông tin chi tiết: tên, giá, thương hiệu, variants
- Mô tả ít nhất 5 dòng
- Tối thiểu 3 hình ảnh minh họa
- Comment và rating system
- Hỗ trợ nhiều variants (size, đá/nóng, đường/không đường)
- **Bắt buộc**: Mỗi sản phẩm có ít nhất 2 variants

**2.3.3. Product Sorting (0.25 điểm)**
- 4 tiêu chí sắp xếp bắt buộc:
  - Tên A-Z và Z-A
  - Giá tăng dần và giảm dần

**2.3.4. Search & Filtering (0.25 điểm)**
- Tìm kiếm theo tên sản phẩm
- 3 bộ lọc bắt buộc:
  - **Brand** (thương hiệu)
  - **Price** (khoảng giá min-max)
  - **Category** (danh mục)

### 2.4. Cart and Checkout - 1.0 điểm
**2.4.1. Shopping Cart (0.4 điểm)**
- Thêm sản phẩm vào giỏ hàng
- Cập nhật số lượng real-time (không reload page)
- Xóa sản phẩm khỏi giỏ
- Tính tổng tiền tự động

**2.4.2. Checkout Process (0.4 điểm)**
- Multi-step checkout
- Nhập thông tin thanh toán và giao hàng
- Guest checkout (không cần tài khoản)
- Hiển thị summary: tổng tiền, thuế, phí ship

**2.4.3. Discount Codes (0.2 điểm)**
- Mã giảm giá 5 ký tự alphanumeric
- Không có hạn sử dụng
- Giới hạn tối đa 10 lần sử dụng
- Hiển thị hiệu lực và ảnh hưởng trước thanh toán

### 2.5. Order Management - 1.0 điểm
**2.5.1. Order Creation (0.3 điểm)**
- Tạo đơn hàng sau thanh toán thành công
- Màn hình thành công với thông tin đầy đủ
- Email xác nhận đơn hàng

**2.5.2. Order Tracking (0.4 điểm)**
- Theo dõi trạng thái: pending, confirmed, shipping, delivered
- Lịch sử thay đổi trạng thái với timestamp
- Sắp xếp ngược chronological

**2.5.3. Order History (0.2 điểm)**
- Danh sách đơn hàng trước đây
- Thông tin: mã đơn, ngày mua, tổng tiền, trạng thái, danh sách sản phẩm

**2.5.4. Loyalty Program (0.1 điểm)**
- Tích điểm 10% giá trị đơn hàng
- Sử dụng điểm ngay lập tức
- 1 điểm = 1,000 VND

### 2.6. Admin Management - 1.5 điểm
**2.6.1. Simple Dashboard (0.3 điểm)**
- Tổng số users, users mới
- Số đơn hàng, doanh thu
- Sản phẩm bán chạy (charts)

**2.6.2. Advanced Dashboard (0.4 điểm)**
- Thống kê theo thời gian: năm, quý, tháng, tuần, custom range
- Metrics: số đơn bán, doanh thu, lợi nhuận
- Biểu đồ so sánh theo thời gian

**2.6.3. Product Management (0.3 điểm)**
- CRUD sản phẩm từ dashboard
- Quản lý categories và inventory
- Upload multiple images

**2.6.4. User Management (0.2 điểm)**
- Xem và quản lý users
- Ban/unban users
- Cập nhật thông tin user

**2.6.5. Order Management (0.2 điểm)**
- Danh sách đơn hàng (20 items/page)
- Filter theo thời gian
- Thay đổi trạng thái đơn hàng

**2.6.6. Discount Management (0.1 điểm)**
- Xem danh sách mã giảm giá
- Tạo mã giảm giá mới
- Theo dõi usage statistics

## 3. YÊU CẦU CHỨC NĂNG CHI TIẾT

### 3.1. Danh mục sản phẩm cụ thể

#### 3.1.1. Coffee & Espresso
**Sản phẩm:**
- Cà phê hạt (Arabica, Robusta, blend)
- Cà phê bột (phin, espresso, cold brew)
- Espresso shots
- Cold brew concentrate

**Variants:**
- Size: Small (240ml), Medium (360ml), Large (480ml)
- Preparation: Hot, Iced
- Sweetness: No sugar, Low sugar, Regular, Extra sweet
- Milk options: Black, Milk, Soy milk, Oat milk

#### 3.1.2. Tea & Beverages
**Sản phẩm:**
- Trà truyền thống (oolong, green tea, black tea)
- Trà sữa (Thai tea, Earl Grey, Matcha)
- Nước ép tươi (cam, dứa, táo, cà rót)
- Sinh tố (xoài, bơ, dâu, chocolate)

**Variants:**
- Size: Small, Medium, Large
- Ice level: No ice, Less ice, Regular ice, Extra ice
- Sweetness level: 0%, 25%, 50%, 75%, 100%
- Toppings: Pearl, Jelly, Pudding, Foam

#### 3.1.3. Food & Snacks
**Bánh ngọt:**
- Croissant (plain, chocolate, almond)
- Muffin (blueberry, chocolate chip, banana)
- Cookies (chocolate chip, oatmeal, macadamia)
- Cake slices (cheesecake, tiramisu, red velvet)

**Bánh mặn:**
- Sandwich (ham & cheese, BLT, club)
- Pizza mini (margherita, pepperoni, veggie)
- Wrap (chicken caesar, tuna, veggie)

**Thức ăn nhanh:**
- Burger (beef, chicken, veggie)
- Hot dog (classic, chili, cheese)
- Salad (caesar, garden, greek)
- Snacks (chips, nuts, crackers)

### 3.2. Business Rules

#### 3.2.1. Pricing Rules
- Giá sản phẩm theo size: Small (base), Medium (+20%), Large (+40%)
- Phụ phí toppings: 5,000-15,000 VND
- Miễn phí ship đơn hàng > 200,000 VND
- Phí ship: 25,000 VND (< 200k), 0 VND (>= 200k)

#### 3.2.2. Inventory Rules
- Cảnh báo hết hàng khi stock < 10
- Không cho phép đặt hàng khi stock = 0
- Tự động giảm stock sau khi đặt hàng thành công

#### 3.2.3. Discount Rules
- Mã giảm giá: 5-15% hoặc số tiền cố định
- Không áp dụng đồng thời nhiều mã
- Áp dụng trước khi tính phí ship

## 4. YÊU CẦU KỸ THUẬT

### 4.1. Technology Stack
**Backend:**
- Node.js với Express.js
- Database: MongoDB hoặc PostgreSQL
- Authentication: JWT + Passport.js
- File upload: Multer + CloudStorage

**Frontend:**
- React.js hoặc Vue.js (recommended)
- State management: Redux/Vuex
- UI Framework: Bootstrap/Tailwind CSS
- Real-time: Socket.io

### 4.2. API Requirements
**RESTful APIs:**
- `/api/auth/*` - Authentication endpoints
- `/api/products/*` - Product management
- `/api/cart/*` - Shopping cart operations
- `/api/orders/*` - Order management
- `/api/users/*` - User management
- `/api/admin/*` - Admin functions

**WebSocket Events:**
- `cart:updated` - Real-time cart updates
- `comment:new` - New product comments
- `rating:updated` - Rating updates

### 4.3. Database Design

#### 4.3.1. Core Entities
```
Users
- id, email, password, fullName, phone
- addresses: [street, city, district, isDefault]
- loyaltyPoints, socialAuth, isActive

Products
- id, name, description, category, brand
- basePrice, images: [url], tags
- variants: [{name, price, stock}]
- ratings: {average, count}

Orders
- id, userId, status, totalAmount
- items: [{productId, variantId, quantity, price}]
- shippingAddress, discountCode, loyaltyPointsUsed
- timestamps: {created, updated, statusHistory}

Categories
- id, name, slug, description, parentId

DiscountCodes
- id, code, type, value, usageLimit, usedCount
- isActive, createdAt
```

### 4.4. Security Requirements
- Password hashing với bcrypt (min 12 rounds)
- Input validation và sanitization
- Rate limiting cho APIs
- HTTPS required cho production
- File upload restrictions (type, size)
- SQL injection prevention
- XSS protection

## 5. YÊU CẦU TRIỂN KHAI

### 5.1. Deployment Options
**Option 1: Public Hosting**
- Platform: Heroku, Vercel, AWS, Netlify
- Database: MongoDB Atlas, AWS RDS
- File storage: Cloudinary, AWS S3
- Domain: Custom domain recommended

**Option 2: Docker Compose**
- Frontend container (React/Vue)
- Backend container (Node.js)
- Database container (MongoDB/PostgreSQL)
- Nginx reverse proxy
- Redis for caching (optional)

### 5.2. Environment Configuration
```yaml
# docker-compose.yml structure
version: '3.8'
services:
  frontend:
    build: ./frontend
    ports: ["3000:3000"]
  
  backend:
    build: ./backend
    ports: ["5000:5000"]
    environment:
      - NODE_ENV=production
      - DB_URL=mongodb://db:27017/coffee_shop
  
  database:
    image: mongo:latest
    volumes: ["db_data:/data/db"]
```

## 6. TESTING REQUIREMENTS

### 6.1. Functional Testing
- User registration/login flows
- Product browsing and search
- Cart operations and checkout
- Order placement and tracking
- Admin functionalities
- Payment processing (mock)

### 6.2. Performance Testing
- Page load times < 3 seconds
- API response times < 500ms
- Concurrent user handling (100+ users)
- Database query optimization

### 6.3. Security Testing
- Authentication bypass attempts
- Input validation testing
- File upload security
- API rate limiting verification

## 7. BONUS FEATURES (Tùy chọn - +2.0 điểm)

### 7.1. CI/CD Pipeline (+0.5 điểm)
- GitHub Actions workflow
- Automated testing và deployment
- Code quality checks với ESLint/Prettier

### 7.2. Microservices Architecture (+0.5 điểm)
- User Service
- Product Service  
- Order Service
- Notification Service
- API Gateway với load balancing
- RabbitMQ cho async communication

### 7.3. AI Features (+0.5 điểm)
- Chatbot đề xuất sản phẩm
- Image search cho sản phẩm
- Sentiment analysis cho reviews

### 7.4. ElasticSearch Integration (+0.5 điểm)
- Fast product search
- Search suggestions
- Analytics và search insights

## 8. TIMELINE VÀ MILESTONE

### Phase 1 (Tuần 1-2): Setup & Core Features
- Project setup và database design
- Authentication system
- Basic product catalog
- Shopping cart functionality

### Phase 2 (Tuần 3-4): Advanced Features
- Order management system
- Admin dashboard
- Payment integration
- Email notifications

### Phase 3 (Tuần 5-6): Testing & Deployment
- Comprehensive testing
- Performance optimization
- Deployment setup
- Documentation

### Phase 4 (Tuần 7-8): Polish & Bonus
- UI/UX improvements
- Bonus features implementation
- Final testing và bug fixes

## 9. RISK MANAGEMENT

### 9.1. Technical Risks
- **Risk**: Third-party API failures
- **Mitigation**: Implement fallback mechanisms

- **Risk**: Database performance issues
- **Mitigation**: Proper indexing và query optimization

### 9.2. Business Risks
- **Risk**: Feature scope creep
- **Mitigation**: Strict adherence to requirements document

- **Risk**: Timeline delays
- **Mitigation**: Agile development với regular checkpoints

## 10. SUCCESS CRITERIA

### 10.1. Functional Criteria
- ✅ Tất cả required features hoạt động đúng
- ✅ No critical bugs
- ✅ Performance requirements đạt được
- ✅ Security standards tuân thủ

### 10.2. Business Criteria
- ✅ User experience mượt mà
- ✅ Admin có thể quản lý hiệu quả
- ✅ Scalable architecture
- ✅ Production-ready deployment

---

**Tài liệu này tuân thủ hoàn toàn NodeJS Final Project requirements và được thiết kế để đạt điểm cao nhất ở tất cả các tiêu chí đánh giá.**

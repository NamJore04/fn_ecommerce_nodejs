# USE CASE DIAGRAM - COFFEE & TEA E-COMMERCE WEBSITE

## 1. Biểu đồ Use Case Tổng Quát

```mermaid
graph TB
    %% Actors
    Customer((Customer))
    Admin((Admin))
    Guest((Guest User))
    
    %% Main System
    subgraph "Coffee & Tea E-commerce System"
        %% Guest Functions
        UC1[Browse Products]
        UC2[Search & Filter Products]
        UC3[View Product Details]
        UC4[Add to Cart]
        UC5[Guest Checkout]
        UC6[Register Account]
        UC7[Social Login]
        
        %% Customer Functions  
        UC8[Login/Logout]
        UC9[Manage Profile]
        UC10[Manage Addresses]
        UC11[View Order History]
        UC12[Track Orders]
        UC13[Write Reviews]
        UC14[Rate Products]
        UC15[Use Loyalty Points]
        UC16[Apply Discount Codes]
        
        %% Admin Functions
        UC17[Manage Products]
        UC18[Manage Categories]
        UC19[Manage Users]
        UC20[Manage Orders]
        UC21[Manage Discounts]
        UC22[View Dashboard]
        UC23[Generate Reports]
    end
    
    %% Relationships
    Guest --> UC1
    Guest --> UC2
    Guest --> UC3
    Guest --> UC4
    Guest --> UC5
    Guest --> UC6
    Guest --> UC7
    
    Customer --> UC1
    Customer --> UC2
    Customer --> UC3
    Customer --> UC4
    Customer --> UC8
    Customer --> UC9
    Customer --> UC10
    Customer --> UC11
    Customer --> UC12
    Customer --> UC13
    Customer --> UC14
    Customer --> UC15
    Customer --> UC16
    
    Admin --> UC17
    Admin --> UC18
    Admin --> UC19
    Admin --> UC20
    Admin --> UC21
    Admin --> UC22
    Admin --> UC23
```

## 2. Use Case Chi Tiết cho Guest User

```mermaid
sequenceDiagram
    participant G as Guest User
    participant S as System
    participant DB as Database
    participant Email as Email Service
    
    Note over G,Email: Browse Products Without Login
    
    G->>S: Access homepage
    S->>DB: Get featured products
    DB-->>S: Return product list
    S-->>G: Display homepage with products
    
    G->>S: Browse category (Coffee/Tea/Food)
    S->>DB: Get products by category
    DB-->>S: Return filtered products
    S-->>G: Display products with pagination
    
    G->>S: Search products
    S->>DB: Search by name/description
    DB-->>S: Return search results
    S-->>G: Display results with filters
    
    G->>S: Add product to cart
    S-->>G: Update cart (session-based)
    
    G->>S: Proceed to checkout
    S-->>G: Request contact information
    G->>S: Provide email, name, address
    S->>DB: Create guest account
    S->>Email: Send order confirmation
    DB-->>S: Order created
    S-->>G: Show success page
```

## 3. Use Case Chi Tiết cho Customer Authentication

```mermaid
sequenceDiagram
    participant C as Customer
    participant S as System
    participant OAuth as Social Provider
    participant DB as Database
    participant Email as Email Service
    
    Note over C,Email: Registration & Login Process
    
    %% Registration
    C->>S: Register with email
    S->>DB: Check email uniqueness
    DB-->>S: Email available
    S->>DB: Create user account
    S->>Email: Send verification email
    Email-->>C: Verification link
    C->>S: Click verification link
    S->>DB: Activate account
    S-->>C: Account activated
    
    %% Social Login
    C->>S: Login with Google/Facebook
    S->>OAuth: Request authorization
    OAuth-->>C: Show consent screen
    C->>OAuth: Grant permission
    OAuth-->>S: Return user info
    S->>DB: Check/create user account
    S-->>C: Login successful
    
    %% Password Recovery
    C->>S: Forgot password
    S->>Email: Send reset link
    Email-->>C: Reset password link
    C->>S: Reset password
    S->>DB: Update password
    S-->>C: Password updated
```

## 4. Use Case Chi Tiết cho Product Management

```mermaid
sequenceDiagram
    participant C as Customer
    participant S as System
    participant DB as Database
    participant WS as WebSocket
    
    Note over C,WS: Product Browsing & Interaction
    
    %% Product Catalog
    C->>S: View product catalog
    S->>DB: Get products with pagination
    DB-->>S: Return products (20/page)
    S-->>C: Display product list
    
    %% Product Details
    C->>S: View product details
    S->>DB: Get product info + variants
    DB-->>S: Return detailed product data
    S-->>C: Show product page with variants
    
    %% Product Variants
    C->>S: Select variant (size/preparation)
    S->>DB: Check variant availability
    DB-->>S: Return variant stock
    S-->>C: Update price and availability
    
    %% Reviews & Ratings
    C->>S: Write review (login required)
    S->>DB: Save review
    S->>WS: Broadcast new review
    WS-->>C: Real-time review update
    
    %% Search & Filter
    C->>S: Apply filters (brand, price, category)
    S->>DB: Filter products
    DB-->>S: Return filtered results
    S-->>C: Update product list
    
    %% Sorting
    C->>S: Sort by (name A-Z, price asc/desc)
    S->>DB: Sort products
    DB-->>S: Return sorted results
    S-->>C: Update product order
```

## 5. Use Case Chi Tiết cho Shopping Cart & Checkout

```mermaid
sequenceDiagram
    participant C as Customer
    participant S as System
    participant DB as Database
    participant Payment as Payment Gateway
    participant Email as Email Service
    
    Note over C,Email: Shopping Cart & Checkout Process
    
    %% Add to Cart
    C->>S: Add product to cart
    S->>DB: Check product availability
    DB-->>S: Confirm stock
    S->>DB: Update cart
    S-->>C: Real-time cart update (no reload)
    
    %% Modify Cart
    C->>S: Update quantity
    S->>DB: Update cart item
    S-->>C: Recalculate totals
    
    C->>S: Remove item
    S->>DB: Remove from cart
    S-->>C: Update cart display
    
    %% Checkout Process
    C->>S: Proceed to checkout
    S->>DB: Get cart items
    S-->>C: Show checkout form
    
    %% Apply Discounts
    C->>S: Enter discount code
    S->>DB: Validate discount code
    DB-->>S: Check usage limit
    S-->>C: Apply discount/show error
    
    %% Use Loyalty Points
    C->>S: Apply loyalty points
    S->>DB: Check point balance
    S-->>C: Apply points discount
    
    %% Payment
    C->>S: Submit payment info
    S->>Payment: Process payment
    Payment-->>S: Payment confirmation
    S->>DB: Create order
    S->>DB: Update product stock
    S->>DB: Add loyalty points
    S->>Email: Send order confirmation
    S-->>C: Show success page
```

## 6. Use Case Chi Tiết cho Order Management

```mermaid
sequenceDiagram
    participant C as Customer
    participant A as Admin
    participant S as System
    participant DB as Database
    participant Email as Email Service
    
    Note over C,Email: Order Tracking & Management
    
    %% Customer Order Tracking
    C->>S: View order history
    S->>DB: Get customer orders
    DB-->>S: Return order list
    S-->>C: Display orders with status
    
    C->>S: Track specific order
    S->>DB: Get order status history
    DB-->>S: Return status timeline
    S-->>C: Show tracking information
    
    %% Admin Order Management
    A->>S: View all orders
    S->>DB: Get orders (20/page)
    DB-->>S: Return paginated orders
    S-->>A: Display order list
    
    A->>S: Filter orders by date
    S->>DB: Filter orders
    DB-->>S: Return filtered results
    S-->>A: Update order list
    
    A->>S: Update order status
    S->>DB: Update order status
    S->>DB: Add status history entry
    S->>Email: Notify customer
    S-->>A: Confirm status update
    
    %% Order Status Flow
    Note over DB: pending → confirmed → shipping → delivered
```

## 7. Use Case Chi Tiết cho Admin Dashboard

```mermaid
sequenceDiagram
    participant A as Admin
    participant S as System
    participant DB as Database
    participant Analytics as Analytics Engine
    
    Note over A,Analytics: Admin Dashboard & Reports
    
    %% Simple Dashboard
    A->>S: Access dashboard
    S->>DB: Get basic metrics
    DB-->>S: Return user count, orders, revenue
    S->>Analytics: Generate charts
    Analytics-->>S: Return chart data
    S-->>A: Display simple dashboard
    
    %% Advanced Dashboard
    A->>S: Select time period (yearly/monthly/custom)
    S->>DB: Get metrics for period
    DB-->>S: Return detailed analytics
    S->>Analytics: Generate comparative charts
    Analytics-->>S: Revenue, profit, product charts
    S-->>A: Display advanced dashboard
    
    %% Product Management
    A->>S: Manage products
    S->>DB: Get product list
    S-->>A: Show product management interface
    
    A->>S: Add/Edit/Delete product
    S->>DB: Perform CRUD operation
    S-->>A: Confirm operation
    
    %% User Management
    A->>S: View users
    S->>DB: Get user list
    S-->>A: Display users
    
    A->>S: Ban/Unban user
    S->>DB: Update user status
    S-->>A: Confirm action
    
    %% Discount Management
    A->>S: Create discount code
    S->>DB: Generate 5-char alphanumeric code
    S->>DB: Save discount with usage limit (max 10)
    S-->>A: Show created discount
    
    A->>S: View discount usage
    S->>DB: Get discount statistics
    S-->>A: Show usage data
```

## 8. Biểu đồ Use Case cho Real-time Features

```mermaid
sequenceDiagram
    participant C1 as Customer 1
    participant C2 as Customer 2
    participant S as System
    participant WS as WebSocket Server
    participant DB as Database
    
    Note over C1,DB: Real-time Cart & Comments
    
    %% Real-time Cart Updates
    C1->>S: Update cart quantity
    S->>WS: Emit cart update
    S->>DB: Save cart changes
    WS-->>C1: Instant cart update (no reload)
    
    %% Real-time Comments
    C1->>S: Post product comment
    S->>DB: Save comment
    S->>WS: Broadcast new comment
    WS-->>C2: Show new comment (if viewing same product)
    WS-->>C1: Confirm comment posted
    
    %% Real-time Ratings
    C1->>S: Rate product (stars)
    S->>DB: Save rating
    S->>DB: Recalculate average rating
    S->>WS: Broadcast rating update
    WS-->>C2: Update product rating display
```

## 9. Use Case cho Loyalty Program

```mermaid
sequenceDiagram
    participant C as Customer
    participant S as System
    participant DB as Database
    
    Note over C,DB: Loyalty Points System
    
    %% Earn Points
    C->>S: Complete order
    S->>DB: Calculate points (10% of order value)
    S->>DB: Add points to customer account
    S-->>C: Show points earned
    
    %% Use Points
    C->>S: Apply points at checkout
    S->>DB: Check point balance
    DB-->>S: Return available points
    S-->>C: Show applicable discount
    
    C->>S: Confirm point usage
    S->>DB: Deduct points from balance
    S->>DB: Apply discount to order
    S-->>C: Update order total
    
    %% View Point History
    C->>S: View point history
    S->>DB: Get point transactions
    DB-->>S: Return point history
    S-->>C: Display earned/used points
```

## 10. Error Handling Use Cases

```mermaid
sequenceDiagram
    participant U as User
    participant S as System
    participant DB as Database
    participant Log as Error Logger
    
    Note over U,Log: Error Handling Scenarios
    
    %% Product Out of Stock
    U->>S: Add out-of-stock product to cart
    S->>DB: Check product availability
    DB-->>S: Stock = 0
    S-->>U: Show "Out of Stock" message
    
    %% Invalid Discount Code
    U->>S: Apply discount code "INVALID"
    S->>DB: Check discount code
    DB-->>S: Code not found
    S-->>U: Show "Invalid discount code" error
    
    %% Payment Failure
    U->>S: Submit payment
    S->>Payment: Process payment
    Payment-->>S: Payment declined
    S->>Log: Log payment failure
    S-->>U: Show payment error + retry option
    
    %% Session Timeout
    U->>S: Perform action (login required)
    S-->>S: Check session validity
    S-->>U: Redirect to login page
    
    %% Server Error
    U->>S: Any request
    S-->>S: Internal server error
    S->>Log: Log error details
    S-->>U: Show friendly error message
```

---

## Hướng dẫn sử dụng Use Case Diagrams

### Cách đọc biểu đồ:
1. **Actors** (hình oval): Guest User, Customer, Admin
2. **Use Cases** (hình chữ nhật): Các chức năng của hệ thống
3. **Relationships** (mũi tên): Tương tác giữa actor và use case

### Sequence Diagrams:
- Mô tả luồng thực hiện chi tiết của từng use case
- Hiển thị thứ tự tương tác giữa các thành phần
- Bao gồm cả xử lý lỗi và edge cases

### Sử dụng trong development:
1. **Planning**: Xác định scope và requirements
2. **Development**: Implement theo đúng luồng mô tả
3. **Testing**: Validate các scenario đã định nghĩa
4. **Documentation**: Tài liệu tham khảo cho team

Các Use Case này được thiết kế để đáp ứng đầy đủ yêu cầu NodeJS Final Project và đạt điểm cao nhất.

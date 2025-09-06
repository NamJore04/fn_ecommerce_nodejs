# API SPECIFICATION - COFFEE & TEA E-COMMERCE

## 1. API Overview

### 1.1. Base Information
- **Base URL**: `https://api.coffeetea.com/v1` (production) hoặc `http://localhost:5000/api/v1` (development)
- **Authentication**: JWT Bearer Token
- **Content-Type**: `application/json`
- **Rate Limiting**: 100 requests/minute per IP
- **API Version**: v1

### 1.2. Response Format
```json
{
  "success": true,
  "data": {},
  "message": "Operation successful",
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  },
  "timestamp": "2024-12-27T10:00:00Z"
}
```

### 1.3. Error Response Format
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "email",
        "message": "Email is required"
      }
    ]
  },
  "timestamp": "2024-12-27T10:00:00Z"
}
```

## 2. Authentication APIs

### 2.1. User Registration
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123",
  "fullName": "John Doe",
  "phone": "0901234567",
  "address": {
    "addressLine": "123 Main St",
    "city": "Ho Chi Minh City",
    "district": "District 1",
    "postalCode": "70000"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid-here",
      "email": "user@example.com",
      "fullName": "John Doe",
      "loyaltyPoints": 0
    },
    "accessToken": "jwt-token-here",
    "refreshToken": "refresh-token-here"
  },
  "message": "Registration successful"
}
```

### 2.2. User Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

### 2.3. Social Authentication
```http
POST /auth/social/google
Content-Type: application/json

{
  "googleToken": "google-oauth-token",
  "userInfo": {
    "email": "user@gmail.com",
    "name": "John Doe",
    "picture": "https://profile-pic-url"
  }
}
```

### 2.4. Password Recovery
```http
POST /auth/forgot-password
Content-Type: application/json

{
  "email": "user@example.com"
}
```

```http
POST /auth/reset-password
Content-Type: application/json

{
  "token": "reset-token-from-email",
  "newPassword": "NewSecurePass123"
}
```

## 3. Product APIs

### 3.1. Get Product Catalog
```http
GET /products?page=1&limit=20&category=coffee&brand=highlands&sort=price_asc&minPrice=50000&maxPrice=200000&search=vietnamese
Authorization: Bearer jwt-token (optional)
```

**Response:**
```json
{
  "success": true,
  "data": {
    "products": [
      {
        "id": "uuid-here",
        "name": "Vietnamese Drip Coffee",
        "slug": "vietnamese-drip-coffee",
        "description": "Authentic Vietnamese coffee experience...",
        "basePrice": 45000,
        "images": [
          "https://cdn.example.com/coffee1.jpg",
          "https://cdn.example.com/coffee2.jpg"
        ],
        "category": {
          "id": "cat-uuid",
          "name": "Coffee & Espresso",
          "slug": "coffee-espresso"
        },
        "brand": {
          "id": "brand-uuid", 
          "name": "Highlands Coffee"
        },
        "rating": {
          "average": 4.5,
          "count": 128
        },
        "variants": [
          {
            "id": "variant-uuid",
            "name": "Medium Hot",
            "price": 45000,
            "inStock": true
          }
        ],
        "tags": ["vietnamese", "traditional", "hot"],
        "isActive": true
      }
    ]
  },
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

### 3.2. Get Product Details
```http
GET /products/:productId
Authorization: Bearer jwt-token (optional)
```

**Response:**
```json
{
  "success": true,
  "data": {
    "product": {
      "id": "uuid-here",
      "name": "Vietnamese Drip Coffee", 
      "slug": "vietnamese-drip-coffee",
      "description": "Detailed description with at least 5 lines...",
      "basePrice": 45000,
      "images": [
        "https://cdn.example.com/coffee1.jpg",
        "https://cdn.example.com/coffee2.jpg",
        "https://cdn.example.com/coffee3.jpg"
      ],
      "category": {
        "id": "cat-uuid",
        "name": "Coffee & Espresso"
      },
      "brand": {
        "id": "brand-uuid",
        "name": "Highlands Coffee"
      },
      "variants": [
        {
          "id": "variant-uuid-1",
          "type": "size",
          "name": "Small",
          "priceAdjustment": 0,
          "finalPrice": 45000,
          "stock": 50,
          "sku": "VDC-S-001"
        },
        {
          "id": "variant-uuid-2", 
          "type": "size",
          "name": "Medium",
          "priceAdjustment": 5000,
          "finalPrice": 50000,
          "stock": 30,
          "sku": "VDC-M-001"
        }
      ],
      "rating": {
        "average": 4.5,
        "count": 128
      },
      "reviews": [
        {
          "id": "review-uuid",
          "user": {
            "name": "Customer A",
            "avatar": "https://avatar-url"
          },
          "rating": 5,
          "comment": "Excellent coffee!",
          "isVerifiedPurchase": true,
          "createdAt": "2024-12-26T10:00:00Z"
        }
      ]
    }
  }
}
```

### 3.3. Search Products
```http
GET /products/search?q=coffee&filters[category]=coffee&filters[brand]=highlands&sort=relevance
Authorization: Bearer jwt-token (optional)
```

### 3.4. Get Categories
```http
GET /categories
```

**Response:**
```json
{
  "success": true,
  "data": {
    "categories": [
      {
        "id": "uuid-here",
        "name": "Coffee & Espresso",
        "slug": "coffee-espresso",
        "description": "All types of coffee and espresso",
        "imageUrl": "https://cdn.example.com/category-coffee.jpg",
        "productCount": 45,
        "subcategories": [
          {
            "id": "sub-uuid",
            "name": "Coffee Beans",
            "slug": "coffee-beans",
            "productCount": 20
          }
        ]
      }
    ]
  }
}
```

### 3.5. Get Featured Products
```http
GET /products/featured?section=new_products
# sections: new_products, best_sellers, featured
```

## 4. Cart APIs

### 4.1. Get Cart
```http
GET /cart
Authorization: Bearer jwt-token (optional - for guest cart use session)
```

**Response:**
```json
{
  "success": true,
  "data": {
    "cart": {
      "id": "cart-uuid",
      "items": [
        {
          "id": "item-uuid",
          "product": {
            "id": "product-uuid",
            "name": "Vietnamese Drip Coffee",
            "images": ["https://image-url"]
          },
          "variant": {
            "id": "variant-uuid",
            "name": "Medium Hot",
            "price": 50000
          },
          "quantity": 2,
          "unitPrice": 50000,
          "totalPrice": 100000
        }
      ],
      "summary": {
        "subtotal": 100000,
        "shippingFee": 25000,
        "discountAmount": 0,
        "loyaltyPointsUsed": 0,
        "total": 125000,
        "itemCount": 2
      }
    }
  }
}
```

### 4.2. Add to Cart
```http
POST /cart/items
Authorization: Bearer jwt-token (optional)
Content-Type: application/json

{
  "productId": "product-uuid",
  "variantId": "variant-uuid", 
  "quantity": 1
}
```

### 4.3. Update Cart Item
```http
PUT /cart/items/:itemId
Authorization: Bearer jwt-token (optional)
Content-Type: application/json

{
  "quantity": 3
}
```

### 4.4. Remove Cart Item
```http
DELETE /cart/items/:itemId
Authorization: Bearer jwt-token (optional)
```

### 4.5. Clear Cart
```http
DELETE /cart
Authorization: Bearer jwt-token (optional)
```

## 5. Order APIs

### 5.1. Create Order (Checkout)
```http
POST /orders
Authorization: Bearer jwt-token (optional for guest checkout)
Content-Type: application/json

{
  "customerInfo": {
    "email": "customer@example.com",
    "fullName": "John Doe",
    "phone": "0901234567"
  },
  "shippingAddress": {
    "addressLine": "123 Main St",
    "city": "Ho Chi Minh City",
    "district": "District 1",
    "postalCode": "70000"
  },
  "items": [
    {
      "productId": "product-uuid",
      "variantId": "variant-uuid",
      "quantity": 2,
      "unitPrice": 50000
    }
  ],
  "discountCode": "SAVE15",
  "loyaltyPointsUsed": 50,
  "paymentMethod": "cash_on_delivery"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "order": {
      "id": "order-uuid",
      "orderNumber": "ORD-2024-001234",
      "status": "pending",
      "customerInfo": {
        "email": "customer@example.com",
        "fullName": "John Doe",
        "phone": "0901234567"
      },
      "shippingAddress": {
        "addressLine": "123 Main St",
        "city": "Ho Chi Minh City",
        "district": "District 1"
      },
      "items": [
        {
          "productName": "Vietnamese Drip Coffee",
          "variantName": "Medium Hot",
          "quantity": 2,
          "unitPrice": 50000,
          "totalPrice": 100000
        }
      ],
      "summary": {
        "subtotal": 100000,
        "shippingFee": 25000,
        "discountAmount": 15000,
        "loyaltyPointsUsed": 50,
        "total": 110000
      },
      "loyaltyPointsEarned": 11000,
      "createdAt": "2024-12-27T10:00:00Z"
    }
  },
  "message": "Order created successfully"
}
```

### 5.2. Get Order History
```http
GET /orders?page=1&limit=10&status=completed
Authorization: Bearer jwt-token
```

### 5.3. Get Order Details
```http
GET /orders/:orderId
Authorization: Bearer jwt-token
```

**Response:**
```json
{
  "success": true,
  "data": {
    "order": {
      "id": "order-uuid",
      "orderNumber": "ORD-2024-001234",
      "status": "delivered",
      "statusHistory": [
        {
          "status": "pending",
          "timestamp": "2024-12-27T10:00:00Z",
          "note": "Order received"
        },
        {
          "status": "confirmed",
          "timestamp": "2024-12-27T10:15:00Z",
          "note": "Payment confirmed"
        },
        {
          "status": "delivered",
          "timestamp": "2024-12-27T12:30:00Z",
          "note": "Order delivered successfully"
        }
      ],
      "items": [],
      "summary": {},
      "createdAt": "2024-12-27T10:00:00Z"
    }
  }
}
```

### 5.4. Track Order
```http
GET /orders/:orderId/tracking
Authorization: Bearer jwt-token (optional for guest with email verification)
```

## 6. User Profile APIs

### 6.1. Get Profile
```http
GET /users/profile
Authorization: Bearer jwt-token
```

### 6.2. Update Profile
```http
PUT /users/profile
Authorization: Bearer jwt-token
Content-Type: application/json

{
  "fullName": "John Smith",
  "phone": "0987654321"
}
```

### 6.3. Change Password
```http
POST /users/change-password
Authorization: Bearer jwt-token
Content-Type: application/json

{
  "currentPassword": "OldPass123",
  "newPassword": "NewPass123"
}
```

### 6.4. Manage Addresses
```http
GET /users/addresses
Authorization: Bearer jwt-token
```

```http
POST /users/addresses
Authorization: Bearer jwt-token
Content-Type: application/json

{
  "addressLine": "456 New Street",
  "city": "Ho Chi Minh City", 
  "district": "District 3",
  "postalCode": "70000",
  "isDefault": false
}
```

```http
PUT /users/addresses/:addressId
Authorization: Bearer jwt-token
```

```http
DELETE /users/addresses/:addressId
Authorization: Bearer jwt-token
```

## 7. Review & Rating APIs

### 7.1. Get Product Reviews
```http
GET /products/:productId/reviews?page=1&limit=10&sort=newest
```

### 7.2. Add Review
```http
POST /products/:productId/reviews
Authorization: Bearer jwt-token
Content-Type: application/json

{
  "rating": 5,
  "comment": "Excellent coffee! Highly recommended."
}
```

### 7.3. Update Review
```http
PUT /reviews/:reviewId
Authorization: Bearer jwt-token
Content-Type: application/json

{
  "rating": 4,
  "comment": "Updated review comment"
}
```

## 8. Discount & Loyalty APIs

### 8.1. Validate Discount Code
```http
POST /discounts/validate
Content-Type: application/json

{
  "code": "SAVE15",
  "orderTotal": 100000
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "discount": {
      "id": "discount-uuid",
      "code": "SAVE15",
      "type": "percentage",
      "value": 15,
      "discountAmount": 15000,
      "isValid": true,
      "usageRemaining": 8
    }
  }
}
```

### 8.2. Get Loyalty Points
```http
GET /users/loyalty-points
Authorization: Bearer jwt-token
```

### 8.3. Get Loyalty Transactions
```http
GET /users/loyalty-points/transactions?page=1&limit=20
Authorization: Bearer jwt-token
```

## 9. Admin APIs

### 9.1. Admin Dashboard
```http
GET /admin/dashboard/simple
Authorization: Bearer admin-jwt-token
```

**Response:**
```json
{
  "success": true,
  "data": {
    "metrics": {
      "totalUsers": 1250,
      "newUsers": 45,
      "totalOrders": 3456,
      "revenue": 125000000,
      "bestSellingProducts": [
        {
          "id": "product-uuid",
          "name": "Vietnamese Drip Coffee",
          "totalSold": 234,
          "revenue": 11700000
        }
      ]
    },
    "charts": {
      "salesChart": {
        "labels": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        "data": [120, 150, 180, 165, 200, 250, 220]
      }
    }
  }
}
```

### 9.2. Advanced Dashboard
```http
GET /admin/dashboard/advanced?period=monthly&year=2024&month=12
Authorization: Bearer admin-jwt-token
```

### 9.3. Product Management
```http
GET /admin/products?page=1&limit=20&search=coffee
Authorization: Bearer admin-jwt-token
```

```http
POST /admin/products
Authorization: Bearer admin-jwt-token
Content-Type: multipart/form-data

{
  "name": "New Coffee Product",
  "description": "Product description...",
  "categoryId": "category-uuid",
  "brandId": "brand-uuid",
  "basePrice": 50000,
  "variants": [
    {
      "name": "Small",
      "type": "size",
      "priceAdjustment": 0,
      "stock": 100
    }
  ],
  "images": [file1, file2, file3]
}
```

### 9.4. User Management
```http
GET /admin/users?page=1&limit=20&search=john&status=active
Authorization: Bearer admin-jwt-token
```

```http
PUT /admin/users/:userId/status
Authorization: Bearer admin-jwt-token
Content-Type: application/json

{
  "isActive": false,
  "reason": "Violation of terms"
}
```

### 9.5. Order Management
```http
GET /admin/orders?page=1&limit=20&status=pending&dateFrom=2024-12-01&dateTo=2024-12-31
Authorization: Bearer admin-jwt-token
```

```http
PUT /admin/orders/:orderId/status
Authorization: Bearer admin-jwt-token
Content-Type: application/json

{
  "status": "confirmed",
  "note": "Order confirmed by admin"
}
```

### 9.6. Discount Management
```http
GET /admin/discounts?page=1&limit=20
Authorization: Bearer admin-jwt-token
```

```http
POST /admin/discounts
Authorization: Bearer admin-jwt-token
Content-Type: application/json

{
  "code": "SAVE20",
  "type": "percentage",
  "value": 20,
  "minimumOrder": 100000,
  "usageLimit": 10,
  "isActive": true
}
```

## 10. Real-time WebSocket Events

### 10.1. Cart Updates
```javascript
// Client subscribes to cart updates
socket.on('cart:updated', (data) => {
  // Update cart UI in real-time
  updateCartDisplay(data.cart);
});

// Server emits cart updates
socket.emit('cart:updated', {
  cartId: 'cart-uuid',
  cart: cartData
});
```

### 10.2. Product Reviews
```javascript
// Real-time review updates
socket.on('product:review:new', (data) => {
  addReviewToDisplay(data.review);
  updateProductRating(data.rating);
});
```

### 10.3. Order Status Updates
```javascript
// Real-time order status updates
socket.on('order:status:updated', (data) => {
  updateOrderStatus(data.orderId, data.status);
});
```

## 11. Error Codes

### 11.1. Authentication Errors
- `AUTH_001`: Invalid credentials
- `AUTH_002`: Token expired
- `AUTH_003`: Token invalid
- `AUTH_004`: Access denied

### 11.2. Validation Errors
- `VAL_001`: Required field missing
- `VAL_002`: Invalid email format
- `VAL_003`: Password too weak
- `VAL_004`: Invalid data type

### 11.3. Business Logic Errors
- `BIZ_001`: Product out of stock
- `BIZ_002`: Invalid discount code
- `BIZ_003`: Insufficient loyalty points
- `BIZ_004`: Order already processed

### 11.4. System Errors
- `SYS_001`: Database connection error
- `SYS_002`: External service unavailable
- `SYS_003`: File upload failed
- `SYS_004`: Rate limit exceeded

## 12. API Testing Examples

### 12.1. Postman Collection Structure
```json
{
  "info": {
    "name": "Coffee & Tea E-commerce API",
    "version": "1.0.0"
  },
  "folders": [
    {
      "name": "Authentication",
      "requests": ["Register", "Login", "Social Login", "Forgot Password"]
    },
    {
      "name": "Products",
      "requests": ["Get Products", "Get Product Details", "Search", "Categories"]
    },
    {
      "name": "Cart",
      "requests": ["Get Cart", "Add Item", "Update Item", "Remove Item"]
    },
    {
      "name": "Orders", 
      "requests": ["Create Order", "Get Orders", "Order Details", "Track Order"]
    },
    {
      "name": "Admin",
      "requests": ["Dashboard", "Manage Products", "Manage Users", "Manage Orders"]
    }
  ]
}
```

API specification này đảm bảo:
- **RESTful design** tuân theo standards
- **Comprehensive coverage** của tất cả features
- **Consistent response format** 
- **Proper authentication & authorization**
- **Real-time capabilities** với WebSocket
- **Admin functionality** đầy đủ
- **Error handling** chi tiết

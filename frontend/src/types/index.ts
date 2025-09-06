// Shared TypeScript Types - Coffee & Tea E-commerce
// Synchronized with backend types for consistency

// ============================================
// USER & AUTHENTICATION TYPES
// ============================================

export interface User {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  role: 'CUSTOMER' | 'ADMIN' | 'STAFF' | 'SUPER_ADMIN';
  emailVerified: boolean;
  isActive: boolean;
  loyaltyPoints: number;
  loyaltyTier: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    accessToken: string;
    refreshToken: string;
  };
}

// ============================================
// PRODUCT TYPES
// ============================================

export interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string;
  shortDescription?: string;
  basePrice: number | string;
  salePrice?: number | string | null;
  sku?: string;
  stockQuantity: number;
  weight?: number;
  dimensions?: string;
  category: Category;
  brand?: Brand;
  images?: ProductImage[];
  variants?: ProductVariant[];
  averageRating?: number;
  reviewCount?: number;
  isActive?: boolean;
  isFeatured: boolean;
  tags: string[];
  seoTitle?: string;
  seoDescription?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parentId?: string;
  isActive: boolean;
  sortOrder: number;
  children?: Category[];
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  isActive: boolean;
}

export interface ProductImage {
  id?: string;
  url: string;
  alt?: string;
  isPrimary?: boolean;
  sortOrder?: number;
}

export interface ProductVariant {
  id: string;
  name: string;
  value?: string;
  price?: number;
  priceAdjustment?: number;
  stock?: number;
  stockQuantity?: number;
  sku?: string;
}

// ============================================
// CART TYPES
// ============================================

export interface CartItem {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
  variantId?: string;
  variant?: ProductVariant;
  unitPrice: number;
  totalPrice: number;
  addedAt: string;
}

export interface Cart {
  id: string;
  userId?: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  currency: 'VND';
  itemCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface AddToCartRequest {
  productId: string;
  quantity: number;
  variantId?: string;
}

export interface UpdateCartItemRequest {
  quantity: number;
}

// ============================================
// ORDER TYPES
// ============================================

export type OrderStatus = 
  | 'PENDING' 
  | 'CONFIRMED' 
  | 'PROCESSING' 
  | 'SHIPPING' 
  | 'DELIVERED' 
  | 'CANCELLED' 
  | 'REFUNDED';

export type PaymentStatus = 
  | 'PENDING' 
  | 'PROCESSING' 
  | 'COMPLETED' 
  | 'FAILED' 
  | 'CANCELLED' 
  | 'REFUNDED';

export type PaymentMethod = 'COD' | 'VNPAY' | 'MOMO' | 'ZALOPAY';

export interface ShippingAddress {
  fullName: string;
  phone: string;
  email?: string;
  address: string;
  city: string;
  district: string;
  ward: string;
  postalCode?: string;
  isDefault?: boolean;
}

export interface OrderItem {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
  variantId?: string;
  variant?: ProductVariant;
  unitPrice: number;
  totalPrice: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId?: string;
  user?: User;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  currency: 'VND';
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  shippingAddress: ShippingAddress;
  notes?: string;
  trackingNumber?: string;
  estimatedDelivery?: string;
  loyaltyPointsEarned: number;
  loyaltyPointsUsed: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderRequest {
  shippingAddress: ShippingAddress;
  paymentMethod: PaymentMethod;
  notes?: string;
  loyaltyPointsUsed?: number;
}

export interface UpdateOrderStatusRequest {
  status: OrderStatus;
  statusReason?: string;
  adminNotes?: string;
  trackingNumber?: string;
  estimatedDelivery?: string;
}

export interface OrderSummary {
  totalOrders: number;
  totalSpent: number;
  averageOrderValue: number;
  lastOrderDate?: string;
  favoriteCategories: string[];
  loyaltyPointsEarned: number;
  loyaltyPointsUsed: number;
  loyaltyPointsBalance: number;
}

// ============================================
// API RESPONSE TYPES
// ============================================

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  code?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ============================================
// FILTER & SEARCH TYPES
// ============================================

export interface ProductFilters {
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  onSale?: boolean;
  rating?: number;
  search?: string;
  tags?: string[];
  page?: number;
  limit?: number;
  sortBy?: 'name' | 'price' | 'rating' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export interface OrderFilters {
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

// ============================================
// UI STATE TYPES
// ============================================

export interface LoadingState {
  isLoading: boolean;
  message?: string;
}

export interface ErrorState {
  hasError: boolean;
  message?: string;
  code?: string;
}

// ============================================
// VIETNAM-SPECIFIC TYPES
// ============================================

export interface VietnameseAddress {
  fullName: string;
  phone: string;
  address: string;
  ward: string;      // Phường/Xã
  district: string;  // Quận/Huyện
  city: string;      // Tỉnh/Thành phố
  postalCode?: string;
}

export interface VNDCurrency {
  amount: number;
  currency: 'VND';
  formatted: string; // e.g., "1.234.567 ₫"
}

// ============================================
// CONSTANTS
// ============================================

export const VIETNAM_TAX_RATE = 0.08; // 8% VAT
export const DEFAULT_CURRENCY = 'VND';
export const LOYALTY_POINTS_RATE = 0.01; // 1% of order value

// ============================================
// CHECKOUT TYPES EXPORT
// ============================================

// Re-export checkout types
export * from './checkout.types';

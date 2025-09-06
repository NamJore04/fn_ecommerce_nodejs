// Order Module Types - Coffee & Tea E-commerce
// Following memory bank order-module-bank specifications

import { OrderStatus, PaymentStatus, FulfillmentStatus } from '@prisma/client';

// ============================================
// SHOPPING CART TYPES
// ============================================

export interface CartItem {
  id: string;
  userId: string;
  productId: string;
  variantId?: string;
  quantity: number;
  customizations?: {
    giftMessage?: string;
    specialInstructions?: string;
    [key: string]: any;
  };
  
  // Product details (populated)
  product: {
    id: string;
    name: string;
    slug: string;
    basePrice: number;
    images: string[];
    isActive: boolean;
    stockQuantity: number;
  };
  
  variant?: {
    id: string;
    name: string;
    price: number;
    stockQuantity: number;
    sku: string;
  } | undefined;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface AddToCartRequest {
  productId: string;
  variantId?: string;
  quantity: number;
  customizations?: {
    giftMessage?: string;
    specialInstructions?: string;
    [key: string]: any;
  };
}

export interface UpdateCartItemRequest {
  quantity: number;
  customizations?: {
    giftMessage?: string;
    specialInstructions?: string;
    [key: string]: any;
  };
}

export interface CartSummary {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  estimatedTax: number;
  estimatedShipping: number;
  estimatedTotal: number;
  appliedCoupons: AppliedCoupon[];
  loyaltyPointsAvailable: number;
  loyaltyPointsValue: number;
}

// ============================================
// ORDER TYPES
// ============================================

export interface UpdateOrderStatusRequest {
  status: OrderStatus;
  paymentStatus?: PaymentStatus;
  fulfillmentStatus?: FulfillmentStatus;
  statusReason?: string;
  adminNotes?: string;
  trackingNumber?: string;
}

export interface OrderSearchParams {
  page?: number;
  limit?: number;
  status?: OrderStatus;
  startDate?: Date;
  endDate?: Date;
  sortBy?: 'createdAt' | 'updatedAt' | 'totalAmount' | 'orderNumber';
  sortOrder?: 'asc' | 'desc';
}

export interface OrderSummary {
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  totalSpent: number;
  recentOrders: Order[];
}

export interface CreateOrderRequest {
  // Customer Information (for guest orders)
  guestEmail?: string;
  guestPhone?: string;
  
  // Addresses
  shippingAddress: Address;
  billingAddress?: Address;
  
  // Shipping
  shippingMethod: string;
  
  // Payment
  paymentMethod: string;
  
  // Order Notes
  customerNotes?: string;
  
  // Loyalty Points
  loyaltyPointsToRedeem?: number;
  
  // Applied Coupons
  couponCodes?: string[];
}

export interface Order {
  id: string;
  orderNumber: string;
  userId?: string;
  
  // Customer Information
  guestEmail?: string;
  guestPhone?: string;
  customer?: {
    id: string;
    email: string;
    fullName: string;
    phone?: string;
  } | undefined;
  
  // Order Status
  status: OrderStatus;
  fulfillmentStatus: FulfillmentStatus;
  
  // Pricing Breakdown
  subtotal: number;
  taxAmount: number;
  shippingAmount: number;
  discountAmount: number;
  loyaltyPointsDiscount: number;
  couponDiscount: number;
  totalAmount: number;
  
  // Addresses
  shippingAddress: Address;
  billingAddress?: Address;
  
  // Payment Information
  paymentMethod?: string;
  paymentStatus: PaymentStatus;
  paymentId?: string;
  transactionId?: string;
  
  // Shipping Information
  shippingMethod?: string;
  trackingNumber?: string;
  
  // Order Notes
  customerNotes?: string;
  adminNotes?: string;
  
  // Loyalty Points
  pointsEarned: number;
  pointsRedeemed: number;
  
  // Items
  items: OrderItem[];
  
  // Status History
  statusHistory?: OrderStatusHistory[];
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  shippedAt?: Date;
  deliveredAt?: Date;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  variantId?: string;
  
  // Item Details at time of purchase
  productName: string;
  variantName?: string;
  sku: string;
  
  // Pricing & Quantity
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  
  // Product Snapshot
  productSnapshot?: {
    description?: string;
    images: string[];
    attributes: { [key: string]: any };
  };
  
  createdAt: Date;
}

export interface OrderStatusHistory {
  id: string;
  orderId: string;
  status: OrderStatus;
  fulfillmentStatus: FulfillmentStatus;
  notes?: string;
  createdBy?: string;
  createdAt: Date;
}

// ============================================
// ADDRESS TYPES
// ============================================

export interface Address {
  firstName: string;
  lastName: string;
  company?: string;
  address1: string;
  address2?: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
  phone?: string;
}

// ============================================
// PAYMENT TYPES
// ============================================

export interface PaymentMethodInfo {
  type: 'CARD' | 'BANK_TRANSFER' | 'COD' | 'WALLET' | 'LOYALTY_POINTS';
  provider?: string;
  last4?: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
}

export interface ProcessPaymentRequest {
  orderId: string;
  paymentMethod: string;
  paymentDetails: {
    cardToken?: string;
    bankAccount?: string;
    walletPhone?: string;
    [key: string]: any;
  };
}

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  paymentId?: string;
  status: PaymentStatus;
  message?: string;
  errorCode?: string;
}

// ============================================
// COUPON & DISCOUNT TYPES
// ============================================

export interface AppliedCoupon {
  code: string;
  name: string;
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT' | 'FREE_SHIPPING';
  discountValue: number;
  appliedAmount: number;
}

export interface ValidateCouponRequest {
  code: string;
  subtotal: number;
  userId?: string;
}

export interface CouponValidationResult {
  valid: boolean;
  coupon?: {
    code: string;
    name: string;
    discountType: 'PERCENTAGE' | 'FIXED_AMOUNT' | 'FREE_SHIPPING';
    discountValue: number;
    minimumAmount?: number;
    maximumDiscount?: number;
  };
  appliedAmount?: number;
  message?: string;
}

// ============================================
// SHIPPING TYPES
// ============================================

export interface ShippingMethod {
  id: string;
  name: string;
  description: string;
  estimatedDays: string;
  price: number;
  freeShippingThreshold?: number;
}

export interface ShippingCalculationRequest {
  items: {
    productId: string;
    variantId?: string;
    quantity: number;
    weight?: number;
    dimensions?: {
      length: number;
      width: number;
      height: number;
    };
  }[];
  shippingAddress: Address;
}

// ============================================
// LOYALTY PROGRAM TYPES
// ============================================

export interface LoyaltyPointsTransaction {
  id: string;
  userId: string;
  orderId?: string;
  type: 'EARNED_PURCHASE' | 'EARNED_SIGNUP' | 'EARNED_REFERRAL' | 'EARNED_REVIEW' | 'EARNED_BIRTHDAY' | 'REDEEMED_DISCOUNT' | 'REDEEMED_PRODUCT' | 'EXPIRED' | 'ADJUSTED';
  points: number;
  description: string;
  createdAt: Date;
  expiresAt?: Date;
}

export interface LoyaltyPointsBalance {
  totalEarned: number;
  totalRedeemed: number;
  availablePoints: number;
  pendingPoints: number;
  expiringPoints: {
    points: number;
    expiresAt: Date;
  }[];
}

// ============================================
// SEARCH & FILTER TYPES
// ============================================

export interface OrderSearchQuery {
  // Basic filters
  query?: string; // Search in order number, customer email, etc.
  status?: OrderStatus[];
  paymentStatus?: PaymentStatus[];
  fulfillmentStatus?: FulfillmentStatus[];
  
  // Date range
  startDate?: Date;
  endDate?: Date;
  
  // Customer filters
  userId?: string;
  guestEmail?: string;
  
  // Amount filters
  minAmount?: number;
  maxAmount?: number;
  
  // Sorting
  sortBy?: 'createdAt' | 'updatedAt' | 'totalAmount' | 'orderNumber';
  sortOrder?: 'asc' | 'desc';
  
  // Pagination
  page?: number;
  limit?: number;
}

export interface OrderListResponse {
  orders: Order[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  filters: {
    statusCounts: { [key in OrderStatus]: number };
    paymentStatusCounts: { [key in PaymentStatus]: number };
    fulfillmentStatusCounts: { [key in FulfillmentStatus]: number };
  };
}

// ============================================
// CHECKOUT TYPES
// ============================================

export interface CheckoutSession {
  id: string;
  userId?: string;
  guestEmail?: string;
  
  // Cart Items
  items: CartItem[];
  
  // Addresses
  shippingAddress?: Address;
  billingAddress?: Address;
  
  // Shipping & Payment Selection
  selectedShippingMethod?: ShippingMethod;
  selectedPaymentMethod?: string;
  
  // Applied Discounts
  appliedCoupons: AppliedCoupon[];
  loyaltyPointsToRedeem: number;
  
  // Pricing
  subtotal: number;
  taxAmount: number;
  shippingAmount: number;
  discountAmount: number;
  loyaltyPointsValue: number;
  totalAmount: number;
  
  // Session Management
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface InitiateCheckoutRequest {
  cartItems?: AddToCartRequest[]; // For direct checkout without cart
  shippingAddress?: Address;
  guestEmail?: string;
}

export interface UpdateCheckoutRequest {
  shippingAddress?: Address;
  billingAddress?: Address;
  shippingMethod?: string;
  paymentMethod?: string;
  couponCode?: string;
  loyaltyPointsToRedeem?: number;
}

// ============================================
// BUSINESS RULES & CONSTANTS
// ============================================

export const ORDER_BUSINESS_RULES = {
  cart: {
    maxItemsPerCart: 50,
    maxQuantityPerItem: 10,
    guestCartExpiryDays: 7,
  },
  order: {
    minimumOrderValue: 50000, // VND
    freeShippingThreshold: 500000, // VND
    checkoutTimeoutMinutes: 15,
    cancellationWindowHours: 2,
  },
  loyalty: {
    pointsPerVND: 0.01,
    welcomeBonus: 100,
    redemptionRate: 100, // 100 points = 10,000 VND
    minimumRedemption: 50,
    pointsExpiryMonths: 24,
  },
} as const;

// ============================================
// ERROR TYPES
// ============================================

export class OrderError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 400
  ) {
    super(message);
    this.name = 'OrderError';
  }
}

export class CartError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 400
  ) {
    super(message);
    this.name = 'CartError';
  }
}

export class PaymentError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 400
  ) {
    super(message);
    this.name = 'PaymentError';
  }
}

export class CheckoutError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 400
  ) {
    super(message);
    this.name = 'CheckoutError';
  }
}

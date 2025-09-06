// Order Service - Coffee & Tea E-commerce
// Manages order lifecycle from creation to fulfillment

import { PrismaClient, Order as PrismaOrder, OrderStatus, PaymentStatus, FulfillmentStatus } from '@prisma/client';
import { 
  Order, 
  CreateOrderRequest,
  UpdateOrderStatusRequest,
  OrderSummary,
  OrderError,
  OrderSearchParams,
  ORDER_BUSINESS_RULES,
  LoyaltyPointsTransaction
} from '../types/order.types';

export class OrderService {
  constructor(private prisma: PrismaClient) {}

  // ================================
  // ORDER CREATION & MANAGEMENT
  // ================================

  async createOrder(userId: string, request: CreateOrderRequest): Promise<Order> {
    try {
      // Start a transaction for order creation
      const orderId = await this.prisma.$transaction(async (tx) => {
        // Validate cart items and calculate totals
        const cartItems = await tx.cartItem.findMany({
          where: { userId },
          include: {
            product: true,
            variant: true
          }
        });

        if (cartItems.length === 0) {
          throw new OrderError('Cart is empty', 'EMPTY_CART');
        }

        // Validate inventory and calculate order details
        let subtotal = 0;
        const orderItems = [];

        for (const cartItem of cartItems) {
          const product = cartItem.product;
          const variant = cartItem.variant;

          // Check product availability
          if (!product.isActive) {
            throw new OrderError(`Product ${product.name} is no longer available`, 'PRODUCT_NOT_AVAILABLE');
          }

          if (variant && !variant.isActive) {
            throw new OrderError(`Product variant ${product.name} - ${variant.variantName} is no longer available`, 'VARIANT_NOT_AVAILABLE');
          }

          // Check stock availability
          const availableStock = variant?.stockQuantity ?? product.stockQuantity;
          if (availableStock < cartItem.quantity) {
            throw new OrderError(
              `Insufficient stock for ${product.name}${variant ? ` - ${variant.variantName}` : ''}. Available: ${availableStock}`,
              'INSUFFICIENT_STOCK'
            );
          }

          // Calculate price
          const unitPrice = variant ? 
            Number(product.basePrice) + Number(variant.priceAdjustment) : 
            Number(product.basePrice);
          
          const itemTotal = unitPrice * cartItem.quantity;
          subtotal += itemTotal;

          orderItems.push({
            productId: cartItem.productId,
            variantId: cartItem.variantId,
            productName: product.name,
            variantName: variant?.variantName || null,
            sku: variant?.sku || product.sku,
            quantity: cartItem.quantity,
            unitPrice: unitPrice,
            totalPrice: itemTotal,
            productSnapshot: {
              name: product.name,
              sku: product.sku,
              description: product.description,
              category: product.categoryId,
              images: product.images
            }
          });
        }

        // Calculate tax (8% VAT in Vietnam)
        const taxAmount = Math.round(subtotal * 0.08);

        // Calculate shipping
        const shippingAmount = subtotal >= ORDER_BUSINESS_RULES.order.freeShippingThreshold ? 0 : 30000;

        // Apply loyalty points if requested
        let loyaltyPointsUsed = 0;
        let loyaltyPointsDiscount = 0;
        if (request.loyaltyPointsToRedeem && request.loyaltyPointsToRedeem > 0) {
          const user = await tx.user.findUnique({
            where: { id: userId },
            select: { loyaltyPoints: true }
          });

          if (!user) {
            throw new OrderError('User not found', 'USER_NOT_FOUND', 404);
          }

          const maxPointsToUse = Math.min(
            request.loyaltyPointsToRedeem,
            user.loyaltyPoints,
            Math.floor((subtotal + taxAmount + shippingAmount) / 10000) * ORDER_BUSINESS_RULES.loyalty.redemptionRate
          );

          loyaltyPointsUsed = maxPointsToUse;
          loyaltyPointsDiscount = Math.floor(maxPointsToUse / ORDER_BUSINESS_RULES.loyalty.redemptionRate) * 10000;
        }

        // Apply coupon discount if provided
        let couponDiscount = 0;
        let appliedCoupons = [];
        // TODO: Implement coupon system

        // Calculate final total
        const totalAmount = Math.max(0, subtotal + taxAmount + shippingAmount - loyaltyPointsDiscount - couponDiscount);

        // Create order
        const order = await tx.order.create({
          data: {
            userId,
            orderNumber: await this.generateOrderNumber(),
            status: OrderStatus.PENDING,
            paymentStatus: PaymentStatus.PENDING,
            fulfillmentStatus: FulfillmentStatus.PENDING,
            
            // Amounts
            subtotal: subtotal,
            taxAmount: taxAmount,
            shippingAmount: shippingAmount,
            discountAmount: loyaltyPointsDiscount + couponDiscount,
            totalAmount: totalAmount,
            
            // Shipping
            shippingAddress: request.shippingAddress as any,
            billingAddress: (request.billingAddress || request.shippingAddress) as any,
            
            // Payment
            paymentMethod: request.paymentMethod,
            
            // Customer notes
            customerNotes: request.customerNotes || null
          }
        });

        // Create order items
        for (const item of orderItems) {
          await tx.orderItem.create({
            data: {
              orderId: order.id,
              ...item
            }
          });
        }

        // Update stock quantities
        for (const cartItem of cartItems) {
          if (cartItem.variantId) {
            await tx.productVariant.update({
              where: { id: cartItem.variantId },
              data: {
                stockQuantity: {
                  decrement: cartItem.quantity
                }
              }
            });
          } else {
            await tx.product.update({
              where: { id: cartItem.productId },
              data: {
                stockQuantity: {
                  decrement: cartItem.quantity
                }
              }
            });
          }
        }

        // Process loyalty points
        if (loyaltyPointsUsed > 0) {
          // Deduct used points
          await tx.user.update({
            where: { id: userId },
            data: {
              loyaltyPoints: {
                decrement: loyaltyPointsUsed
              }
            }
          });

          // Record transaction
          await tx.loyaltyTransaction.create({
            data: {
              userId,
              orderId: order.id,
              type: 'REDEEMED_DISCOUNT',
              points: -loyaltyPointsUsed,
              description: `Points redeemed for order ${order.orderNumber}`,
              expiresAt: null
            }
          });
        }

        // Award new loyalty points for purchase
        const pointsEarned = Math.floor(totalAmount / ORDER_BUSINESS_RULES.loyalty.pointsPerVND);
        if (pointsEarned > 0) {
          await tx.user.update({
            where: { id: userId },
            data: {
              loyaltyPoints: {
                increment: pointsEarned
              }
            }
          });

          // Record transaction
          await tx.loyaltyTransaction.create({
            data: {
              userId,
              orderId: order.id,
              type: 'EARNED_PURCHASE',
              points: pointsEarned,
              description: `Points earned from order ${order.orderNumber}`,
              expiresAt: new Date(Date.now() + ORDER_BUSINESS_RULES.loyalty.pointsExpiryMonths * 30 * 24 * 60 * 60 * 1000)
            }
          });
        }

        // Create order status history
        await tx.orderStatusHistory.create({
          data: {
            orderId: order.id,
            fromStatus: null,
            toStatus: OrderStatus.PENDING,
            reason: 'Order created'
          }
        });

        // Clear cart
        await tx.cartItem.deleteMany({
          where: { userId }
        });

        return order.id; // Return just the ID
      });

      // Fetch the complete order with items after transaction commits
      const completeOrder = await this.prisma.order.findUnique({
        where: { id: orderId },
        include: {
          items: true,
          statusHistory: {
            orderBy: { createdAt: 'desc' },
            take: 5
          },
          user: {
            select: {
              id: true,
              email: true,
              fullName: true,
              phone: true
            }
          }
        }
      });

      if (!completeOrder) {
        throw new OrderError('Order not found after creation', 'ORDER_NOT_FOUND', 404);
      }

      return this.enrichOrder(completeOrder);
    } catch (error) {
      if (error instanceof OrderError) {
        throw error;
      }
      console.error('Error creating order:', error);
      throw new OrderError('Failed to create order', 'CREATE_ORDER_FAILED', 500);
    }
  }

  async getOrder(orderId: string, userId?: string): Promise<Order> {
    try {
      const whereClause: any = { id: orderId };
      if (userId) {
        whereClause.userId = userId;
      }

      const order = await this.prisma.order.findUnique({
        where: whereClause,
        include: {
          items: true,
          statusHistory: {
            orderBy: { createdAt: 'desc' }
          },
          user: {
            select: {
              id: true,
              email: true,
              fullName: true,
              phone: true
            }
          }
        }
      });

      if (!order) {
        throw new OrderError('Order not found', 'ORDER_NOT_FOUND', 404);
      }

      return this.enrichOrder(order);
    } catch (error) {
      if (error instanceof OrderError) {
        throw error;
      }
      
      // Handle Prisma UUID validation errors as 404
      if ((error as any)?.code === 'P2023' || (error as any)?.message?.includes('invalid character')) {
        throw new OrderError('Order not found', 'ORDER_NOT_FOUND', 404);
      }
      
      console.error('Error getting order:', error);
      throw new OrderError('Failed to retrieve order', 'GET_ORDER_FAILED', 500);
    }
  }

  async updateOrderStatus(
    orderId: string, 
    request: UpdateOrderStatusRequest, 
    adminUserId?: string
  ): Promise<Order> {
    try {
      return await this.prisma.$transaction(async (tx) => {
        const order = await tx.order.findUnique({
          where: { id: orderId }
        });

        if (!order) {
          throw new OrderError('Order not found', 'ORDER_NOT_FOUND', 404);
        }

        // Validate status transition
        if (!this.isValidStatusTransition(order.status, request.status)) {
          throw new OrderError(
            `Invalid status transition from ${order.status} to ${request.status}`,
            'INVALID_STATUS_TRANSITION'
          );
        }

        // Update order
        const updatedOrder = await tx.order.update({
          where: { id: orderId },
          data: {
            status: request.status,
            paymentStatus: request.paymentStatus || order.paymentStatus,
            fulfillmentStatus: request.fulfillmentStatus || order.fulfillmentStatus,
            adminNotes: request.adminNotes || order.adminNotes,
            trackingNumber: request.trackingNumber || order.trackingNumber,
            shippedAt: request.status === OrderStatus.SHIPPED ? new Date() : order.shippedAt,
            deliveredAt: request.status === OrderStatus.DELIVERED ? new Date() : order.deliveredAt,
            updatedAt: new Date()
          }
        });

        // Create status history
        await tx.orderStatusHistory.create({
          data: {
            orderId,
            fromStatus: order.status,
            toStatus: request.status,
            reason: request.statusReason || `Status updated to ${request.status}`,
            performedBy: adminUserId || null
          }
        });

        return this.enrichOrder(updatedOrder);
      });
    } catch (error) {
      if (error instanceof OrderError) {
        throw error;
      }
      console.error('Error updating order status:', error);
      throw new OrderError('Failed to update order status', 'UPDATE_ORDER_STATUS_FAILED', 500);
    }
  }

  // ================================
  // ORDER QUERIES & SEARCH
  // ================================

  async getOrdersByUser(
    userId: string, 
    params: OrderSearchParams = {}
  ): Promise<{ orders: Order[]; totalCount: number; totalPages: number; pagination: any; filters: any }> {
    try {
      const {
        page = 1,
        limit = 10,
        status,
        startDate,
        endDate,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = params;

      const skip = (page - 1) * limit;
      
      const whereClause: any = {
        userId,
        ...(status && { status: status as OrderStatus }),
        ...(startDate && endDate && {
          createdAt: {
            gte: startDate,
            lte: endDate
          }
        })
      };

      const [orders, totalCount, statusCounts] = await Promise.all([
        this.prisma.order.findMany({
          where: whereClause,
          include: {
            items: true,
            statusHistory: {
              orderBy: { createdAt: 'desc' },
              take: 1
            }
          },
          orderBy: { [sortBy]: sortOrder },
          skip,
          take: limit
        }),
        this.prisma.order.count({ where: whereClause }),
        this.getOrderStatusCounts(userId)
      ]);

      const enrichedOrders = await Promise.all(
        orders.map(order => this.enrichOrder(order))
      );

      const totalPages = Math.ceil(totalCount / limit);

      return {
        orders: enrichedOrders,
        totalCount,
        totalPages,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: totalCount,
          itemsPerPage: limit,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        },
        filters: {
          statusCounts,
          dateRange: { startDate, endDate }
        }
      };
    } catch (error) {
      console.error('Error getting orders by user:', error);
      throw new OrderError('Failed to retrieve orders', 'GET_ORDERS_FAILED', 500);
    }
  }

  async getOrdersWithPagination(
    params: OrderSearchParams = {}
  ): Promise<{ orders: Order[]; totalCount: number; totalPages: number; pagination: any; filters: any }> {
    try {
      const {
        page = 1,
        limit = 10,
        status,
        startDate,
        endDate,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = params;

      const skip = (page - 1) * limit;
      
      const whereClause: any = {
        ...(status && { status: status as OrderStatus }),
        ...(startDate && endDate && {
          createdAt: {
            gte: startDate,
            lte: endDate
          }
        })
      };

      const [orders, totalCount, statusCounts] = await Promise.all([
        this.prisma.order.findMany({
          where: whereClause,
          include: {
            items: true,
            statusHistory: {
              orderBy: { createdAt: 'desc' },
              take: 1
            },
            user: {
              select: {
                id: true,
                email: true,
                fullName: true,
                phone: true
              }
            }
          },
          orderBy: { [sortBy]: sortOrder },
          skip,
          take: limit
        }),
        this.prisma.order.count({ where: whereClause }),
        this.getAllOrderStatusCounts()
      ]);

      const enrichedOrders = await Promise.all(
        orders.map(order => this.enrichOrder(order))
      );

      const totalPages = Math.ceil(totalCount / limit);

      return {
        orders: enrichedOrders,
        totalCount,
        totalPages,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: totalCount,
          itemsPerPage: limit,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        },
        filters: {
          statusCounts,
          dateRange: { startDate, endDate }
        }
      };
    } catch (error) {
      console.error('Error getting orders with pagination:', error);
      throw new OrderError('Failed to retrieve orders', 'GET_ORDERS_FAILED', 500);
    }
  }

  async trackOrderByNumber(orderNumber: string): Promise<any> {
    try {
      const order = await this.prisma.order.findUnique({
        where: { orderNumber },
        include: {
          items: {
            include: {
              product: {
                select: { name: true, images: true }
              },
              variant: {
                select: { variantName: true }
              }
            }
          },
          statusHistory: {
            orderBy: { createdAt: 'asc' }
          }
        }
      });

      if (!order) {
        throw new OrderError('Order not found', 'ORDER_NOT_FOUND', 404);
      }

      // Calculate delivery progress
      const deliveryProgress = {
        confirmed: ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'].includes(order.status),
        processing: ['PROCESSING', 'SHIPPED', 'DELIVERED'].includes(order.status),
        shipping: ['SHIPPED', 'DELIVERED'].includes(order.status),
        delivered: order.status === 'DELIVERED'
      };

      // Calculate estimated delivery
      let estimatedDelivery = order.deliveredAt;
      if (!estimatedDelivery && order.status === 'SHIPPED') {
        estimatedDelivery = new Date();
        estimatedDelivery.setDate(estimatedDelivery.getDate() + 2); // 2 days after shipping
      }

      return {
        orderNumber: order.orderNumber,
        status: order.status,
        statusHistory: order.statusHistory.map((history: any) => ({
          status: history.toStatus,
          timestamp: history.createdAt,
          note: history.reason,
          location: null // Could be extended with shipping location data
        })),
        trackingNumber: order.trackingNumber,
        estimatedDelivery: estimatedDelivery?.toISOString(),
        currentLocation: null, // Could be extended with real-time tracking
        shippingCarrier: order.shippingMethod || 'Standard Delivery',
        deliveryProgress,
        items: order.items.map((item: any) => ({
          productName: item.product?.name,
          variantName: item.variant?.variantName,
          quantity: item.quantity,
          image: item.product?.images?.[0]
        })),
        shippingAddress: order.shippingAddress,
        totalAmount: Number(order.totalAmount)
      };
    } catch (error) {
      if (error instanceof OrderError) {
        throw error;
      }
      console.error('Error tracking order:', error);
      throw new OrderError('Failed to track order', 'TRACK_ORDER_FAILED', 500);
    }
  }

  async cancelOrder(orderId: string, reason: string, userId: string): Promise<Order> {
    try {
      return await this.prisma.$transaction(async (tx) => {
        const order = await tx.order.findUnique({
          where: { id: orderId },
          include: { items: true }
        });

        if (!order) {
          throw new OrderError('Order not found', 'ORDER_NOT_FOUND', 404);
        }

        // Check if order can be cancelled
        const cancellableStatuses = ['PENDING', 'CONFIRMED'];
        if (!cancellableStatuses.includes(order.status)) {
          throw new OrderError(
            `Order cannot be cancelled. Current status: ${order.status}`,
            'ORDER_CANNOT_BE_CANCELLED',
            400
          );
        }

        // Update order status to cancelled
        const cancelledOrder = await tx.order.update({
          where: { id: orderId },
          data: {
            status: 'CANCELLED' as OrderStatus,
            adminNotes: reason,
            updatedAt: new Date()
          }
        });

        // Restore stock quantities
        for (const item of order.items) {
          if (item.variantId) {
            await tx.productVariant.update({
              where: { id: item.variantId },
              data: {
                stockQuantity: {
                  increment: item.quantity
                }
              }
            });
          } else {
            await tx.product.update({
              where: { id: item.productId },
              data: {
                stockQuantity: {
                  increment: item.quantity
                }
              }
            });
          }
        }

        // Create status history
        await tx.orderStatusHistory.create({
          data: {
            orderId,
            fromStatus: order.status,
            toStatus: 'CANCELLED' as OrderStatus,
            reason: reason,
            performedBy: userId
          }
        });

        // Restore loyalty points if used
        if (order.pointsRedeemed && order.pointsRedeemed > 0 && order.userId) {
          await tx.user.update({
            where: { id: order.userId },
            data: {
              loyaltyPoints: {
                increment: order.pointsRedeemed
              }
            }
          });
        }

        return this.enrichOrder(cancelledOrder);
      });
    } catch (error) {
      if (error instanceof OrderError) {
        throw error;
      }
      console.error('Error cancelling order:', error);
      throw new OrderError('Failed to cancel order', 'CANCEL_ORDER_FAILED', 500);
    }
  }

  private async getOrderStatusCounts(userId: string): Promise<Record<string, number>> {
    const statusCounts = await this.prisma.order.groupBy({
      by: ['status'],
      where: { userId },
      _count: { status: true }
    });

    const counts: Record<string, number> = {};
    statusCounts.forEach(item => {
      counts[item.status] = item._count.status;
    });

    return counts;
  }

  private async getAllOrderStatusCounts(): Promise<Record<string, number>> {
    const statusCounts = await this.prisma.order.groupBy({
      by: ['status'],
      _count: { status: true }
    });

    const counts: Record<string, number> = {};
    statusCounts.forEach(item => {
      counts[item.status] = item._count.status;
    });

    return counts;
  }

  async getOrderSummary(userId: string): Promise<OrderSummary> {
    try {
      const [
        totalOrders,
        pendingOrders,
        completedOrders,
        totalSpent
      ] = await Promise.all([
        this.prisma.order.count({
          where: { userId }
        }),
        this.prisma.order.count({
          where: { 
            userId,
            status: { in: [OrderStatus.PENDING, OrderStatus.PROCESSING, OrderStatus.SHIPPED] }
          }
        }),
        this.prisma.order.count({
          where: { 
            userId,
            status: OrderStatus.DELIVERED
          }
        }),
        this.prisma.order.aggregate({
          where: { 
            userId,
            status: OrderStatus.DELIVERED
          },
          _sum: { totalAmount: true }
        })
      ]);

      // Get recent orders
      const recentOrders = await this.prisma.order.findMany({
        where: { userId },
        include: {
          items: {
            take: 3
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 5
      });

      const enrichedRecentOrders = await Promise.all(
        recentOrders.map(order => this.enrichOrder(order))
      );

      return {
        totalOrders,
        pendingOrders,
        completedOrders,
        totalSpent: Number(totalSpent._sum.totalAmount || 0),
        recentOrders: enrichedRecentOrders
      };
    } catch (error) {
      console.error('Error getting order summary:', error);
      throw new OrderError('Failed to retrieve order summary', 'GET_ORDER_SUMMARY_FAILED', 500);
    }
  }

  // ================================
  // HELPER METHODS
  // ================================

  private async generateOrderNumber(): Promise<string> {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    
    // Count orders today to get sequence
    const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);
    
    const ordersToday = await this.prisma.order.count({
      where: {
        createdAt: {
          gte: startOfDay,
          lt: endOfDay
        }
      }
    });

    const sequence = (ordersToday + 1).toString().padStart(4, '0');
    return `CT${year}${month}${day}${sequence}`;
  }

  private calculateExpectedDeliveryDate(shippingAddress: any): Date {
    const deliveryDate = new Date();
    
    // Add delivery days based on address (simplified logic)
    // In a real application, this would integrate with shipping providers
    const deliveryDays = 3; // Default 3 days for domestic delivery
    deliveryDate.setDate(deliveryDate.getDate() + deliveryDays);
    
    return deliveryDate;
  }

  private isValidStatusTransition(currentStatus: OrderStatus, newStatus: OrderStatus): boolean {
    const validTransitions: Record<OrderStatus, OrderStatus[]> = {
      [OrderStatus.PENDING]: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
      [OrderStatus.CONFIRMED]: [OrderStatus.PROCESSING, OrderStatus.CANCELLED],
      [OrderStatus.PROCESSING]: [OrderStatus.SHIPPED, OrderStatus.CANCELLED],
      [OrderStatus.SHIPPED]: [OrderStatus.DELIVERED, OrderStatus.RETURNED],
      [OrderStatus.DELIVERED]: [OrderStatus.RETURNED, OrderStatus.REFUNDED],
      [OrderStatus.CANCELLED]: [],
      [OrderStatus.RETURNED]: [OrderStatus.REFUNDED],
      [OrderStatus.REFUNDED]: []
    };

    return validTransitions[currentStatus]?.includes(newStatus) || false;
  }

  private async enrichOrder(order: any): Promise<Order> {
    // If order doesn't include items, fetch them
    let items = order.items;
    if (!items) {
      items = await this.prisma.orderItem.findMany({
        where: { orderId: order.id }
      });
    }

    // If order doesn't include status history, fetch recent
    let statusHistory = order.statusHistory;
    if (!statusHistory) {
      statusHistory = await this.prisma.orderStatusHistory.findMany({
        where: { orderId: order.id },
        orderBy: { createdAt: 'desc' },
        take: 5
      });
    }

    return {
      id: order.id,
      userId: order.userId,
      orderNumber: order.orderNumber,
      status: order.status,
      paymentStatus: order.paymentStatus,
      fulfillmentStatus: order.fulfillmentStatus,
      
      // Amounts
      subtotal: Number(order.subtotal),
      taxAmount: Number(order.taxAmount),
      shippingAmount: Number(order.shippingAmount),
      discountAmount: Number(order.discountAmount || 0),
      loyaltyPointsDiscount: Number(order.pointsRedeemed) * 100 || 0, // 1 point = 100 VND
      couponDiscount: Number(order.discountAmount || 0),
      totalAmount: Number(order.totalAmount),
      
      // Loyalty Points
      pointsEarned: Number(order.pointsEarned || 0),
      pointsRedeemed: Number(order.pointsRedeemed || 0),
      
      // Addresses
      shippingAddress: order.shippingAddress,
      billingAddress: order.billingAddress,
      
      // Payment & Delivery
      paymentMethod: order.paymentMethod,
      trackingNumber: order.trackingNumber,
      
      // Notes
      customerNotes: order.customerNotes,
      adminNotes: order.adminNotes,
      
      // Items
      items: items.map((item: any) => ({
        id: item.id,
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity,
        unitPrice: Number(item.unitPrice),
        totalPrice: Number(item.totalPrice),
        productSnapshot: item.productSnapshot,
        variantSnapshot: item.variantSnapshot,
        customizations: item.customizations
      })),
      
      // Status history
      statusHistory: statusHistory.map((history: any) => ({
        id: history.id,
        status: history.status,
        statusReason: history.statusReason,
        changedAt: history.changedAt,
        changedBy: history.changedBy
      })),
      
      // Customer info (if included)
      customer: order.user ? {
        id: order.user.id,
        email: order.user.email,
        fullName: order.user.fullName,
        phone: order.user.phone
      } : undefined,
      
      // Timestamps
      createdAt: order.createdAt,
      updatedAt: order.updatedAt
    };
  }
}

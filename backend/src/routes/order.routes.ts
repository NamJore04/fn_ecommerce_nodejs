// Order Routes - Coffee & Tea E-commerce
// RESTful API endpoints for order management

import { Router } from 'express';
import { PrismaClient, OrderStatus } from '@prisma/client';
import { OrderService } from '../services/order.service';
import { authMiddleware } from '../middleware/auth.middleware';
import { 
  CreateOrderRequest,
  UpdateOrderStatusRequest
} from '../types/order.types';

const router = Router();
const prisma = new PrismaClient();
const orderService = new OrderService(prisma);

// ================================
// ORDER MANAGEMENT ENDPOINTS
// ================================

/**
 * @route   POST /api/orders
 * @desc    Create new order from cart
 * @access  Private (Authenticated users only)
 */
router.post('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User authentication required'
      });
    }

    const createOrderRequest: CreateOrderRequest = req.body;
    
    // Validate required fields
    if (!createOrderRequest.shippingAddress) {
      return res.status(400).json({
        success: false,
        message: 'Shipping address is required'
      });
    }

    if (!createOrderRequest.paymentMethod) {
      return res.status(400).json({
        success: false,
        message: 'Payment method is required'
      });
    }

    // Create order
    const order = await orderService.createOrder(userId, createOrderRequest);

    return res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: order
    });

  } catch (error: any) {
    console.error('Create order error:', error);
    
    if (error.code === 'EMPTY_CART' || error.code === 'INSUFFICIENT_STOCK') {
      return res.status(400).json({
        success: false,
        message: error.message,
        code: error.code
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to create order',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route   GET /api/orders
 * @desc    Get user's orders with filtering and pagination
 * @access  Private
 */
router.get('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User authentication required'
      });
    }

    // Parse query parameters with enhanced filtering
    const searchParams: any = {
      page: parseInt(req.query.page as string) || 1,
      limit: Math.min(parseInt(req.query.limit as string) || 10, 50), // Max 50 per page
      startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
      endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
      sortBy: (req.query.sortBy as string) || 'createdAt',
      sortOrder: (req.query.sortOrder as 'asc' | 'desc') || 'desc'
    };

    // Only add status if it's provided and valid
    if (req.query.status && Object.values(OrderStatus).includes(req.query.status as OrderStatus)) {
      searchParams.status = req.query.status as OrderStatus;
    }

    // Admin can view all orders with additional filters
    if (userRole === 'ADMIN' || userRole === 'STAFF') {
      // If no specific user filter and user is admin, get all orders
      const result = await orderService.getOrdersWithPagination(searchParams);
      return res.json({
        success: true,
        message: 'Orders retrieved successfully',
        data: result.orders,
        pagination: result.pagination,
        filters: result.filters
      });
    } else {
      // Regular users get their own orders
      const result = await orderService.getOrdersByUser(userId, searchParams);
      return res.json({
        success: true,
        message: 'Orders retrieved successfully',
        data: result.orders,
        pagination: result.pagination,
        filters: result.filters
      });
    }

  } catch (error: any) {
    console.error('Get orders error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve orders',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route   GET /api/orders/:id
 * @desc    Get specific order by ID
 * @access  Private
 */
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const orderId = req.params.id;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User authentication required'
      });
    }

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: 'Order ID is required'
      });
    }

    const order = await orderService.getOrder(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check ownership (users can only view their own orders, admins can view all)
    if (order.userId !== userId && userRole !== 'ADMIN' && userRole !== 'STAFF') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    return res.json({
      success: true,
      message: 'Order retrieved successfully',
      data: order
    });

  } catch (error: any) {
<<<<<<< HEAD
    console.error('Get order error:', error);
=======
    // Only log errors in non-test environments
    if (process.env.NODE_ENV !== 'test') {
      console.error('Get order error:', error);
    }
>>>>>>> e0366de708e308e3f8f2d024af0ae5c307cac571
    
    // Handle OrderError with specific status codes
    if (error.code === 'ORDER_NOT_FOUND') {
      return res.status(404).json({
        success: false,
        message: error.message || 'Order not found'
      });
    }
    
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve order',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route   PUT /api/orders/:id/status
 * @desc    Update order status (Admin only)
 * @access  Private (Admin/Staff only)
 */
router.put('/:id/status', authMiddleware, async (req, res) => {
  try {
    const orderId = req.params.id;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    // Check admin permissions
    if (userRole !== 'ADMIN' && userRole !== 'STAFF') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User authentication required'
      });
    }

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: 'Order ID is required'
      });
    }

    const updateRequest: UpdateOrderStatusRequest = req.body;

    // Validate required fields
    if (!updateRequest.status) {
      return res.status(400).json({
        success: false,
        message: 'Order status is required'
      });
    }

    const updatedOrder = await orderService.updateOrderStatus(orderId, updateRequest, userId);

    return res.json({
      success: true,
      message: 'Order status updated successfully',
      data: updatedOrder
    });

  } catch (error: any) {
<<<<<<< HEAD
    console.error('Update order status error:', error);
=======
    // Only log errors in non-test environments
    if (process.env.NODE_ENV !== 'test') {
      console.error('Update order status error:', error);
    }
>>>>>>> e0366de708e308e3f8f2d024af0ae5c307cac571
    
    if (error.code === 'ORDER_NOT_FOUND') {
      return res.status(404).json({
        success: false,
        message: error.message,
        code: error.code
      });
    }

    if (error.code === 'INVALID_STATUS_TRANSITION') {
      return res.status(400).json({
        success: false,
        message: error.message,
        code: error.code
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to update order status',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route   GET /api/orders/track/:orderNumber
 * @desc    Track order by order number (public with order number)
 * @access  Public (with order number validation)
 */
router.get('/track/:orderNumber', async (req, res) => {
  try {
    const orderNumber = req.params.orderNumber;

    if (!orderNumber) {
      return res.status(400).json({
        success: false,
        message: 'Order number is required'
      });
    }

    const trackingData = await orderService.trackOrderByNumber(orderNumber);

    if (!trackingData) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    return res.json({
      success: true,
      message: 'Order tracking information retrieved successfully',
      data: trackingData
    });

  } catch (error: any) {
<<<<<<< HEAD
    console.error('Track order error:', error);
=======
    // Only log errors in non-test environments
    if (process.env.NODE_ENV !== 'test') {
      console.error('Track order error:', error);
    }
>>>>>>> e0366de708e308e3f8f2d024af0ae5c307cac571
    
    if (error.code === 'ORDER_NOT_FOUND') {
      return res.status(404).json({
        success: false,
        message: error.message,
        code: error.code
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve order tracking information',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route   PUT /api/orders/:id/cancel
 * @desc    Cancel order (customer or admin)
 * @access  Private
 */
router.put('/:id/cancel', authMiddleware, async (req, res) => {
  try {
    const orderId = req.params.id;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User authentication required'
      });
    }

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: 'Order ID is required'
      });
    }

    const cancelReason = req.body.reason || 'Customer requested cancellation';

    // Get order to check ownership
    const order = await orderService.getOrder(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check permissions (user can cancel their own orders, admin can cancel any)
    if (order.userId !== userId && userRole !== 'ADMIN' && userRole !== 'STAFF') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const cancelledOrder = await orderService.cancelOrder(orderId, cancelReason, userId);

    return res.json({
      success: true,
      message: 'Order cancelled successfully',
      data: cancelledOrder
    });

  } catch (error: any) {
<<<<<<< HEAD
    console.error('Cancel order error:', error);
=======
    // Only log errors in non-test environments
    if (process.env.NODE_ENV !== 'test') {
      console.error('Cancel order error:', error);
    }
>>>>>>> e0366de708e308e3f8f2d024af0ae5c307cac571
    
    if (error.code === 'ORDER_NOT_FOUND') {
      return res.status(404).json({
        success: false,
        message: error.message,
        code: error.code
      });
    }

    if (error.code === 'ORDER_CANNOT_BE_CANCELLED') {
      return res.status(400).json({
        success: false,
        message: error.message,
        code: error.code
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to cancel order',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route   GET /api/orders/summary/user
 * @desc    Get order summary for user
 * @access  Private
 */
router.get('/summary/user', authMiddleware, async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User authentication required'
      });
    }

    const summary = await orderService.getOrderSummary(userId);

    return res.json({
      success: true,
      message: 'Order summary retrieved successfully',
      data: summary
    });

  } catch (error: any) {
    console.error('Get order summary error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve order summary',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default router;

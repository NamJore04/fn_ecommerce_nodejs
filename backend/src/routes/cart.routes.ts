// Cart Routes - Coffee & Tea E-commerce
// API endpoints for shopping cart functionality

import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { CartService } from '../services/cart.service';
import { authMiddleware } from '../middleware/auth.middleware';
import { CartError } from '../types/order.types';

const router = Router();
const prisma = new PrismaClient();
const cartService = new CartService(prisma);

// ================================
// CART MANAGEMENT ROUTES
// ================================

/**
 * @route   POST /api/cart/add
 * @desc    Add item to cart
 * @access  Private
 */
router.post('/add', authMiddleware, async (req, res) => {
  try {
    const userId = req.user!.id;
    const { productId, variantId, quantity, customizations } = req.body;

    // Validate required fields
    if (!productId || !quantity || quantity <= 0) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'Product ID and valid quantity are required'
      });
    }

    const cartItem = await cartService.addToCart(userId, {
      productId,
      variantId,
      quantity,
      customizations
    });

    return res.status(201).json({
      success: true,
      data: cartItem,
      message: 'Item added to cart successfully'
    });
  } catch (error) {
<<<<<<< HEAD
    console.error('Error adding to cart:', error);
=======
    // Only log errors in non-test environments
    if (process.env.NODE_ENV !== 'test') {
      console.error('Error adding to cart:', error);
    }
>>>>>>> e0366de708e308e3f8f2d024af0ae5c307cac571
    
    if (error instanceof CartError) {
      return res.status(error.statusCode || 400).json({
        error: error.code,
        message: error.message
      });
    }

    return res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'Failed to add item to cart'
    });
  }
});

/**
 * @route   GET /api/cart
 * @desc    Get user's cart with summary
 * @access  Private
 */
router.get('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.user!.id;
    const cartSummary = await cartService.getCart(userId);

    return res.json({
      success: true,
      data: cartSummary
    });
  } catch (error) {
    console.error('Error getting cart:', error);
    
    if (error instanceof CartError) {
      return res.status(error.statusCode || 400).json({
        error: error.code,
        message: error.message
      });
    }

    return res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'Failed to retrieve cart'
    });
  }
});

/**
 * @route   PUT /api/cart/items/:itemId
 * @desc    Update cart item quantity or customizations
 * @access  Private
 */
router.put('/items/:itemId', authMiddleware, async (req, res) => {
  try {
    const userId = req.user!.id;
    const { itemId } = req.params;
    const { quantity, customizations } = req.body;

    if (!itemId) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'Item ID is required'
      });
    }

    // Validate quantity
    if (!quantity || quantity <= 0) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'Valid quantity is required'
      });
    }

    const updatedItem = await cartService.updateCartItem(userId, itemId, {
      quantity,
      customizations
    });

    return res.json({
      success: true,
      data: updatedItem,
      message: 'Cart item updated successfully'
    });
  } catch (error) {
    console.error('Error updating cart item:', error);
    
    if (error instanceof CartError) {
      return res.status(error.statusCode || 400).json({
        error: error.code,
        message: error.message
      });
    }

    return res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'Failed to update cart item'
    });
  }
});

/**
 * @route   DELETE /api/cart/items/:itemId
 * @desc    Remove item from cart
 * @access  Private
 */
router.delete('/items/:itemId', authMiddleware, async (req, res) => {
  try {
    const userId = req.user!.id;
    const { itemId } = req.params;

    if (!itemId) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'Item ID is required'
      });
    }

    await cartService.removeFromCart(userId, itemId);

    return res.json({
      success: true,
      message: 'Item removed from cart successfully'
    });
  } catch (error) {
    console.error('Error removing from cart:', error);
    
    if (error instanceof CartError) {
      return res.status(error.statusCode || 400).json({
        error: error.code,
        message: error.message
      });
    }

    return res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'Failed to remove item from cart'
    });
  }
});

/**
 * @route   DELETE /api/cart/clear
 * @desc    Clear entire cart
 * @access  Private
 */
router.delete('/clear', authMiddleware, async (req, res) => {
  try {
    const userId = req.user!.id;
    await cartService.clearCart(userId);

    return res.json({
      success: true,
      message: 'Cart cleared successfully'
    });
  } catch (error) {
    console.error('Error clearing cart:', error);
    
    if (error instanceof CartError) {
      return res.status(error.statusCode || 400).json({
        error: error.code,
        message: error.message
      });
    }

    return res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'Failed to clear cart'
    });
  }
});

/**
 * @route   GET /api/cart/count
 * @desc    Get cart item count (for header badge)
 * @access  Private
 */
router.get('/count', authMiddleware, async (req, res) => {
  try {
    const userId = req.user!.id;
    const count = await cartService.getCartItemCount(userId);

    res.json({
      success: true,
      data: { count }
    });
  } catch (error) {
    console.error('Error getting cart count:', error);
    
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'Failed to get cart count'
    });
  }
});

/**
 * @route   POST /api/cart/validate
 * @desc    Validate cart items (stock availability, pricing)
 * @access  Private
 */
router.post('/validate', authMiddleware, async (req, res) => {
  try {
    const userId = req.user!.id;
    const validation = await cartService.validateCartItemsStock(userId);

    res.json({
      success: true,
      data: validation
    });
  } catch (error) {
    console.error('Error validating cart:', error);
    
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'Failed to validate cart'
    });
  }
});

// ================================
// BULK OPERATIONS
// ================================

/**
 * @route   POST /api/cart/bulk-add
 * @desc    Add multiple items to cart at once
 * @access  Private
 */
router.post('/bulk-add', authMiddleware, async (req, res) => {
  try {
    const userId = req.user!.id;
    const { items } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'Items array is required'
      });
    }

    const results = [];
    const errors = [];

    for (const item of items) {
      try {
        const cartItem = await cartService.addToCart(userId, item);
        results.push({
          success: true,
          data: cartItem,
          productId: item.productId
        });
      } catch (error) {
        errors.push({
          success: false,
          error: error instanceof CartError ? error.code : 'UNKNOWN_ERROR',
          message: error instanceof CartError ? error.message : 'Unknown error',
          productId: item.productId
        });
      }
    }

    return res.json({
      success: errors.length === 0,
      data: {
        results,
        errors,
        successCount: results.length,
        errorCount: errors.length
      },
      message: `Added ${results.length} items to cart. ${errors.length} items failed.`
    });
  } catch (error) {
    console.error('Error bulk adding to cart:', error);
    
    return res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'Failed to add items to cart'
    });
  }
});

/**
 * @route   PUT /api/cart/bulk-update
 * @desc    Update multiple cart items at once
 * @access  Private
 */
router.put('/bulk-update', authMiddleware, async (req, res) => {
  try {
    const userId = req.user!.id;
    const { updates } = req.body;

    if (!Array.isArray(updates) || updates.length === 0) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'Updates array is required'
      });
    }

    const results = [];
    const errors = [];

    for (const update of updates) {
      try {
        const cartItem = await cartService.updateCartItem(userId, update.itemId, {
          quantity: update.quantity,
          customizations: update.customizations
        });
        results.push({
          success: true,
          data: cartItem,
          itemId: update.itemId
        });
      } catch (error) {
        errors.push({
          success: false,
          error: error instanceof CartError ? error.code : 'UNKNOWN_ERROR',
          message: error instanceof CartError ? error.message : 'Unknown error',
          itemId: update.itemId
        });
      }
    }

    return res.json({
      success: errors.length === 0,
      data: {
        results,
        errors,
        successCount: results.length,
        errorCount: errors.length
      },
      message: `Updated ${results.length} items. ${errors.length} items failed.`
    });
  } catch (error) {
    console.error('Error bulk updating cart:', error);
    
    return res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'Failed to update cart items'
    });
  }
});

export default router;

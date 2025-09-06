// Cart Service - Coffee & Tea E-commerce
// Manages shopping cart functionality with guest and authenticated users

import { PrismaClient, CartItem as PrismaCartItem, Product, ProductVariant } from '@prisma/client';
import { 
  CartItem, 
  AddToCartRequest, 
  UpdateCartItemRequest, 
  CartSummary,
  CartError,
  ORDER_BUSINESS_RULES
} from '../types/order.types';

export class CartService {
  constructor(private prisma: PrismaClient) {}

  // ================================
  // CART MANAGEMENT
  // ================================

  async addToCart(userId: string, request: AddToCartRequest): Promise<CartItem> {
    try {
      // Validate product and variant
      const { product, variant } = await this.validateProductAndVariant(
        request.productId,
        request.variantId
      );

      // Check stock availability
      const availableStock = variant?.stockQuantity ?? product.stockQuantity;
      if (availableStock < request.quantity) {
        throw new CartError(
          `Insufficient stock. Available: ${availableStock}, Requested: ${request.quantity}`,
          'INSUFFICIENT_STOCK'
        );
      }

      // Check quantity limits
      if (request.quantity > ORDER_BUSINESS_RULES.cart.maxQuantityPerItem) {
        throw new CartError(
          `Maximum quantity per item is ${ORDER_BUSINESS_RULES.cart.maxQuantityPerItem}`,
          'QUANTITY_LIMIT_EXCEEDED'
        );
      }

      // Check if item already exists in cart
      const existingItem = await this.prisma.cartItem.findFirst({
        where: {
          userId,
          productId: request.productId,
          variantId: request.variantId ?? null
        }
      });

      let cartItem: PrismaCartItem;

      if (existingItem) {
        // Update existing item
        const newQuantity = existingItem.quantity + request.quantity;
        
        if (newQuantity > ORDER_BUSINESS_RULES.cart.maxQuantityPerItem) {
          throw new CartError(
            `Maximum quantity per item is ${ORDER_BUSINESS_RULES.cart.maxQuantityPerItem}`,
            'QUANTITY_LIMIT_EXCEEDED'
          );
        }

        if (newQuantity > availableStock) {
          throw new CartError(
            `Insufficient stock. Available: ${availableStock}, Total requested: ${newQuantity}`,
            'INSUFFICIENT_STOCK'
          );
        }

        cartItem = await this.prisma.cartItem.update({
          where: { id: existingItem.id },
          data: {
            quantity: newQuantity,
            customizations: request.customizations as any,
            updatedAt: new Date()
          }
        });
      } else {
        // Create new item
        cartItem = await this.prisma.cartItem.create({
          data: {
            userId,
            productId: request.productId,
            variantId: request.variantId ?? null,
            quantity: request.quantity,
            customizations: request.customizations as any
          }
        });
      }

      // Return cart item with product details
      return this.enrichCartItem(cartItem);
    } catch (error) {
      if (error instanceof CartError) {
        throw error;
      }
      console.error('Error adding to cart:', error);
      throw new CartError('Failed to add item to cart', 'ADD_TO_CART_FAILED', 500);
    }
  }

  async getCart(userId: string): Promise<CartSummary> {
    try {
      const cartItems = await this.prisma.cartItem.findMany({
        where: { userId },
        include: {
          product: {
            include: {
              category: true,
              variants: true
            }
          },
          variant: true
        },
        orderBy: { createdAt: 'desc' }
      });

      // Enrich cart items and calculate totals
      const enrichedItems = await Promise.all(
        cartItems.map(item => this.enrichCartItem(item))
      );

      // Calculate cart summary
      return this.calculateCartSummary(enrichedItems, userId);
    } catch (error) {
      console.error('Error getting cart:', error);
      throw new CartError('Failed to retrieve cart', 'GET_CART_FAILED', 500);
    }
  }

  async updateCartItem(
    userId: string, 
    cartItemId: string, 
    request: UpdateCartItemRequest
  ): Promise<CartItem> {
    try {
      // Find cart item
      const existingItem = await this.prisma.cartItem.findFirst({
        where: {
          id: cartItemId,
          userId
        },
        include: {
          product: true,
          variant: true
        }
      });

      if (!existingItem) {
        throw new CartError('Cart item not found', 'CART_ITEM_NOT_FOUND', 404);
      }

      // Validate quantity
      if (request.quantity > ORDER_BUSINESS_RULES.cart.maxQuantityPerItem) {
        throw new CartError(
          `Maximum quantity per item is ${ORDER_BUSINESS_RULES.cart.maxQuantityPerItem}`,
          'QUANTITY_LIMIT_EXCEEDED'
        );
      }

      // Check stock availability
      const availableStock = existingItem.variant?.stockQuantity ?? existingItem.product.stockQuantity;
      if (availableStock < request.quantity) {
        throw new CartError(
          `Insufficient stock. Available: ${availableStock}`,
          'INSUFFICIENT_STOCK'
        );
      }

      // Update cart item
      const updatedItem = await this.prisma.cartItem.update({
        where: { id: cartItemId },
        data: {
          quantity: request.quantity,
          customizations: (request.customizations ?? existingItem.customizations) as any,
          updatedAt: new Date()
        }
      });

      return this.enrichCartItem(updatedItem);
    } catch (error) {
      if (error instanceof CartError) {
        throw error;
      }
      console.error('Error updating cart item:', error);
      throw new CartError('Failed to update cart item', 'UPDATE_CART_ITEM_FAILED', 500);
    }
  }

  async removeFromCart(userId: string, cartItemId: string): Promise<void> {
    try {
      const result = await this.prisma.cartItem.deleteMany({
        where: {
          id: cartItemId,
          userId
        }
      });

      if (result.count === 0) {
        throw new CartError('Cart item not found', 'CART_ITEM_NOT_FOUND', 404);
      }
    } catch (error) {
      if (error instanceof CartError) {
        throw error;
      }
      console.error('Error removing from cart:', error);
      throw new CartError('Failed to remove item from cart', 'REMOVE_FROM_CART_FAILED', 500);
    }
  }

  async clearCart(userId: string): Promise<void> {
    try {
      await this.prisma.cartItem.deleteMany({
        where: { userId }
      });
    } catch (error) {
      console.error('Error clearing cart:', error);
      throw new CartError('Failed to clear cart', 'CLEAR_CART_FAILED', 500);
    }
  }

  async getCartItemCount(userId: string): Promise<number> {
    try {
      return await this.prisma.cartItem.count({
        where: { userId }
      });
    } catch (error) {
      console.error('Error getting cart item count:', error);
      return 0;
    }
  }

  // ================================
  // CART VALIDATION & ENRICHMENT
  // ================================

  private async validateProductAndVariant(
    productId: string, 
    variantId?: string
  ): Promise<{ product: Product; variant?: ProductVariant | undefined }> {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      include: {
        variants: true
      }
    });

    if (!product) {
      throw new CartError('Product not found', 'PRODUCT_NOT_FOUND', 404);
    }

    if (!product.isActive) {
      throw new CartError('Product is not available', 'PRODUCT_NOT_AVAILABLE');
    }

    let variant: ProductVariant | undefined;
    if (variantId) {
      const foundVariant = await this.prisma.productVariant.findUnique({
        where: { id: variantId }
      });

      if (!foundVariant) {
        throw new CartError('Product variant not found', 'VARIANT_NOT_FOUND', 404);
      }

      if (foundVariant.productId !== productId) {
        throw new CartError('Variant does not belong to this product', 'INVALID_VARIANT');
      }

      if (!foundVariant.isActive) {
        throw new CartError('Product variant is not available', 'VARIANT_NOT_AVAILABLE');
      }

      variant = foundVariant;
    }

    return { product, variant };
  }

  private async enrichCartItem(cartItem: any): Promise<CartItem> {
    // If cart item already includes product and variant, use them
    let product = cartItem.product;
    let variant = cartItem.variant;

    // Otherwise fetch them
    if (!product) {
      product = await this.prisma.product.findUnique({
        where: { id: cartItem.productId },
        include: {
          category: true
        }
      });
    }

    if (cartItem.variantId && !variant) {
      variant = await this.prisma.productVariant.findUnique({
        where: { id: cartItem.variantId }
      });
    }

    if (!product) {
      throw new CartError('Product not found during enrichment', 'PRODUCT_NOT_FOUND', 404);
    }

    return {
      id: cartItem.id,
      userId: cartItem.userId,
      productId: cartItem.productId,
      variantId: cartItem.variantId || undefined,
      quantity: cartItem.quantity,
      customizations: cartItem.customizations || undefined,
      product: {
        id: product.id,
        name: product.name,
        slug: product.slug,
        basePrice: Number(product.basePrice),
        images: Array.isArray(product.images) ? product.images : [],
        isActive: product.isActive,
        stockQuantity: product.stockQuantity
      },
      variant: variant ? {
        id: variant.id,
        name: variant.variantName,
        price: Number(product.basePrice) + Number(variant.priceAdjustment),
        stockQuantity: variant.stockQuantity,
        sku: variant.sku
      } : undefined,
      createdAt: cartItem.createdAt,
      updatedAt: cartItem.updatedAt
    };
  }

  private async calculateCartSummary(items: CartItem[], userId: string): Promise<CartSummary> {
    let subtotal = 0;
    let itemCount = 0;

    // Calculate subtotal and item count
    for (const item of items) {
      const price = item.variant?.price ?? item.product?.basePrice ?? 0;
      subtotal += price * item.quantity;
      itemCount += item.quantity;
    }

    // Get user's loyalty points (if authenticated)
    let loyaltyPointsAvailable = 0;
    if (userId) {
      try {
        const user = await this.prisma.user.findUnique({
          where: { id: userId },
          select: { loyaltyPoints: true }
        });
        loyaltyPointsAvailable = user?.loyaltyPoints ?? 0;
      } catch (error) {
        console.error('Error fetching loyalty points:', error);
      }
    }

    // Calculate loyalty points value (100 points = 10,000 VND)
    const loyaltyPointsValue = Math.floor(loyaltyPointsAvailable / ORDER_BUSINESS_RULES.loyalty.redemptionRate) * 10000;

    // Estimate tax (8% VAT in Vietnam)
    const estimatedTax = subtotal * 0.08;

    // Estimate shipping (free if above threshold)
    const estimatedShipping = subtotal >= ORDER_BUSINESS_RULES.order.freeShippingThreshold ? 0 : 30000; // 30k VND

    const estimatedTotal = subtotal + estimatedTax + estimatedShipping;

    return {
      items,
      itemCount,
      subtotal,
      estimatedTax,
      estimatedShipping,
      estimatedTotal,
      appliedCoupons: [], // TODO: Implement coupon system
      loyaltyPointsAvailable,
      loyaltyPointsValue
    };
  }

  // ================================
  // CART CLEANUP & MAINTENANCE
  // ================================

  async cleanupExpiredGuestCarts(): Promise<number> {
    try {
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() - ORDER_BUSINESS_RULES.cart.guestCartExpiryDays);

      // For now, we'll clean up old cart items for all users
      // In the future, we might want to distinguish between guest and registered users
      const result = await this.prisma.cartItem.deleteMany({
        where: {
          updatedAt: {
            lt: expiryDate
          }
        }
      });

      return result.count;
    } catch (error) {
      console.error('Error cleaning up expired carts:', error);
      return 0;
    }
  }

  async validateCartItemsStock(userId: string): Promise<{ valid: boolean; issues: string[] }> {
    try {
      const cartItems = await this.prisma.cartItem.findMany({
        where: { userId },
        include: {
          product: true,
          variant: true
        }
      });

      const issues: string[] = [];

      for (const item of cartItems) {
        const product = item.product;
        const variant = item.variant;

        // Check if product is still active
        if (!product.isActive) {
          issues.push(`${product.name} is no longer available`);
          continue;
        }

        // Check if variant is still active (if applicable)
        if (variant && !variant.isActive) {
          issues.push(`${product.name} - ${variant.variantName} is no longer available`);
          continue;
        }

        // Check stock availability
        const availableStock = variant?.stockQuantity ?? product.stockQuantity;
        if (availableStock < item.quantity) {
          if (availableStock === 0) {
            issues.push(`${product.name}${variant ? ` - ${variant.variantName}` : ''} is out of stock`);
          } else {
            issues.push(`${product.name}${variant ? ` - ${variant.variantName}` : ''} only has ${availableStock} items available`);
          }
        }
      }

      return {
        valid: issues.length === 0,
        issues
      };
    } catch (error) {
      console.error('Error validating cart items stock:', error);
      return {
        valid: false,
        issues: ['Unable to validate cart items']
      };
    }
  }
}

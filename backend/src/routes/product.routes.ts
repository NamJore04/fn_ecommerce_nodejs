// Product Routes - Coffee & Tea E-commerce
// RESTful API endpoints for product catalog management

import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { ProductService } from '../services/product.service';
import { authMiddleware } from '../middleware/auth.middleware';
import { 
  CreateProductRequest,
  UpdateProductRequest,
  ProductSearchQuery
} from '../types/product.types';

const router = Router();
const prisma = new PrismaClient();
const productService = new ProductService(prisma);

// ================================
// PUBLIC PRODUCT ENDPOINTS
// ================================

/**
 * @route   GET /api/products
 * @desc    Get products with filtering and pagination
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    // Parse query parameters with proper null checking
    const searchQuery: ProductSearchQuery = {};
    
    if (req.query.search) {
      searchQuery.query = req.query.search as string;
    }
    if (req.query.category) {
      searchQuery.categoryId = req.query.category as string;
    }
    if (req.query.minPrice) {
      searchQuery.minPrice = parseFloat(req.query.minPrice as string);
    }
    if (req.query.maxPrice) {
      searchQuery.maxPrice = parseFloat(req.query.maxPrice as string);
    }
    if (req.query.tags) {
      searchQuery.tags = (req.query.tags as string).split(',');
    }
    if (req.query.featured === 'true') {
      searchQuery.isFeatured = true;
    }
    if (req.query.inStock === 'true') {
      searchQuery.hasStock = true;
    }
    
    searchQuery.sortBy = req.query.sortBy as 'name' | 'price' | 'created' || 'created';
    searchQuery.sortOrder = req.query.sortOrder as 'asc' | 'desc' || 'desc';
    
    // Ensure positive pagination values
    const page = parseInt(req.query.page as string);
    const limit = parseInt(req.query.limit as string);
    
    searchQuery.page = (page > 0) ? page : 1;
    searchQuery.limit = (limit > 0) ? limit : 20;

    const result = await productService.searchProducts(searchQuery);

    return res.json({
      success: true,
      message: 'Products retrieved successfully',
      data: result.products,
      pagination: result.pagination
    });

  } catch (error: any) {
    console.error('Get products error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve products',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route   GET /api/products/featured
 * @desc    Get featured products
 * @access  Public
 */
router.get('/featured', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 8;
    
    const searchQuery: ProductSearchQuery = {
      isFeatured: true,
      hasStock: true,
      sortBy: 'created',
      sortOrder: 'desc',
      page: 1,
      limit
    };

    const result = await productService.searchProducts(searchQuery);

    return res.json({
      success: true,
      message: 'Featured products retrieved successfully',
      data: result.products
    });

  } catch (error: any) {
    console.error('Get featured products error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve featured products',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route   GET /api/products/search
 * @desc    Search products with query
 * @access  Public
 */
router.get('/search', async (req, res) => {
  try {
    const query = req.query.q as string;
    
    if (!query || query.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 2 characters long'
      });
    }

    const searchQuery: ProductSearchQuery = {
      query: query.trim()
    };
    
    if (req.query.inStock === 'true') {
      searchQuery.hasStock = true;
    }
    if (req.query.category) {
      searchQuery.categoryId = req.query.category as string;
    }
    if (req.query.minPrice) {
      searchQuery.minPrice = parseFloat(req.query.minPrice as string);
    }
    if (req.query.maxPrice) {
      searchQuery.maxPrice = parseFloat(req.query.maxPrice as string);
    }
    
    searchQuery.sortBy = req.query.sortBy as 'name' | 'price' | 'created' || 'created';
    searchQuery.sortOrder = req.query.sortOrder as 'asc' | 'desc' || 'desc';
    searchQuery.page = parseInt(req.query.page as string) || 1;
    searchQuery.limit = parseInt(req.query.limit as string) || 20;

    const result = await productService.searchProducts(searchQuery);

    return res.json({
      success: true,
      message: 'Search results retrieved successfully',
      data: result.products,
      pagination: result.pagination,
      searchQuery: query
    });

  } catch (error: any) {
    console.error('Search products error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to search products',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route   GET /api/products/slug/:slug
 * @desc    Get product by slug
 * @access  Public
 */
router.get('/slug/:slug', async (req, res) => {
  try {
    const { slug } = req.params;

    if (!slug) {
      return res.status(400).json({
        success: false,
        message: 'Product slug is required'
      });
    }

    const product = await productService.getProductBySlug(slug);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    return res.json({
      success: true,
      message: 'Product retrieved successfully',
      data: product
    });

  } catch (error: any) {
    console.error('Get product by slug error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve product',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route   GET /api/products/:id
 * @desc    Get product by ID
 * @access  Public
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required'
      });
    }

    const product = await productService.getProduct(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    return res.json({
      success: true,
      message: 'Product retrieved successfully',
      data: product
    });

  } catch (error: any) {
    console.error('Get product error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve product',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// ================================
// ADMIN PRODUCT ENDPOINTS
// ================================

/**
 * @route   POST /api/products
 * @desc    Create new product (Admin only)
 * @access  Private (Admin/Staff)
 */
router.post('/', authMiddleware, async (req, res) => {
  try {
    const userRole = req.user?.role;

    // Check admin permissions
    if (userRole !== 'ADMIN' && userRole !== 'STAFF' && userRole !== 'SUPER_ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    const createProductRequest: CreateProductRequest = req.body;

    // Validate required fields
    if (!createProductRequest.name) {
      return res.status(400).json({
        success: false,
        message: 'Product name is required'
      });
    }

    if (!createProductRequest.basePrice || createProductRequest.basePrice <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid base price is required'
      });
    }

    if (!createProductRequest.categoryId) {
      return res.status(400).json({
        success: false,
        message: 'Category ID is required'
      });
    }

    const product = await productService.createProduct(createProductRequest);

    return res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product
    });

  } catch (error: any) {
<<<<<<< HEAD
    console.error('Create product error:', error);
=======
    // Only log errors in non-test environments
    if (process.env.NODE_ENV !== 'test') {
      console.error('Create product error:', error);
    }
>>>>>>> e0366de708e308e3f8f2d024af0ae5c307cac571
    
    if (error.message.includes('already exists')) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to create product',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route   PUT /api/products/:id
 * @desc    Update product (Admin only)
 * @access  Private (Admin/Staff)
 */
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const userRole = req.user?.role;
    const { id } = req.params;

    // Check admin permissions
    if (userRole !== 'ADMIN' && userRole !== 'STAFF' && userRole !== 'SUPER_ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required'
      });
    }

    const updateProductRequest: UpdateProductRequest = { 
      id, 
      ...req.body 
    };

    const product = await productService.updateProduct(updateProductRequest);

    return res.json({
      success: true,
      message: 'Product updated successfully',
      data: product
    });

  } catch (error: any) {
<<<<<<< HEAD
    console.error('Update product error:', error);
=======
    // Only log errors in non-test environments
    if (process.env.NODE_ENV !== 'test') {
      console.error('Update product error:', error);
    }
>>>>>>> e0366de708e308e3f8f2d024af0ae5c307cac571
    
    if (error.message === 'Product not found') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to update product',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route   DELETE /api/products/:id
 * @desc    Delete product (Admin only)
 * @access  Private (Admin/Staff)
 */
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const userRole = req.user?.role;
    const { id } = req.params;

    // Check admin permissions
    if (userRole !== 'ADMIN' && userRole !== 'SUPER_ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required'
      });
    }

    await productService.deleteProduct(id);

    return res.json({
      success: true,
      message: 'Product deleted successfully'
    });

  } catch (error: any) {
    console.error('Delete product error:', error);
    
    if (error.message === 'Product not found') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to delete product',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default router;

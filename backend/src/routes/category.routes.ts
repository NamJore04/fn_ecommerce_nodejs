// Category Routes - Coffee & Tea E-commerce
// RESTful API endpoints for category management

import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { CategoryService } from '../services/category.service';
import { authMiddleware } from '../middleware/auth.middleware';
import { 
  CreateCategoryRequest,
  UpdateCategoryRequest as CategoryUpdateRequest
} from '../types/category.types';

const router = Router();
const prisma = new PrismaClient();
const categoryService = new CategoryService(prisma);

// ================================
// PUBLIC CATEGORY ENDPOINTS
// ================================

/**
 * @route   GET /api/categories
 * @desc    Get all active categories
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    const includeProducts = req.query.includeProducts === 'true';
    const categories = await categoryService.getActiveCategories(includeProducts);

    return res.json({
      success: true,
      message: 'Categories retrieved successfully',
      data: categories
    });

  } catch (error: any) {
    console.error('Get categories error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve categories',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route   GET /api/categories/:id
 * @desc    Get category by ID with products
 * @access  Public
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Category ID is required'
      });
    }

    const result = await categoryService.getCategoryWithProducts(id, { page, limit });

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    return res.json({
      success: true,
      message: 'Category retrieved successfully',
      data: result.category,
      pagination: result.pagination
    });

  } catch (error: any) {
    console.error('Get category error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve category',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route   GET /api/categories/slug/:slug
 * @desc    Get category by slug with products
 * @access  Public
 */
router.get('/slug/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    if (!slug) {
      return res.status(400).json({
        success: false,
        message: 'Category slug is required'
      });
    }

    const result = await categoryService.getCategoryBySlugWithProducts(slug, { page, limit });

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    return res.json({
      success: true,
      message: 'Category retrieved successfully',
      data: result.category,
      pagination: result.pagination
    });

  } catch (error: any) {
    console.error('Get category by slug error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve category',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// ================================
// ADMIN CATEGORY ENDPOINTS
// ================================

/**
 * @route   POST /api/categories
 * @desc    Create new category (Admin only)
 * @access  Private (Admin/Staff)
 */
router.post('/', authMiddleware, async (req, res) => {
  try {
    const userRole = req.user?.role;

    // Check admin permissions
    if (userRole !== 'ADMIN' && userRole !== 'SUPER_ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    const createRequest: CreateCategoryRequest = req.body;

    // Validate required fields
    if (!createRequest.name) {
      return res.status(400).json({
        success: false,
        message: 'Category name is required'
      });
    }

    const category = await categoryService.createCategory(createRequest);

    return res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: category
    });

  } catch (error: any) {
    console.error('Create category error:', error);
    
    if (error.code === 'CATEGORY_EXISTS') {
      return res.status(409).json({
        success: false,
        message: error.message,
        code: error.code
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to create category',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route   PUT /api/categories/:id
 * @desc    Update category (Admin only)
 * @access  Private (Admin/Staff)
 */
router.put('/:id', authMiddleware, async (req, res) => {
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
        message: 'Category ID is required'
      });
    }

    const updateRequest: CategoryUpdateRequest = req.body;
    const category = await categoryService.updateCategory(id, updateRequest);

    return res.json({
      success: true,
      message: 'Category updated successfully',
      data: category
    });

  } catch (error: any) {
    console.error('Update category error:', error);
    
    if (error.message === 'Category not found') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }

    if (error.code === 'CATEGORY_EXISTS') {
      return res.status(409).json({
        success: false,
        message: error.message,
        code: error.code
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to update category',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route   DELETE /api/categories/:id
 * @desc    Delete category (Admin only)
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
        message: 'Category ID is required'
      });
    }

    await categoryService.deleteCategory(id);

    return res.json({
      success: true,
      message: 'Category deleted successfully'
    });

  } catch (error: any) {
    console.error('Delete category error:', error);
    
    if (error.message === 'Category not found') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }

    if (error.code === 'CATEGORY_HAS_PRODUCTS') {
      return res.status(400).json({
        success: false,
        message: error.message,
        code: error.code
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to delete category',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route   GET /api/categories/admin/all
 * @desc    Get all categories for admin (including inactive)
 * @access  Private (Admin/Staff)
 */
router.get('/admin/all', authMiddleware, async (req, res) => {
  try {
    const userRole = req.user?.role;

    // Check admin permissions
    if (userRole !== 'ADMIN' && userRole !== 'SUPER_ADMIN' && userRole !== 'STAFF') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    const categories = await categoryService.getAllCategories();

    return res.json({
      success: true,
      message: 'Categories retrieved successfully',
      data: categories
    });

  } catch (error: any) {
    console.error('Get all categories error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve categories',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default router;

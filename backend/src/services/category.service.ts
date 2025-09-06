// Category Service - Coffee & Tea E-commerce
// Manages product categories and hierarchical structure

import { PrismaClient, Category, Prisma } from '@prisma/client';
import { 
  CreateCategoryRequest, 
  UpdateCategoryRequest,
  CategorySummary
} from '../types/product.types';
import { 
  Category as CategoryInterface,
  CategoryWithProducts,
  CategoryError,
  UpdateCategoryRequest as CategoryUpdateRequest
} from '../types/category.types';
import { generateSlug } from '../utils/helpers';
import { AppError, NotFoundError, ConflictError } from '../utils/errors';

export class CategoryService {
  constructor(private prisma: PrismaClient) {}

  // ================================
  // CATEGORY CRUD OPERATIONS
  // ================================

  async createCategory(data: CreateCategoryRequest): Promise<Category> {
    // Validate parent category if provided
    if (data.parentId) {
      const parentCategory = await this.prisma.category.findUnique({
        where: { id: data.parentId }
      });
      if (!parentCategory) {
        throw new AppError('Parent category not found', 400);
      }
    }

    // Generate slug if not provided
    const slug = data.slug || generateSlug(data.name);
    await this.ensureUniqueSlug(slug);

    const categoryData: Prisma.CategoryCreateInput = {
      name: data.name,
      slug: slug,
      description: data.description || null,
      imageUrl: data.image || null,
      metaTitle: data.metaTitle || null,
      metaDesc: data.metaDescription || null,
      sortOrder: data.sortOrder ?? 0,
      isActive: data.isVisible ?? true,
      isFeatured: false,
      ...(data.parentId && {
        parent: {
          connect: { id: data.parentId }
        }
      })
    };

    const category = await this.prisma.category.create({
      data: categoryData,
      include: {
        parent: true,
        children: true,
        products: true
      }
    });

    return category;
  }

  async deleteCategory(id: string): Promise<void> {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: { 
        children: true, 
        products: true 
      }
    });

    if (!category) {
      throw new NotFoundError('Category');
    }

    // Check if category has products
    if (category.products.length > 0) {
      throw new AppError('Cannot delete category with products. Move products to another category first.', 400);
    }

    // Check if category has child categories
    if (category.children.length > 0) {
      throw new AppError('Cannot delete category with subcategories. Delete subcategories first.', 400);
    }

    await this.prisma.category.delete({
      where: { id }
    });
  }

  async getCategory(id: string): Promise<Category | null> {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        parent: true,
        children: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' }
        },
        products: {
          where: { status: 'ACTIVE', isActive: true },
          select: { id: true, name: true, slug: true, basePrice: true, comparePrice: true },
          take: 10
        }
      }
    });

    return category;
  }

  async getCategoryBySlug(slug: string): Promise<Category | null> {
    const category = await this.prisma.category.findUnique({
      where: { slug },
      include: {
        parent: true,
        children: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' }
        },
        products: {
          where: { status: 'ACTIVE', isActive: true },
          select: { id: true, name: true, slug: true, basePrice: true, comparePrice: true },
          take: 10
        }
      }
    });

    return category;
  }

  // ================================
  // CATEGORY LISTING & FILTERING
  // ================================

  async getAllCategories(includeInactive: boolean = false): Promise<Category[]> {
    const categories = await this.prisma.category.findMany({
      where: includeInactive ? {} : { isActive: true },
      include: {
        parent: true,
        children: {
          where: includeInactive ? {} : { isActive: true },
          orderBy: { sortOrder: 'asc' }
        },
        _count: {
          select: { products: true }
        }
      },
      orderBy: [
        { parentId: 'asc' },
        { sortOrder: 'asc' },
        { name: 'asc' }
      ]
    });

    return categories;
  }

  async getRootCategories(): Promise<Category[]> {
    const categories = await this.prisma.category.findMany({
      where: { 
        parentId: null,
        isActive: true 
      },
      include: {
        children: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
          include: {
            children: {
              where: { isActive: true },
              orderBy: { sortOrder: 'asc' }
            },
            _count: {
              select: { products: true }
            }
          }
        },
        _count: {
          select: { products: true }
        }
      },
      orderBy: [
        { sortOrder: 'asc' },
        { name: 'asc' }
      ]
    });

    return categories;
  }

  async getCategoryTree(): Promise<CategorySummary[]> {
    const categories = await this.getRootCategories();
    
    return categories.map(category => this.formatCategoryTree(category));
  }

  async getFeaturedCategories(): Promise<Category[]> {
    const categories = await this.prisma.category.findMany({
      where: { 
        isFeatured: true,
        isActive: true 
      },
      include: {
        _count: {
          select: { products: true }
        }
      },
      orderBy: [
        { sortOrder: 'asc' },
        { name: 'asc' }
      ]
    });

    return categories;
  }

  async searchCategories(query: string): Promise<Category[]> {
    const categories = await this.prisma.category.findMany({
      where: {
        isActive: true,
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } }
        ]
      },
      include: {
        parent: true,
        _count: {
          select: { products: true }
        }
      },
      orderBy: { name: 'asc' },
      take: 20
    });

    return categories;
  }

  // ================================
  // CATEGORY MANAGEMENT OPERATIONS
  // ================================

  async toggleCategoryStatus(id: string): Promise<Category> {
    const category = await this.prisma.category.findUnique({
      where: { id }
    });

    if (!category) {
      throw new NotFoundError('Category');
    }

    const updatedCategory = await this.prisma.category.update({
      where: { id },
      data: { 
        isActive: !category.isActive,
        updatedAt: new Date()
      },
      include: {
        parent: true,
        children: true,
        _count: {
          select: { products: true }
        }
      }
    });

    return updatedCategory;
  }

  async toggleFeaturedStatus(id: string): Promise<Category> {
    const category = await this.prisma.category.findUnique({
      where: { id }
    });

    if (!category) {
      throw new NotFoundError('Category');
    }

    const updatedCategory = await this.prisma.category.update({
      where: { id },
      data: { 
        isFeatured: !category.isFeatured,
        updatedAt: new Date()
      },
      include: {
        parent: true,
        children: true,
        _count: {
          select: { products: true }
        }
      }
    });

    return updatedCategory;
  }

  async reorderCategories(categoryOrders: { id: string; sortOrder: number }[]): Promise<void> {
    // Use transaction to ensure consistency
    await this.prisma.$transaction(
      categoryOrders.map(({ id, sortOrder }) =>
        this.prisma.category.update({
          where: { id },
          data: { 
            sortOrder,
            updatedAt: new Date()
          }
        })
      )
    );
  }

  async moveCategory(categoryId: string, newParentId: string | null): Promise<Category> {
    const category = await this.prisma.category.findUnique({
      where: { id: categoryId }
    });

    if (!category) {
      throw new NotFoundError('Category');
    }

    // Validate new parent if provided
    if (newParentId) {
      if (newParentId === categoryId) {
        throw new AppError('Category cannot be its own parent', 400);
      }

      await this.validateNoCircularReference(categoryId, newParentId);

      const parentCategory = await this.prisma.category.findUnique({
        where: { id: newParentId }
      });
      if (!parentCategory) {
        throw new AppError('Parent category not found', 400);
      }
    }

    const updateData: Prisma.CategoryUpdateInput = {
      updatedAt: new Date()
    };

    if (newParentId) {
      updateData.parent = { connect: { id: newParentId } };
    } else {
      updateData.parent = { disconnect: true };
    }

    const updatedCategory = await this.prisma.category.update({
      where: { id: categoryId },
      data: updateData,
      include: {
        parent: true,
        children: true,
        _count: {
          select: { products: true }
        }
      }
    });

    return updatedCategory;
  }

  // ================================
  // STATISTICS & ANALYTICS
  // ================================

  async getCategoryStats(id: string): Promise<{
    productCount: number;
    activeProductCount: number;
    subcategoryCount: number;
    totalValue: number;
  }> {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        products: {
          select: {
            id: true,
            basePrice: true,
            comparePrice: true,
            status: true,
            isActive: true
          }
        },
        children: true
      }
    });

    if (!category) {
      throw new NotFoundError('Category');
    }

    const productCount = category.products.length;
    const activeProductCount = category.products.filter(p => p.status === 'ACTIVE' && p.isActive).length;
    const subcategoryCount = category.children.length;
    
    const totalValue = category.products.reduce((sum, product) => {
      const price = product.comparePrice || product.basePrice;
      return sum + Number(price);
    }, 0);

    return {
      productCount,
      activeProductCount,
      subcategoryCount,
      totalValue
    };
  }

  // ================================
  // ADDITIONAL METHODS FOR API ROUTES
  // ================================

  async getActiveCategories(includeProducts: boolean = false): Promise<CategoryInterface[]> {
    try {
      const categories = await this.prisma.category.findMany({
        where: { isActive: true },
        include: {
          products: includeProducts ? {
            where: { isActive: true },
            take: 5,
            select: {
              id: true,
              name: true,
              slug: true,
              basePrice: true,
              images: true,
              isFeatured: true
            }
          } : false,
          _count: {
            select: {
              products: {
                where: { isActive: true }
              }
            }
          }
        },
        orderBy: [
          { sortOrder: 'asc' },
          { name: 'asc' }
        ]
      });

      return categories.map(category => this.enrichCategory(category));
    } catch (error) {
      console.error('Error getting active categories:', error);
      throw new CategoryError('Failed to retrieve categories', 'GET_CATEGORIES_FAILED', 500);
    }
  }

  async getCategoryWithProducts(
    id: string, 
    pagination: { page: number; limit: number }
  ): Promise<CategoryWithProducts | null> {
    try {
      const { page, limit } = pagination;
      const skip = (page - 1) * limit;

      const category = await this.prisma.category.findUnique({
        where: { id, isActive: true },
        include: {
          _count: {
            select: {
              products: {
                where: { isActive: true }
              }
            }
          }
        }
      });

      if (!category) {
        return null;
      }

      const products = await this.prisma.product.findMany({
        where: { 
          categoryId: id,
          isActive: true 
        },
        include: {
          variants: {
            where: { isActive: true },
            take: 1,
            orderBy: { priceAdjustment: 'asc' }
          },
          _count: {
            select: {
              reviews: true
            }
          }
        },
        skip,
        take: limit,
        orderBy: [
          { isFeatured: 'desc' },
          { createdAt: 'desc' }
        ]
      });

      const totalProducts = category._count.products;
      const totalPages = Math.ceil(totalProducts / limit);

      return {
        category: this.enrichCategory(category),
        products: products.map(product => ({
          id: product.id,
          name: product.name,
          slug: product.slug,
          description: product.description,
          basePrice: Number(product.basePrice),
          salePrice: product.comparePrice ? Number(product.comparePrice) : null,
          images: product.images || [],
          stockQuantity: product.stockQuantity,
          isFeatured: product.isFeatured,
          isActive: product.isActive,
          reviewCount: product._count.reviews,
          variants: product.variants.map(variant => ({
            id: variant.id,
            variantName: variant.variantName,
            priceAdjustment: Number(variant.priceAdjustment),
            stockQuantity: variant.stockQuantity
          }))
        })),
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: totalProducts,
          itemsPerPage: limit
        }
      };
    } catch (error) {
      console.error('Error getting category with products:', error);
      throw new CategoryError('Failed to retrieve category with products', 'GET_CATEGORY_PRODUCTS_FAILED', 500);
    }
  }

  async getCategoryBySlugWithProducts(
    slug: string, 
    pagination: { page: number; limit: number }
  ): Promise<CategoryWithProducts | null> {
    try {
      const category = await this.prisma.category.findUnique({
        where: { slug, isActive: true }
      });
      
      if (!category) {
        return null;
      }

      return await this.getCategoryWithProducts(category.id, pagination);
    } catch (error) {
      console.error('Error getting category by slug with products:', error);
      throw new CategoryError('Failed to retrieve category with products', 'GET_CATEGORY_PRODUCTS_FAILED', 500);
    }
  }

  async updateCategory(id: string, data: CategoryUpdateRequest): Promise<CategoryInterface> {
    try {
      // Check if category exists
      const existingCategory = await this.prisma.category.findUnique({
        where: { id }
      });

      if (!existingCategory) {
        throw new CategoryError('Category not found', 'CATEGORY_NOT_FOUND', 404);
      }

      // Generate new slug if name is being updated
      let slug = existingCategory.slug;
      if (data.name && data.name !== existingCategory.name) {
        slug = this.generateSlugHelper(data.name);
        await this.ensureUniqueSlug(slug, id);
      }

      const category = await this.prisma.category.update({
        where: { id },
        data: {
          ...(data.name && { name: data.name }),
          ...(data.name && { slug }),
          ...(data.description !== undefined && { description: data.description }),
          ...(data.image !== undefined && { imageUrl: data.image }),
          ...(data.icon !== undefined && { icon: data.icon }),
          ...(data.isVisible !== undefined && { isActive: data.isVisible }),
          ...(data.sortOrder !== undefined && { sortOrder: data.sortOrder }),
          updatedAt: new Date()
        },
        include: {
          _count: {
            select: {
              products: true
            }
          }
        }
      });

      return this.enrichCategory(category);
    } catch (error: any) {
      if (error instanceof CategoryError) {
        throw error;
      }
      
      if (error.code === 'P2002') {
        throw new CategoryError('Category with this name or slug already exists', 'CATEGORY_EXISTS', 409);
      }
      
      console.error('Error updating category:', error);
      throw new CategoryError('Failed to update category', 'UPDATE_CATEGORY_FAILED', 500);
    }
  }

  private enrichCategory(category: any): CategoryInterface {
    return {
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      image: category.imageUrl || category.image,
      icon: category.icon,
      isActive: category.isActive,
      sortOrder: category.sortOrder,
      productCount: category._count?.products || 0,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
      products: category.products || undefined
    };
  }

  private generateSlugHelper(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
      .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
  }

  // ================================
  // PRIVATE HELPER METHODS
  // ================================

  private async ensureUniqueSlug(slug: string, excludeId?: string): Promise<void> {
    const existing = await this.prisma.category.findFirst({
      where: {
        slug,
        ...(excludeId && { id: { not: excludeId } })
      }
    });

    if (existing) {
      throw new ConflictError('Category slug already exists');
    }
  }

  private async validateNoCircularReference(categoryId: string, newParentId: string): Promise<void> {
    // Get all descendants of the category
    const descendants = await this.getAllDescendants(categoryId);
    
    // Check if newParentId is in the descendants
    if (descendants.includes(newParentId)) {
      throw new AppError('Cannot create circular reference in category hierarchy', 400);
    }
  }

  private async getAllDescendants(categoryId: string): Promise<string[]> {
    const descendants: string[] = [];
    
    const children = await this.prisma.category.findMany({
      where: { parentId: categoryId },
      select: { id: true }
    });

    for (const child of children) {
      descendants.push(child.id);
      const childDescendants = await this.getAllDescendants(child.id);
      descendants.push(...childDescendants);
    }

    return descendants;
  }

  private formatCategoryTree(category: any): CategorySummary {
    return {
      id: category.id,
      name: category.name,
      slug: category.slug,
      productCount: category._count?.products || 0,
      children: category.children?.map((child: any) => this.formatCategoryTree(child)) || []
    };
  }
}

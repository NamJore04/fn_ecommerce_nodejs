// Product Service - Coffee & Tea E-commerce
// Core business logic for product management

import { PrismaClient, Product, ProductVariant, Prisma } from '@prisma/client';
import { 
  CreateProductRequest, 
  UpdateProductRequest,
  ProductSearchQuery,
  ProductListResponse,
  CreateProductVariantRequest,
  UpdateProductVariantRequest
} from '../types/product.types';

export class ProductService {
  constructor(private prisma: PrismaClient) {}

  // ================================
  // PRODUCT CRUD OPERATIONS
  // ================================

  async createProduct(data: CreateProductRequest): Promise<Product> {
    try {
      // Generate slug if not provided
      const slug = data.slug || this.generateSlug(data.name);
      await this.validateUniqueSlug(slug);

      // Create product with Prisma
      const product = await this.prisma.product.create({
        data: {
          name: data.name,
          slug,
          description: data.description || null,
          shortDesc: data.shortDescription || null,
          sku: data.sku || this.generateSKU(data.name),
          basePrice: data.basePrice,
          comparePrice: data.salePrice || null,
          stockQuantity: data.stockQuantity || 0,
          categoryId: data.categoryId,
          tags: data.tags || [],
          images: [],
          metaTitle: data.metaTitle || null,
          metaDesc: data.metaDescription || null,
          isFeatured: data.isFeatured || false,
          isActive: data.isVisible !== false,
          status: 'ACTIVE'
        },
        include: {
          category: true,
          variants: true
        }
      });

      return product;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new Error('Product with this SKU or slug already exists');
        }
      }
      throw error;
    }
  }

  async getProduct(id: string): Promise<Product | null> {
    return await this.prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        variants: true
      }
    });
  }

  async getProductBySlug(slug: string): Promise<Product | null> {
    return await this.prisma.product.findUnique({
      where: { slug },
      include: {
        category: true,
        variants: true
      }
    });
  }

  async updateProduct(data: UpdateProductRequest): Promise<Product> {
    const existingProduct = await this.prisma.product.findUnique({
      where: { id: data.id }
    });

    if (!existingProduct) {
      throw new Error('Product not found');
    }

    // Generate new slug if name changed
    let slug = existingProduct.slug;
    if (data.name && data.name !== existingProduct.name) {
      slug = this.generateSlug(data.name);
      await this.validateUniqueSlug(slug, data.id);
    }

    const product = await this.prisma.product.update({
      where: { id: data.id },
      data: {
        ...(data.name && { name: data.name, slug }),
        ...(data.description && { description: data.description }),
        ...(data.shortDescription && { shortDesc: data.shortDescription }),
        ...(data.basePrice && { basePrice: data.basePrice }),
        ...(data.salePrice !== undefined && { comparePrice: data.salePrice }),
        ...(data.stockQuantity !== undefined && { stockQuantity: data.stockQuantity }),
        ...(data.categoryId && { categoryId: data.categoryId }),
        ...(data.tags && { tags: data.tags }),
        ...(data.metaTitle && { metaTitle: data.metaTitle }),
        ...(data.metaDescription && { metaDesc: data.metaDescription }),
        ...(data.isFeatured !== undefined && { isFeatured: data.isFeatured }),
        ...(data.isVisible !== undefined && { isActive: data.isVisible }),
        updatedAt: new Date()
      },
      include: {
        category: true,
        variants: true
      }
    });

    return product;
  }

  async deleteProduct(id: string): Promise<void> {
    const product = await this.prisma.product.findUnique({
      where: { id }
    });

    if (!product) {
      throw new Error('Product not found');
    }

    await this.prisma.product.delete({
      where: { id }
    });
  }

  // ================================
  // SEARCH AND FILTERING
  // ================================

  async searchProducts(query: ProductSearchQuery): Promise<ProductListResponse> {
    const {
      query: searchQuery,
      categoryId,
      minPrice,
      maxPrice,
      tags,
      isFeatured,
      hasStock,
      sortBy = 'created',
      sortOrder = 'desc',
      page = 1,
      limit = 20
    } = query;

    const skip = (page - 1) * limit;
    
    // Build where clause
    const where: Prisma.ProductWhereInput = {
      isActive: true,
      ...(searchQuery && {
        OR: [
          { name: { contains: searchQuery, mode: 'insensitive' } },
          { description: { contains: searchQuery, mode: 'insensitive' } },
          { shortDesc: { contains: searchQuery, mode: 'insensitive' } },
          { tags: { hasSome: searchQuery.split(' ') } }
        ]
      }),
      ...(categoryId && { categoryId }),
      ...(minPrice && { basePrice: { gte: minPrice } }),
      ...(maxPrice && { basePrice: { lte: maxPrice } }),
      ...(tags && { tags: { hasSome: tags } }),
      ...(isFeatured !== undefined && { isFeatured }),
      ...(hasStock && { stockQuantity: { gt: 0 } })
    };

    // Build orderBy clause
    let orderBy: Prisma.ProductOrderByWithRelationInput = {};
    switch (sortBy) {
      case 'name':
        orderBy = { name: sortOrder };
        break;
      case 'price':
        orderBy = { basePrice: sortOrder };
        break;
      case 'created':
        orderBy = { createdAt: sortOrder };
        break;
      default:
        orderBy = { createdAt: 'desc' };
    }

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          category: true,
          variants: true
        }
      }),
      this.prisma.product.count({ where })
    ]);

    return {
      products: products.map(p => this.formatProductSummary(p)),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  // ================================
  // PRODUCT VARIANTS
  // ================================

  async createProductVariant(data: CreateProductVariantRequest): Promise<ProductVariant> {
    const product = await this.prisma.product.findUnique({
      where: { id: data.productId }
    });

    if (!product) {
      throw new Error('Product not found');
    }

    return await this.prisma.productVariant.create({
      data: {
        productId: data.productId,
        variantName: data.name,
        variantType: 'custom',
        variantValue: data.name,
        priceAdjustment: data.priceAdjustment || 0,
        stockQuantity: data.stockQuantity || 0,
        sku: data.sku || this.generateVariantSKU(product.sku, data.name)
      }
    });
  }

  async updateProductVariant(data: UpdateProductVariantRequest): Promise<ProductVariant> {
    const variant = await this.prisma.productVariant.findUnique({
      where: { id: data.id }
    });

    if (!variant) {
      throw new Error('Product variant not found');
    }

    return await this.prisma.productVariant.update({
      where: { id: data.id },
      data: {
        ...(data.name && { variantName: data.name, variantValue: data.name }),
        ...(data.priceAdjustment !== undefined && { priceAdjustment: data.priceAdjustment }),
        ...(data.stockQuantity !== undefined && { stockQuantity: data.stockQuantity }),
        ...(data.sku && { sku: data.sku }),
        updatedAt: new Date()
      }
    });
  }

  async deleteProductVariant(id: string): Promise<void> {
    const variant = await this.prisma.productVariant.findUnique({
      where: { id }
    });

    if (!variant) {
      throw new Error('Product variant not found');
    }

    await this.prisma.productVariant.delete({
      where: { id }
    });
  }

  // ================================
  // INVENTORY MANAGEMENT
  // ================================

  async updateInventory(data: { productId?: string; variantId?: string; quantityChange: number; reason?: string; notes?: string }): Promise<any> {
    if (data.productId) {
      const product = await this.prisma.product.findUnique({
        where: { id: data.productId }
      });

      if (!product) {
        throw new Error('Product not found');
      }

      const newQuantity = product.stockQuantity + data.quantityChange;
      
      if (newQuantity < 0) {
        throw new Error('Insufficient stock');
      }

      await this.prisma.product.update({
        where: { id: data.productId },
        data: { stockQuantity: newQuantity }
      });

      return { 
        productId: data.productId,
        previousQuantity: product.stockQuantity,
        newQuantity,
        quantityChange: data.quantityChange
      };
    }

    if (data.variantId) {
      const variant = await this.prisma.productVariant.findUnique({
        where: { id: data.variantId }
      });

      if (!variant) {
        throw new Error('Product variant not found');
      }

      const newQuantity = variant.stockQuantity + data.quantityChange;
      
      if (newQuantity < 0) {
        throw new Error('Insufficient stock');
      }

      await this.prisma.productVariant.update({
        where: { id: data.variantId },
        data: { stockQuantity: newQuantity }
      });

      return { 
        variantId: data.variantId,
        previousQuantity: variant.stockQuantity,
        newQuantity,
        quantityChange: data.quantityChange
      };
    }

    throw new Error('Either productId or variantId must be provided');
  }

  async getInventoryStatus(productId: string): Promise<any> {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      include: { variants: true }
    });

    if (!product) {
      throw new Error('Product not found');
    }

    return {
      productId,
      productStock: product.stockQuantity,
      variants: product.variants.map(v => ({
        id: v.id,
        name: v.variantName,
        stock: v.stockQuantity,
        lowStock: v.stockQuantity < 10
      })),
      totalStock: product.stockQuantity + product.variants.reduce((sum, v) => sum + v.stockQuantity, 0),
      lowStock: product.stockQuantity < 10
    };
  }

  // ================================
  // UTILITY METHODS
  // ================================

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }

  private generateSKU(name: string): string {
    const prefix = name.substring(0, 3).toUpperCase();
    const timestamp = Date.now().toString().slice(-6);
    return `${prefix}-${timestamp}`;
  }

  private generateVariantSKU(productSKU: string, variantName: string): string {
    const variantCode = variantName.substring(0, 3).toUpperCase();
    return `${productSKU}-${variantCode}`;
  }

  private async validateUniqueSlug(slug: string, excludeId?: string): Promise<void> {
    const existing = await this.prisma.product.findFirst({
      where: { 
        slug,
        ...(excludeId && { id: { not: excludeId } })
      }
    });

    if (existing) {
      throw new Error('Product with this slug already exists');
    }
  }

  private formatProductSummary(product: any): any {
    return {
      id: product.id,
      name: product.name,
      slug: product.slug,
      shortDescription: product.shortDesc,
      basePrice: product.basePrice,
      salePrice: product.comparePrice,
      images: product.images || [],
      category: product.category ? {
        id: product.category.id,
        name: product.category.name,
        slug: product.category.slug
      } : null,
      stockQuantity: product.stockQuantity,
      tags: product.tags || [],
      isFeatured: product.isFeatured,
      createdAt: product.createdAt
    };
  }
}

export default ProductService;

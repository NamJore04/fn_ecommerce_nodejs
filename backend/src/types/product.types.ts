// Product Module Types - Coffee & Tea E-commerce
// Following memory bank product-module-bank specifications

export interface CreateProductRequest {
  name: string;
  slug?: string;
  sku?: string; // Optional SKU - will be auto-generated if not provided
  description?: string;
  shortDescription?: string;
  categoryId: string;
  brandId?: string;
  
  // Pricing
  basePrice: number;
  salePrice?: number;
  
  // Inventory
  trackInventory?: boolean;
  stockQuantity?: number;
  lowStockThreshold?: number;
  allowBackorders?: boolean;
  
  // Variants
  hasVariants?: boolean;
  
  // SEO
  metaTitle?: string;
  metaDescription?: string;
  tags?: string[];
  
  // Status
  isVisible?: boolean;
  isFeatured?: boolean;
  
  // Product Attributes (Coffee/Tea specific)
  attributes?: ProductAttributeInput[];
  specifications?: ProductSpecificationInput[];
}

export interface UpdateProductRequest extends Partial<CreateProductRequest> {
  id: string;
}

export interface ProductAttributeInput {
  name: string;
  value: string;
  displayName?: string;
  isFilterable?: boolean;
  sortOrder?: number;
}

export interface ProductSpecificationInput {
  name: string;
  value: string;
  group?: string;
  unit?: string;
  sortOrder?: number;
}

// Product Variant Types
export interface CreateProductVariantRequest {
  productId: string;
  name: string;
  sku?: string;
  priceAdjustment?: number;
  stockQuantity?: number;
  sortOrder?: number;
  attributes?: VariantAttributeInput[];
}

export interface UpdateProductVariantRequest extends Partial<CreateProductVariantRequest> {
  id: string;
}

export interface VariantAttributeInput {
  name: string;
  value: string;
  displayName?: string;
}

// Category Types
export interface CreateCategoryRequest {
  name: string;
  slug?: string;
  description?: string;
  parentId?: string;
  image?: string;
  icon?: string;
  metaTitle?: string;
  metaDescription?: string;
  sortOrder?: number;
  isVisible?: boolean;
}

export interface UpdateCategoryRequest extends Partial<CreateCategoryRequest> {
  id: string;
}

// Brand Types
export interface CreateBrandRequest {
  name: string;
  slug?: string;
  description?: string;
  story?: string;
  logo?: string;
  bannerImage?: string;
  website?: string;
  socialLinks?: Record<string, string>;
  country?: string;
  region?: string;
  sortOrder?: number;
  isActive?: boolean;
}

export interface UpdateBrandRequest extends Partial<CreateBrandRequest> {
  id: string;
}

// Search and Filter Types
export interface ProductSearchQuery {
  query?: string;
  categoryId?: string;
  brandId?: string;
  minPrice?: number;
  maxPrice?: number;
  tags?: string[];
  attributes?: { [key: string]: string | string[] };
  isVisible?: boolean;
  isFeatured?: boolean;
  hasStock?: boolean;
  sortBy?: 'name' | 'price' | 'rating' | 'created' | 'updated';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface ProductFilterOptions {
  categories: CategorySummary[];
  brands: BrandSummary[];
  priceRange: { min: number; max: number };
  attributes: AttributeFilter[];
  tags: string[];
}

export interface CategorySummary {
  id: string;
  name: string;
  slug: string;
  productCount: number;
  children?: CategorySummary[];
}

export interface BrandSummary {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  productCount: number;
}

export interface AttributeFilter {
  name: string;
  displayName: string;
  values: { value: string; count: number }[];
}

// Response Types
export interface ProductListResponse {
  products: ProductSummary[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  filters?: ProductFilterOptions;
}

export interface ProductSummary {
  id: string;
  name: string;
  slug: string;
  shortDescription?: string;
  basePrice: number;
  salePrice?: number;
  averageRating: number;
  reviewCount: number;
  isVisible: boolean;
  isFeatured: boolean;
  hasVariants: boolean;
  stockQuantity?: number;
  trackInventory: boolean;
  images: ProductImageSummary[];
  category: CategorySummary;
  brand?: BrandSummary;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ProductImageSummary {
  id: string;
  url: string;
  alt?: string;
  isMain: boolean;
  sortOrder: number;
}

export interface ProductDetail extends ProductSummary {
  description?: string;
  metaTitle?: string;
  metaDescription?: string;
  attributes: ProductAttributeDisplay[];
  specifications: ProductSpecificationDisplay[];
  variants: ProductVariantDisplay[];
  reviews: ProductReviewSummary[];
}

export interface ProductAttributeDisplay {
  id: string;
  name: string;
  value: string;
  displayName: string;
  isFilterable: boolean;
  sortOrder: number;
}

export interface ProductSpecificationDisplay {
  id: string;
  name: string;
  value: string;
  group?: string;
  unit?: string;
  sortOrder: number;
}

export interface ProductVariantDisplay {
  id: string;
  name: string;
  sku: string;
  priceAdjustment: number;
  finalPrice: number;
  stockQuantity?: number;
  isActive: boolean;
  sortOrder: number;
  attributes: VariantAttributeDisplay[];
  images: ProductImageSummary[];
}

export interface VariantAttributeDisplay {
  id: string;
  name: string;
  value: string;
  displayName: string;
}

export interface ProductReviewSummary {
  id: string;
  rating: number;
  title?: string;
  content?: string;
  userName: string;
  isVerifiedPurchase: boolean;
  helpfulCount: number;
  createdAt: string;
}

// Image Upload Types
export interface ImageUploadRequest {
  file: Express.Multer.File;
  productId?: string;
  variantId?: string;
  alt?: string;
  isMain?: boolean;
  sortOrder?: number;
}

export interface ImageUploadResponse {
  id: string;
  url: string;
  alt?: string;
  isMain: boolean;
  sortOrder: number;
  uploadedAt: string;
}

// Error Types
export interface ProductValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ProductErrorResponse {
  success: false;
  error: {
    message: string;
    code: string;
    details?: ProductValidationError[];
  };
}

// Coffee & Tea Specific Types (from memory bank domain analysis)
export interface CoffeeAttributes {
  roastLevel?: 'light' | 'medium' | 'medium-dark' | 'dark';
  origin?: string;
  processingMethod?: 'washed' | 'natural' | 'honey' | 'anaerobic';
  flavorNotes?: string[];
  caffeineContent?: 'low' | 'medium' | 'high';
  grindSize?: 'whole-bean' | 'coarse' | 'medium' | 'fine' | 'extra-fine';
  roastDate?: string;
}

export interface TeaAttributes {
  teaType?: 'black' | 'green' | 'white' | 'oolong' | 'pu-erh' | 'herbal';
  origin?: string;
  grade?: string;
  flavorProfile?: string[];
  caffeineLevel?: 'caffeine-free' | 'low' | 'medium' | 'high';
  packageType?: 'loose' | 'bags';
  harvestSeason?: 'spring' | 'summer' | 'autumn' | 'winter';
}

export interface AccessoryAttributes {
  material?: string;
  capacity?: string;
  compatibility?: string[];
  color?: string;
  style?: string;
  size?: 'small' | 'medium' | 'large' | 'extra-large';
}

// Inventory Types
export interface InventoryUpdateRequest {
  productId?: string;
  variantId?: string;
  quantityChange: number;
  reason: 'sale' | 'restock' | 'adjustment' | 'damage' | 'return';
  notes?: string;
}

export interface InventoryStatus {
  productId: string;
  variantId?: string;
  stockQuantity: number;
  lowStockThreshold: number;
  isLowStock: boolean;
  isOutOfStock: boolean;
  allowBackorders: boolean;
  lastUpdated: string;
}

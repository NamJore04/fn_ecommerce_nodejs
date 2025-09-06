// Category Module Types - Coffee & Tea E-commerce
// Category management types and interfaces

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  icon?: string;
  isActive: boolean;
  sortOrder: number;
  productCount?: number;
  createdAt: Date;
  updatedAt: Date;
  products?: any[]; // Will be populated when needed
}

export interface CreateCategoryRequest {
  name: string;
  description?: string;
  image?: string;
  icon?: string;
  isActive?: boolean;
  sortOrder?: number;
}

export interface UpdateCategoryRequest {
  name?: string;
  description?: string;
  image?: string;
  icon?: string;
  isActive?: boolean;
  isVisible?: boolean;
  sortOrder?: number;
}

export interface CategoryWithProducts {
  category: Category;
  products: any[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

export class CategoryError extends Error {
  public readonly code: string;
  public readonly statusCode: number;

  constructor(message: string, code: string, statusCode: number = 500) {
    super(message);
    this.name = 'CategoryError';
    this.code = code;
    this.statusCode = statusCode;
  }
}

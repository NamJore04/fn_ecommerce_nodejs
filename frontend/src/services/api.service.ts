// API Client - Coffee & Tea E-commerce Frontend
// Centralized API service for frontend-backend communication

import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import { User } from '@/types';

// ============================================
// API CLIENT CONFIGURATION
// ============================================

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    requestId?: string;
    timestamp: string;
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

// ============================================
// API CLIENT CLASS
// ============================================

class ApiClient {
  private axiosInstance: AxiosInstance;
  private baseURL: string;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    
    this.axiosInstance = axios.create({
      baseURL: this.baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
    this.loadTokensFromStorage();
  }

  private setupInterceptors(): void {
    this.axiosInstance.interceptors.request.use(
      (config) => {
        if (this.accessToken) {
          config.headers.Authorization = `Bearer ${this.accessToken}`;
        }
        config.headers['X-Request-Time'] = new Date().toISOString();
        return config;
      },
      (error) => Promise.reject(error)
    );

    this.axiosInstance.interceptors.response.use(
      (response: AxiosResponse) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as any;
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          try {
            await this.refreshAccessToken();
            if (this.accessToken) {
              originalRequest.headers.Authorization = `Bearer ${this.accessToken}`;
              return this.axiosInstance(originalRequest);
            }
          } catch (refreshError) {
            this.clearTokens();
            if (typeof window !== 'undefined') {
              window.location.href = '/auth/login';
            }
          }
        }
        return Promise.reject(error);
      }
    );
  }

  public setTokens(tokens: AuthTokens): void {
    this.accessToken = tokens.accessToken;
    this.refreshToken = tokens.refreshToken;
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', tokens.accessToken);
      localStorage.setItem('refreshToken', tokens.refreshToken);
      localStorage.setItem('tokenExpiresIn', tokens.expiresIn.toString());
    }
  }

  public clearTokens(): void {
    this.accessToken = null;
    this.refreshToken = null;
    
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('tokenExpiresIn');
    }
  }

  private loadTokensFromStorage(): void {
    if (typeof window !== 'undefined') {
      this.accessToken = localStorage.getItem('accessToken');
      this.refreshToken = localStorage.getItem('refreshToken');
    }
  }

  private async refreshAccessToken(): Promise<void> {
    if (!this.refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await this.axiosInstance.post('/api/auth/refresh', {
        refreshToken: this.refreshToken
      });

      if (response.data.success) {
        this.setTokens(response.data.data.tokens);
      } else {
        throw new Error('Token refresh failed');
      }
    } catch (error) {
      this.clearTokens();
      throw error;
    }
  }

  public async get<T>(endpoint: string, params?: any): Promise<ApiResponse<T>> {
    try {
      const response = await this.axiosInstance.get(endpoint, { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  public async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    try {
      const response = await this.axiosInstance.post(endpoint, data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  public async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    try {
      const response = await this.axiosInstance.put(endpoint, data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  public async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    try {
      const response = await this.axiosInstance.delete(endpoint);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  private handleError(error: any): Error {
    if (error.response) {
      const errorData = error.response.data;
      return new Error(errorData?.error?.message || errorData?.message || 'API Error');
    } else if (error.request) {
      return new Error('Network error - no response received');
    } else {
      return new Error(error.message || 'Unknown error occurred');
    }
  }

  public isAuthenticated(): boolean {
    return !!this.accessToken;
  }

  public getBaseURL(): string {
    return this.baseURL;
  }
}

// ============================================
// SERVICE CLASSES
// ============================================

export class AuthService {
  constructor(private apiClient: ApiClient) {}

  async register(data: {
    email: string;
    password: string;
    fullName: string;
    phone?: string;
  }): Promise<ApiResponse<{ user: User; tokens: AuthTokens }>> {
    const response = await this.apiClient.post<{ user: User; tokens: AuthTokens }>('/api/auth/register', data);
    
    if (response.success && response.data?.tokens) {
      this.apiClient.setTokens(response.data.tokens);
    }
    
    return response;
  }

  async login(email: string, password: string): Promise<ApiResponse<{ user: User; tokens: AuthTokens }>> {
    const response = await this.apiClient.post<{ user: User; tokens: AuthTokens }>('/api/auth/login', {
      email,
      password
    });
    
    if (response.success && response.data?.tokens) {
      this.apiClient.setTokens(response.data.tokens);
    }
    
    return response;
  }

  async logout(): Promise<void> {
    try {
      await this.apiClient.post('/api/auth/logout');
    } finally {
      this.apiClient.clearTokens();
    }
  }

  async getProfile(): Promise<ApiResponse<User>> {
    return this.apiClient.get<User>('/api/auth/profile');
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<ApiResponse<void>> {
    return this.apiClient.post<void>('/api/auth/change-password', {
      currentPassword,
      newPassword
    });
  }

  async forgotPassword(email: string): Promise<ApiResponse<void>> {
    return this.apiClient.post<void>('/api/auth/forgot-password', { email });
  }

  async resetPassword(token: string, newPassword: string): Promise<ApiResponse<void>> {
    return this.apiClient.post<void>('/api/auth/reset-password', {
      token,
      newPassword
    });
  }
}

export class ProductService {
  constructor(private apiClient: ApiClient) {}

  async getProducts(params?: {
    search?: string;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    page?: number;
    limit?: number;
    featured?: boolean;
  }): Promise<ApiResponse<any[]>> {
    // Convert params to query string format that backend expects
    const queryParams: any = {};
    
    if (params?.search) queryParams.search = params.search;
    if (params?.category) queryParams.category = params.category;
    if (params?.minPrice) queryParams.minPrice = params.minPrice;
    if (params?.maxPrice) queryParams.maxPrice = params.maxPrice;
    if (params?.page) queryParams.page = params.page;
    if (params?.limit) queryParams.limit = params.limit;
    if (params?.featured) queryParams.featured = params.featured;
    
    return this.apiClient.get<any[]>('/api/products', queryParams);
  }

  async getAll(): Promise<any[]> {
    const response = await this.getProducts();
    return response.data || [];
  }

  async getProduct(id: string): Promise<ApiResponse<any>> {
    return this.apiClient.get<any>(`/api/products/${id}`);
  }

  async getCategories(): Promise<ApiResponse<any[]>> {
    return this.apiClient.get<any[]>('/api/categories');
  }

  async getAllCategories(): Promise<any[]> {
    const response = await this.getCategories();
    return response.data || [];
  }

  async getFeaturedProducts(limit: number = 8): Promise<ApiResponse<any[]>> {
    return this.apiClient.get<any[]>('/api/products/featured', { limit });
  }

  async searchProducts(query: string, params?: {
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<any[]>> {
    const queryParams: any = { search: query };
    
    if (params?.category) queryParams.category = params.category;
    if (params?.minPrice) queryParams.minPrice = params.minPrice;
    if (params?.maxPrice) queryParams.maxPrice = params.maxPrice;
    if (params?.page) queryParams.page = params.page;
    if (params?.limit) queryParams.limit = params.limit;
    
    return this.apiClient.get<any[]>('/api/products', queryParams);
  }
}

// ============================================
// CATEGORY SERVICE  
// ============================================

export class CategoryService {
  constructor(private apiClient: ApiClient) {}

  async getAll(): Promise<any[]> {
    const response = await this.apiClient.get<any[]>('/api/categories');
    return response.data || [];
  }

  async getCategory(id: string): Promise<ApiResponse<any>> {
    return this.apiClient.get<any>(`/api/categories/${id}`);
  }
}

// ============================================
// CART SERVICE
// ============================================

export class CartService {
  constructor(private apiClient: ApiClient) {}

  async getCart(): Promise<ApiResponse<any>> {
    return this.apiClient.get<any>('/api/cart');
  }

  async addToCart(productId: string, quantity: number, variantId?: string): Promise<ApiResponse<any>> {
    return this.apiClient.post<any>('/api/cart/add', {
      productId,
      quantity,
      variantId
    });
  }

  async updateCartItem(itemId: string, quantity: number): Promise<ApiResponse<any>> {
    return this.apiClient.put<any>(`/api/cart/${itemId}`, { quantity });
  }

  async removeCartItem(itemId: string): Promise<ApiResponse<void>> {
    return this.apiClient.delete<void>(`/api/cart/${itemId}`);
  }

  async clearCart(): Promise<ApiResponse<void>> {
    return this.apiClient.delete<void>('/api/cart');
  }
}

// ============================================
// SINGLETON EXPORTS
// ============================================

const apiClient = new ApiClient();

export const authService = new AuthService(apiClient);
export const productService = new ProductService(apiClient);
export const categoryService = new CategoryService(apiClient);
export const cartService = new CartService(apiClient);

export default apiClient;

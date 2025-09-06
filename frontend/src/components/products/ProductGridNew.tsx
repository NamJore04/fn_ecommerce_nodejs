// ProductGrid Component - Product Grid Display with API Integration
// Coffee & Tea E-commerce - Vietnamese localized

'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HeartIcon, 
  EyeIcon, 
  ShoppingCartIcon,
  StarIcon 
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import Image from 'next/image';
import Link from 'next/link';
import { productService } from '@/services/api.service';
import { formatPrice, formatStock } from '@/utils/format';
import { cn } from '@/utils/cn';
import { Product } from '@/types';
import { CardLoading } from '@/components/ui/loading';
import { usePerformanceMonitor } from '@/hooks/usePerformance';

// ============================================
// TYPES
// ============================================

interface ProductGridProps {
  className?: string;
  columns?: 1 | 2 | 3 | 4 | 5;
  showFilters?: boolean;
  categoryId?: string;
  featured?: boolean;
}

// ============================================
// PRODUCT CARD COMPONENT
// ============================================

const ProductCard: React.FC<{ product: Product; index: number }> = ({ product, index }) => {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  
  const basePrice = typeof product.basePrice === 'string' ? parseFloat(product.basePrice) : product.basePrice;
  const salePrice = product.salePrice ? (typeof product.salePrice === 'string' ? parseFloat(product.salePrice) : product.salePrice) : null;
  
  const discountPercent = salePrice && basePrice 
    ? Math.round(((basePrice - salePrice) / basePrice) * 100)
    : 0;

  const currentPrice = salePrice || basePrice;
  const primaryImage = product.images?.find(img => img.isPrimary) || product.images?.[0];
  const totalStock = product.variants?.reduce((sum, variant) => sum + (variant.stock || variant.stockQuantity || 0), 0) || product.stockQuantity || 0;

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
    // TODO: Call wishlist API
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // TODO: Call add to cart API
    console.log('Add to cart:', product.id);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="group relative bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-lg transition-shadow duration-300"
    >
      <Link href={`/products/${product.slug}`}>
        {/* Product Image */}
        <div className="relative aspect-square overflow-hidden rounded-t-lg bg-gray-100">
          {primaryImage ? (
            <Image
              src={primaryImage.url}
              alt={primaryImage.alt || product.name}
              fill
              className={cn(
                "object-cover transition-transform duration-300 group-hover:scale-105",
                imageLoading ? "scale-110 blur-sm" : "scale-100 blur-0"
              )}
              onLoad={() => setImageLoading(false)}
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-200">
              <span className="text-gray-400">Không có hình ảnh</span>
            </div>
          )}

          {/* Discount Badge */}
          {discountPercent > 0 && (
            <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
              -{discountPercent}%
            </div>
          )}

          {/* Wishlist Button */}
          <button
            onClick={handleWishlistToggle}
            className="absolute top-2 right-2 p-2 rounded-full bg-white/80 hover:bg-white transition-all duration-200"
          >
            {isWishlisted ? (
              <HeartSolidIcon className="h-5 w-5 text-red-500" />
            ) : (
              <HeartIcon className="h-5 w-5 text-gray-600" />
            )}
          </button>

          {/* Quick Actions Overlay */}
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <div className="flex space-x-2">
              <button className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors">
                <EyeIcon className="h-5 w-5 text-gray-700" />
              </button>
              <button 
                onClick={handleAddToCart}
                className="p-2 bg-amber-600 text-white rounded-full hover:bg-amber-700 transition-colors"
              >
                <ShoppingCartIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Product Info */}
        <div className="p-4 space-y-2">
          {/* Category & Brand */}
          <div className="flex items-center text-xs text-gray-500 space-x-2">
            <span>{product.category.name}</span>
            {product.brand && (
              <>
                <span>•</span>
                <span>{product.brand.name}</span>
              </>
            )}
          </div>

          {/* Product Name */}
          <h3 className="font-medium text-gray-900 line-clamp-2 hover:text-amber-600 transition-colors">
            {product.name}
          </h3>

          {/* Rating */}
          <div className="flex items-center space-x-1">
            <div className="flex items-center">
              {Array.from({ length: 5 }).map((_, i) => (
                <StarIcon
                  key={i}
                  className={cn(
                    "h-4 w-4",
                    i < Math.floor(product.averageRating || 0)
                      ? "text-amber-400 fill-current"
                      : "text-gray-300"
                  )}
                />
              ))}
            </div>
            <span className="text-sm text-gray-500">
              ({product.reviewCount || 0})
            </span>
          </div>

          {/* Price */}
          <div className="flex items-center space-x-2">
            <span className="text-lg font-bold text-amber-600">
              {formatPrice(currentPrice)}
            </span>
            {salePrice && (
              <span className="text-sm text-gray-500 line-through">
                {formatPrice(basePrice)}
              </span>
            )}
          </div>

          {/* Stock Status */}
          <div className="text-sm">
            {totalStock > 0 ? (
              <span className="text-green-600">
                Còn {formatStock(totalStock)} sản phẩm
              </span>
            ) : (
              <span className="text-red-600">Hết hàng</span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

// ============================================
// MAIN PRODUCT GRID COMPONENT
// ============================================

const ProductGrid: React.FC<ProductGridProps> = ({
  className,
  columns = 4,
  showFilters = true,
  categoryId,
  featured
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const performance = usePerformanceMonitor('ProductGrid');
  const [filters, setFilters] = useState({
    search: '',
    category: categoryId || '',
    minPrice: 0,
    maxPrice: 0,
    sortBy: 'name',
    sortOrder: 'asc' as 'asc' | 'desc',
    page: 1,
    limit: 12
  });

  // Grid column classes
  const gridClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
    5: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5'
  };

  // Fetch products
  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        ...filters,
        featured: featured ? true : undefined
      };

      const response = await productService.getProducts(params);
      
      if (response.success && response.data) {
        const productData = Array.isArray(response.data) ? response.data : [];
        setProducts(productData);
        performance.trackApiCall(); // Track successful API call
      } else {
        setError('Không thể tải danh sách sản phẩm');
        performance.trackError(); // Track error
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      const errorMessage = 'Đã xảy ra lỗi khi tải sản phẩm';
      setError(errorMessage);
      performance.trackError(); // Track error
    } finally {
      setLoading(false);
    }
  };

  // Effect to fetch products when filters change
  useEffect(() => {
    fetchProducts();
    performance.trackMemory(); // Track memory usage
  }, [filters, featured, categoryId, performance]);

  // Update category filter when categoryId prop changes
  useEffect(() => {
    if (categoryId) {
      setFilters(prev => ({ ...prev, category: categoryId }));
    }
  }, [categoryId]);

  // Loading state
  if (loading) {
    return (
      <CardLoading 
        count={8} 
        className={cn("grid gap-6", gridClasses[columns], className)}
      />
    );
  }

  // Error state
  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">{error}</div>
        <button
          onClick={fetchProducts}
          className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
        >
          Thử lại
        </button>
      </div>
    );
  }

  // Empty state
  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 mb-4">Không tìm thấy sản phẩm nào</div>
        <Link
          href="/products"
          className="inline-block px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
        >
          Xem tất cả sản phẩm
        </Link>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Products Grid */}
      <div className={cn("grid gap-6", gridClasses[columns])}>
        <AnimatePresence>
          {products.map((product: Product, index: number) => (
            <ProductCard
              key={product.id}
              product={product}
              index={index}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Load More Button */}
      {products.length >= filters.limit && (
        <div className="text-center">
          <button
            onClick={() => setFilters(prev => ({ ...prev, limit: prev.limit + 12 }))}
            className="px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
          >
            Xem thêm sản phẩm
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductGrid;

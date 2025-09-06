'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Coffee, Leaf, UtensilsCrossed, Package, ArrowRight } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { productService } from '@/services/api.service';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  isActive: boolean;
  productCount?: number;
}

const categoryIcons: { [key: string]: React.ComponentType<any> } = {
  'coffee': Coffee,
  'ca-phe': Coffee,
  'tea': Leaf,
  'tra': Leaf,
  'food': UtensilsCrossed,
  'thuc-an': UtensilsCrossed,
  'accessories': Package,
  'phu-kien': Package,
};

const categoryColors: { [key: string]: string } = {
  'coffee': 'from-amber-500 to-orange-600',
  'ca-phe': 'from-amber-500 to-orange-600',
  'tea': 'from-green-500 to-emerald-600',
  'tra': 'from-green-500 to-emerald-600',
  'food': 'from-red-500 to-pink-600',
  'thuc-an': 'from-red-500 to-pink-600',
  'accessories': 'from-blue-500 to-indigo-600',
  'phu-kien': 'from-blue-500 to-indigo-600',
};

const getCategoryIcon = (slug: string) => {
  const IconComponent = categoryIcons[slug] || Package;
  return IconComponent;
};

const getCategoryColor = (slug: string) => {
  return categoryColors[slug] || 'from-gray-500 to-gray-600';
};

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await productService.getCategories();
      
      if (response.success && response.data) {
        setCategories(response.data);
      } else {
        setError('Không thể tải danh sách danh mục');
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError('Đã xảy ra lỗi khi tải danh mục');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-coffee-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Đang tải danh mục...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={fetchCategories}>
              Thử lại
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Danh mục sản phẩm
          </h1>
          <p className="text-gray-600">
            Khám phá các danh mục sản phẩm đa dạng của chúng tôi
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {categories.map((category) => {
            const IconComponent = getCategoryIcon(category.slug);
            const gradientClass = getCategoryColor(category.slug);

            return (
              <Link key={category.id} href={`/categories/${category.slug}`}>
                <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer overflow-hidden">
                  {/* Category Icon */}
                  <div className={`bg-gradient-to-br ${gradientClass} p-6 text-center`}>
                    <IconComponent className="h-12 w-12 text-white mx-auto mb-2" />
                    <h3 className="text-white font-semibold text-lg">
                      {category.name}
                    </h3>
                  </div>

                  {/* Category Info */}
                  <CardContent className="p-6">
                    {category.description && (
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {category.description}
                      </p>
                    )}

                    {category.productCount !== undefined && (
                      <div className="text-sm text-gray-500 mb-4">
                        {category.productCount} sản phẩm
                      </div>
                    )}

                    {/* View Category Button */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                        Xem danh mục
                      </span>
                      <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        {/* Empty State */}
        {categories.length === 0 && !loading && (
          <div className="text-center py-12">
            <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Chưa có danh mục nào
            </h3>
            <p className="text-gray-600">
              Danh mục sản phẩm sẽ xuất hiện ở đây khi có dữ liệu.
            </p>
          </div>
        )}

        {/* Call to Action */}
        {categories.length > 0 && (
          <div className="mt-12 bg-gradient-to-r from-coffee-800 to-coffee-600 rounded-xl p-8 text-white text-center">
            <h2 className="text-2xl font-bold mb-4">
              Không tìm thấy thứ bạn cần?
            </h2>
            <p className="text-coffee-100 mb-6 max-w-2xl mx-auto">
              Liên hệ với chúng tôi để được tư vấn và hỗ trợ tìm sản phẩm phù hợp nhất cho nhu cầu của bạn.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-coffee-800 hover:bg-coffee-50">
                Liên hệ tư vấn
              </Button>
              <Link href="/products">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-coffee-800">
                  Xem tất cả sản phẩm
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

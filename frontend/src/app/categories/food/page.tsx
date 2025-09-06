'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, UtensilsCrossed } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import ProductGridNew from '@/components/products/ProductGridNew';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const foodSubCategories = [
  { id: 'pastries', name: 'Bánh ngọt', description: 'Croissant, muffin, cookies tươi ngon' },
  { id: 'sandwiches', name: 'Bánh mì & Sandwich', description: 'Thức ăn nhanh, tiện lợi' },
  { id: 'salads', name: 'Salad', description: 'Tươi mát, bổ dưỡng' },
  { id: 'snacks', name: 'Đồ ăn vặt', description: 'Snack healthy, hạt khô' },
  { id: 'breakfast', name: 'Bữa sáng', description: 'Combo breakfast hoàn chỉnh' },
  { id: 'desserts', name: 'Tráng miệng', description: 'Pudding, ice cream, tiramisu' },
];

export default function FoodCategoryPage() {
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('all');

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-6">
          <Link href="/categories" className="text-gray-500 hover:text-gray-700">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <span className="text-gray-500">/</span>
          <Link href="/categories" className="text-gray-500 hover:text-gray-700">
            Danh mục
          </Link>
          <span className="text-gray-500">/</span>
          <span className="text-gray-900 font-medium">Thức ăn</span>
        </div>

        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-gradient-to-br from-red-500 to-pink-600 p-3 rounded-lg">
              <UtensilsCrossed className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Thức ăn
              </h1>
              <p className="text-gray-600">
                Thực phẩm tươi ngon từ bánh ngọt, bánh mì đến món ăn nhanh
              </p>
            </div>
          </div>
        </div>

        {/* Sub-categories Filter */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Loại thức ăn</h3>
            <div className="flex flex-wrap gap-3">
              <Button
                variant={selectedSubCategory === 'all' ? 'default' : 'outline'}
                onClick={() => setSelectedSubCategory('all')}
                className="mb-2"
              >
                Tất cả
              </Button>
              {foodSubCategories.map((subCat) => (
                <Button
                  key={subCat.id}
                  variant={selectedSubCategory === subCat.id ? 'default' : 'outline'}
                  onClick={() => setSelectedSubCategory(subCat.id)}
                  className="mb-2"
                  title={subCat.description}
                >
                  {subCat.name}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Products Grid */}
        <ProductGridNew categoryId="food" />

        {/* Food Information */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {foodSubCategories.map((subCat) => (
            <Card key={subCat.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-2 text-red-700">
                  {subCat.name}
                </h3>
                <p className="text-gray-600 text-sm">
                  {subCat.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Call to Action */}
        <div className="mt-12 bg-gradient-to-r from-red-600 to-pink-600 rounded-xl p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-4">
            Combo bữa ăn hoàn hảo
          </h2>
          <p className="text-red-100 mb-6 max-w-2xl mx-auto">
            Kết hợp cà phê, trà với các món ăn ngon để có trải nghiệm ẩm thực hoàn chỉnh. 
            Chúng tôi có nhiều combo đặc biệt cho bạn.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-red-700 hover:bg-red-50">
              Xem combo
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-red-700">
              Đặt bàn
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Package } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import ProductGridNew from '@/components/products/ProductGridNew';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const accessorySubCategories = [
  { id: 'coffee-makers', name: 'Máy pha cà phê', description: 'Espresso machine, French press, V60' },
  { id: 'tea-sets', name: 'Bộ pha trà', description: 'Ấm trà, tách trà, infuser' },
  { id: 'grinders', name: 'Máy xay', description: 'Máy xay cà phê thủ công và điện' },
  { id: 'filters', name: 'Bộ lọc', description: 'Paper filter, metal filter' },
  { id: 'cups', name: 'Cốc & Tách', description: 'Coffee cup, tea cup, travel mug' },
  { id: 'storage', name: 'Đồ bảo quản', description: 'Hộp đựng cà phê, trà, vacuum container' },
];

export default function AccessoriesCategoryPage() {
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
          <span className="text-gray-900 font-medium">Phụ kiện</span>
        </div>

        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-3 rounded-lg">
              <Package className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Phụ kiện
              </h1>
              <p className="text-gray-600">
                Dụng cụ pha chế, máy móc và phụ kiện cho trải nghiệm hoàn hảo
              </p>
            </div>
          </div>
        </div>

        {/* Sub-categories Filter */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Loại phụ kiện</h3>
            <div className="flex flex-wrap gap-3">
              <Button
                variant={selectedSubCategory === 'all' ? 'default' : 'outline'}
                onClick={() => setSelectedSubCategory('all')}
                className="mb-2"
              >
                Tất cả
              </Button>
              {accessorySubCategories.map((subCat) => (
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
        <ProductGridNew categoryId="accessories" />

        {/* Accessories Information */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {accessorySubCategories.map((subCat) => (
            <Card key={subCat.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-2 text-blue-700">
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
        <div className="mt-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-4">
            Hướng dẫn sử dụng miễn phí
          </h2>
          <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
            Mua phụ kiện pha chế cà phê, trà mà chưa biết cách sử dụng? 
            Chúng tôi có video hướng dẫn chi tiết và hỗ trợ trực tiếp.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-blue-700 hover:bg-blue-50">
              Xem hướng dẫn
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-700">
              Hỗ trợ trực tiếp
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}

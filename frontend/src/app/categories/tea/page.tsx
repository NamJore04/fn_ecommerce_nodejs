'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Leaf } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import ProductGridNew from '@/components/products/ProductGridNew';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const teaSubCategories = [
  { id: 'green', name: 'Trà xanh', description: 'Thanh mát, nhiều chất chống oxy hóa' },
  { id: 'black', name: 'Trà đen', description: 'Đậm đà, mạnh mẽ' },
  { id: 'oolong', name: 'Trà oolong', description: 'Hương vị cân bằng, tinh tế' },
  { id: 'white', name: 'Trà trắng', description: 'Nhẹ nhàng, tự nhiên' },
  { id: 'herbal', name: 'Trà thảo dược', description: 'Tốt cho sức khỏe, không caffeine' },
  { id: 'pu-erh', name: 'Trà Phổ Nhĩ', description: 'Lên men, hương vị độc đáo' },
];

export default function TeaCategoryPage() {
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
          <span className="text-gray-900 font-medium">Trà</span>
        </div>

        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-3 rounded-lg">
              <Leaf className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Trà
              </h1>
              <p className="text-gray-600">
                Bộ sưu tập trà cao cấp từ các loại trà xanh, đen, oolong đến trà thảo dược
              </p>
            </div>
          </div>
        </div>

        {/* Sub-categories Filter */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Loại trà</h3>
            <div className="flex flex-wrap gap-3">
              <Button
                variant={selectedSubCategory === 'all' ? 'default' : 'outline'}
                onClick={() => setSelectedSubCategory('all')}
                className="mb-2"
              >
                Tất cả
              </Button>
              {teaSubCategories.map((subCat) => (
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
        <ProductGridNew categoryId="tea" />

        {/* Tea Information */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teaSubCategories.map((subCat) => (
            <Card key={subCat.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-2 text-green-800">
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
        <div className="mt-12 bg-gradient-to-r from-green-700 to-emerald-600 rounded-xl p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-4">
            Khám phá văn hóa trà
          </h2>
          <p className="text-green-100 mb-6 max-w-2xl mx-auto">
            Tìm hiểu về nguồn gốc, cách pha và lợi ích sức khỏe của từng loại trà. 
            Chúng tôi có đội ngũ chuyên gia sẵn sàng chia sẻ kiến thức.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-green-800 hover:bg-green-50">
              Tìm hiểu thêm
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-green-800">
              Hướng dẫn pha trà
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}

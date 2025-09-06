'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Coffee } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import ProductGridNew from '@/components/products/ProductGridNew';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const coffeeSubCategories = [
  { id: 'arabica', name: 'Arabica', description: 'Hương vị tinh tế, ít caffeine' },
  { id: 'robusta', name: 'Robusta', description: 'Đậm đà, nhiều caffeine' },
  { id: 'espresso', name: 'Espresso', description: 'Pha máy, đậm đặc' },
  { id: 'cold-brew', name: 'Cold Brew', description: 'Pha lạnh, êm dịu' },
  { id: 'instant', name: 'Cà phê hòa tan', description: 'Tiện lợi, nhanh chóng' },
];

export default function CoffeeCategoryPage() {
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
          <span className="text-gray-900 font-medium">Cà phê</span>
        </div>

        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-3 rounded-lg">
              <Coffee className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Cà phê
              </h1>
              <p className="text-gray-600">
                Khám phá thế giới cà phê với các loại hạt rang từ các vùng nổi tiếng
              </p>
            </div>
          </div>
        </div>

        {/* Sub-categories Filter */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Loại cà phê</h3>
            <div className="flex flex-wrap gap-3">
              <Button
                variant={selectedSubCategory === 'all' ? 'default' : 'outline'}
                onClick={() => setSelectedSubCategory('all')}
                className="mb-2"
              >
                Tất cả
              </Button>
              {coffeeSubCategories.map((subCat) => (
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
        <ProductGridNew categoryId="coffee" />

        {/* Coffee Information */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {coffeeSubCategories.map((subCat) => (
            <Card key={subCat.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-2 text-coffee-800">
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
        <div className="mt-12 bg-gradient-to-r from-coffee-800 to-coffee-600 rounded-xl p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-4">
            Tư vấn chọn cà phê phù hợp
          </h2>
          <p className="text-coffee-100 mb-6 max-w-2xl mx-auto">
            Không biết chọn loại cà phê nào? Hãy để chúng tôi tư vấn cho bạn 
            dựa trên sở thích và nhu cầu sử dụng.
          </p>
          <Button size="lg" className="bg-white text-coffee-800 hover:bg-coffee-50">
            Nhận tư vấn miễn phí
          </Button>
        </div>
      </div>
    </Layout>
  );
}

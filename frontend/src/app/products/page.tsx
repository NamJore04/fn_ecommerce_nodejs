'use client';

import React, { useState } from 'react';
import { Search } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import ProductGridNew from '@/components/products/ProductGridNew';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function ProductsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // ProductGrid sẽ xử lý việc filter
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Sản phẩm
          </h1>
          <p className="text-gray-600">
            Khám phá bộ sưu tập cà phê, trà và thức ăn chất lượng cao
          </p>
        </div>

        {/* Search and Filter Section */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              {/* Search Bar */}
              <form onSubmit={handleSearch} className="flex-1 max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Tìm kiếm sản phẩm..."
                    value={searchQuery}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-coffee-500 focus:border-transparent"
                  />
                </div>
              </form>

              {/* Category Filter */}
              <div className="flex gap-2 flex-wrap">
                {[
                  { value: 'all', label: 'Tất cả' },
                  { value: 'coffee', label: 'Cà phê' },
                  { value: 'tea', label: 'Trà' },
                  { value: 'food', label: 'Thức ăn' },
                ].map((category) => (
                  <Button
                    key={category.value}
                    variant={selectedCategory === category.value ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedCategory(category.value)}
                  >
                    {category.label}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Product Grid */}
        <ProductGridNew />
      </div>
    </Layout>
  );
}

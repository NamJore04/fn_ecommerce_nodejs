'use client';

import React, { useState } from 'react';
import { CheckCircle, XCircle, Clock, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { productService } from '@/services/api.service';
import { LoadingSpinner } from '@/components/ui/loading';
import { cn } from '@/utils/cn';

interface TestResult {
  name: string;
  status: 'pending' | 'success' | 'error';
  message: string;
  duration?: number;
  data?: any;
}

export default function ApiTestPage() {
  const [results, setResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const updateResult = (index: number, update: Partial<TestResult>) => {
    setResults(prev => prev.map((result, i) => 
      i === index ? { ...result, ...update } : result
    ));
  };

  const tests = [
    {
      name: 'Get All Products',
      test: async () => {
        const response = await productService.getProducts();
        if (!response.success || !response.data) {
          throw new Error('Failed to fetch products');
        }
        return {
          message: `Loaded ${response.data.length} products`,
          data: response.data.slice(0, 3)
        };
      }
    },
    {
      name: 'Get Featured Products',
      test: async () => {
        const response = await productService.getProducts({ featured: true });
        if (!response.success || !response.data) {
          throw new Error('Failed to fetch featured products');
        }
        return {
          message: `Loaded ${response.data.length} featured products`,
          data: response.data
        };
      }
    },
    {
      name: 'Get Categories',
      test: async () => {
        const response = await productService.getCategories();
        if (!response.success || !response.data) {
          throw new Error('Failed to fetch categories');
        }
        return {
          message: `Loaded ${response.data.length} categories`,
          data: response.data.slice(0, 5)
        };
      }
    },
    {
      name: 'Search Products',
      test: async () => {
        const response = await productService.searchProducts('coffee');
        if (!response.success || !response.data) {
          throw new Error('Failed to search products');
        }
        return {
          message: `Found ${response.data.length} coffee products`,
          data: response.data
        };
      }
    }
  ];

  const runAllTests = async () => {
    setIsRunning(true);
    setResults(tests.map(test => ({
      name: test.name,
      status: 'pending' as const,
      message: 'Đang chạy...'
    })));

    for (let i = 0; i < tests.length; i++) {
      const test = tests[i];
      const startTime = Date.now();

      try {
        const result = await test.test();
        const duration = Date.now() - startTime;
        
        updateResult(i, {
          status: 'success',
          message: result.message,
          duration,
          data: result.data
        });
      } catch (error: any) {
        const duration = Date.now() - startTime;
        
        updateResult(i, {
          status: 'error',
          message: error.message || 'Test failed',
          duration
        });
      }

      // Add small delay between tests
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    setIsRunning(false);
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
    }
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'pending':
        return 'border-yellow-200 bg-yellow-50';
      case 'success':
        return 'border-green-200 bg-green-50';
      case 'error':
        return 'border-red-200 bg-red-50';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold text-gray-900">
            API Integration Test Suite
          </h1>
          <p className="text-gray-600">
            Kiểm tra tất cả API endpoints và user interactions
          </p>
          
          <Button 
            onClick={runAllTests}
            disabled={isRunning}
            size="lg"
            className="bg-coffee-600 hover:bg-coffee-700"
          >
            {isRunning ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Đang chạy tests...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Chạy tất cả tests
              </>
            )}
          </Button>
        </div>

        {results.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Kết quả Tests
            </h2>
            
            <div className="grid gap-4">
              {results.map((result, index) => (
                <Card 
                  key={index} 
                  className={cn('transition-all duration-200', getStatusColor(result.status))}
                >
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center justify-between text-lg">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(result.status)}
                        <span>{result.name}</span>
                      </div>
                      {result.duration && (
                        <span className="text-sm text-gray-500">
                          {result.duration}ms
                        </span>
                      )}
                    </CardTitle>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <p className="text-sm text-gray-700 mb-3">
                      {result.message}
                    </p>
                    
                    {result.data && (
                      <details className="text-xs">
                        <summary className="cursor-pointer text-gray-500 hover:text-gray-700">
                          Xem dữ liệu mẫu
                        </summary>
                        <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-x-auto">
                          {JSON.stringify(result.data, null, 2)}
                        </pre>
                      </details>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Summary */}
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-blue-900">Tổng kết</h3>
                  <div className="flex space-x-4 text-sm">
                    <span className="text-green-600">
                      ✓ {results.filter(r => r.status === 'success').length} thành công
                    </span>
                    <span className="text-red-600">
                      ✗ {results.filter(r => r.status === 'error').length} thất bại
                    </span>
                    <span className="text-yellow-600">
                      ⏳ {results.filter(r => r.status === 'pending').length} đang chạy
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

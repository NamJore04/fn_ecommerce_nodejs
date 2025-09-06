'use client'

import React, { useState, useCallback } from 'react'
import { productService, categoryService, authService } from '@/services/api.service'
import { ButtonLoading } from '@/components/ui/loading'
import { Product } from '@/types'

interface TestResult {
  name: string
  status: 'pending' | 'running' | 'success' | 'error'
  data?: any
  error?: string
  duration?: number
}

export default function DatabaseTestPage() {
  const [tests, setTests] = useState<TestResult[]>([])
  const [isRunning, setIsRunning] = useState(false)

  const updateTestResult = useCallback((name: string, updates: Partial<TestResult>) => {
    setTests(prev => prev.map(test => 
      test.name === name ? { ...test, ...updates } : test
    ))
  }, [])

  const runTest = async (testFn: () => Promise<any>, name: string) => {
    const startTime = Date.now()
    updateTestResult(name, { status: 'running' })
    
    try {
      const result = await testFn()
      const duration = Date.now() - startTime
      updateTestResult(name, { 
        status: 'success', 
        data: result,
        duration 
      })
      return result
    } catch (error) {
      const duration = Date.now() - startTime
      updateTestResult(name, { 
        status: 'error', 
        error: error instanceof Error ? error.message : 'Unknown error',
        duration 
      })
      throw error
    }
  }

  const runAllTests = async () => {
    setIsRunning(true)
    
    // Initialize test list
    const testList = [
      'Database Connection Test',
      'Product Data Verification', 
      'Category Data Verification',
      'Product-Category Relationships',
      'Image Data Integrity',
      'Variant Data Structure',
      'User Authentication Test',
      'Data Consistency Check',
      'Performance Benchmark'
    ]

    setTests(testList.map(name => ({ name, status: 'pending' as const })))

    try {
      // Test 1: Database Connection
      await runTest(async () => {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/health`)
        if (!response.ok) throw new Error('Health check failed')
        return await response.json()
      }, 'Database Connection Test')

      // Test 2: Product Data Verification
      await runTest(async () => {
        const products = await productService.getAll()
        if (!Array.isArray(products)) throw new Error('Products not returned as array')
        if (products.length === 0) throw new Error('No products found in database')
        
        return {
          count: products.length,
          sampleProduct: products[0],
          hasImages: products.some(p => p.images && p.images.length > 0),
          hasVariants: products.some(p => p.variants && p.variants.length > 0)
        }
      }, 'Product Data Verification')

      // Test 3: Category Data Verification  
      await runTest(async () => {
        const categories = await categoryService.getAll()
        if (!Array.isArray(categories)) throw new Error('Categories not returned as array')
        if (categories.length === 0) throw new Error('No categories found in database')
        
        return {
          count: categories.length,
          sampleCategory: categories[0],
          hasSubcategories: categories.some(c => c.children && c.children.length > 0)
        }
      }, 'Category Data Verification')

      // Test 4: Product-Category Relationships
      await runTest(async () => {
        const products = await productService.getAll()
        const categories = await categoryService.getAll()
        
        const productsWithCategories = products.filter((p: Product) => p.category?.id)
        const categoryIds = categories.map((c: any) => c.id)
        const validRelationships = productsWithCategories.filter((p: Product) => 
          categoryIds.includes(p.category?.id)
        )
        
        return {
          totalProducts: products.length,
          productsWithCategories: productsWithCategories.length,
          validRelationships: validRelationships.length,
          integrity: (validRelationships.length / productsWithCategories.length) * 100
        }
      }, 'Product-Category Relationships')

      // Test 5: Image Data Integrity
      await runTest(async () => {
        const products = await productService.getAll()
        const productsWithImages = products.filter((p: Product) => p.images && p.images.length > 0)
        const totalImages = products.reduce((sum: number, p: Product) => sum + (p.images?.length || 0), 0)
        const primaryImages = products.reduce((sum: number, p: Product) => 
          sum + (p.images?.filter((img: any) => img.isPrimary).length || 0), 0
        )
        
        return {
          productsWithImages: productsWithImages.length,
          totalImages,
          primaryImages,
          averageImagesPerProduct: totalImages / products.length
        }
      }, 'Image Data Integrity')

      // Test 6: Variant Data Structure
      await runTest(async () => {
        const products = await productService.getAll()
        const productsWithVariants = products.filter((p: Product) => p.variants && p.variants.length > 0)
        const totalVariants = products.reduce((sum: number, p: Product) => sum + (p.variants?.length || 0), 0)
        const variantsWithStock = products.reduce((sum: number, p: Product) => 
          sum + (p.variants?.filter((v: any) => (v.stock || v.stockQuantity || 0) > 0).length || 0), 0
        )
        
        return {
          productsWithVariants: productsWithVariants.length,
          totalVariants,
          variantsWithStock,
          stockUtilization: (variantsWithStock / totalVariants) * 100
        }
      }, 'Variant Data Structure')

      // Test 7: User Authentication Test
      await runTest(async () => {
        try {
          const testResult = await authService.login('admin@coffee.com', 'admin123')
          
          if (testResult.success && testResult.data) {
            // Test token validation
            const profileResult = await authService.getProfile()
            return {
              loginSuccess: true,
              tokenValid: profileResult.success,
              userProfile: profileResult.data
            }
          } else {
            throw new Error('Login failed')
          }
        } catch (error) {
          return {
            loginSuccess: false,
            error: error instanceof Error ? error.message : 'Auth test failed'
          }
        }
      }, 'User Authentication Test')

      // Test 8: Data Consistency Check
      await runTest(async () => {
        const products = await productService.getAll()
        const categories = await categoryService.getAll()
        
        // Check for required fields
        const productsWithoutName = products.filter((p: Product) => !p.name || p.name.trim() === '')
        const productsWithoutPrice = products.filter((p: Product) => !p.basePrice || (typeof p.basePrice === 'number' ? p.basePrice <= 0 : parseFloat(p.basePrice) <= 0))
        const categoriesWithoutName = categories.filter((c: any) => !c.name || c.name.trim() === '')
        
        // Check price consistency
        const invalidPrices = products.filter((p: Product) => {
          const base = typeof p.basePrice === 'string' ? parseFloat(p.basePrice) : p.basePrice
          const sale = p.salePrice ? (typeof p.salePrice === 'string' ? parseFloat(p.salePrice) : p.salePrice) : null
          return sale && sale >= base
        })
        
        return {
          dataQuality: {
            productsWithoutName: productsWithoutName.length,
            productsWithoutPrice: productsWithoutPrice.length,
            categoriesWithoutName: categoriesWithoutName.length,
            invalidPrices: invalidPrices.length
          },
          consistencyScore: ((products.length + categories.length - productsWithoutName.length - productsWithoutPrice.length - categoriesWithoutName.length - invalidPrices.length) / (products.length + categories.length)) * 100
        }
      }, 'Data Consistency Check')

      // Test 9: Performance Benchmark
      await runTest(async () => {
        const startTime = Date.now()
        
        // Parallel requests test
        const [products, categories] = await Promise.all([
          productService.getAll(),
          categoryService.getAll()
        ])
        
        const parallelTime = Date.now() - startTime
        
        // Sequential requests test
        const seqStart = Date.now()
        await productService.getAll()
        await categoryService.getAll()
        const sequentialTime = Date.now() - seqStart
        
        return {
          parallelRequestTime: parallelTime,
          sequentialRequestTime: sequentialTime,
          performanceGain: ((sequentialTime - parallelTime) / sequentialTime) * 100,
          dataVolume: {
            products: products.length,
            categories: categories.length
          }
        }
      }, 'Performance Benchmark')

    } catch (error) {
      console.error('Test suite failed:', error)
    } finally {
      setIsRunning(false)
    }
  }

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'pending': return '⏳'
      case 'running': return '🔄'
      case 'success': return '✅'
      case 'error': return '❌'
    }
  }

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'pending': return 'text-gray-500'
      case 'running': return 'text-blue-500'
      case 'success': return 'text-green-600'
      case 'error': return 'text-red-600'
    }
  }

  const successCount = tests.filter(t => t.status === 'success').length
  const errorCount = tests.filter(t => t.status === 'error').length
  const totalTests = tests.length

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Database Integration Test Suite
          </h1>
          <p className="text-gray-600">
            Comprehensive testing of database connectivity, data integrity, and performance
          </p>
        </div>

        {/* Test Summary */}
        {tests.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Test Summary</h2>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{successCount}</div>
                <div className="text-sm text-gray-600">Passed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{errorCount}</div>
                <div className="text-sm text-gray-600">Failed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{totalTests}</div>
                <div className="text-sm text-gray-600">Total</div>
              </div>
            </div>
            <div className="mt-4">
              <div className="bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(successCount / totalTests) * 100}%` }}
                ></div>
              </div>
              <div className="text-sm text-gray-600 mt-1">
                Success Rate: {totalTests > 0 ? Math.round((successCount / totalTests) * 100) : 0}%
              </div>
            </div>
          </div>
        )}

        {/* Run Tests Button */}
        <div className="mb-6">
          <ButtonLoading
            onClick={runAllTests}
            disabled={isRunning}
            loading={isRunning}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold"
          >
            {isRunning ? 'Running Tests...' : 'Run All Database Tests'}
          </ButtonLoading>
        </div>

        {/* Test Results */}
        <div className="space-y-4">
          {tests.map((test, index) => (
            <div 
              key={index}
              className="bg-white rounded-lg shadow-md p-6 border-l-4 border-gray-200"
              style={{
                borderLeftColor: test.status === 'success' ? '#10b981' : 
                               test.status === 'error' ? '#ef4444' : 
                               test.status === 'running' ? '#3b82f6' : '#9ca3af'
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <span className="text-xl">{getStatusIcon(test.status)}</span>
                  {test.name}
                </h3>
                <div className={`text-sm font-medium ${getStatusColor(test.status)}`}>
                  {test.status.toUpperCase()}
                  {test.duration && ` (${test.duration}ms)`}
                </div>
              </div>

              {test.error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-3">
                  <p className="text-red-800 text-sm font-medium">Error:</p>
                  <p className="text-red-700 text-sm">{test.error}</p>
                </div>
              )}

              {test.data && (
                <div className="bg-gray-50 border border-gray-200 rounded-md p-3">
                  <p className="text-gray-800 text-sm font-medium mb-2">Test Results:</p>
                  <pre className="text-xs text-gray-700 overflow-x-auto">
                    {JSON.stringify(test.data, null, 2)}
                  </pre>
                </div>
              )}

              {test.status === 'running' && (
                <div className="flex items-center gap-2 text-blue-600">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <span className="text-sm">Testing in progress...</span>
                </div>
              )}
            </div>
          ))}
        </div>

        {tests.length === 0 && (
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <p className="text-gray-600 mb-4">
              Click "Run All Database Tests" to start comprehensive testing
            </p>
            <div className="text-sm text-gray-500">
              This test suite will verify:
              <ul className="mt-2 space-y-1">
                <li>• Database connectivity and health</li>
                <li>• Product and category data integrity</li>
                <li>• Relational data consistency</li>
                <li>• Authentication system functionality</li>
                <li>• Performance benchmarks</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
